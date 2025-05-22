
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Debes confirmar tu nueva contraseña"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function Settings() {
  const [loading, setLoading] = useState(false);
  
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  const onSubmit = async (values: PasswordFormValues) => {
    setLoading(true);
    try {
      // Get current session to check if logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("No hay sesión activa");
        return;
      }
      
      // First verify the current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email || '',
        password: values.currentPassword,
      });
      
      if (signInError) {
        toast.error("La contraseña actual es incorrecta");
        return;
      }
      
      // If current password is correct, update to new password
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });
      
      if (error) {
        toast.error(`Error al actualizar la contraseña: ${error.message}`);
      } else {
        toast.success("Contraseña actualizada con éxito");
        form.reset();
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>
      
      <Card className="bg-card/50 backdrop-blur-sm border-border/30 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-vpn" />
            Cambiar Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña actual</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Ingresa tu contraseña actual" 
                        {...field} 
                        className="bg-secondary/30 border-border/40 focus:border-vpn focus:ring-1 focus:ring-vpn"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva contraseña</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Ingresa tu nueva contraseña" 
                        {...field}
                        className="bg-secondary/30 border-border/40 focus:border-vpn focus:ring-1 focus:ring-vpn"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar nueva contraseña</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirma tu nueva contraseña" 
                        {...field}
                        className="bg-secondary/30 border-border/40 focus:border-vpn focus:ring-1 focus:ring-vpn"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-vpn hover:bg-vpn-dark shadow-neon-blue" 
                disabled={loading}
              >
                {loading ? "Actualizando..." : "Actualizar contraseña"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
