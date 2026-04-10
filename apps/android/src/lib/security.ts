import { Dimensions, Platform } from "react-native";

const IP_LOOKUP_ENDPOINT = "https://api.ipify.org?format=json";

function hashText(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }

  return `fp_${Math.abs(hash).toString(16)}`;
}

function isLikelyIpAddress(value: string): boolean {
  const ipv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  const ipv6 = /^[0-9a-fA-F:]+$/;
  return ipv4.test(value) || ipv6.test(value);
}

export async function resolveClientIpAddress(
  timeoutMs = 2000,
): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(IP_LOOKUP_ENDPOINT, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { ip?: string };
    const ip = payload.ip?.trim();

    if (!ip || !isLikelyIpAddress(ip)) {
      return null;
    }

    return ip;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function createIpFingerprint(): string {
  const { width, height } = Dimensions.get("window");
  const parts = [
    Platform.OS,
    String(Platform.Version),
    String(width),
    String(height),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    String(new Date().getTimezoneOffset()),
  ];

  return hashText(parts.join("|"));
}
