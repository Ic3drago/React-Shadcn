import { supabase } from '../lib/supabase'

export async function obtenerTickeosUsuario(id_usuario, fecha = null) {
  try {
    let query = supabase
      .from('tickeos')
      .select('*')
      .eq('id_usuario', id_usuario)
      .order('fecha', { ascending: false })
      .order('hora', { ascending: false })

    if (fecha) {
      query = query.eq('fecha', fecha)
    }

    const { data, error } = await query

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function registrarTickeoTickeos(tickeo) {
  try {
    const { data, error } = await supabase
      .from('tickeos')
      .insert([tickeo])
      .select()

    if (error) throw error
    return { data: data[0], error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function actualizarTickeo(id, tickeo) {
  try {
    const { data, error } = await supabase
      .from('tickeos')
      .update(tickeo)
      .eq('id', id)
      .select()

    if (error) throw error
    return { data: data[0], error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function eliminarTickeo(id) {
  try {
    const { error } = await supabase
      .from('tickeos')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error: error.message }
  }
}