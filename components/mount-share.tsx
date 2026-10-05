import * as React from "react";
import { createRoot } from "react-dom/client";
import TaskShareDemo from "./ui/share-demo";
import { ShareDialog, type Collaborator } from "./ui/share-file-dialog";

// 1. Mount demo if demo container is present on the page
const demoContainer = document.getElementById("react-share-demo-root");
if (demoContainer) {
  const filename = demoContainer.getAttribute("data-filename") || "Q3-product-roadmap.txt";
  const shareUrl = demoContainer.getAttribute("data-url") || window.location.href;
  const root = createRoot(demoContainer);
  root.render(<TaskShareDemo taskFilename={filename} shareUrl={shareUrl} />);
}

// 2. Global modal connector for EJS views (Task cards and Show page)
declare global {
  interface Window {
    openTaskShareModal?: (filename: string, shareUrl?: string) => void;
  }
}

// Stock collaborators with verified Unsplash portraits
const DEFAULT_COLLABORATORS: Collaborator[] = [
  { 
    id: "u1", 
    name: "Sarah Anderson", 
    email: "sarah@northwind.studio", 
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&h=128&q=80", 
    role: "owner", 
    you: true 
  },
  { 
    id: "u2", 
    name: "Michael Carter", 
    email: "michael@northwind.studio", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&h=128&q=80", 
    role: "edit" 
  },
  { 
    id: "u3", 
    name: "Emily Thompson", 
    email: "emily@northwind.studio", 
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&h=128&q=80", 
    role: "edit" 
  },
  { 
    id: "u4", 
    name: "Daniel Wilson", 
    email: "daniel@velalabs.com", 
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&h=128&q=80", 
    role: "comment" 
  },
  { 
    id: "u5", 
    name: "Olivia Martinez", 
    email: "olivia@velalabs.com", 
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80", 
    role: "view" 
  },
  { 
    id: "u6", 
    name: "Priya Raman", 
    email: "priya@velalabs.com", 
    role: "view" 
  },
  { 
    id: "u7", 
    name: "Tom Okafor", 
    email: "tom@northwind.studio", 
    role: "comment" 
  },
];

function GlobalShareModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [filename, setFilename] = React.useState("");
  const [shareUrl, setShareUrl] = React.useState("");

  React.useEffect(() => {
    window.openTaskShareModal = (fname: string, url?: string) => {
      setFilename(fname);
      setShareUrl(url || `${window.location.origin}/file/${encodeURIComponent(fname)}`);
      setIsOpen(true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-neutral-950/60 p-4 backdrop-blur-sm transition-opacity"
      onClick={() => setIsOpen(false)}
      role="presentation"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-[520px] animate-in fade-in zoom-in-95 duration-200"
      >
        <ShareDialog
          title="Share Task File"
          fileName={filename}
          people={DEFAULT_COLLABORATORS}
          shareUrl={shareUrl}
          onClose={() => setIsOpen(false)}
          className="shadow-[0_24px_60px_-18px_rgb(0_0_0/0.4)]"
        />
      </div>
    </div>
  );
}

// Mount the global modal container into document body
const modalRootElem = document.createElement("div");
modalRootElem.id = "task-share-modal-root";
document.body.appendChild(modalRootElem);
const modalRoot = createRoot(modalRootElem);
modalRoot.render(<GlobalShareModal />);
