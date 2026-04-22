import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Hub from "@/pages/hub";
import Pokedex from "@/pages/pokedex";
import Collection from "@/pages/collection";
import World from "@/pages/world";
import Battle from "@/pages/battle";
import Inventory from "@/pages/inventory";
import Leaderboard from "@/pages/leaderboard";
import { Layout } from "@/components/layout";
import { setPlayerIdGetter } from "@workspace/api-client-react";

// Automatically attach stored player ID to every API request
setPlayerIdGetter(() => localStorage.getItem("elemoria_player_id"));

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/hub">
        <Layout><Hub /></Layout>
      </Route>
      <Route path="/pokedex">
        <Layout><Pokedex /></Layout>
      </Route>
      <Route path="/collection">
        <Layout><Collection /></Layout>
      </Route>
      <Route path="/world">
        <Layout><World /></Layout>
      </Route>
      <Route path="/battle">
        <Layout><Battle /></Layout>
      </Route>
      <Route path="/inventory">
        <Layout><Inventory /></Layout>
      </Route>
      <Route path="/leaderboard">
        <Layout><Leaderboard /></Layout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="dark min-h-screen bg-background text-foreground selection:bg-primary/30">
            <Router />
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
