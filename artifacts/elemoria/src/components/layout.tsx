import { Link, useLocation } from "wouter";
import { Compass, Book, Users, Swords, Backpack, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const links = [
    { href: "/hub", label: "Hub", icon: User },
    { href: "/world", label: "World", icon: Compass },
    { href: "/collection", label: "Party", icon: Users },
    { href: "/pokedex", label: "Pokedex", icon: Book },
    { href: "/inventory", label: "Bag", icon: Backpack },
    { href: "/leaderboard", label: "Rank", icon: Trophy },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-20 lg:w-64 border-r border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col items-center lg:items-stretch py-8">
        <div className="px-4 mb-8 hidden lg:block">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Elemoria
          </h1>
        </div>
        <nav className="flex-1 w-full space-y-2 px-2">
          {links.map((link) => {
            const active = location === link.href || location.startsWith(link.href + "/");
            return (
              <Link key={link.href} href={link.href} className="block w-full">
                <span className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group cursor-pointer",
                  active 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}>
                  <link.icon className={cn("w-6 h-6", active ? "text-primary" : "group-hover:text-foreground")} />
                  <span className="hidden lg:block font-medium tracking-wide">{link.label}</span>
                </span>
              </Link>
            )
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto relative z-0">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="relative z-10 min-h-full p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
