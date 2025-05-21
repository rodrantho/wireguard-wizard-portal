
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PeerFormData } from "@/lib/types";
import { validatePeerInput } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cliente } from "@/lib/supabase";

type PeerFormProps = {
  onSubmit: (data: PeerFormData) => void;
  initialData?: PeerFormData;
  isLoading?: boolean;
  cliente?: Cliente;
  allClientes?: Cliente[];
  clienteSeleccionado?: string;
  onClienteChange?: (clienteId: string) => void;
};

export default function PeerForm({ 
  onSubmit, 
  initialData, 
  isLoading = false,
  cliente,
  allClientes,
  clienteSeleccionado,
  onClienteChange
}: PeerFormProps) {
  const [formData, setFormData] = useState<PeerFormData>(
    initialData || {
      nombre_peer: "",
      ip_asignada: "",
      endpoint: "",
      port: cliente?.puerto || "51820",
      allowed_ips: "10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16", // Rangos de IP privadas por defecto
      count: 1,
      multiple: false
    }
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, multiple: checked }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    }
  };
  
  const handleClienteChange = (value: string) => {
    if (onClienteChange) {
      onClienteChange(value);
      
      // Actualizar puerto en base al cliente seleccionado
      if (allClientes) {
        const selectedCliente = allClientes.find(c => c.id === value);
        if (selectedCliente) {
          setFormData(prev => ({
            ...prev,
            port: selectedCliente.puerto || "51820",
            endpoint: selectedCliente.ip_cloud
          }));
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validatePeerInput(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    onSubmit(formData);
  };
  
  return (
    <Card className="w-full max-w-md bg-black/30 backdrop-blur-lg border border-blue-500/30 animate-glow">
      <CardHeader className="border-b border-blue-500/20">
        <CardTitle className="text-blue-400">{initialData ? "Editar Peer" : "Nuevo Peer"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-4">
          {allClientes && onClienteChange && (
            <div className="space-y-2">
              <Label htmlFor="cliente" className="text-blue-300">Cliente</Label>
              <Select 
                value={clienteSeleccionado} 
                onValueChange={handleClienteChange}
              >
                <SelectTrigger className="border-blue-500/30 bg-black/50">
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent className="bg-black/80 border-blue-500/30">
                  {allClientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="nombre_peer" className="text-blue-300">Nombre del peer</Label>
            <Input 
              id="nombre_peer"
              name="nombre_peer"
              value={formData.nombre_peer}
              onChange={handleChange}
              placeholder="Departamento / Usuario"
              className={`border-blue-500/30 bg-black/50 ${errors.nombre_peer ? "border-red-500" : ""}`}
            />
            {errors.nombre_peer && (
              <p className="text-red-500 text-sm">{errors.nombre_peer}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ip_asignada" className="text-blue-300">IP a asignar</Label>
            <Input 
              id="ip_asignada"
              name="ip_asignada"
              value={formData.ip_asignada}
              onChange={handleChange}
              placeholder="10.0.0.2"
              className={`border-blue-500/30 bg-black/50 ${errors.ip_asignada ? "border-red-500" : ""}`}
            />
            {errors.ip_asignada && (
              <p className="text-red-500 text-sm">{errors.ip_asignada}</p>
            )}
          </div>
          
          {!initialData && (
            <>
              <div className="space-y-2">
                <Label htmlFor="endpoint" className="text-blue-300">Endpoint (IP pública del servidor)</Label>
                <Input 
                  id="endpoint"
                  name="endpoint"
                  value={formData.endpoint || (cliente?.ip_cloud || "")}
                  onChange={handleChange}
                  placeholder="203.0.113.1"
                  className="border-blue-500/30 bg-black/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="port" className="text-blue-300">Puerto</Label>
                <Input 
                  id="port"
                  name="port"
                  value={formData.port || (cliente?.puerto || "51820")}
                  onChange={handleChange}
                  placeholder="51820"
                  className="border-blue-500/30 bg-black/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="allowed_ips" className="text-blue-300">IPs permitidas</Label>
                <Input 
                  id="allowed_ips"
                  name="allowed_ips"
                  value={formData.allowed_ips || "10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16"}
                  onChange={handleChange}
                  placeholder="10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16"
                  className="border-blue-500/30 bg-black/50"
                />
                <p className="text-xs text-blue-400/70">Rangos de IP privadas separados por comas</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="multiple" 
                  checked={formData.multiple} 
                  onCheckedChange={handleSwitchChange}
                  className="data-[state=checked]:bg-blue-500"
                />
                <Label htmlFor="multiple" className="text-blue-300">Generar múltiples peers</Label>
              </div>
              
              {formData.multiple && (
                <div className="space-y-2">
                  <Label htmlFor="count" className="text-blue-300">Cantidad de peers</Label>
                  <Input 
                    id="count"
                    name="count"
                    type="number"
                    min={1}
                    value={formData.count?.toString() || "1"}
                    onChange={handleNumberChange}
                    className="w-20 border-blue-500/30 bg-black/50"
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2 border-t border-blue-500/20 pt-4">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => window.history.back()}
            className="border-blue-500/50 text-blue-400 hover:bg-blue-950/30"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || !clienteSeleccionado}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Generar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
