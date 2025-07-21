import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
