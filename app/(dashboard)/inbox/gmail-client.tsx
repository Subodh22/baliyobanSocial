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
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
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
    <div className="mt-6 flex flex-1 overflow-hidden">
      {/* Email list (left) */}
      <div className="flex w-full max-w-sm flex-col border-r border-[#E8E8E8]">
        <div className="flex items-center justify-between border-b border-[#E8E8E8] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] font-medium uppercase tracking-[0.04em] text-[#969696]">Gmail</span>
            <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11px] text-[#969696]">
              {emails.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={refreshing || loading}
              title="Refresh"
              className="rounded border border-[#DEDEDE] px-3 py-1.5 text-xs text-[#5A5A5A] transition-colors hover:bg-[#F6F6F6] hover:text-[#0A0A0A] disabled:opacity-50"
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <button
              onClick={() => {
                setComposeOpen(true);
                setCError(null);
                setCSent(false);
              }}
              className="text-[13px] text-[#0A0A0A] font-[450] inline-flex items-center gap-[5px] border-b border-[#0A0A0A] transition-opacity hover:opacity-55"
            >
              Compose
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[13px] w-[13px]">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="py-16 text-center text-sm text-[#969696]">
              Loading email&hellip;
            </div>
          )}

          {error && !loading && (
            <div className="m-4 rounded border border-[#CC2A1E]/20 bg-red-50 px-4 py-3 text-sm text-[#CC2A1E]">
              {error}
            </div>
          )}

          {!loading && !error && emails.length === 0 && (
            <div className="py-16 text-center text-sm text-[#969696]">
              No emails in your inbox.
            </div>
          )}

          <div className="border border-[#E8E8E8] rounded overflow-hidden mx-0">
            {emails.map((m, i) => (
              <button
                key={m.id}
                onClick={() => openEmail(m)}
                className={`flex w-full items-baseline gap-[14px] px-5 py-[15px] text-left transition-colors hover:bg-[#F6F6F6] ${
                  i < emails.length - 1 ? "border-b border-[#E8E8E8]" : ""
                } ${selected?.id === m.id ? "bg-[#F6F6F6]" : ""}`}
              >
                <span className="w-[160px] shrink-0 text-[13.5px] font-[450] truncate text-[#0A0A0A]">
                  {m.author}
                </span>
                <span className="flex-1 min-w-0 text-[13.5px] truncate">
                  <span className="font-[450]">{m.title}</span>{" "}
                  <span className="text-[#969696] font-normal">— {m.snippet}</span>
                </span>
                <span className="font-[family-name:var(--font-jetbrains-mono)] text-[11.5px] text-[#969696] shrink-0">
                  {timeAgo(m.timestamp)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reading pane (right) */}
      <div className="flex flex-1 flex-col">
        {needsReconnect && (
          <div className="mx-6 mt-4 rounded border border-[#9A6B00]/20 bg-amber-50 px-4 py-3 text-sm text-[#9A6B00]">
            To send and reply to email, reconnect Gmail with send permission.{" "}
            <a
              href="/api/connect/gmail"
              className="font-medium underline hover:opacity-70"
            >
              Reconnect Gmail
            </a>
          </div>
        )}

        {!selected && !detailLoading && !detailError && (
          <div className="flex flex-1 items-center justify-center px-6 text-center">
            <div>
              <p className="text-sm text-[#969696]">
                Select an email to read it
              </p>
              <p className="mt-1 text-xs text-[#C2C2C2]">
                Replies are sent from your connected Gmail account
              </p>
            </div>
          </div>
        )}

        {detailLoading && (
          <div className="flex flex-1 items-center justify-center text-sm text-[#969696]">
            Loading&hellip;
          </div>
        )}

        {detailError && (
          <div className="m-6 rounded border border-[#CC2A1E]/20 bg-red-50 px-4 py-3 text-sm text-[#CC2A1E]">
            {detailError}
          </div>
        )}

        {selected && (
          <>
            <div className="border-b border-[#E8E8E8] px-6 py-4">
              <h2 className="text-base font-medium text-[#0A0A0A]">
                {selected.subject}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-xs text-[#969696]">
                <span className="font-medium text-[#5A5A5A]">
                  {selected.from}
                </span>
                <span className="text-[#C2C2C2]">&lt;{selected.fromEmail}&gt;</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#5A5A5A]">
                {selected.body}
              </p>
            </div>

            {/* Reply box */}
            <div className="border-t border-[#E8E8E8] px-6 py-4">
              {replySent ? (
                <div className="flex items-center justify-between rounded border border-[#1F7A4D]/20 bg-green-50 px-4 py-2 text-sm text-[#1F7A4D]">
                  <span>Reply sent to {selected.fromEmail}.</span>
                  <button
                    onClick={() => setReplySent(false)}
                    className="text-xs text-[#1F7A4D]/70 hover:text-[#1F7A4D]"
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
                    className="w-full resize-none rounded border border-[#DEDEDE] bg-white px-[13px] py-[10px] text-[13.5px] text-[#0A0A0A] placeholder-[#969696] focus:border-[#0A0A0A] focus:outline-none"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[#CC2A1E]">
                      {replyError}
                    </span>
                    <button
                      onClick={sendReply}
                      disabled={replySending || !replyText.trim()}
                      className="rounded bg-[#0A0A0A] px-[15px] py-[9px] text-[13px] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => !cSending && setComposeOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded border border-[#E8E8E8] bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-medium text-[#0A0A0A]">New email</h2>
            <div className="mt-4 space-y-3">
              <input
                type="email"
                value={cTo}
                onChange={(e) => setCTo(e.target.value)}
                placeholder="To"
                disabled={cSending}
                className="w-full rounded border border-[#DEDEDE] bg-white px-[13px] py-[10px] text-[13.5px] text-[#0A0A0A] placeholder-[#969696] focus:border-[#0A0A0A] focus:outline-none"
              />
              <input
                type="text"
                value={cSubject}
                onChange={(e) => setCSubject(e.target.value)}
                placeholder="Subject"
                disabled={cSending}
                className="w-full rounded border border-[#DEDEDE] bg-white px-[13px] py-[10px] text-[13.5px] text-[#0A0A0A] placeholder-[#969696] focus:border-[#0A0A0A] focus:outline-none"
              />
              <textarea
                value={cBody}
                onChange={(e) => setCBody(e.target.value)}
                placeholder="Write your message…"
                rows={8}
                disabled={cSending}
                className="w-full resize-none rounded border border-[#DEDEDE] bg-white px-[13px] py-[10px] text-[13.5px] text-[#0A0A0A] placeholder-[#969696] focus:border-[#0A0A0A] focus:outline-none"
              />
            </div>
            {cSent && (
              <p className="mt-3 text-sm text-[#1F7A4D]">Email sent.</p>
            )}
            {cError && <p className="mt-3 text-sm text-[#CC2A1E]">{cError}</p>}
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setComposeOpen(false)}
                disabled={cSending}
                className="rounded border border-[#DEDEDE] px-[15px] py-[9px] text-[13px] font-[450] text-[#5A5A5A] transition-colors hover:bg-[#F6F6F6] hover:text-[#0A0A0A] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={sendCompose}
                disabled={cSending || !cTo.trim() || !cBody.trim()}
                className="rounded bg-[#0A0A0A] px-[15px] py-[9px] text-[13px] font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50"
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
