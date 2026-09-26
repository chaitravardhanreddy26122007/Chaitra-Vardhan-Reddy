"use client";

import { WorksWheel, type WorksWheelItem } from "@/components/ui/works-wheel";
export { MenuBarDemo } from "@/components/ui/bottom-menu-demo";

// Curated high-resolution anime & cinematic Unsplash stock imagery
// Verified reliable URLs with zero nudity, strictly adhering to safety filters
const WORKS: WorksWheelItem[] = [
  {
    title: "Prismatic Rift",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=900&q=80",
    href: "#prismatic-rift",
  },
  {
    title: "Ember Clouds",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80",
    href: "#ember-clouds",
  },
  {
    title: "Neon Portal",
    image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=900&q=80",
    href: "#neon-portal",
  },
  {
    title: "Red Ribbon",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80",
    href: "#red-ribbon",
  },
  {
    title: "Celestial",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
    href: "#celestial",
  },
  { 
    title: "Uplight", 
    image: "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=900&q=80", 
    href: "#uplight" 
  },
  {
    title: "Indigo Marble",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
    href: "#indigo-marble",
  },
  {
    title: "Launch Window",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80",
    href: "#launch-window",
  },
  {
    title: "Cosmic Wave",
    image: "https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=900&q=80",
    href: "#cosmic-wave",
  },
];

export function WorksWheelDemo() {
  return (
    <div className="bg-background text-foreground w-full h-[600px] md:h-[700px] rounded-xl overflow-hidden border border-border shadow-2xl relative">
      <WorksWheel items={WORKS} label="Works '26" action="View" />
    </div>
  );
}

export default WorksWheelDemo;
