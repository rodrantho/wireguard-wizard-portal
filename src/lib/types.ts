export type ClienteFormData = {
  nombre: string;
  ip_cloud: string;
  public_key: string;
  interfaz: string;
  puerto: string;
};

export type PeerFormData = {
  nombre_peer: string;
  ip_asignada: string;
  endpoint?: string;
  port?: string;
  allowed_ips?: string;
  count?: number;
  multiple?: boolean;
};

export type LoginFormData = {
  email: string;
  password: string;
};
