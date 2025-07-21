import Dashboard from "./Dashboard";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, profile } = useAuth();
  return <Dashboard />;
};

export default Index;
