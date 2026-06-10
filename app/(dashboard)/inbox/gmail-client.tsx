"use client";

import { useEffect, useState } from "react";
import { useCachedFetch } from "./use-cached-fetch";

type EmailItem = {
  id: string;
  author: string;
  title?: string;
  snippet: string;
  timestamp: number;
  threadId?: string;
  fromEmail?: string;
  messageId?: string;
};

type EmailDetail = {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  fromEmail: string;
  to: string;
  date: string;
  messageId: string;
  body: string;
};

function timeAgo(unix: number): string {
  const diff = Math.floor(Date.now() / 1000) - unix;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function replySubject(subject: string): string {
  return /^re:/i.test(subject) ? subject : `Re: ${subject}`;
}

export default function GmailClient({ canSend }: { canSend: boolean }) {
  const {
    data: gmailData,
    loading,
    error,
    refreshing,
    refresh,
  } = useCachedFetch<{ items: EmailItem[]; canSend: boolean }>(
    "/api/inbox/gmail"
  );
  const emails = gmailData?.items ?? [];
  const [needsReconnect, setNeedsReconnect] = useState(!canSend);

  const [selected, setSelected] = useState<EmailDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySent, setReplySent] = useState(false);

  const [composeOpen, setComposeOpen] = useState(false);
  const [cTo, setCTo] = useState("");
  const [cSubject, setCSubject] = useState("");
  const [cBody, setCBody] = useState("");
  const [cSending, setCSending] = useState(false);
  const [cError, setCError] = useState<string | null>(null);
  const [cSent, setCSent] = useState(false);

  useEffect(() => {
    if (gmailData && gmailData.canSend === false) setNeedsReconnect(true);
  }, [gmailData]);

  async function openEmail(item: EmailItem) {
    setSelected(null);
    setDetailError(null);
    setDetailLoading(true);
    setReplyText("");
    setReplyError(null);
    setReplySent(false);
    try {
      const res = await fetch(`/api/inbox/gmail/message?id=${item.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load email");
      setSelected(data.message);
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : "Failed to load email");
    } finally {
      setDetailLoading(false);
    }
  }

  async function sendReply() {
    if (!selected || !replyText.trim()) return;
    setReplySending(true);
    setReplyError(null);
    try {
      const res = await fetch("/api/inbox/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selected.fromEmail,
          subject: replySubject(selected.subject),
          body: replyText.trim(),
          threadId: selected.threadId,
          inReplyTo: selected.messageId,
        }),
      });
      const data = await res.json();
      if (data.needsReconnect) {
        setNeedsReconnect(true);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Failed to send reply");
      setReplyText("");
      setReplySent(true);
    } catch (e) {
      setReplyError(e instanceof Error ? e.message : "Failed to send reply");
    } finally {
      setReplySending(false);
    }
  }

  async function sendCompose() {
    if (!cTo.trim() || !cBody.trim()) return;
    setCSending(true);
    setCError(null);
    try {
      const res = await fetch("/api/inbox/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: cTo.trim(),
          subject: cSubject.trim(),
          body: cBody.trim(),
        }),
      });
      const data = await res.json();
      if (data.needsReconnect) {
        setNeedsReconnect(true);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Failed to send email");
      setCSent(true);
      setCTo("");
      setCSubject("");
      setCBody("");
      setTimeout(() => {
        setComposeOpen(false);
        setCSent(false);
      }, 1200);
    } catch (e) {
      setCError(e instanceof Error ? e.message : "Failed to send email");
    } finally {
      setCSending(false);
    }
  }

  return (
    <div className="mt-8 flex flex-1 overflow-hidden">
      {/* Email list (left) */}
      <div className="flex w-full max-w-sm flex-col border-r border-white/[0.06]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-300">Gmail</span>
            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[11px] text-indigo-400">
              {emails.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={refreshing || loading}
              title="Refresh"
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200 disabled:opacity-50"
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <button
              onClick={() => {
                setComposeOpen(true);
                setCError(null);
                setCSent(false);
              }}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Compose
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="py-16 text-center text-sm text-zinc-500">
              Loading email&hellip;
            </div>
          )}

          {error && !loading && (
            <div className="m-4 rounded-lg border border-red-500/20 bg-red-950/40 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && emails.length === 0 && (
            <div className="py-16 text-center text-sm text-zinc-500">
              No emails in your inbox.
            </div>
          )}

          {emails.map((m) => (
            <button
              key={m.id}
              onClick={() => openEmail(m)}
              className={`flex w-full flex-col items-start gap-1 border-b border-white/[0.04] px-4 py-3 text-left transition-colors hover:bg-white/[0.03] ${
                selected?.id === m.id ? "bg-white/[0.05]" : ""
              }`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-zinc-200">
                  {m.author}
                </span>
                <span className="flex-shrink-0 text-[11px] text-zinc-600">
                  {timeAgo(m.timestamp)}
                </span>
              </div>
              <span className="truncate text-xs font-medium text-zinc-400">
                {m.title}
              </span>
              <span className="line-clamp-1 text-xs text-zinc-600">
                {m.snippet}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Reading pane (right) */}
      <div className="flex flex-1 flex-col">
        {needsReconnect && (
          <div className="mx-6 mt-4 rounded-lg border border-amber-500/20 bg-amber-950/40 px-4 py-3 text-sm text-amber-400">
            To send and reply to email, reconnect Gmail with send permission.{" "}
            <a
              href="/api/connect/gmail"
              className="font-medium underline hover:text-amber-300"
            >
              Reconnect Gmail
            </a>
          </div>
        )}

        {!selected && !detailLoading && !detailError && (
          <div className="flex flex-1 items-center justify-center px-6 text-center">
            <div>
              <p className="text-sm text-zinc-500">
                Select an email to read it
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                Replies are sent from your connected Gmail account
              </p>
            </div>
          </div>
        )}

        {detailLoading && (
          <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
            Loading&hellip;
          </div>
        )}

        {detailError && (
          <div className="m-6 rounded-lg border border-red-500/20 bg-red-950/40 px-4 py-3 text-sm text-red-400">
            {detailError}
          </div>
        )}

        {selected && (
          <>
            <div className="border-b border-white/[0.06] px-6 py-4">
              <h2 className="text-base font-bold text-zinc-100">
                {selected.subject}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                <span className="font-medium text-zinc-400">
                  {selected.from}
                </span>
                <span className="text-zinc-600">&lt;{selected.fromEmail}&gt;</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                {selected.body}
              </p>
            </div>

            {/* Reply box */}
            <div className="border-t border-white/[0.06] px-6 py-4">
              {replySent ? (
                <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-950/30 px-4 py-2 text-sm text-emerald-400">
                  <span>Reply sent to {selected.fromEmail}.</span>
                  <button
                    onClick={() => setReplySent(false)}
                    className="text-xs text-emerald-300/70 hover:text-emerald-300"
                  >
                    Reply again
                  </button>
                </div>
              ) : (
                <>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${selected.from}…`}
                    rows={3}
                    disabled={replySending}
                    className="w-full resize-none rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-red-400">
                      {replyError}
                    </span>
                    <button
                      onClick={sendReply}
                      disabled={replySending || !replyText.trim()}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                    >
                      {replySending ? "Sending…" : "Send reply"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Compose modal */}
      {composeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => !cSending && setComposeOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#181818] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-zinc-100">New email</h2>
            <div className="mt-4 space-y-3">
              <input
                type="email"
                value={cTo}
                onChange={(e) => setCTo(e.target.value)}
                placeholder="To"
                disabled={cSending}
                className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="text"
                value={cSubject}
                onChange={(e) => setCSubject(e.target.value)}
                placeholder="Subject"
                disabled={cSending}
                className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
              />
              <textarea
                value={cBody}
                onChange={(e) => setCBody(e.target.value)}
                placeholder="Write your message…"
                rows={8}
                disabled={cSending}
                className="w-full resize-none rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            {cSent && (
              <p className="mt-3 text-sm text-emerald-400">Email sent.</p>
            )}
            {cError && <p className="mt-3 text-sm text-red-400">{cError}</p>}
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setComposeOpen(false)}
                disabled={cSending}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={sendCompose}
                disabled={cSending || !cTo.trim() || !cBody.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
              >
                {cSending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
