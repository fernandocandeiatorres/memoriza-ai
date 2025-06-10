import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Generator from "@/pages/Generator";
import SummaryGenerator from "@/pages/SummaryGenerator";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import { ComponentType } from "react";
import { useAuth } from "@/hooks/useAuth";

function ProtectedRoute({
  component: Component,
  ...rest
}: {
  component: ComponentType<any>;
}) {
  const { session, loading } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    const redirectTo = encodeURIComponent(location);
    return <Redirect to={`/login?redirectTo=${redirectTo}`} />;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/" component={Home} />
        <Route path="/generator">
          <ProtectedRoute component={Generator} />
        </Route>
        <Route path="/summary-generator">
          <ProtectedRoute component={SummaryGenerator} />
        </Route>
        <Route path="/dashboard">
          <ProtectedRoute component={Dashboard} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
