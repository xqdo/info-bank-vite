import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CreateTournament from "@/pages/create-tournament";
import Tournaments from "@/pages/tournaments";
import TournamentView from "@/pages/tournament-view";
import MatchControl from "@/pages/match-control";
import GameDisplay from "@/pages/game-display";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={CreateTournament} />
      <Route path="/tournaments" component={Tournaments} />
      <Route path="/tournament/:id" component={TournamentView} />
      <Route path="/tournament/:tournamentId/match/:matchId" component={MatchControl} />
      <Route path="/display" component={GameDisplay} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="flex items-center justify-between gap-4 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <ThemeToggle />
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-auto">
            <Router />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function DisplayLayout() {
  return (
    <div className="min-h-screen">
      <GameDisplay />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="info-bank-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Switch>
            <Route path="/display">
              <DisplayLayout />
            </Route>
            <Route>
              <AppLayout />
            </Route>
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
