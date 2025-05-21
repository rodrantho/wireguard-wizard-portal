
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, QrCode, Terminal } from "lucide-react";
import { convertToDownloadableLink } from "@/lib/utils";
import { toast } from "sonner";

type QRCodeDisplayProps = {
  qrImageUrl: string;
  configText: string;
  clientName: string;
  commandText: string;
};

export default function QRCodeDisplay({
  qrImageUrl,
  configText,
  clientName,
  commandText,
}: QRCodeDisplayProps) {
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

  return (
    <Card className="w-full bg-cyber-glow backdrop-blur-lg border border-blue-500/30 shadow-neon-blue">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col items-center">
            <div className="flex items-center mb-3">
              <QrCode className="h-5 w-5 text-blue-400 mr-2" />
              <h3 className="text-lg font-medium text-blue-400">QR Code</h3>
            </div>
            <div className="p-3 bg-white border-2 border-blue-500/50 rounded-md shadow-neon-blue animate-pulse-blue">
              <img
                src={qrImageUrl}
                alt="QR Code para configuración WireGuard"
                className="w-64 h-64 object-contain"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col space-y-6">
            <div>
              <div className="flex items-center mb-3">
                <Terminal className="h-5 w-5 text-blue-400 mr-2" />
                <h3 className="text-lg font-medium text-blue-400">Archivo de Configuración</h3>
              </div>
              <div className="bg-black/70 text-green-400 p-4 rounded-md h-48 overflow-y-auto font-mono text-sm border border-blue-500/30 shadow-inner-glow">
                <pre>{configText}</pre>
              </div>
              <div className="mt-3 flex space-x-3">
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
              </div>
            </div>

            <div>
              <div className="flex items-center mb-3">
                <Terminal className="h-5 w-5 text-blue-400 mr-2" />
                <h3 className="text-lg font-medium text-blue-400">Comando MikroTik</h3>
              </div>
              <div className="bg-black/70 text-green-400 p-4 rounded-md max-h-32 overflow-y-auto font-mono text-sm border border-blue-500/30 shadow-inner-glow">
                <pre>{commandText}</pre>
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
