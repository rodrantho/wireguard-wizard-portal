
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClienteFormData } from "@/lib/types";
import { validateClientInput } from "@/lib/utils";

type ClienteFormProps = {
  onSubmit: (data: ClienteFormData) => void;
  initialData?: ClienteFormData;
  isLoading?: boolean;
};

export default function ClienteForm({ onSubmit, initialData, isLoading = false }: ClienteFormProps) {
  const [formData, setFormData] = React.useState<ClienteFormData>(
    initialData || {
      nombre: "",
      ip_cloud: "",
      public_key: "",
      interfaz: ""
    }
  );
  
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateClientInput(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    onSubmit(formData);
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{initialData ? "Editar Cliente" : "Nuevo Cliente"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la empresa</Label>
            <Input 
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Empresa S.A."
              className={errors.nombre ? "border-red-500" : ""}
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm">{errors.nombre}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ip_cloud">IP Pública</Label>
            <Input 
              id="ip_cloud"
              name="ip_cloud"
              value={formData.ip_cloud}
              onChange={handleChange}
              placeholder="203.0.113.1"
              className={errors.ip_cloud ? "border-red-500" : ""}
            />
            {errors.ip_cloud && (
              <p className="text-red-500 text-sm">{errors.ip_cloud}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="public_key">Clave Pública</Label>
            <Input 
              id="public_key"
              name="public_key"
              value={formData.public_key}
              onChange={handleChange}
              placeholder="XL9rFhcxJO0rJj7Ed4..."
              className={errors.public_key ? "border-red-500" : ""}
            />
            {errors.public_key && (
              <p className="text-red-500 text-sm">{errors.public_key}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="interfaz">Interfaz WireGuard</Label>
            <Input 
              id="interfaz"
              name="interfaz"
              value={formData.interfaz}
              onChange={handleChange}
              placeholder="wg0"
              className={errors.interfaz ? "border-red-500" : ""}
            />
            {errors.interfaz && (
              <p className="text-red-500 text-sm">{errors.interfaz}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Guardando..." : initialData ? "Actualizar" : "Crear"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
