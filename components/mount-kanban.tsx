import * as React from "react";
import { createRoot } from "react-dom/client";
import { Component as TrelloKanbanBoard, type KanbanColumn, type KanbanTask } from "./ui/trello-kanban-board";
import DemoOne from "./ui/demo";

// 1. Mount static demo if container exists
const demoContainer = document.getElementById("react-kanban-demo-root");
if (demoContainer) {
  const root = createRoot(demoContainer);
  root.render(<DemoOne />);
}

// 2. Interactive full board with fs tasks sync
const liveBoardContainer = document.getElementById("react-kanban-root");
if (liveBoardContainer) {
  const root = createRoot(liveBoardContainer);
  root.render(<LiveKanbanTaskManager />);
}

const STOCK_AVATARS: Record<string, string> = {
  SA: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&h=128&q=80",
  MC: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&h=128&q=80",
  ET: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&h=128&q=80",
  AL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80",
};

function LiveKanbanTaskManager() {
  const [columns, setColumns] = React.useState<KanbanColumn[]>([
    {
      id: "todo",
      title: "To Do (Files)",
      tasks: [],
    },
    {
      id: "in-progress",
      title: "In Progress",
      tasks: [],
    },
    {
      id: "done",
      title: "Done",
      tasks: [],
    },
  ]);
  const [loading, setLoading] = React.useState(true);

  // Load tasks from backend /api/tasks
  const loadTasks = React.useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      
      const fileTasks: KanbanTask[] = (data.tasks || []).map((t: any, index: number) => {
        const cleanTitle = t.filename.replace(/\.txt$/, "");
        const initials = ["SA", "MC", "ET", "AL"][index % 4];
        
        // Infer label from filename or content
        const lower = (t.filename + " " + t.fullContent).toLowerCase();
        const labels: string[] = [];
        if (lower.includes("front") || lower.includes("ui")) labels.push("frontend");
        if (lower.includes("back") || lower.includes("api") || lower.includes("db")) labels.push("backend");
        if (lower.includes("doc") || lower.includes("md")) labels.push("docs");
        if (labels.length === 0) labels.push("research");

        return {
          id: `task-file-${t.filename}`,
          title: cleanTitle || t.filename,
          description: t.preview ? t.preview.slice(0, 90) + (t.preview.length > 90 ? "..." : "") : "Stored in files/" + t.filename,
          labels,
          assignee: initials,
          assigneeAvatar: STOCK_AVATARS[initials],
        };
      });

      // Distribute tasks across columns if needed or place in To Do
      setColumns([
        {
          id: "todo",
          title: "To Do (Files)",
          tasks: fileTasks.slice(0, Math.ceil(fileTasks.length / 2)),
        },
        {
          id: "in-progress",
          title: "In Progress",
          tasks: fileTasks.slice(Math.ceil(fileTasks.length / 2), Math.ceil((fileTasks.length * 3) / 4)),
        },
        {
          id: "done",
          title: "Done",
          tasks: fileTasks.slice(Math.ceil((fileTasks.length * 3) / 4)),
        },
      ]);
    } catch (e) {
      console.warn("Could not load /api/tasks dynamically, using fallback demo state", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Handle adding card directly to fs storage
  const handleTaskAdd = async (columnId: string, title: string) => {
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          details: `Task created from Kanban Board [Column: ${columnId}]\nCreated on ${new Date().toLocaleString()}`,
        }),
      });
      // Refresh to keep in sync with fs
      loadTasks();
    } catch (err) {
      console.error("Error creating task file:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-zinc-400">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mr-2" />
        Loading tasks from file system...
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Live Board View</h2>
          <p className="text-xs text-zinc-400">
            Synced with files directory. Adding cards creates new .txt files on the server.
          </p>
        </div>
        <button
          onClick={() => loadTasks()}
          className="text-xs px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
        >
          Refresh from Disk
        </button>
      </div>

      <TrelloKanbanBoard
        columns={columns}
        onColumnsChange={(cols) => setColumns(cols)}
        onTaskAdd={handleTaskAdd}
        columnColors={{
          todo: "bg-blue-500",
          "in-progress": "bg-amber-500",
          done: "bg-emerald-500",
        }}
        allowAddTask={true}
      />
    </div>
  );
}
