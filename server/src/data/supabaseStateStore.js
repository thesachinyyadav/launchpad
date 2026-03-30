const { createClient } = require('@supabase/supabase-js')

const runtimeTable = process.env.SUPABASE_STATE_TABLE || 'app_runtime_state'
const runtimeRowId = process.env.SUPABASE_STATE_ROW_ID || 'launchpad_runtime'

let supabaseClient = null

function isSupabaseStateEnabled() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function getSupabaseClient() {
  if (!isSupabaseStateEnabled()) {
    return null
  }

  if (!supabaseClient) {
    supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return supabaseClient
}

async function loadRuntimeState(defaultState) {
  const client = getSupabaseClient()

  if (!client) {
    return defaultState
  }

  const { data, error } = await client
    .from(runtimeTable)
    .select('payload')
    .eq('id', runtimeRowId)
    .maybeSingle()

  if (error) {
    if (String(error.message || '').includes('relation') && String(error.message || '').includes('does not exist')) {
      throw new Error(
        `Supabase table "${runtimeTable}" was not found. Run server/sql/01_supabase_schema_clean.sql before starting the backend.`,
      )
    }

    throw new Error(error.message || 'Unable to load runtime state from Supabase.')
  }

  if (!data || !data.payload || typeof data.payload !== 'object') {
    await saveRuntimeState(defaultState)
    return defaultState
  }

  return data.payload
}

async function saveRuntimeState(state) {
  const client = getSupabaseClient()

  if (!client) {
    return false
  }

  const { error } = await client
    .from(runtimeTable)
    .upsert(
      {
        id: runtimeRowId,
        payload: state,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'id',
      },
    )

  if (error) {
    throw new Error(error.message || 'Unable to persist runtime state to Supabase.')
  }

  return true
}

async function loadAuthUsersFromSupabase() {
  const client = getSupabaseClient()

  if (!client) {
    return []
  }

  const { data, error } = await client
    .from('users')
    .select('id, full_name, email, role, password_hash, is_active')
    .eq('is_active', true)

  if (error) {
    if (String(error.message || '').includes('relation') && String(error.message || '').includes('does not exist')) {
      return []
    }

    throw new Error(error.message || 'Unable to load auth users from Supabase.')
  }

  return Array.isArray(data) ? data : []
}

module.exports = {
  isSupabaseStateEnabled,
  loadRuntimeState,
  saveRuntimeState,
  loadAuthUsersFromSupabase,
}
