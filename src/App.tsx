import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Layout } from "@/components/Layout";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ContentGeneration from "./pages/ContentGeneration";
import Scheduling from "./pages/Scheduling";
import Automation from "./pages/Automation";
import Analytics from "./pages/Analytics";
import LeadTracking from "./pages/LeadTracking";
import Integrations from "./pages/Integrations";
import UserManagement from "./pages/UserManagement";
import Strategy from "./pages/Strategy";
import Compliance from "./pages/Compliance";
import DataExport from "./pages/DataExport";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profile } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profile?.status === 'pending') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Account Pending Approval</h2>
          <p>Your account is pending approval. Please wait for admin approval.</p>
        </div>
      </div>
    );
  }

  if (profile?.status === 'rejected') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Account Rejected</h2>
          <p>Your account has been rejected. Please contact support.</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/auth" 
          element={user ? <Navigate to="/" replace /> : <Auth />} 
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/content" element={<ContentGeneration />} />
                  <Route path="/scheduling" element={<Scheduling />} />
                  <Route path="/automation" element={<Automation />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/leads" element={<LeadTracking />} />
                  <Route path="/integrations" element={<Integrations />} />
                  <Route path="/users" element={<UserManagement />} />
                  <Route path="/strategy" element={<Strategy />} />
                  <Route path="/compliance" element={<Compliance />} />
                  <Route path="/export" element={<DataExport />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
