/**
 * Lightweight User-Agent parser.
 * Parses browser, OS, and device type from a UA string.
 * We parse server-side and discard the raw UA — it's PII.
 */

export interface ParsedUA {
  browser: string;
  os: string;
  device_type: "desktop" | "mobile" | "tablet";
}

export function parseUserAgent(ua: string): ParsedUA {
  const lower = ua.toLowerCase();

  // ── Device type ──────────────────────────────
  let device_type: "desktop" | "mobile" | "tablet" = "desktop";
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device_type = "tablet";
  } else if (
    /mobile|iphone|ipod|android|blackberry|windows phone|opera mini|iemobile/i.test(ua)
  ) {
    device_type = "mobile";
  }

  // ── Browser ──────────────────────────────────
  let browser = "Unknown";
  if (/edg\//i.test(ua)) {
    browser = "Edge";
  } else if (/opr\//i.test(ua) || /opera/i.test(ua)) {
    browser = "Opera";
  } else if (/chrome|chromium/i.test(ua) && !/chromium/i.test(ua)) {
    browser = "Chrome";
  } else if (/firefox|fxios/i.test(ua)) {
    browser = "Firefox";
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browser = "Safari";
  } else if (/trident|msie/i.test(ua)) {
    browser = "Internet Explorer";
  }

  // ── OS ───────────────────────────────────────
  let os = "Unknown";
  if (/windows nt/i.test(ua)) {
    os = "Windows";
  } else if (/mac os x|macintosh/i.test(ua) && !/iphone|ipad/i.test(ua)) {
    os = "macOS";
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    os = "iOS";
  } else if (/android/i.test(ua)) {
    os = "Android";
  } else if (/linux/i.test(ua)) {
    os = "Linux";
  } else if (/cros/i.test(ua)) {
    os = "ChromeOS";
  }

  return { browser, os, device_type };
}
