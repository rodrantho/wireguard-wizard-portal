
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const downloadToken = url.pathname.split('/').pop()
    
    if (!downloadToken) {
      return new Response('Token de descarga requerido', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    console.log(`Download request for token: ${downloadToken}`)

    // Since we're using Firebase, we need to make an HTTP request to our Firebase backend
    // to get the peer data by download token
    const firebaseResponse = await fetch(`${Deno.env.get('FIREBASE_DATABASE_URL') || 'https://your-project.firebaseio.com'}/vpn_peers.json`, {
      method: 'GET'
    })

    if (!firebaseResponse.ok) {
      return new Response('Error accessing database', { 
        status: 500, 
        headers: corsHeaders 
      })
    }

    const allPeers = await firebaseResponse.json()
    
    // Find peer by download token
    let foundPeer = null
    for (const [id, peer] of Object.entries(allPeers || {})) {
      if ((peer as any).download_token === downloadToken) {
        foundPeer = peer as any
        break
      }
    }

    if (!foundPeer) {
      console.error('Peer not found for token:', downloadToken)
      return new Response('Archivo no encontrado', { 
        status: 404, 
        headers: corsHeaders 
      })
    }

    // Check if download is still active
    if (!foundPeer.is_download_active) {
      return new Response('El enlace de descarga ha sido desactivado', { 
        status: 403, 
        headers: corsHeaders 
      })
    }

    // Check if download has expired
    if (foundPeer.download_expires_at && new Date() > new Date(foundPeer.download_expires_at)) {
      return new Response('El enlace de descarga ha expirado', { 
        status: 410, 
        headers: corsHeaders 
      })
    }

    // Check if download limit has been reached
    if (foundPeer.download_limit && (foundPeer.download_count || 0) >= foundPeer.download_limit) {
      return new Response('Se ha alcanzado el límite de descargas para este archivo', { 
        status: 429, 
        headers: corsHeaders 
      })
    }

    console.log(`Serving download for peer: ${foundPeer.nombre_peer}`)

    // Increment download count (we'll do this async without blocking the download)
    const updatePromise = fetch(`${Deno.env.get('FIREBASE_DATABASE_URL') || 'https://your-project.firebaseio.com'}/vpn_peers/${foundPeer.id}/download_count.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify((foundPeer.download_count || 0) + 1)
    }).catch(err => console.error('Failed to update download count:', err))

    const fileName = `${foundPeer.nombre_peer.replace(/\s+/g, "_")}.conf`
    
    return new Response(foundPeer.config_texto, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    })

  } catch (error) {
    console.error('Download error:', error)
    return new Response('Error interno del servidor', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})
