"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHydrated } from "@/lib/hooks";

export function ThemeToggle() {
  const { setTheme } = useTheme();
  const hydrated = useHydrated();

  if (!hydrated) return <div className="h-10 w-10" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="glass" size="icon" className="h-10 w-10 rounded-full border-white/5">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-strong border-white/10 rounded-2xl p-1 min-w-[120px]">
        <DropdownMenuItem onClick={() => setTheme("light")} className="rounded-xl hover:bg-white/5 gap-2 cursor-pointer focus:bg-white/5 focus:text-primary">
          <Sun className="h-4 w-4" />
          <span className="font-bold">Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="rounded-xl hover:bg-white/5 gap-2 cursor-pointer focus:bg-white/5 focus:text-primary">
          <Moon className="h-4 w-4" />
          <span className="font-bold">Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="rounded-xl hover:bg-white/5 gap-2 cursor-pointer focus:bg-white/5 focus:text-primary">
          <Monitor className="h-4 w-4" />
          <span className="font-bold">System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
