import * as React from "react";
import { Component, type kanbanColumn, type KanbanColumn } from "@/components/ui/trello-kanban-board";

// Stock portraits from Unsplash for realistic avatars
const AVATARS = {
  alex: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80",
  sarah: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&h=128&q=80",
  mike: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&h=128&q=80",
  emily: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=128&h=128&q=80",
};

const simpleColumns: KanbanColumn[] = [
  {
    id: "todo",
    title: "To Do",
    tasks: [
      { 
        id: "1", 
        title: "Create project documentation", 
        description: "Document fs routes and EJS template structure",
        labels: ["docs", "urgent"],
        assignee: "SA",
        assigneeAvatar: AVATARS.sarah,
      },
      { 
        id: "2", 
        title: "Design system components", 
        description: "Configure Tailwind CSS tokens and shadcn structure",
        labels: ["design", "frontend"],
        assignee: "MC",
        assigneeAvatar: AVATARS.mike,
      },
      { 
        id: "3", 
        title: "Set up testing framework", 
        description: "Configure Jest / Playwright suite",
        labels: ["devops"],
        assignee: "AL",
        assigneeAvatar: AVATARS.alex,
      },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    tasks: [
      { 
        id: "4", 
        title: "Build authentication flow", 
        description: "JWT session cookie validation",
        labels: ["backend"],
        assignee: "ET",
        assigneeAvatar: AVATARS.emily,
      },
      { 
        id: "5", 
        title: "API integration", 
        description: "Express fs endpoints for tasks CRUD",
        labels: ["backend", "frontend"],
        assignee: "SA",
        assigneeAvatar: AVATARS.sarah,
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    tasks: [
      { 
        id: "6", 
        title: "Project setup", 
        description: "Initialize Express, TypeScript, and shadcn",
        labels: ["devops"],
        assignee: "AL",
        assigneeAvatar: AVATARS.alex,
      },
      { 
        id: "7", 
        title: "Database design", 
        description: "File-system based storage using node fs module",
        labels: ["backend"],
        assignee: "MC",
        assigneeAvatar: AVATARS.mike,
      },
    ],
  },
];

export default function DemoOne({ allowAdd = true }: { allowAdd?: boolean }) {
  return (
    <div className="bg-background p-4 sm:p-8 rounded-xl border border-border">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Task Board</h1>
          <p className="text-muted-foreground text-sm">
            Drag tasks between columns to update their status or add new cards
          </p>
        </div>
        <Component
          columns={simpleColumns}
          columnColors={{
            todo: "bg-indigo-500",
            "in-progress": "bg-amber-500",
            done: "bg-emerald-500",
          }}
          allowAddTask={allowAdd}
        />
      </div>
    </div>
  );
}

export { DemoOne };
