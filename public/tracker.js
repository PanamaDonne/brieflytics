/**
 * Brieflytics Analytics Tracker
 * ────────────────────────────
 * Cookieless, privacy-first analytics.
 * Embeds on any website with a single <script> tag:
 *
 *   <script
 *     defer
 *     src="https://brieflytics.com/tracker.js"
 *     data-token="your-site-token"
 *   ></script>
 *
 * What it collects (no PII):
 *   - Page URL (pathname only, strips query params by default)
 *   - Referrer domain (strips full referrer path)
 *   - Screen dimensions
 *   - A hashed session ID (derived from a random value + domain — never the user's IP)
 *   - Timestamp
 *   - Custom events via window.brieflytics.track()
 *
 * What it does NOT collect:
 *   - Cookies (none set, none read)
 *   - Fingerprinting data
 *   - Full URLs with query strings (unless opted in)
 *   - User identity of any kind
 *   - Personal information
 *
 * GDPR: Exempt from consent requirements under the ePrivacy Directive
 * (Recital 30 — statistical purposes without tracking individuals).
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  // ── Config ────────────────────────────────────────────────────────────
  var script = document.currentScript;
  var token = script && script.getAttribute("data-token");
  var endpoint =
    (script && script.getAttribute("data-endpoint")) ||
    "https://brieflytics.com/api/collect";

  // Respect Do Not Track
  var dnt =
    navigator.doNotTrack === "1" ||
    window.doNotTrack === "1" ||
    navigator.msDoNotTrack === "1";

  // Allow opt-out via localStorage (for GDPR compliance)
  var optedOut = false;
  try {
    optedOut = !!localStorage.getItem("brieflytics_optout");
  } catch (_) {}

  if (!token || dnt || optedOut) {
    // Install a no-op public API and exit
    window.brieflytics = { track: function () {} };
    return;
  }

  // ── Session ID ────────────────────────────────────────────────────────
  // Generated fresh per page session using a random number.
  // Not stored in cookies or localStorage — vanishes when the tab closes.
  // We hash it with the domain to prevent cross-site linking.
  var sessionId = generateSessionId();

  function generateSessionId() {
    var rand = Math.random().toString(36).slice(2) + Date.now().toString(36);
    var domain = location.hostname;
    // Simple hash: no crypto needed here — just needs to be non-reversible
    // and consistent within a single session tab lifecycle.
    return sha256Tiny(rand + domain);
  }

  /**
   * Tiny non-cryptographic hash (FNV-1a variant).
   * Good enough for anonymous session IDs — not for security purposes.
   */
  function sha256Tiny(str) {
    var hash = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0; // unsigned 32-bit multiply
    }
    // Pad to fixed-length hex string
    return hash.toString(16).padStart(8, "0") +
      Math.random().toString(16).slice(2, 10).padStart(8, "0") +
      Math.random().toString(16).slice(2, 10).padStart(8, "0");
  }

  // ── URL sanitization ──────────────────────────────────────────────────
  // By default, strips query params and hash — can be overridden
  function getPageUrl() {
    var keepQuery = script && script.getAttribute("data-keep-query") === "true";
    if (keepQuery) {
      return location.pathname + location.search;
    }
    return location.pathname;
  }

  function getReferrer() {
    var ref = document.referrer;
    if (!ref) return undefined;
    try {
      // Return only the hostname — no paths, no query strings
      return new URL(ref).hostname;
    } catch (_) {
      return undefined;
    }
  }

  // ── Payload builder ───────────────────────────────────────────────────
  function buildPayload(eventName, properties) {
    var payload = {
      t: token,
      u: getPageUrl(),
      r: getReferrer(),
      sw: screen.width,
      sh: screen.height,
      s: sessionId,
      ts: new Date().toISOString(),
    };

    if (eventName) {
      payload.e = eventName;
      if (properties) payload.p = properties;
    }

    return payload;
  }

  // ── Send to collector ─────────────────────────────────────────────────
  function send(payload) {
    var data = JSON.stringify(payload);

    // Prefer sendBeacon for exit events (non-blocking, survives page unload)
    if (navigator.sendBeacon) {
      var blob = new Blob([data], { type: "application/json" });
      var queued = navigator.sendBeacon(endpoint, blob);
      if (queued) return;
    }

    // Fallback: fetch (won't fire on page unload in all browsers)
    if (window.fetch) {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
        keepalive: true, // allows request to outlive the page
      }).catch(function () {});
      return;
    }

    // Last resort: XHR
    var xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
  }

  // ── Pageview tracking ─────────────────────────────────────────────────
  function trackPageview() {
    send(buildPayload());
  }

  // ── SPA navigation detection ──────────────────────────────────────────
  // Patch pushState and replaceState to detect client-side navigation
  var lastPath = location.pathname;

  function onNavigate() {
    var currentPath = location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      trackPageview();
    }
  }

  var originalPushState = history.pushState;
  history.pushState = function () {
    originalPushState.apply(this, arguments);
    onNavigate();
  };

  var originalReplaceState = history.replaceState;
  history.replaceState = function () {
    originalReplaceState.apply(this, arguments);
    onNavigate();
  };

  window.addEventListener("popstate", onNavigate);

  // ── Public API ────────────────────────────────────────────────────────
  /**
   * Track a custom event.
   *
   * Usage:
   *   window.brieflytics.track("signup");
   *   window.brieflytics.track("purchase", { plan: "pro", value: 49 });
   *
   * Properties must NOT include personal data.
   */
  window.brieflytics = {
    track: function (eventName, properties) {
      if (!eventName || typeof eventName !== "string") return;
      // Sanitize properties — allow only primitives, no email/name/etc.
      var safeProps = sanitizeProperties(properties);
      send(buildPayload(eventName, safeProps));
    },

    /**
     * Opt the user out of tracking entirely.
     * Sets a localStorage flag. Reload required.
     */
    optOut: function () {
      try {
        localStorage.setItem("brieflytics_optout", "1");
      } catch (_) {}
    },

    /**
     * Remove opt-out and resume tracking. Reload required.
     */
    optIn: function () {
      try {
        localStorage.removeItem("brieflytics_optout");
      } catch (_) {}
    },
  };

  // ── Sanitize custom event properties ─────────────────────────────────
  // Strips any keys that look like PII (email, name, user, etc.)
  var PII_KEYS = /email|name|phone|address|ip|user|person|id|uid|token/i;

  function sanitizeProperties(props) {
    if (!props || typeof props !== "object") return undefined;
    var clean = {};
    for (var key in props) {
      if (!Object.prototype.hasOwnProperty.call(props, key)) continue;
      if (PII_KEYS.test(key)) continue;
      var val = props[key];
      // Only pass primitives
      if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
        clean[key] = val;
      }
    }
    return Object.keys(clean).length > 0 ? clean : undefined;
  }

  // ── Fire initial pageview ─────────────────────────────────────────────
  // Use requestIdleCallback if available — don't block page render
  if (window.requestIdleCallback) {
    requestIdleCallback(trackPageview);
  } else {
    setTimeout(trackPageview, 0);
  }
})();
