"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Play, Share2, FileText } from "lucide-react";
import { ShareDialog, type Collaborator } from "@/components/ui/share-file-dialog";

/* High-resolution Unsplash portraits for collaborators */
const PORTRAITS = {
  sarah: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&h=128&q=80",
  michael: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&h=128&q=80",
  emily: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&h=128&q=80",
  daniel: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&h=128&q=80",
  olivia: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80",
} as const;

const TASK_COLLABORATORS: Collaborator[] = [
  { id: "u1", name: "Sarah Anderson", email: "sarah@northwind.studio", avatar: PORTRAITS.sarah, role: "owner", you: true },
  { id: "u2", name: "Michael Carter", email: "michael@northwind.studio", avatar: PORTRAITS.michael, role: "edit" },
  { id: "u3", name: "Emily Thompson", email: "emily@northwind.studio", avatar: PORTRAITS.emily, role: "edit" },
  { id: "u4", name: "Daniel Wilson", email: "daniel@velalabs.com", avatar: PORTRAITS.daniel, role: "comment" },
  { id: "u5", name: "Olivia Martinez", email: "olivia@velalabs.com", avatar: PORTRAITS.olivia, role: "view" },
  { id: "u6", name: "Priya Raman", email: "priya@velalabs.com", role: "view" },
  { id: "u7", name: "Tom Okafor", email: "tom@northwind.studio", role: "comment" },
];

export interface TaskShareDemoProps {
  taskFilename?: string;
  shareUrl?: string;
}

export default function TaskShareDemo({
  taskFilename = "Q3-product-roadmap.txt",
  shareUrl = "http://localhost:3000/file/Q3-product-roadmap.txt",
}: TaskShareDemoProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open]);

  return (
    <div className="w-full bg-background px-6 py-8">
      <div className="mx-auto w-full max-w-[880px] overflow-visible rounded-[18px] border border-black/[0.07] bg-white shadow-[0_1px_2px_rgb(0_0_0/0.05)] [corner-shape:squircle] dark:border-white/[0.08] dark:bg-neutral-900">
        <div className="flex h-14 items-center justify-between gap-4 border-b border-black/[0.06] px-4 dark:border-white/[0.08]">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] bg-blue-600 text-white [corner-shape:squircle]">
              <FileText aria-hidden className="h-3.5 w-3.5" />
            </span>
            <p className="m-0 truncate text-[13.5px] font-medium text-neutral-900 dark:text-neutral-50">
              {taskFilename}
            </p>
            <ChevronDown aria-hidden className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden items-center sm:flex">
              {TASK_COLLABORATORS.slice(0, 4).map((p, i) => (
                <img
                  key={p.id}
                  src={p.avatar}
                  alt={p.name}
                  style={{ marginLeft: i ? -8 : 0, zIndex: 10 - i }}
                  className="h-7 w-7 rounded-full object-cover ring-2 ring-white dark:ring-neutral-900"
                />
              ))}
              <span className="ml-[-8px] grid h-7 w-7 place-items-center rounded-full bg-neutral-100 text-[10.5px] font-semibold text-neutral-600 ring-2 ring-white dark:bg-white/[0.12] dark:text-neutral-200 dark:ring-neutral-900">
                +3
              </span>
            </div>

            <span className="hidden h-5 w-px bg-black/[0.08] sm:block dark:bg-white/[0.12]" />

            <button
              type="button"
              className="hidden h-9 items-center gap-1.5 rounded-[10px] px-2.5 text-[13px] font-medium text-neutral-600 transition-colors hover:bg-black/[0.05] hover:text-neutral-900 sm:inline-flex [corner-shape:squircle] dark:text-neutral-300 dark:hover:bg-white/[0.08] dark:hover:text-neutral-50"
            >
              <Play aria-hidden className="h-3.5 w-3.5" />
              Preview Task
            </button>

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-haspopup="dialog"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] bg-blue-600 px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-blue-700 [corner-shape:squircle]"
            >
              <Share2 aria-hidden className="h-3.5 w-3.5" />
              Share Task
            </button>
          </div>
        </div>

        <div className="px-8 py-10">
          <div className="mx-auto w-full max-w-[560px]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                .txt file
              </span>
              <span className="text-xs text-zinc-400">Stored via fs.writeFile</span>
            </div>
            <div className="h-3 w-[42%] mt-3 rounded-full bg-neutral-200/80 dark:bg-white/[0.1]" />
            <div className="mt-5 space-y-2.5">
              <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-white/[0.06]" />
              <div className="h-2 w-[94%] rounded-full bg-neutral-100 dark:bg-white/[0.06]" />
              <div className="h-2 w-[88%] rounded-full bg-neutral-100 dark:bg-white/[0.06]" />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 grid place-items-center bg-neutral-950/25 p-4 backdrop-blur-[2px]"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="w-full max-w-[520px]"
            >
              <ShareDialog
                title="Share Task File"
                fileName={taskFilename}
                people={TASK_COLLABORATORS}
                shareUrl={shareUrl}
                onClose={() => setOpen(false)}
                className="shadow-[0_24px_60px_-18px_rgb(0_0_0/0.35)]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
