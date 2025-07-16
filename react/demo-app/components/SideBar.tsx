"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define types for components and theme colors
type Component = {
  name: string;
  path: string;
};

type ThemeColor = {
  color: string;
  name: string;
  cssVar: string;
};

// List of components to display in the sidebar
const components: Component[] = [
  { name: "Knob", path: "/components/knob" },
  { name: "Slider", path: "/components/slider" },
  { name: "Button", path: "/components/button" },
  // More components can be added here in the future
];

// Theme color options
const themeColors: ThemeColor[] = [
  { color: "bg-blue-500", name: "Blue", cssVar: "--theme-blue-primary" },
  { color: "bg-orange-500", name: "Orange", cssVar: "--theme-orange-primary" },
  { color: "bg-pink-500", name: "Pink", cssVar: "--theme-pink-primary" },
  { color: "bg-zinc-500", name: "Slate", cssVar: "--theme-slate-primary" },
  { color: "bg-green-500", name: "Green", cssVar: "--theme-green-primary" },
  { color: "bg-purple-500", name: "Purple", cssVar: "--theme-purple-primary" },
  { color: "bg-teal-500", name: "Teal", cssVar: "--theme-teal-primary" },
  { color: "bg-red-500", name: "Red", cssVar: "--theme-red-primary" }
];

export default function SideBar() {
  const pathname = usePathname();
  const [currentTheme, setCurrentTheme] = useState('--theme-blue-primary');
  const [isOpen, setIsOpen] = useState(false);

  // Function to change theme
  const changeTheme = (themeCssVar: string) => {
    document.documentElement.style.setProperty('--primary-color', `var(${themeCssVar})`);
    document.documentElement.style.setProperty('--primary-color-50', `var(${themeCssVar}-50)`);
    document.documentElement.style.setProperty('--primary-color-20', `var(${themeCssVar}-20)`);
    setCurrentTheme(themeCssVar);
  };

  // Set initial theme when component mounts
  useEffect(() => {
    // Blue is the default theme in styles.css, but we set it explicitly to ensure consistency
    changeTheme('--theme-blue-primary');
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile toggle button - only visible on small screens */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Overlay for mobile - only appears when sidebar is open */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed md:sticky top-0 z-40
          h-screen md:h-screen bg-zinc-900/50 border-r border-zinc-800 p-4 flex flex-col
          w-64 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex-grow">
          <Link 
            href="/"
            className="block text-2xl font-bold mb-6 hover:text-primary-color transition-colors"
          >
            Audio UI
          </Link>

          <h2 className="text-xl font-medium mb-4">Controls</h2>
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

        {/* Theme Selector at the bottom of sidebar */}
        <div className="mt-auto pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">Theme</span>
            <Select 
              value={currentTheme} 
              onValueChange={(value) => changeTheme(value)}
            >
              <SelectTrigger className="w-[120px] bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                {themeColors.map((theme) => (
                  <SelectItem 
                    key={theme.cssVar} 
                    value={theme.cssVar}
                    className="flex items-center gap-2"
                  >
                    <div className={`w-4 h-4 rounded-full ${theme.color} inline-block mr-2`}></div>
                    {theme.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </>
  );
}
