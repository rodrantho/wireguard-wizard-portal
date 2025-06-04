
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Authentication check
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
        version: '1.0.0',
        description: 'API REST para integración con el sistema WG-NST',
        endpoints: {
          'GET /api/clientes': 'Obtener todos los clientes',
          'GET /api/clientes/{id}': 'Obtener cliente por ID',
          'GET /api/peers': 'Obtener todos los peers (query: cliente_id)',
          'GET /api/peers/{id}': 'Obtener peer por ID',
          'GET /api/activity': 'Obtener actividad reciente (query: limit)',
          'GET /api/alerts': 'Obtener alertas del sistema',
          'GET /api/audit-logs': 'Obtener logs de auditoría (query: table, record_id)',
          'GET /api/docs': 'Documentación de la API'
        },
        authentication: 'Bearer token requerido en el header Authorization'
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
