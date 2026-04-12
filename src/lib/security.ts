/**
 * Security helpers for web client.
 * These are best-effort controls that complement backend RLS and constraints.
 */

const IP_LOOKUP_ENDPOINT = "https://api.ipify.org?format=json";
const HIRE_LOCK_PREFIX = "shram-sewa:hire-ip-lock";
const HIRE_LOCK_TTL_MS = 24 * 60 * 60 * 1000;

type HireIpLockPayload = {
  workerId: string;
  hirerIp: string;
  fingerprint: string;
  createdAt: string;
  expiresAt: string;
};

function isLikelyIpAddress(value: string): boolean {
  const ipv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  const ipv6 = /^[0-9a-fA-F:]+$/;
  return ipv4.test(value) || ipv6.test(value);
}

function safeStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function hashText(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }

  return `fp_${Math.abs(hash).toString(16)}`;
}

function lockKey(workerId: string, hirerIp: string): string {
  return `${HIRE_LOCK_PREFIX}:${workerId}:${hirerIp}`;
}

function parseHireIpLock(raw: string | null): HireIpLockPayload | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<HireIpLockPayload>;

    if (
      typeof parsed.workerId !== "string" ||
      typeof parsed.hirerIp !== "string" ||
      typeof parsed.fingerprint !== "string" ||
      typeof parsed.createdAt !== "string" ||
      typeof parsed.expiresAt !== "string"
    ) {
      return null;
    }

    if (
      Number.isNaN(Date.parse(parsed.createdAt)) ||
      Number.isNaN(Date.parse(parsed.expiresAt))
    ) {
      return null;
    }

    return parsed as HireIpLockPayload;
  } catch {
    return null;
  }
}

function isLockExpired(lock: HireIpLockPayload): boolean {
  return Date.parse(lock.expiresAt) <= Date.now();
}

function removeHireIpLock(storage: Storage, workerId: string, hirerIp: string) {
  storage.removeItem(lockKey(workerId, hirerIp));
}

export function pruneExpiredHireIpLocks(): void {
  const storage = safeStorage();
  if (!storage) {
    return;
  }

  for (let index = storage.length - 1; index >= 0; index -= 1) {
    const key = storage.key(index);
    if (!key || !key.startsWith(HIRE_LOCK_PREFIX)) {
      continue;
    }

    const raw = storage.getItem(key);
    const lock = parseHireIpLock(raw);
    if (!lock || isLockExpired(lock)) {
      storage.removeItem(key);
    }
  }
}

export async function resolveClientIpAddress(
  timeoutMs = 1800,
): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(IP_LOOKUP_ENDPOINT, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
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
    window.clearTimeout(timeout);
  }
}

export function createIpFingerprint(): string {
  if (typeof window === "undefined") {
    return "fp_server";
  }

  const nav = window.navigator;
  const parts = [
    nav.userAgent,
    nav.language,
    String(nav.hardwareConcurrency ?? ""),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    String(window.screen?.width ?? ""),
    String(window.screen?.height ?? ""),
    String(window.devicePixelRatio ?? ""),
    String(new Date().getTimezoneOffset()),
  ];

  return hashText(parts.join("|"));
}

export function hasHireIpLock(workerId: string, hirerIp: string): boolean {
  if (!workerId || !hirerIp) {
    return false;
  }

  const storage = safeStorage();
  if (!storage) {
    return false;
  }

  pruneExpiredHireIpLocks();

  const raw = storage.getItem(lockKey(workerId, hirerIp));
  const lock = parseHireIpLock(raw);

  if (!lock) {
    if (raw) {
      removeHireIpLock(storage, workerId, hirerIp);
    }
    return false;
  }

  if (isLockExpired(lock)) {
    removeHireIpLock(storage, workerId, hirerIp);
    return false;
  }

  return true;
}

export function setHireIpLock(
  workerId: string,
  hirerIp: string,
  fingerprint: string,
  ttlMs = HIRE_LOCK_TTL_MS,
): void {
  if (!workerId || !hirerIp) {
    return;
  }

  const storage = safeStorage();
  if (!storage) {
    return;
  }

  pruneExpiredHireIpLocks();

  const sanitizedTtl = Number.isFinite(ttlMs)
    ? Math.max(60_000, ttlMs)
    : HIRE_LOCK_TTL_MS;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + sanitizedTtl).toISOString();

  storage.setItem(
    lockKey(workerId, hirerIp),
    JSON.stringify({
      workerId,
      hirerIp,
      fingerprint,
      createdAt: now.toISOString(),
      expiresAt,
    }),
  );
}
