
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/lib/supabase";
import { Network } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background bg-grid-pattern bg-[size:50px_50px]">
      <div className="flex items-center mb-4">
        <Network className="h-10 w-10 text-vpn animate-pulse mr-2" />
        <h1 className="text-4xl font-bold text-white">
          <span className="text-vpn">WG</span>-NST
        </h1>
      </div>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vpn"></div>
    </div>
  );
};

export default Index;
