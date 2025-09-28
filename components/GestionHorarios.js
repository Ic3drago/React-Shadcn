'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Edit, Trash2, Plus, Clock } from 'lucide-react'
import { obtenerHorariosUsuario, crearHorario, actualizarHorario, eliminarHorario } from '@/lib/horarios'

export default function GestionHorarios({ usuario }) {
  const [horarios, setHorarios] = useState([])
  const [nuevoHorario, setNuevoHorario] = useState({
    hora_ingreso: '15:00',
    hora_salida: '18:00'
  })
  const [editandoHorario, setEditandoHorario] = useState(null)
  const [cargando, setCargando] = useState(false)

  // Cargar horarios del usuario
  useEffect(() => {
    const fetchHorarios = async () => {
      if (usuario?.id) {
        setCargando(true)
        const { data, error } = await obtenerHorariosUsuario(usuario.id)
        
        if (error) {
          toast.error('Error al cargar horarios: ' + error)
        } else {
          setHorarios(data || [])
        }
        setCargando(false)
      }
    }
    fetchHorarios()
  }, [usuario])

  const agregarHorario = async () => {
    if (!nuevoHorario.hora_ingreso || !nuevoHorario.hora_salida) {
      toast.error('Ambas horas son requeridas')
      return
    }

    const result = await crearHorario({
      id_usuario: usuario.id,
      hora_ingreso: nuevoHorario.hora_ingreso,
      hora_salida: nuevoHorario.hora_salida
    })

    if (result.error) {
      toast.error('Error al crear horario: ' + result.error)
    } else {
      toast.success('Horario agregado correctamente')
      setNuevoHorario({ hora_ingreso: '15:00', hora_salida: '18:00' })
      cargarHorarios()
    }
  }

  const actualizarHorarioExistente = async () => {
    if (!editandoHorario.hora_ingreso || !editandoHorario.hora_salida) {
      toast.error('Ambas horas son requeridas')
      return
    }

    const result = await actualizarHorario(editandoHorario.id, {
      hora_ingreso: editandoHorario.hora_ingreso,
      hora_salida: editandoHorario.hora_salida
    })

    if (result.error) {
      toast.error('Error al actualizar horario: ' + result.error)
    } else {
      toast.success('Horario actualizado correctamente')
      setEditandoHorario(null)
      cargarHorarios()
    }
  }

  const eliminarHorarioExistente = async (horario) => {
    const result = await eliminarHorario(horario.id)

    if (result.error) {
      toast.error('Error al eliminar horario: ' + result.error)
    } else {
      toast.success('Horario eliminado correctamente')
      cargarHorarios()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Gestión de Horarios - {usuario.nombre}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="hora_ingreso">Hora de Ingreso</Label>
              <Input
                id="hora_ingreso"
                type="time"
                value={editandoHorario ? editandoHorario.hora_ingreso : nuevoHorario.hora_ingreso}
                onChange={(e) => 
                  editandoHorario 
                    ? setEditandoHorario({...editandoHorario, hora_ingreso: e.target.value})
                    : setNuevoHorario({...nuevoHorario, hora_ingreso: e.target.value})
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora_salida">Hora de Salida</Label>
              <Input
                id="hora_salida"
                type="time"
                value={editandoHorario ? editandoHorario.hora_salida : nuevoHorario.hora_salida}
                onChange={(e) => 
                  editandoHorario 
                    ? setEditandoHorario({...editandoHorario, hora_salida: e.target.value})
                    : setNuevoHorario({...nuevoHorario, hora_salida: e.target.value})
                }
              />
            </div>
            <div className="flex items-end gap-2">
              {editandoHorario ? (
                <>
                  <Button onClick={actualizarHorarioExistente} className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                  <Button variant="outline" onClick={() => setEditandoHorario(null)}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button onClick={agregarHorario} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Horario
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horarios Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {cargando ? (
            <div className="text-center py-6">
              <p>Cargando horarios...</p>
            </div>
          ) : horarios.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No hay horarios registrados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora de Ingreso</TableHead>
                  <TableHead>Hora de Salida</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead className="w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {horarios.map((horario) => {
                  const ingreso = new Date(`2000-01-01T${horario.hora_ingreso}`)
                  const salida = new Date(`2000-01-01T${horario.hora_salida}`)
                  const duracionMs = salida - ingreso
                  const horas = Math.floor(duracionMs / (1000 * 60 * 60))
                  const minutos = Math.floor((duracionMs % (1000 * 60 * 60)) / (1000 * 60))
                  
                  return (
                    <TableRow key={horario.id}>
                      <TableCell className="font-medium">{horario.hora_ingreso}</TableCell>
                      <TableCell>{horario.hora_salida}</TableCell>
                      <TableCell>{horas}h {minutos}m</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditandoHorario(horario)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => eliminarHorarioExistente(horario)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}