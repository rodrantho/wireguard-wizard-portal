
export type AuditLog = {
  id: string;
  user_id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
};

export type Comment = {
  id: string;
  user_id: string;
  entity_type: 'cliente' | 'peer';
  entity_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type AccessLog = {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
};

export type ActivityFeed = {
  id: string;
  user_id: string;
  action_type: string;
  description: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: any;
  created_at: string;
};

export type SystemAlert = {
  id: string;
  user_id?: string;
  alert_type: 'ip_conflict' | 'duplicate_peer' | 'security_warning' | 'info';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_read: boolean;
  auto_resolved: boolean;
  resolved_at?: string;
  created_at: string;
};
