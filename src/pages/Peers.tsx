import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPeers, getClienteById, Cliente, VpnPeer, deletePeer, updatePeer } from "@/lib/supabase";
import { Plus, Eye, Trash, Download, Search } from "lucide-react";
import { convertToDownloadableLink } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Peers() {
  const { clienteId } = useParams<{ clienteId?: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [peers, setPeers] = useState<any[]>([]);
  const [filteredPeers, setFilteredPeers] = useState<any[]>([]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [selectedPeer, setSelectedPeer] = useState<VpnPeer | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    fetchData();
  }, [clienteId]);
  
  useEffect(() => {
    if (searchQuery) {
      const filtered = peers.filter(peer => 
        peer.nombre_peer.toLowerCase().includes(searchQuery.toLowerCase()) || 
        peer.ip_asignada.includes(searchQuery)
      );
      setFilteredPeers(filtered);
    } else {
      setFilteredPeers(peers);
    }
    setCurrentPage(1); // Reset to first page when filter changes
  }, [searchQuery, peers]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const peersData = await getPeers(clienteId);
      setPeers(peersData);
      setFilteredPeers(peersData);
      
      if (clienteId) {
        const clienteData = await getClienteById(clienteId);
        setCliente(clienteData);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreatePeer = () => {
    if (clienteId) {
      navigate(`/crear-peer/${clienteId}`);
    } else {
      navigate("/crear-peer");
    }
  };
  
  const handleViewPeer = (peer: VpnPeer) => {
    setSelectedPeer(peer);
    setIsViewDialogOpen(true);
  };

  const handlePeerUpdate = (updatedPeer: VpnPeer) => {
    setPeers(peers.map(p => p.id === updatedPeer.id ? updatedPeer : p));
    setFilteredPeers(filteredPeers.map(p => p.id === updatedPeer.id ? updatedPeer : p));
    setSelectedPeer(updatedPeer);
  };

  const handleDeletePeer = async (id: string) => {
    try {
      await deletePeer(id);
      setPeers(peers.filter(p => p.id !== id));
      setFilteredPeers(filteredPeers.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error al eliminar peer:", error);
    }
  };

  const handleEstadoChange = async (peerId: string, newEstado: string) => {
    try {
      await updatePeer(peerId, { estado: newEstado });
      const updatedPeers = peers.map(peer => 
        peer.id === peerId ? { ...peer, estado: newEstado } : peer
      );
      setPeers(updatedPeers);
      setFilteredPeers(updatedPeers.filter(peer => 
        searchQuery ? (
          peer.nombre_peer.toLowerCase().includes(searchQuery.toLowerCase()) || 
          peer.ip_asignada.includes(searchQuery)
        ) : true
      ));
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };
  
  const handleDownloadConfig = (peer: VpnPeer) => {
    convertToDownloadableLink(peer.config_texto, `${peer.nombre_peer.replace(/\s+/g, "_")}.conf`);
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-gray-100 text-gray-800';
      case 'suspendido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Get current peers for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPeers = filteredPeers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPeers.length / itemsPerPage);
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {cliente ? `Peers VPN - ${cliente.nombre}` : "Todos los Peers VPN"}
          </h1>
          {cliente && (
            <p className="text-gray-500">Interfaz: {cliente.interfaz}</p>
          )}
        </div>
        <Button onClick={handleCreatePeer} className="bg-vpn hover:bg-vpn-dark">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Peer
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vpn"></div>
        </div>
      ) : peers.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No hay peers</CardTitle>
            <CardDescription>
              {cliente 
                ? `No hay peers VPN para ${cliente.nombre}. Crea uno nuevo.` 
                : "No hay peers VPN. Selecciona un cliente y crea un nuevo peer."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreatePeer}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Peer VPN
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center border rounded-md px-3 py-2 bg-background">
              <Search className="h-4 w-4 mr-2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none shadow-none focus-visible:ring-0 flex-1"
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="h-5 w-5 p-0"
                >
                  ×
                </Button>
              )}
            </div>
            {filteredPeers.length === 0 && (
              <p className="text-center mt-2 text-sm text-muted-foreground">
                No se encontraron peers con ese criterio
              </p>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            {filteredPeers.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    {!clienteId && <TableHead>Cliente</TableHead>}
                    <TableHead>IP Asignada</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPeers.map((peer) => (
                    <TableRow key={peer.id}>
                      <TableCell className="font-medium">{peer.nombre_peer}</TableCell>
                      {!clienteId && (
                        <TableCell>{peer.clientes?.nombre}</TableCell>
                      )}
                      <TableCell>{peer.ip_asignada}</TableCell>
                      <TableCell>
                        <Select
                          value={peer.estado || 'activo'}
                          onValueChange={(value) => handleEstadoChange(peer.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue>
                              <Badge className={getEstadoBadgeColor(peer.estado || 'activo')}>
                                {peer.estado || 'activo'}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="activo">
                              <Badge className="bg-green-100 text-green-800">activo</Badge>
                            </SelectItem>
                            <SelectItem value="inactivo">
                              <Badge className="bg-gray-100 text-gray-800">inactivo</Badge>
                            </SelectItem>
                            <SelectItem value="suspendido">
                              <Badge className="bg-red-100 text-red-800">suspendido</Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {new Date(peer.fecha_creacion).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewPeer(peer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDownloadConfig(peer)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-500 border-red-200 hover:bg-red-50"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar peer?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará permanentemente el peer VPN "{peer.nombre_peer}".
                                  Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeletePeer(peer.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {/* Pagination */}
            {filteredPeers.length > itemsPerPage && (
              <div className="py-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      // Logic to show current page and nearby pages
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => paginate(pageNumber)}
                            isActive={currentPage === pageNumber}
                            className="cursor-pointer"
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Detalles del Peer: {selectedPeer?.nombre_peer}
            </DialogTitle>
          </DialogHeader>
          {selectedPeer && (
            <QRCodeDisplay
              qrImageUrl={selectedPeer.qr_img_url}
              configText={selectedPeer.config_texto}
              clientName={selectedPeer.nombre_peer}
              commandText={selectedPeer.comando_mikrotik}
              downloadToken={selectedPeer.download_token}
              peer={selectedPeer}
              onPeerUpdate={handlePeerUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
