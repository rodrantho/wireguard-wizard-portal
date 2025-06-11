
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, QrCode, Terminal, Settings } from "lucide-react";
import { convertToDownloadableLink } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DownloadLinkManager from "./DownloadLinkManager";
import type { VpnPeer } from "@/lib/supabase";

type QRCodeDisplayProps = {
  qrImageUrl: string;
  configText: string;
  clientName: string;
  commandText: string;
  downloadToken?: string;
  peer?: VpnPeer;
  onPeerUpdate?: (peer: VpnPeer) => void;
};

export default function QRCodeDisplay({
  qrImageUrl,
  configText,
  clientName,
  commandText,
  downloadToken,
  peer,
  onPeerUpdate,
}: QRCodeDisplayProps) {
  const [showDownloadManager, setShowDownloadManager] = useState(false);

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(configText);
    toast.success("Configuración copiada al portapapeles");
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(commandText);
    toast.success("Comando copiado al portapapeles");
  };

  const handleDownloadConfig = () => {
    convertToDownloadableLink(configText, `${clientName.replace(/\s+/g, "_")}.conf`);
  };

  const handleCopyDownloadLink = () => {
    if (downloadToken) {
      const downloadLink = `${window.location.origin}/api/download/${downloadToken}`;
      navigator.clipboard.writeText(downloadLink);
      toast.success("Link de descarga copiado al portapapeles");
    }
  };

  return (
    <Card className="w-full bg-cyber-glow backdrop-blur-lg border border-blue-500/30 shadow-neon-blue overflow-hidden">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-3">
              <QrCode className="h-5 w-5 text-blue-400 mr-2" />
              <h3 className="text-lg font-medium text-blue-400">QR Code</h3>
            </div>
            <div className="p-3 bg-black/60 border-2 border-blue-500/50 rounded-md shadow-neon-blue">
              {qrImageUrl ? (
                <img
                  src={qrImageUrl}
                  alt="QR Code para configuración WireGuard"
                  className="w-60 h-60 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallbackDiv = document.createElement('div');
                      fallbackDiv.className = 'w-60 h-60 flex items-center justify-center text-blue-400 text-center flex-col';
                      fallbackDiv.innerHTML = '<p>QR no disponible</p><p class="text-xs mt-2">Descargue el archivo de configuración</p>';
                      parent.appendChild(fallbackDiv);
                    }
                  }}
                />
              ) : (
                <div className="w-60 h-60 flex items-center justify-center text-blue-400 flex-col text-center">
                  <p>QR proximamente</p>
                  <p className="text-xs mt-2">Por favor descargue el archivo de configuración</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col space-y-6">
            <div>
              <div className="flex items-center mb-3">
                <Terminal className="h-5 w-5 text-blue-400 mr-2" />
                <h3 className="text-lg font-medium text-blue-400">Archivo de Configuración</h3>
              </div>
              <div className="bg-black/70 text-green-400 p-4 rounded-md h-40 overflow-y-auto font-mono text-sm border border-blue-500/30 shadow-inner-glow">
                <pre className="whitespace-pre-wrap break-all">{configText}</pre>
              </div>
              <div className="mt-3 flex space-x-3 flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyConfig}
                  className="flex items-center border-blue-500/50 text-blue-400 hover:bg-blue-950/30"
                >
                  <Copy className="mr-1 h-4 w-4" />
                  Copiar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadConfig}
                  className="flex items-center border-blue-500/50 text-blue-400 hover:bg-blue-950/30"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Descargar .conf
                </Button>
                {downloadToken && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyDownloadLink}
                    className="flex items-center border-green-500/50 text-green-400 hover:bg-green-950/30"
                  >
                    <Copy className="mr-1 h-4 w-4" />
                    Copiar Link Público
                  </Button>
                )}
                {peer && onPeerUpdate && (
                  <Dialog open={showDownloadManager} onOpenChange={setShowDownloadManager}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center border-yellow-500/50 text-yellow-400 hover:bg-yellow-950/30"
                      >
                        <Settings className="mr-1 h-4 w-4" />
                        Gestionar Link
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Gestión de Enlaces de Descarga</DialogTitle>
                      </DialogHeader>
                      <DownloadLinkManager
                        peer={peer}
                        onUpdate={(updatedPeer) => {
                          onPeerUpdate(updatedPeer);
                          setShowDownloadManager(false);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              {downloadToken && (
                <p className="text-xs text-green-400/70 mt-2">
                  Link público: Comparte este enlace para descargar sin login
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center mb-3">
                <Terminal className="h-5 w-5 text-blue-400 mr-2" />
                <h3 className="text-lg font-medium text-blue-400">Comando MikroTik</h3>
              </div>
              <div className="bg-black/70 text-green-400 p-4 rounded-md max-h-28 overflow-y-auto font-mono text-sm border border-blue-500/30 shadow-inner-glow">
                <pre className="whitespace-pre-wrap break-all">{commandText}</pre>
              </div>
              <div className="mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCommand}
                  className="flex items-center border-blue-500/50 text-blue-400 hover:bg-blue-950/30"
                >
                  <Copy className="mr-1 h-4 w-4" />
                  Copiar comando
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
