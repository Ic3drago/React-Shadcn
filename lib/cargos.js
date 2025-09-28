import { supabase } from '../lib/supabase'

export async function obtenerCargos() {
  try {
    const { data, error } = await supabase
      .from('cargos')
      .select('*')
      .order('cargo')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function crearCargo(cargo) {
  try {
    const cargoParaInsertar = {
      cargo: cargo.cargo,
      sueldo: cargo.sueldo
    }

    const { data, error } = await supabase
      .from('cargos')
      .insert([cargoParaInsertar])
      .select()

    if (error) throw error
    return { data: data[0], error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function actualizarCargo(id, cargo) {
  try {
    const { data, error } = await supabase
      .from('cargos')
      .update(cargo)
      .eq('id', id)
      .select()

    if (error) throw error
    return { data: data[0], error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

export async function eliminarCargo(id) {
  try {
    console.log('Eliminando cargo ID:', id)
    
    console.log('Eliminando relaciones de cargos_usuarios...')
    const { error: errorRelaciones, count: countRelaciones } = await supabase
      .from('cargos_usuarios')
      .delete()
      .eq('id_cargo', id)

    if (errorRelaciones) {
      console.error('Error eliminando relaciones:', errorRelaciones)
      throw errorRelaciones
    }
    console.log('Relaciones eliminadas:', countRelaciones)

    console.log('Eliminando cargo...')
    const { error, count } = await supabase
      .from('cargos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error eliminando cargo:', error)
      throw error
    }
    console.log('Cargo eliminado. Filas afectadas:', count)

    return { error: null }
  } catch (error) {
    console.error('Error completo eliminando cargo:', error)
    return { error: error.message }
  }
}