"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Globe,
  Link2,
  Lock,
  Search,
  Send,
  X,
} from "lucide-react";

/* ==========================================================================
   ShareDialog (Task Manager Component)

   Permits sharing individual task files saved in ./files/<taskname>.txt
   with collaborators, configuring permissions (Owner, Can edit, Can comment, Can view),
   managing public vs restricted link access, and copying the task direct URL.
   ========================================================================== */

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** iOS style continuous corners, degrading to a plain radius. */
const SQUIRCLE = "[corner-shape:squircle]";

/**
 * Inter font stack matching the modern design system.
 */
const FONT_STACK =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.8 } as const;
const SOFT = { type: "spring", stiffness: 300, damping: 30 } as const;

/* --------------------------------------------------------------- types -- */

/** What a person may do. Owner is a station, not a setting: it cannot be given. */
export type AccessRole = "owner" | "edit" | "comment" | "view";

/** Who the link works for. */
export type LinkAccess = "restricted" | "anyone";

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  /** Square image. Initials stand in when there is none. */
  avatar?: string;
  role: AccessRole;
  /** Marks the signed in person, labelled "(you)". */
  you?: boolean;
  /** Invited but not yet accepted. */
  pending?: boolean;
}

export interface ShareDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Panel heading. */
  title?: string;
  /** Shown under the heading — usually the task file being shared. */
  fileName?: string;
  /** The people who already have access. */
  people?: Collaborator[];
  /** Who the link works for. */
  linkAccess?: LinkAccess;
  /** What link holders may do, when the link is open. */
  linkRole?: Exclude<AccessRole, "owner">;
  /** The link itself, copied to the clipboard. */
  shareUrl?: string;
  /** Show the filter field once the list is longer than this. */
  searchThreshold?: number;
  onInvite?: (emails: string[], role: Exclude<AccessRole, "owner">) => void;
  onRoleChange?: (id: string, role: AccessRole) => void;
  onRemove?: (id: string) => void;
  onLinkAccessChange?: (access: LinkAccess, role: Exclude<AccessRole, "owner">) => void;
  onCopyLink?: (url: string) => void;
  onClose?: () => void;
}

/* ------------------------------------------------------------- helpers -- */

const ROLE_LABELS: Record<AccessRole, string> = {
  owner: "Owner",
  edit: "Can edit",
  comment: "Can comment",
  view: "Can view",
};

const ASSIGNABLE: Array<Exclude<AccessRole, "owner">> = ["edit", "comment", "view"];

/** Deliberately loose: the server is the authority, this only catches typos. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

const TINTS = [
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
  "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200",
  "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-200",
];

function tintFor(seed: string) {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n * 31 + seed.charCodeAt(i)) >>> 0;
  return TINTS[n % TINTS.length];
}

function Avatar({ person }: { person: Collaborator }) {
  const EDGE = "ring-1 ring-inset ring-black/[0.12] dark:ring-white/[0.16]";

  return person.avatar ? (
    <img
      src={person.avatar}
      alt=""
      className={cn("h-8 w-8 shrink-0 rounded-full object-cover", EDGE)}
    />
  ) : (
    <span
      aria-hidden
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[12px] font-semibold",
        tintFor(person.email || person.name),
        EDGE,
      )}
    >
      {initials(person.name)}
    </span>
  );
}

/* ------------------------------------------------------------- menu ----- */

interface MenuOption {
  value: string;
  label: string;
  hint?: string;
  danger?: boolean;
}

function Menu({
  label,
  value,
  options,
  onSelect,
  align = "right",
  tone = "quiet",
  disabled,
}: {
  label: string;
  value?: string;
  options: MenuOption[];
  onSelect: (value: string) => void;
  align?: "left" | "right";
  tone?: "quiet" | "field";
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [box, setBox] = React.useState({ top: 0, left: 0, above: false });
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const uid = React.useId();

  const WIDTH = 212;
  const GAP = 6;

  const place = React.useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const r = trigger.getBoundingClientRect();
    const height =
      menuRef.current?.offsetHeight ?? options.reduce((h, o) => h + (o.hint ? 46 : 32), 8);
    const below = window.innerHeight - r.bottom;
    const above = below < height + GAP + 8 && r.top > below;
    setBox({
      top: above ? Math.max(8, r.top - GAP - height) : r.bottom + GAP,
      left: Math.max(
        8,
        Math.min(align === "right" ? r.right - WIDTH : r.left, window.innerWidth - WIDTH - 8),
      ),
      above,
    });
  }, [align, options]);

  React.useLayoutEffect(() => {
    if (!open) return;
    place();
    const id = window.requestAnimationFrame(place);
    return () => window.cancelAnimationFrame(id);
  }, [open, place]);

  React.useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  const menu = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          id={uid}
          role="menu"
          style={{
            position: "fixed",
            top: box.top,
            left: box.left,
            width: WIDTH,
            fontFamily: FONT_STACK,
          }}
          initial={{ opacity: 0, y: box.above ? 4 : -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: box.above ? 4 : -4, scale: 0.98 }}
          transition={SOFT}
          className={cn(
            "z-[60] overflow-hidden p-1",
            "rounded-[12px] border border-black/[0.07] bg-white shadow-[0_16px_36px_-14px_rgb(0_0_0/0.28)]",
            "dark:border-white/[0.09] dark:bg-neutral-900",
            SQUIRCLE,
          )}
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitem"
                onClick={() => {
                  onSelect(opt.value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className={cn(
                  "flex w-full items-start gap-2 rounded-[8px] px-2.5 py-1.5 text-left transition-colors",
                  opt.danger
                    ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/12"
                    : "text-neutral-800 hover:bg-black/[0.05] dark:text-neutral-100 dark:hover:bg-white/[0.07]",
                  SQUIRCLE,
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-medium leading-tight">{opt.label}</span>
                  {opt.hint && (
                    <span className="mt-0.5 block text-[11px] leading-tight text-neutral-500 dark:text-neutral-400">
                      {opt.hint}
                    </span>
                  )}
                </span>
                {active && (
                  <Check aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-500" />
                )}
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? uid : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex shrink-0 items-center gap-1 text-[12.5px] font-medium transition-colors duration-150",
          tone === "field"
            ? cn(
                "h-[38px] rounded-[10px] border px-3",
                "border-black/[0.1] bg-white text-neutral-700 hover:bg-neutral-50",
                "dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-neutral-200 dark:hover:bg-white/[0.08]",
              )
            : cn(
                "h-8 rounded-[9px] px-2 text-neutral-500 hover:bg-black/[0.05] hover:text-neutral-900",
                "dark:text-neutral-400 dark:hover:bg-white/[0.08] dark:hover:text-neutral-50",
              ),
          "disabled:pointer-events-none disabled:opacity-60",
          SQUIRCLE,
        )}
      >
        {label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={SOFT} className="flex">
          <ChevronDown aria-hidden className="h-3.5 w-3.5" />
        </motion.span>
      </button>

      {typeof document !== "undefined" ? createPortal(menu, document.body) : null}
    </>
  );
}

/* --------------------------------------------------------- email field -- */

interface Chip {
  id: string;
  value: string;
  valid: boolean;
}

function EmailField({
  chips,
  setChips,
  draft,
  setDraft,
  onSubmit,
}: {
  chips: Chip[];
  setChips: React.Dispatch<React.SetStateAction<Chip[]>>;
  draft: string;
  setDraft: (v: string) => void;
  onSubmit: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const commit = (raw: string) => {
    const parts = raw
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    setChips((list) => [
      ...list,
      ...parts
        .filter((p) => !list.some((c) => c.value.toLowerCase() === p.toLowerCase()))
        .map((p) => ({ id: `${p}-${Date.now()}-${Math.random()}`, value: p, valid: EMAIL.test(p) })),
    ]);
    setDraft("");
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={cn(
        "flex min-h-[38px] w-full flex-wrap items-center gap-1.5 rounded-[10px] border px-2 py-1.5",
        "border-black/[0.1] bg-white transition-colors",
        "focus-within:border-neutral-400 dark:border-white/[0.12] dark:bg-white/[0.04]",
        "dark:focus-within:border-white/30",
        SQUIRCLE,
      )}
    >
      <AnimatePresence initial={false}>
        {chips.map((chip) => (
          <motion.span
            key={chip.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={SPRING}
            className={cn(
              "inline-flex h-[24px] items-center gap-1 rounded-[7px] pl-2 pr-1 text-[12px] font-medium",
              chip.valid
                ? "bg-neutral-100 text-neutral-700 dark:bg-white/[0.09] dark:text-neutral-200"
                : "bg-red-50 text-red-600 dark:bg-red-500/12 dark:text-red-300",
              SQUIRCLE,
            )}
          >
            {chip.value}
            <button
              type="button"
              aria-label={`Remove ${chip.value}`}
              onClick={(e) => {
                e.stopPropagation();
                setChips((list) => list.filter((c) => c.id !== chip.id));
              }}
              className="grid h-4 w-4 place-items-center rounded-[6px] hover:bg-black/[0.08] dark:hover:bg-white/[0.14]"
            >
              <X aria-hidden className="h-3 w-3" />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>

      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => {
          const v = e.target.value;
          if (/[,;\s]$/.test(v)) commit(v);
          else setDraft(v);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (draft.trim()) commit(draft);
            else onSubmit();
          }
          if (e.key === "Backspace" && !draft && chips.length) {
            const last = chips[chips.length - 1];
            setChips((list) => list.slice(0, -1));
            setDraft(last.value);
          }
        }}
        onBlur={() => draft.trim() && commit(draft)}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text");
          if (!/[,;\s]/.test(text)) return;
          e.preventDefault();
          commit(text);
        }}
        placeholder={chips.length ? "" : "Add people by email"}
        aria-label="Invite people by email"
        className={cn(
          "h-6 min-w-[120px] flex-1 bg-transparent text-[13px] outline-none",
          "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
        )}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- toast -- */

type ToastTone = "done" | "removed";

function Toast({
  message,
  tone,
  onDone,
}: {
  message: string;
  tone: ToastTone;
  onDone: () => void;
}) {
  const done = React.useRef(onDone);
  React.useEffect(() => {
    done.current = onDone;
  });

  React.useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => done.current(), 2600);
    return () => window.clearTimeout(t);
  }, [message]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {message && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={SPRING}
          style={{ fontFamily: FONT_STACK }}
          className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4"
        >
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-[12px] border px-3 py-2 text-[12.5px] font-medium",
              "border-black/[0.07] bg-white text-neutral-900",
              "dark:border-white/[0.1] dark:bg-neutral-800 dark:text-neutral-50",
              "shadow-[0_16px_36px_-14px_rgb(0_0_0/0.28)]",
              SQUIRCLE,
            )}
          >
            {tone === "done" && (
              <Check
                aria-hidden
                className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
                strokeWidth={2.75}
              />
            )}
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ================================================================== root == */

export const ShareDialog = React.forwardRef<HTMLDivElement, ShareDialogProps>(
  function ShareDialog(
    {
      title = "Share this task file",
      fileName,
      people = [],
      linkAccess = "restricted",
      linkRole = "view",
      shareUrl = "http://localhost:3000/file/task.txt",
      searchThreshold = 6,
      onInvite,
      onRoleChange,
      onRemove,
      onLinkAccessChange,
      onCopyLink,
      onClose,
      className,
      style,
      ...props
    },
    ref,
  ) {
    const reduceMotion = useReducedMotion();

    const [list, setList] = React.useState<Collaborator[]>(people);
    React.useEffect(() => setList(people), [people]);

    const [access, setAccess] = React.useState<LinkAccess>(linkAccess);
    const [openRole, setOpenRole] = React.useState<Exclude<AccessRole, "owner">>(linkRole);

    const [chips, setChips] = React.useState<Chip[]>([]);
    const [draft, setDraft] = React.useState("");
    const [inviteRole, setInviteRole] = React.useState<Exclude<AccessRole, "owner">>("edit");

    const [query, setQuery] = React.useState("");
    const [copied, setCopied] = React.useState(false);
    const [toast, setToast] = React.useState<{ text: string; tone: ToastTone } | null>(null);
    const [announcement, setAnnouncement] = React.useState("");

    const pendingDraft = draft.trim();
    const validCount =
      chips.filter((c) => c.valid).length + (EMAIL.test(pendingDraft) ? 1 : 0);

    const invite = () => {
      const emails = [
        ...chips.filter((c) => c.valid).map((c) => c.value),
        ...(EMAIL.test(pendingDraft) ? [pendingDraft] : []),
      ];
      if (!emails.length) return;

      const invited: Collaborator[] = emails.map((email) => ({
        id: `pending-${email}`,
        name: email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
        email,
        role: inviteRole,
        pending: true,
      }));

      setList((current) => [
        ...invited,
        ...current.filter((p) => !emails.includes(p.email)),
      ]);
      setChips((list) => list.filter((c) => !c.valid));
      setDraft("");
      const sent = `${emails.length === 1 ? "Invitation" : "Invitations"} sent to ${emails.length} ${emails.length === 1 ? "person" : "people"}`;
      setAnnouncement(sent);
      setToast({ text: sent, tone: "done" });
      onInvite?.(emails, inviteRole);
    };

    const changeRole = (id: string, role: AccessRole) => {
      setList((current) => current.map((p) => (p.id === id ? { ...p, role } : p)));
      onRoleChange?.(id, role);
    };

    const remove = (id: string) => {
      const person = list.find((p) => p.id === id);
      setList((current) => current.filter((p) => p.id !== id));
      if (person) {
        const said = person.pending
          ? `Invitation to ${person.name} cancelled`
          : `${person.name} no longer has access`;
        setAnnouncement(said);
        setToast({ text: said, tone: "removed" });
      }
      onRemove?.(id);
    };

    const copy = async () => {
      try {
        await navigator.clipboard?.writeText(shareUrl);
      } catch {
        /* clipboard fallback */
      }
      setCopied(true);
      setToast({ text: "Task link copied to clipboard", tone: "done" });
      onCopyLink?.(shareUrl);
    };

    React.useEffect(() => {
      if (!copied) return;
      const t = window.setTimeout(() => setCopied(false), 1800);
      return () => window.clearTimeout(t);
    }, [copied]);

    const accepted = list.filter((p) => !p.pending).length;
    const invitedCount = list.length - accepted;

    const showSearch = list.length > searchThreshold;
    const shown = query.trim()
      ? list.filter((p) =>
          `${p.name} ${p.email}`.toLowerCase().includes(query.trim().toLowerCase()),
        )
      : list;

    return (
      <div
        ref={ref}
        role="dialog"
        aria-label={title}
        style={{ "--share-font": FONT_STACK, fontFamily: "var(--share-font)", ...style } as React.CSSProperties}
        className={cn(
          "w-full max-w-[520px] overflow-hidden rounded-[18px] border text-neutral-950 antialiased",
          "border-black/[0.07] bg-white shadow-[0_1px_2px_rgb(0_0_0/0.05)]",
          "dark:border-white/[0.08] dark:bg-neutral-900 dark:text-neutral-50",
          SQUIRCLE,
          className,
        )}
        {...props}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-3 px-4 pt-4">
          <div className="min-w-0">
            <h2 className="m-0 text-[15px] font-semibold tracking-[-0.01em]">{title}</h2>
            {fileName && (
              <p className="m-0 mt-0.5 truncate text-[12px] text-neutral-500 dark:text-neutral-400">
                {fileName}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(
              "-mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-[8px] text-neutral-400 transition-colors",
              "hover:bg-black/[0.06] hover:text-neutral-800",
              "dark:text-neutral-500 dark:hover:bg-white/[0.1] dark:hover:text-neutral-100",
              SQUIRCLE,
            )}
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        {/* invite */}
        <div className="mt-3 flex items-start gap-2 px-4">
          <div className="min-w-0 flex-1">
            <EmailField
              chips={chips}
              setChips={setChips}
              draft={draft}
              setDraft={setDraft}
              onSubmit={invite}
            />
          </div>
          <Menu
            label={ROLE_LABELS[inviteRole]}
            value={inviteRole}
            tone="field"
            options={ASSIGNABLE.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
            onSelect={(v) => setInviteRole(v as Exclude<AccessRole, "owner">)}
          />
          <motion.button
            type="button"
            onClick={invite}
            disabled={!validCount}
            whileTap={validCount && !reduceMotion ? { scale: 0.97 } : undefined}
            className={cn(
              "inline-flex h-[38px] shrink-0 items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-medium",
              "bg-neutral-900 text-white transition-colors hover:bg-neutral-800",
              "dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-white",
              "disabled:pointer-events-none disabled:opacity-35",
              SQUIRCLE,
            )}
          >
            <Send aria-hidden className="h-3.5 w-3.5" />
            Invite
          </motion.button>
        </div>

        {/* people */}
        <div className="mt-4 px-4">
          <div className="flex items-center justify-between gap-3">
            <p className="m-0 text-[11.5px] font-medium uppercase tracking-[0.05em] text-neutral-400 dark:text-neutral-500">
              Who has access
            </p>
            {showSearch && (
              <div className="relative">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter people"
                  aria-label="Filter people"
                  className={cn(
                    "h-8 w-[150px] rounded-[9px] border bg-transparent pl-7 pr-2 text-[12.5px] outline-none",
                    "border-black/[0.08] placeholder:text-neutral-400 focus:border-neutral-400",
                    "dark:border-white/[0.12] dark:placeholder:text-neutral-500 dark:focus:border-white/30",
                    SQUIRCLE,
                  )}
                />
              </div>
            )}
          </div>

          <div className="mt-1.5 max-h-[268px] overflow-y-auto pr-0.5">
            <AnimatePresence initial={false}>
              {shown.map((person) => (
                <motion.div
                  key={person.id}
                  layout={!reduceMotion}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={SPRING}
                  className="flex items-center gap-2.5 py-1.5"
                >
                  <Avatar person={person} />

                  <div className="min-w-0 flex-1">
                    <p className="m-0 flex items-center gap-1.5 text-[13px] font-medium leading-tight">
                      <span className="truncate">{person.name}</span>
                      {person.you && (
                        <span className="shrink-0 text-neutral-400 dark:text-neutral-500">
                          (you)
                        </span>
                      )}
                      {person.pending && (
                        <span
                          className={cn(
                            "inline-flex h-[18px] shrink-0 items-center rounded-[7px] px-1.5 text-[10.5px] font-medium",
                            "bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-300",
                            SQUIRCLE,
                          )}
                        >
                          Invited
                        </span>
                      )}
                    </p>
                    <p className="m-0 mt-0.5 truncate text-[11.5px] leading-tight text-neutral-500 dark:text-neutral-400">
                      {person.email}
                    </p>
                  </div>

                  {person.role === "owner" ? (
                    <span className="shrink-0 pr-2 text-[12.5px] font-medium text-neutral-400 dark:text-neutral-500">
                      Owner
                    </span>
                  ) : (
                    <Menu
                      label={ROLE_LABELS[person.role]}
                      value={person.role}
                      options={[
                        ...ASSIGNABLE.map((r) => ({ value: r, label: ROLE_LABELS[r] })),
                        {
                          value: "remove",
                          label: person.pending ? "Cancel invitation" : "Remove access",
                          danger: true,
                        },
                      ]}
                      onSelect={(v) =>
                        v === "remove" ? remove(person.id) : changeRole(person.id, v as AccessRole)
                      }
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {!shown.length && (
              <p className="m-0 py-6 text-center text-[12.5px] text-neutral-400 dark:text-neutral-500">
                Nobody matches “{query}”.
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 h-px bg-black/[0.06] dark:bg-white/[0.08]" />

        {/* general access */}
        <div className="flex items-center gap-2.5 px-4 py-3">
          <span
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors",
              access === "anyone"
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-400"
                : "bg-neutral-100 text-neutral-500 dark:bg-white/[0.07] dark:text-neutral-300",
            )}
          >
            {access === "anyone" ? (
              <Globe aria-hidden className="h-4 w-4" />
            ) : (
              <Lock aria-hidden className="h-4 w-4" />
            )}
          </span>

          <div className="-ml-2 min-w-0 flex-1">
            <Menu
              align="left"
              label={access === "anyone" ? "Anyone with the link" : "Only people invited"}
              value={access}
              options={[
                {
                  value: "restricted",
                  label: "Only people invited",
                  hint: "The link works for the list above",
                },
                {
                  value: "anyone",
                  label: "Anyone with the link",
                  hint: "No sign in needed",
                },
              ]}
              onSelect={(v) => {
                const next = v as LinkAccess;
                setAccess(next);
                onLinkAccessChange?.(next, openRole);
              }}
            />
          </div>

          {access === "anyone" && (
            <Menu
              label={ROLE_LABELS[openRole]}
              value={openRole}
              options={ASSIGNABLE.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
              onSelect={(v) => {
                const next = v as Exclude<AccessRole, "owner">;
                setOpenRole(next);
                onLinkAccessChange?.(access, next);
              }}
            />
          )}
        </div>

        <div className="h-px bg-black/[0.06] dark:bg-white/[0.08]" />

        {/* footer */}
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <p className="m-0 truncate text-[11.5px] text-neutral-500 dark:text-neutral-400">
            {accepted} {accepted === 1 ? "person has" : "people have"} access
            {invitedCount > 0 && ` · ${invitedCount} invited`}
          </p>
          <motion.button
            type="button"
            onClick={copy}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-[10px] border px-3 text-[13px] font-medium",
              "border-black/[0.1] text-neutral-800 transition-colors hover:bg-black/[0.04]",
              "dark:border-white/[0.14] dark:text-neutral-100 dark:hover:bg-white/[0.08]",
              SQUIRCLE,
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="done"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={SPRING}
                  className="flex items-center gap-1.5"
                >
                  <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={2.75} />
                  Copied
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={SPRING}
                  className="flex items-center gap-1.5"
                >
                  <Link2 aria-hidden className="h-3.5 w-3.5" />
                  Copy link
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <Toast
          message={toast?.text ?? ""}
          tone={toast?.tone ?? "done"}
          onDone={() => setToast(null)}
        />

        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </div>
    );
  },
);

export default ShareDialog;
export { ShareDialog as Component };
