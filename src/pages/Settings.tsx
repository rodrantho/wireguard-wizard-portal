
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Aplicación</CardTitle>
            <CardDescription>
              Detalles sobre la aplicación WireGuard VPN Manager
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Versión:</strong> 1.0.0</p>
              <p><strong>Desarrollado por:</strong> Tu Empresa de IT</p>
              <p>
                Esta aplicación permite gestionar configuraciones VPN WireGuard para múltiples 
                clientes, generando peers de forma rápida y sencilla.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Supabase</CardTitle>
            <CardDescription>
              Información sobre la integración con Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Esta aplicación utiliza Supabase como backend para gestionar la autenticación y el almacenamiento 
              de datos de clientes y peers VPN.
            </p>
            <Button variant="outline" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Configuración de Supabase
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
