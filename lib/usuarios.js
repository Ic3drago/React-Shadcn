import { supabase } from '../lib/supabase'

export async function obtenerUsuarios() {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        cargos_usuarios(
          id,
          fecha_inicio,
          cargos(*)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    const usuariosProcesados = data.map(usuario => ({
      ...usuario,
      cargo_actual: usuario.cargos_usuarios[0]?.cargos || null,
      fecha_inicio_cargo: usuario.cargos_usuarios[0]?.fecha_inicio || null
    }))

    return { data: usuariosProcesados, error: null }
  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    return { data: null, error: error.message }
  }
}

export async function crearUsuario(usuario) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nombre: usuario.nombre,
        email: usuario.email,
        username: usuario.username,
        password: usuario.password,
        edad: usuario.edad
      }])
      .select()

    if (error) throw error
    return { data: data[0], error: null }
  } catch (error) {
    console.error('Error creando usuario:', error)
    return { data: null, error: error.message }
  }
}

export async function actualizarUsuario(id, usuario) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .update({
        nombre: usuario.nombre,
        email: usuario.email,
        username: usuario.username,
        password: usuario.password,
        edad: usuario.edad
      })
      .eq('id', id)
      .select()

    if (error) throw error
    return { data: data[0], error: null }
  } catch (error) {
    console.error('Error actualizando usuario:', error)
    return { data: null, error: error.message }
  }
}

export async function eliminarUsuario(id) {
  try {
    console.log('Eliminando usuario ID:', id)
    
    console.log('Eliminando horarios...')
    const { error: errorHorarios, count: countHorarios } = await supabase
      .from('horarios')
      .delete()
      .eq('id_usuario', id)

    if (errorHorarios) {
      console.error('Error eliminando horarios:', errorHorarios)
      throw errorHorarios
    }
    console.log('Horarios eliminados:', countHorarios)

    console.log('Eliminando tickeos...')
    const { error: errorTickeos, count: countTickeos } = await supabase
      .from('tickeos')
      .delete()
      .eq('id_usuario', id)

    if (errorTickeos) {
      console.error('Error eliminando tickeos:', errorTickeos)
      throw errorTickeos
    }
    console.log('Tickeos eliminados:', countTickeos)

    console.log('Eliminando relaciones de cargos...')
    const { error: errorCargosUsuarios, count: countCargos } = await supabase
      .from('cargos_usuarios')
      .delete()
      .eq('id_usuario', id)

    if (errorCargosUsuarios) {
      console.error('Error eliminando cargos_usuarios:', errorCargosUsuarios)
      throw errorCargosUsuarios
    }
    console.log('Relaciones de cargos eliminadas:', countCargos)

    console.log('Eliminando usuario...')
    const { error, count } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error eliminando usuario:', error)
      throw error
    }
    console.log('Usuario eliminado. Filas afectadas:', count)

    return { error: null }
  } catch (error) {
    console.error('Error completo eliminando usuario:', error)
    return { error: error.message }
  }
}

export async function asignarCargoUsuario(id_usuario, id_cargo, fecha_inicio) {
  try {
    const { error: errorEliminar } = await supabase
      .from('cargos_usuarios')
      .delete()
      .eq('id_usuario', id_usuario)

    if (errorEliminar) throw errorEliminar

    const { data, error } = await supabase
      .from('cargos_usuarios')
      .insert([{
        id_usuario: id_usuario,
        id_cargo: id_cargo,
        fecha_inicio: fecha_inicio
      }])
      .select()

    if (error) throw error
    return { data: data[0], error: null }
  } catch (error) {
    console.error('Error asignando cargo:', error)
    return { data: null, error: error.message }
  }
}
export async function eliminarCargoUsuario(id_cargo_usuario) {
  try {
    const { error } = await supabase
      .from('cargos_usuarios')
      .delete()
      .eq('id', id_cargo_usuario)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error eliminando cargo de usuario:', error)
    return { error: error.message }
  }
}

export async function obtenerUsuarioPorId(id) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        cargos_usuarios(
          id,
          fecha_inicio,
          cargos(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    const usuarioProcesado = {
      ...data,
      cargo_actual: data.cargos_usuarios[0]?.cargos || null,
      fecha_inicio_cargo: data.cargos_usuarios[0]?.fecha_inicio || null
    }

    return { data: usuarioProcesado, error: null }
  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    return { data: null, error: error.message }
  }
}

export async function obtenerUsuariosPorCargo(id_cargo) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        cargos_usuarios!inner(
          id,
          fecha_inicio,
          cargos!inner(*)
        )
      `)
      .eq('cargos_usuarios.id_cargo', id_cargo)
      .order('nombre')

    if (error) throw error

    const usuariosProcesados = data.map(usuario => ({
      ...usuario,
      cargo_actual: usuario.cargos_usuarios[0]?.cargos || null,
      fecha_inicio_cargo: usuario.cargos_usuarios[0]?.fecha_inicio || null
    }))

    return { data: usuariosProcesados, error: null }
  } catch (error) {
    console.error('Error obteniendo usuarios por cargo:', error)
    return { data: null, error: error.message }
  }
}

export async function buscarUsuarios(termino) {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        cargos_usuarios(
          id,
          fecha_inicio,
          cargos(*)
        )
      `)
      .or(`nombre.ilike.%${termino}%,email.ilike.%${termino}%,username.ilike.%${termino}%`)
      .order('nombre')

    if (error) throw error

    const usuariosProcesados = data.map(usuario => ({
      ...usuario,
      cargo_actual: usuario.cargos_usuarios[0]?.cargos || null,
      fecha_inicio_cargo: usuario.cargos_usuarios[0]?.fecha_inicio || null
    }))

    return { data: usuariosProcesados, error: null }
  } catch (error) {
    console.error('Error buscando usuarios:', error)
    return { data: null, error: error.message }
  }
}