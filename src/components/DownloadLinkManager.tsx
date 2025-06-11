
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updatePeer, VpnPeer } from "@/lib/supabase";
import { Copy, RefreshCw, Clock, Download } from "lucide-react";
import { toast } from "sonner";
import { generateDownloadLink } from "@/lib/utils";

type DownloadLinkManagerProps = {
  peer: VpnPeer;
  onUpdate: (updatedPeer: VpnPeer) => void;
};

export default function DownloadLinkManager({ peer, onUpdate }: DownloadLinkManagerProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [downloadLimit, setDownloadLimit] = useState(peer.download_limit || 1);
  const [expirationHours, setExpirationHours] = useState(24);

  const handleRegenerateToken = async () => {
    setIsRegenerating(true);
    try {
      const newToken = globalThis.crypto.randomUUID();
      const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString();
      
      await updatePeer(peer.id, {
        download_token: newToken,
        download_count: 0,
        download_limit: downloadLimit,
        download_expires_at: expiresAt,
        is_download_active: true
      });

      const updatedPeer = {
        ...peer,
        download_token: newToken,
        download_count: 0,
        download_limit: downloadLimit,
        download_expires_at: expiresAt,
        is_download_active: true
      };

      onUpdate(updatedPeer);
      toast.success("Token de descarga regenerado exitosamente");
    } catch (error) {
      console.error("Error regenerating token:", error);
      toast.error("Error al regenerar el token");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopyDownloadLink = () => {
    if (peer.download_token) {
      const downloadLink = generateDownloadLink(peer.download_token, peer.nombre_peer);
      navigator.clipboard.writeText(downloadLink);
      toast.success("Link de descarga copiado al portapapeles");
    }
  };

  const handleToggleDownload = async () => {
    try {
      await updatePeer(peer.id, {
        is_download_active: !peer.is_download_active
      });

      const updatedPeer = {
        ...peer,
        is_download_active: !peer.is_download_active
      };

      onUpdate(updatedPeer);
      toast.success(peer.is_download_active ? "Descarga desactivada" : "Descarga activada");
    } catch (error) {
      console.error("Error toggling download:", error);
      toast.error("Error al cambiar estado de descarga");
    }
  };

  const isExpired = peer.download_expires_at && new Date() > new Date(peer.download_expires_at);
  const isLimitReached = peer.download_limit && (peer.download_count || 0) >= peer.download_limit;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Gestión de Enlaces de Descarga
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge 
            className={
              !peer.is_download_active ? "bg-gray-100 text-gray-800" :
              isExpired ? "bg-red-100 text-red-800" :
              isLimitReached ? "bg-yellow-100 text-yellow-800" :
              "bg-green-100 text-green-800"
            }
          >
            {!peer.is_download_active ? "Desactivado" :
             isExpired ? "Expirado" :
             isLimitReached ? "Límite alcanzado" :
             "Activo"}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleDownload}
          >
            {peer.is_download_active ? "Desactivar" : "Activar"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-muted-foreground">Descargas</Label>
            <p>{peer.download_count || 0} / {peer.download_limit || "∞"}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Expira</Label>
            <p className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {peer.download_expires_at 
                ? new Date(peer.download_expires_at).toLocaleString()
                : "Nunca"
              }
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="downloadLimit">Límite de descargas</Label>
              <Input
                id="downloadLimit"
                type="number"
                min="1"
                value={downloadLimit}
                onChange={(e) => setDownloadLimit(parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label htmlFor="expirationHours">Expiración (horas)</Label>
              <Input
                id="expirationHours"
                type="number"
                min="1"
                value={expirationHours}
                onChange={(e) => setExpirationHours(parseInt(e.target.value) || 24)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleRegenerateToken}
              disabled={isRegenerating}
              className="flex-1"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? "animate-spin" : ""}`} />
              Regenerar Token
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCopyDownloadLink}
              disabled={!peer.download_token || !peer.is_download_active}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Link
            </Button>
          </div>
        </div>

        {peer.download_token && (
          <div className="p-3 bg-muted rounded-md">
            <Label className="text-xs text-muted-foreground">Link de descarga</Label>
            <p className="text-xs font-mono break-all">
              {generateDownloadLink(peer.download_token, peer.nombre_peer)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
