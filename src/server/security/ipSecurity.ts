import { Request } from 'express';
import net from 'net';

/**
 * ============================================================================
 * CAFFEINE PROXY VALIDATOR & SECURE IP EXTRACTION ENGINE
 * ============================================================================
 * Defends against:
 * 1. Blind Trust in X-Forwarded-For spoofing
 * 2. Header injection and malformed IP attacks
 * 3. Rate-limit circumvention via client-controlled headers
 *
 * [SECURITY_LAYER: TRUSTED_PROXY_AND_IP_DEFENSE]
 * [DEFENSE: FORWARDED_FOR_SPOOFING_RESILIENCE]
 * ============================================================================
 */

// Private & Loopback IPv4 Ranges (CIDR-compatible checks)
const IPV4_LOOPBACK_REGEX = /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const IPV4_PRIVATE_10_REGEX = /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const IPV4_PRIVATE_172_REGEX = /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/;
const IPV4_PRIVATE_192_REGEX = /^192\.168\.\d{1,3}\.\d{1,3}$/;
const IPV4_LINK_LOCAL_REGEX = /^169\.254\.\d{1,3}\.\d{1,3}$/;

// Standard IPv4 and IPv6 Strict Regexes
const IPV4_STRICT_REGEX = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const IPV6_STRICT_REGEX = /^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$|^::1$|^::$/;

/**
 * Checks if a string is a strictly valid IPv4 or IPv6 address
 */
export function isValidIp(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;
  const clean = ip.trim().replace(/^::ffff:/i, ''); // Strip IPv4-mapped IPv6 prefix
  if (net.isIP(clean)) return true;
  return IPV4_STRICT_REGEX.test(clean) || IPV6_STRICT_REGEX.test(clean);
}

/**
 * Normalizes an IP string (strips whitespace, ports, and ::ffff: prefixes)
 */
export function normalizeIp(ip: string): string {
  if (!ip || typeof ip !== 'string') return '127.0.0.1';
  let clean = ip.trim();

  // If format is ip:port (IPv4 with port)
  if (clean.includes(':') && !clean.includes('::') && clean.split(':').length === 2) {
    const [host] = clean.split(':');
    if (IPV4_STRICT_REGEX.test(host)) {
      clean = host;
    }
  }

  // Strip IPv4-mapped IPv6
  if (clean.startsWith('::ffff:')) {
    clean = clean.substring(7);
  }

  // Handle standard IPv6 localhost
  if (clean === '::1' || clean === '::') {
    return '127.0.0.1';
  }

  return clean;
}

/**
 * Determines whether an IP address belongs to a trusted reverse proxy / internal subnet
 */
export function isTrustedProxy(ip: string): boolean {
  const norm = normalizeIp(ip);

  // Localhost & Loopback
  if (norm === '127.0.0.1' || IPV4_LOOPBACK_REGEX.test(norm)) {
    return true;
  }

  // Private Subnets (typical for Docker, Cloud Run internal ingress, Kubernetes, VPC)
  if (
    IPV4_PRIVATE_10_REGEX.test(norm) ||
    IPV4_PRIVATE_172_REGEX.test(norm) ||
    IPV4_PRIVATE_192_REGEX.test(norm) ||
    IPV4_LINK_LOCAL_REGEX.test(norm)
  ) {
    return true;
  }

  // Environment-specific trusted proxy list
  if (process.env.TRUSTED_PROXIES) {
    const customList = process.env.TRUSTED_PROXIES.split(',').map((p) => normalizeIp(p.trim()));
    if (customList.includes(norm)) {
      return true;
    }
  }

  return false;
}

/**
 * Securely extracts client IP preventing header spoofing and blind trust
 *
 * Rules:
 * 1. Checks immediate socket connection address.
 * 2. If immediate socket is NOT a trusted proxy, X-Forwarded-For is REJECTED/IGNORED.
 * 3. If immediate socket IS a trusted proxy, X-Forwarded-For is parsed from right to left,
 *    skipping verified trusted proxy hops to identify the true client IP.
 * 4. All IP candidates are strictly validated for syntactical correctness.
 */
export function extractSecureClientIp(req: Request): string {
  const socketAddress = normalizeIp(req.socket?.remoteAddress || req.connection?.remoteAddress || '127.0.0.1');

  // If the direct connecting socket is NOT a trusted proxy, do NOT trust X-Forwarded-For!
  if (!isTrustedProxy(socketAddress)) {
    return isValidIp(socketAddress) ? socketAddress : '127.0.0.1';
  }

  // Socket is a trusted proxy, so we can inspect X-Forwarded-For
  const forwardedHeader = req.headers['x-forwarded-for'];
  if (typeof forwardedHeader === 'string' && forwardedHeader.trim().length > 0) {
    // Parse chain of IPs: client, proxy1, proxy2...
    const rawHops = forwardedHeader.split(',').map((item) => normalizeIp(item.trim()));
    const validHops = rawHops.filter((hop) => isValidIp(hop));

    if (validHops.length > 0) {
      // Find the first untrusted IP searching from right to left (the hop that sent to the trusted proxy)
      for (let i = validHops.length - 1; i >= 0; i--) {
        const hop = validHops[i];
        if (!isTrustedProxy(hop)) {
          return hop;
        }
      }
      // If all hops are trusted (e.g. internal service mesh), return the client (first hop)
      return validHops[0];
    }
  }

  // Check Express req.ip (fallback if populated by trusted proxy setting)
  if (req.ip && isValidIp(normalizeIp(req.ip))) {
    return normalizeIp(req.ip);
  }

  return socketAddress;
}
