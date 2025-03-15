import { Switch, Route, Link } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Home as HomeIcon } from "lucide-react";
import HomePage from "@/pages/home";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/">
          <a className="font-semibold text-lg">Shekhar Health Tracker</a>
        </Link>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <HomeIcon className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <SettingsIcon className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Navbar />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;