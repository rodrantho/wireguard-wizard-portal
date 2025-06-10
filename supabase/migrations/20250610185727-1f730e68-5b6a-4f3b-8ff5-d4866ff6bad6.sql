
-- Add download_token column to vpn_peers table
ALTER TABLE public.vpn_peers 
ADD COLUMN download_token UUID DEFAULT gen_random_uuid();

-- Create index for faster lookups
CREATE INDEX idx_vpn_peers_download_token ON public.vpn_peers(download_token);
