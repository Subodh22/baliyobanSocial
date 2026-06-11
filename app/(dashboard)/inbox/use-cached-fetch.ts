"use client";

import { useCallback, useEffect, useState } from "react";

// Lightweight stale-while-revalidate cache for the Inbox tabs so switching
// tabs or reloading the page doesn't re-hit the upstream APIs every time.
// Cached data lives in a module-level map (survives tab-switch remounts) and
// in sessionStorage (survives a page reload), keyed by request URL. Entries
// older than ttlMs are shown immediately, then revalidated in the background.

type Entry<T> = { data: T; at: number };

const memory = new Map<string, Entry<unknown>>();

function readCache<T>(key: string): Entry<T> | null {
  const inMemory = memory.get(key) as Entry<T> | undefined;
  if (inMemory) return inMemory;
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const entry = JSON.parse(raw) as Entry<T>;
      memory.set(key, entry);
      return entry;
    }
  } catch {
    // sessionStorage unavailable (SSR / privacy mode) — fall through.
  }
  return null;
}

function writeCache<T>(key: string, data: T) {
  const entry: Entry<T> = { data, at: Date.now() };
  memory.set(key, entry);
  try {
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Ignore quota / availability errors; the in-memory copy still works.
  }
}

// Pass url = null to disable the fetch entirely (e.g. a platform that isn't
// connected); data stays null and loading reports false.
export function useCachedFetch<T>(url: string | null, ttlMs = 5 * 60 * 1000) {
  const key = `inbox-cache:${url}`;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(url !== null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent: boolean) => {
      if (url === null) return;
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const res = await fetch(url);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Failed to load");
        writeCache(key, json);
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [url, key]
  );

  // Read cache on mount (client only, so no hydration mismatch). Show cached
  // data instantly; only hit the network when there's nothing cached or it's
  // gone stale.
  useEffect(() => {
    if (url === null) return;
    const cached = readCache<T>(key);
    if (cached) {
      setData(cached.data);
      setLoading(false);
      if (Date.now() - cached.at >= ttlMs) load(true);
    } else {
      load(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, loading, error, refreshing, refresh: () => load(true) };
}
