// A single normalized item shown in the unified Inbox, regardless of source.
export type InboxItem = {
  id: string;
  source: "gmail" | "youtube" | "slack";
  kind: string; // "email" | "comment" | "activity" | "message" | "dm"
  author: string; // sender / commenter / channel name
  title?: string; // email subject / video title / workspace
  snippet: string; // body preview
  timestamp: number; // unix seconds
  url?: string; // deep link back to the source
  // Gmail-only fields used to compose a threaded reply.
  threadId?: string; // Gmail thread id
  fromEmail?: string; // sender's bare email address
  messageId?: string; // RFC 2822 Message-ID header, for In-Reply-To/References
};

// Optional per-source summary (e.g. YouTube channel stats).
export type InboxSummary = {
  source: "youtube";
  label: string;
  stats: { label: string; value: string }[];
};
