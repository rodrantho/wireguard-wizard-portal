
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Network } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      await loginUser(email, password);
      toast.success("Inicio de sesión exitoso");
      navigate("/dashboard");
    } catch (error) {
      // Error already handled in loginUser function
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background bg-grid-pattern bg-[size:50px_50px] p-4">
      <div className="w-full max-w-md relative">
        <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full"></div>
        
        <div className="text-center mb-8 relative z-10">
          <div className="flex justify-center items-center mb-3">
            <Network className="h-10 w-10 text-vpn animate-pulse-blue mr-2" />
            <h1 className="text-4xl font-bold text-white">
              <span className="text-vpn">WG</span>-NST
            </h1>
          </div>
          <p className="text-gray-400 mt-2">Gestión de configuraciones VPN WireGuard</p>
        </div>
        
        <Card className="bg-cyber-glow backdrop-blur-sm border border-border/30 shadow-neon-blue relative z-10">
          <CardHeader>
            <CardTitle className="text-center">Iniciar sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@empresa.com"
                  required
                  className="bg-secondary/30 border-border/40 focus:border-vpn focus:ring-1 focus:ring-vpn"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Contraseña</Label>
                <Input 
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-secondary/30 border-border/40 focus:border-vpn focus:ring-1 focus:ring-vpn"
                />
              </div>
              
              <Button type="submit" className="w-full bg-vpn hover:bg-vpn-dark shadow-neon-blue" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
