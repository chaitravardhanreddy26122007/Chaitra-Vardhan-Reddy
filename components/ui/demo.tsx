import * as React from "react";
import { Component, type kanbanColumn, type KanbanColumn } from "@/components/ui/trello-kanban-board";

const simpleColumns: KanbanColumn[] = [
  {
    id: "todo",
    title: "To Do",
    tasks: [
      { id: "1", title: "Create project documentation" },
      { id: "2", title: "Design system components" },
      { id: "3", title: "Set up testing framework" },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    tasks: [
      { id: "4", title: "Build authentication flow" },
      { id: "5", title: "API integration" },
    ],
  },
  {
    id: "done",
    title: "Done",
    tasks: [
      { id: "6", title: "Project setup" },
      { id: "7", title: "Database design" },
    ],
  },
];

export default function DemoOne() {
  return (
    <div className="bg-background p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Task Board</h1>
          <p className="text-muted-foreground">Drag tasks between columns to update their status</p>
        </div>
        <Component
          columns={simpleColumns}
          columnColors={{
            todo: "bg-indigo-500",
            "in-progress": "bg-amber-500",
            done: "bg-emerald-500",
          }}
          allowAddTask={false}
        />
      </div>
    </div>
  );
}

export { DemoOne };
