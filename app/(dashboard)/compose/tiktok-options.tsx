"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { TikTokDirectPostOptions } from "@/lib/platforms/tiktok";

// Compliant Direct Post picker required by TikTok's content-sharing guidelines:
// the creator must actively choose privacy (no default) and interaction
// settings, see their account, get the commercial-content disclosure, and read
// the compliance declaration before posting.
// https://developers.tiktok.com/doc/content-sharing-guidelines/

type CreatorInfo = {
  nickname: string;
  username: string;
  avatarUrl: string;
  privacyOptions: string[];
  commentDisabled: boolean;
  duetDisabled: boolean;
  stitchDisabled: boolean;
  maxDurationSec: number;
};

const PRIVACY_LABELS: Record<string, string> = {
  PUBLIC_TO_EVERYONE: "Everyone",
  MUTUAL_FOLLOW_FRIENDS: "Friends",
  FOLLOWER_OF_CREATOR: "Followers",
  SELF_ONLY: "Only me (private)",
};

export default function TikTokOptions({
  value,
  onChange,
  onValidityChange,
}: {
  value: TikTokDirectPostOptions;
  onChange: (next: TikTokDirectPostOptions) => void;
  onValidityChange: (valid: boolean) => void;
}) {
  const [info, setInfo] = useState<CreatorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsReconnect, setNeedsReconnect] = useState(false);
  // Commercial-content disclosure toggle (UI-only; maps to the brand toggles).
  // Initialise from the parent value so a remount (e.g. toggling Schedule, or
  // re-selecting TikTok) can't desync the toggle from the brand flags that get
  // sent — otherwise the UI could show disclosure OFF while still posting
  // branded content.
  const [commercial, setCommercial] = useState(
    () => value.yourBrand || value.brandedContent
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/connect/tiktok/creator-info");
        const data = await res.json().catch(() => null);
        if (!active) return;
        if (!res.ok) {
          setNeedsReconnect(Boolean(data?.needsReconnect));
          setError(data?.error ?? "Couldn't load your TikTok account.");
        } else {
          setInfo(data as CreatorInfo);
        }
      } catch {
        if (active) setError("Couldn't load your TikTok account.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Branded content can't be private, so hide SELF_ONLY while it's selected.
  const privacyChoices = (info?.privacyOptions ?? []).filter(
    (p) => !(value.brandedContent && p === "SELF_ONLY")
  );

  const valid =
    !!info &&
    value.privacyLevel !== "" &&
    (!commercial || value.yourBrand || value.brandedContent) &&
    !(value.brandedContent && value.privacyLevel === "SELF_ONLY");

  useEffect(() => {
    onValidityChange(valid);
  }, [valid, onValidityChange]);

  function set<K extends keyof TikTokDirectPostOptions>(
    key: K,
    v: TikTokDirectPostOptions[K]
  ) {
    onChange({ ...value, [key]: v });
  }

  function toggleCommercial(on: boolean) {
    setCommercial(on);
    if (!on) onChange({ ...value, yourBrand: false, brandedContent: false });
  }

  function toggleBranded(on: boolean) {
    // Selecting branded content forces a public audience.
    onChange({
      ...value,
      brandedContent: on,
      privacyLevel:
        on && value.privacyLevel === "SELF_ONLY" ? "" : value.privacyLevel,
    });
  }

  const complianceText = value.brandedContent
    ? "By posting, you agree to TikTok's Branded Content Policy and Music Usage Confirmation."
    : "By posting, you agree to TikTok's Music Usage Confirmation.";

  const box =
    "rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-4";

  if (loading)
    return (
      <div className={box}>
        <p className="text-sm text-zinc-500">Loading TikTok options…</p>
      </div>
    );

  if (error)
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300 space-y-2">
        <p>{error}</p>
        {needsReconnect && (
          <Link href="/dashboard" className="underline hover:text-amber-200">
            Reconnect TikTok
          </Link>
        )}
      </div>
    );

  if (!info) return null;

  return (
    <div className={box}>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-400">Posting to TikTok as</span>
        <span className="font-medium text-zinc-100">
          {info.nickname || info.username}
          {info.username ? ` (@${info.username})` : ""}
        </span>
      </div>

      {/* Privacy — no default; the user must choose. */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400">
          Who can view this video?
        </label>
        <select
          value={value.privacyLevel}
          onChange={(e) => set("privacyLevel", e.target.value)}
          className="w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
        >
          <option value="" disabled>
            Select who can view this post
          </option>
          {privacyChoices.map((p) => (
            <option key={p} value={p}>
              {PRIVACY_LABELS[p] ?? p}
            </option>
          ))}
        </select>
      </div>

      {/* Interaction settings — none checked by default. */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-zinc-400">
          Allow viewers to
        </span>
        <div className="flex flex-wrap gap-4">
          <Toggle
            label="Comment"
            checked={value.allowComment && !info.commentDisabled}
            disabled={info.commentDisabled}
            onChange={(v) => set("allowComment", v)}
          />
          <Toggle
            label="Duet"
            checked={value.allowDuet && !info.duetDisabled}
            disabled={info.duetDisabled}
            onChange={(v) => set("allowDuet", v)}
          />
          <Toggle
            label="Stitch"
            checked={value.allowStitch && !info.stitchDisabled}
            disabled={info.stitchDisabled}
            onChange={(v) => set("allowStitch", v)}
          />
        </div>
      </div>

      {/* Commercial content disclosure. */}
      <div className="space-y-2">
        <Toggle
          label="Disclose commercial content"
          checked={commercial}
          onChange={toggleCommercial}
        />
        {commercial && (
          <div className="pl-1 space-y-2">
            <Toggle
              label="Your brand"
              checked={value.yourBrand}
              onChange={(v) => set("yourBrand", v)}
            />
            <Toggle
              label="Branded content"
              checked={value.brandedContent}
              onChange={toggleBranded}
            />
            <p className="text-xs text-zinc-500">
              {value.brandedContent
                ? "Your video will be labeled as 'Paid partnership'. Branded content can't be private."
                : value.yourBrand
                  ? "Your video will be labeled as 'Promotional content'."
                  : "Select at least one to continue."}
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-500">
        Max video length for this account: {info.maxDurationSec}s.
      </p>
      <p className="text-xs text-zinc-400">{complianceText}</p>
    </div>
  );
}

function Toggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-center gap-2 text-sm ${
        disabled ? "text-zinc-600 cursor-not-allowed" : "text-zinc-300 cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-white/20 bg-white/[0.03] accent-indigo-500"
      />
      {label}
    </label>
  );
}
