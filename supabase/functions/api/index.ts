
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const path = url.pathname.replace('/api', '')
    const method = req.method

    console.log(`API call: ${method} ${path}`)

    // Public download endpoint - no authentication required
    if (path.startsWith('/download/') && method === 'GET') {
      const downloadToken = path.split('/')[2]
      
      console.log(`Download request for token: ${downloadToken}`)
      
      // Check if peer exists and download is valid
      const { data: peer, error } = await supabase
        .from('vpn_peers')
        .select('config_texto, nombre_peer, download_count, download_limit, download_expires_at, is_download_active')
        .eq('download_token', downloadToken)
        .single()

      if (error || !peer) {
        console.error('Peer not found:', error)
        return new Response(
          'Archivo no encontrado',
          { status: 404, headers: corsHeaders }
        )
      }

      // Check if download is still active
      if (!peer.is_download_active) {
        return new Response(
          'El enlace de descarga ha sido desactivado',
          { status: 403, headers: corsHeaders }
        )
      }

      // Check if download has expired
      if (peer.download_expires_at && new Date() > new Date(peer.download_expires_at)) {
        return new Response(
          'El enlace de descarga ha expirado',
          { status: 410, headers: corsHeaders }
        )
      }

      // Check if download limit has been reached
      if (peer.download_limit && peer.download_count >= peer.download_limit) {
        return new Response(
          'Se ha alcanzado el límite de descargas para este archivo',
          { status: 429, headers: corsHeaders }
        )
      }

      console.log(`Serving download for peer: ${peer.nombre_peer}`)

      // Increment download count
      await supabase
        .from('vpn_peers')
        .update({ download_count: (peer.download_count || 0) + 1 })
        .eq('download_token', downloadToken)

      // Log the download access
      await supabase.from('access_logs').insert({
        action: 'download_config',
        resource_type: 'peer',
        resource_id: downloadToken,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })

      const fileName = `${peer.nombre_peer.replace(/\s+/g, "_")}.conf`
      
      return new Response(peer.config_texto, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${fileName}"`
        }
      })
    }

    // Authentication check for other endpoints
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log API access
    await supabase.from('access_logs').insert({
      action: `api_${method.toLowerCase()}`,
      resource_type: 'api',
      resource_id: path,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown'
    })

    // Routes
    if (path === '/clientes' && method === 'GET') {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (path === '/clientes' && method === 'POST') {
      const body = await req.json()
      const { data, error } = await supabase
        .from('clientes')
        .insert([body])
        .select()

      if (error) throw error

      return new Response(
        JSON.stringify(data[0]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (path.startsWith('/clientes/') && method === 'GET') {
      const clienteId = path.split('/')[2]
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (path.startsWith('/clientes/') && method === 'PUT') {
      const clienteId = path.split('/')[2]
      const body = await req.json()
      const { data, error } = await supabase
        .from('clientes')
        .update(body)
        .eq('id', clienteId)
        .select()

      if (error) throw error

      return new Response(
        JSON.stringify(data[0]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (path.startsWith('/clientes/') && method === 'DELETE') {
      const clienteId = path.split('/')[2]
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', clienteId)

      if (error) throw error

      return new Response(
        JSON.stringify({ message: 'Cliente eliminado exitosamente' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (path === '/peers' && method === 'GET') {
      const clienteId = url.searchParams.get('cliente_id')
      let query = supabase
        .from('vpn_peers')
        .select('*, clientes(nombre)')
        .order('display_order', { ascending: true })

      if (clienteId) {
        query = query.eq('cliente_id', clienteId)
      }

      const { data, error } = await query

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (path === '/peers' && method === 'POST') {
      const body = await req.json()
      
      // Generate download token if not provided
      if (!body.download_token) {
        body.download_token = crypto.randomUUID()
      }
      
      // Set default download settings
      body.download_count = 0
      body.download_limit = body.download_limit || 1
      body.download_expires_at = body.download_expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      body.is_download_active = true

      const { data, error } = await supabase
        .from('vpn_peers')
        .insert([body])
        .select('*, clientes(nombre)')

      if (error) throw error

      return new Response(
        JSON.stringify(data[0]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (path.startsWith('/peers/') && method === 'GET') {
      const peerId = path.split('/')[2]
      const { data, error } = await supabase
        .from('vpn_peers')
        .select('*, clientes(nombre)')
        .eq('id', peerId)
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (path.startsWith('/peers/') && method === 'PUT') {
      const peerId = path.split('/')[2]
      const body = await req.json()
      const { data, error } = await supabase
        .from('vpn_peers')
        .update(body)
        .eq('id', peerId)
        .select('*, clientes(nombre)')

      if (error) throw error

      return new Response(
        JSON.stringify(data[0]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (path.startsWith('/peers/') && method === 'DELETE') {
      const peerId = path.split('/')[2]
      const { error } = await supabase
        .from('vpn_peers')
        .delete()
        .eq('id', peerId)

      if (error) throw error

      return new Response(
        JSON.stringify({ message: 'Peer eliminado exitosamente' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Regenerate download token endpoint
    if (path.startsWith('/peers/') && path.endsWith('/regenerate-token') && method === 'POST') {
      const peerId = path.split('/')[2]
      const body = await req.json()
      
      const newToken = crypto.randomUUID()
      const expiresAt = body.expires_hours 
        ? new Date(Date.now() + body.expires_hours * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      const { data, error } = await supabase
        .from('vpn_peers')
        .update({
          download_token: newToken,
          download_count: 0,
          download_limit: body.download_limit || 1,
          download_expires_at: expiresAt,
          is_download_active: true
        })
        .eq('id', peerId)
        .select('download_token, download_expires_at, download_limit')

      if (error) throw error

      return new Response(
        JSON.stringify({
          message: 'Token regenerado exitosamente',
          download_token: data[0].download_token,
          download_url: `${url.origin}/api/download/${data[0].download_token}`,
          expires_at: data[0].download_expires_at,
          download_limit: data[0].download_limit
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (path === '/activity' && method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') || '50')
      const { data, error } = await supabase
        .from('activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (path === '/alerts' && method === 'GET') {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (path === '/audit-logs' && method === 'GET') {
      const tableFilter = url.searchParams.get('table')
      const recordFilter = url.searchParams.get('record_id')
      
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (tableFilter) {
        query = query.eq('table_name', tableFilter)
      }

      if (recordFilter) {
        query = query.eq('record_id', recordFilter)
      }

      const { data, error } = await query

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // API documentation endpoint
    if (path === '/docs' && method === 'GET') {
      const docs = {
        title: 'WG-NST API',
        version: '2.0.0',
        description: 'API REST completa para integración con el sistema WG-NST',
        endpoints: {
          // Clientes
          'GET /api/clientes': 'Obtener todos los clientes',
          'POST /api/clientes': 'Crear nuevo cliente',
          'GET /api/clientes/{id}': 'Obtener cliente por ID',
          'PUT /api/clientes/{id}': 'Actualizar cliente',
          'DELETE /api/clientes/{id}': 'Eliminar cliente',
          
          // Peers
          'GET /api/peers': 'Obtener todos los peers (query: cliente_id)',
          'POST /api/peers': 'Crear nuevo peer',
          'GET /api/peers/{id}': 'Obtener peer por ID',
          'PUT /api/peers/{id}': 'Actualizar peer',
          'DELETE /api/peers/{id}': 'Eliminar peer',
          'POST /api/peers/{id}/regenerate-token': 'Regenerar token de descarga',
          
          // Descargas públicas
          'GET /api/download/{token}': 'Descargar configuración (público, sin auth)',
          
          // Sistema
          'GET /api/activity': 'Obtener actividad reciente (query: limit)',
          'GET /api/alerts': 'Obtener alertas del sistema',
          'GET /api/audit-logs': 'Obtener logs de auditoría (query: table, record_id)',
          'GET /api/docs': 'Documentación de la API'
        },
        authentication: 'Bearer token requerido en el header Authorization (excepto /download)',
        download_features: {
          limits: 'Los enlaces de descarga pueden tener límites de uso (1 descarga por defecto)',
          expiration: 'Los enlaces expiran después de 24 horas por defecto',
          regeneration: 'Los tokens se pueden regenerar con nuevos límites y expiración'
        }
      }

      return new Response(
        JSON.stringify(docs, null, 2),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('API Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
