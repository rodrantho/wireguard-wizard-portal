
-- Add fields to control download limits and regeneration
ALTER TABLE public.vpn_peers 
ADD COLUMN download_count INTEGER DEFAULT 0,
ADD COLUMN download_limit INTEGER DEFAULT 1,
ADD COLUMN download_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
ADD COLUMN is_download_active BOOLEAN DEFAULT true;

-- Create index for download expiration queries
CREATE INDEX idx_vpn_peers_download_expires ON public.vpn_peers(download_expires_at);
CREATE INDEX idx_vpn_peers_download_active ON public.vpn_peers(is_download_active);
