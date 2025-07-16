"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

// List of components to display in the sidebar
const components = [
  { name: "Knob", path: "/components/knob" },
  { name: "Slider", path: "/components/slider" },
  // More components can be added here in the future
];

export default function SideBar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-full bg-zinc-900/50 border-r border-zinc-800 p-4">
      <Link 
        href="/"
        className="block text-2xl font-bold mb-6 hover:text-primary-color transition-colors"
      >
        Audio UI
      </Link>

      <h2 className="text-xl font-medium mb-4">Components</h2>
      <nav className="space-y-2">
        {components.map((component) => (
          <Link
            key={component.name}
            href={component.path}
            className={`block px-3 py-2 rounded-md transition-colors ${
              pathname === component.path
                ? "bg-primary-color/20 text-white"
                : "hover:bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {component.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
