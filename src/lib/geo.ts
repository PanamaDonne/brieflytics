/**
 * IP Geolocation — privacy-first.
 *
 * The IP address is used ONLY to determine country/city and is then
 * immediately discarded. It is never logged, stored, or hashed.
 *
 * Supported providers (set GEO_PROVIDER env var):
 *   - "ipapi"    → free ipapi.co (1k req/day, no key needed)
 *   - "none"     → no geo lookup (country/city will be null)
 */

export interface GeoResult {
  country: string | null;
  city: string | null;
}

const PROVIDER = process.env.GEO_PROVIDER ?? "ipapi";

/**
 * Resolve country and city from an IP address.
 * IP is used transiently and never persisted.
 */
export async function resolveGeo(ip: string): Promise<GeoResult> {
  // Ignore local/private IPs
  if (isPrivateIP(ip)) {
    return { country: null, city: null };
  }

  if (PROVIDER === "none") {
    return { country: null, city: null };
  }

  if (PROVIDER === "ipapi") {
    return lookupIpApi(ip);
  }

  // Fallback
  return { country: null, city: null };
}

async function lookupIpApi(ip: string): Promise<GeoResult> {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { "User-Agent": "brieflytics-analytics/1.0" },
      // Short timeout — geo is best-effort, not critical
      signal: AbortSignal.timeout(2000),
    });

    if (!res.ok) return { country: null, city: null };

    const data = await res.json();
    return {
      country: data.country_name ?? null,
      city: data.city ?? null,
    };
  } catch {
    // Geo is best-effort — never fail a pageview because of it
    return { country: null, city: null };
  }
}

/** Returns true for loopback, private, and link-local addresses */
function isPrivateIP(ip: string): boolean {
  if (ip === "::1" || ip === "127.0.0.1") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  if (ip.startsWith("fe80:")) return true;
  return false;
}
