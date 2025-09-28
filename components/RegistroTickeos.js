'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Edit, Trash2, Plus, CheckSquare, Calendar } from 'lucide-react'
import { obtenerTickeosUsuario, registrarTickeoTickeos, actualizarTickeo, eliminarTickeo } from '@/lib/tickeos'

export default function RegistroTickeos({ usuario }) {
  const [tickeos, setTickeos] = useState([])
  const [nuevoTickeo, setNuevoTickeo] = useState({
    tipo: 'entrada',
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5)
  })
  const [editandoTickeo, setEditandoTickeo] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    const fetchTickeos = async () => {
      if (usuario?.id) {
        setCargando(true)
        const { data, error } = await obtenerTickeosUsuario(usuario.id, fechaFiltro)
        
        if (error) {
          toast.error('Error al cargar tickeos: ' + error)
        } else {
          setTickeos(data || [])
        }
        setCargando(false)
      }
    }
    fetchTickeos()
  }, [usuario, fechaFiltro])

  const registrarTickeo = async () => {
    if (!nuevoTickeo.fecha || !nuevoTickeo.hora) {
      toast.error('Fecha y hora son requeridos')
      return
    }

    const ahora = new Date()
    const horaTickeo = new Date(`${nuevoTickeo.fecha}T${nuevoTickeo.hora}`)
    
    const llegoTarde = false 
    const llegoTemprano = false 

    const result = await registrarTickeoTickeos({
      id_usuario: usuario.id,
      tipo: nuevoTickeo.tipo,
      fecha: nuevoTickeo.fecha,
      hora: nuevoTickeo.hora,
      llego_tarde: llegoTarde,
      llego_temprano: llegoTemprano
    })

    if (result.error) {
      toast.error('Error al registrar tickeo: ' + result.error)
    } else {
      toast.success(`Tickeo de ${nuevoTickeo.tipo} registrado correctamente`)
      setNuevoTickeo({
        tipo: 'entrada',
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().slice(0, 5)
      })
      cargarTickeos()
    }
  }

  const actualizarTickeoExistente = async () => {
    if (!editandoTickeo.fecha || !editandoTickeo.hora) {
      toast.error('Fecha y hora son requeridos')
      return
    }

    const result = await actualizarTickeo(editandoTickeo.id, {
      tipo: editandoTickeo.tipo,
      fecha: editandoTickeo.fecha,
      hora: editandoTickeo.hora
    })

    if (result.error) {
      toast.error('Error al actualizar tickeo: ' + result.error)
    } else {
      toast.success('Tickeo actualizado correctamente')
      setEditandoTickeo(null)
      cargarTickeos()
    }
  }

  const eliminarTickeoExistente = async (tickeo) => {
    const result = await eliminarTickeo(tickeo.id)

    if (result.error) {
      toast.error('Error al eliminar tickeo: ' + result.error)
    } else {
      toast.success('Tickeo eliminado correctamente')
      cargarTickeos()
    }
  }

  const tickeosFiltrados = tickeos.filter(tickeo => 
    !fechaFiltro || tickeo.fecha === fechaFiltro
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Registro de Tickeos - {usuario.nombre}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Registro</Label>
              <div className="flex gap-2">
                <Button 
                  variant={nuevoTickeo.tipo === 'entrada' ? 'default' : 'outline'}
                  onClick={() => setNuevoTickeo({...nuevoTickeo, tipo: 'entrada'})}
                  className="flex-1"
                >
                  Entrada
                </Button>
                <Button 
                  variant={nuevoTickeo.tipo === 'salida' ? 'default' : 'outline'}
                  onClick={() => setNuevoTickeo({...nuevoTickeo, tipo: 'salida'})}
                  className="flex-1"
                >
                  Salida
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={editandoTickeo ? editandoTickeo.fecha : nuevoTickeo.fecha}
                onChange={(e) => 
                  editandoTickeo 
                    ? setEditandoTickeo({...editandoTickeo, fecha: e.target.value})
                    : setNuevoTickeo({...nuevoTickeo, fecha: e.target.value})
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora">Hora</Label>
              <Input
                id="hora"
                type="time"
                value={editandoTickeo ? editandoTickeo.hora : nuevoTickeo.hora}
                onChange={(e) => 
                  editandoTickeo 
                    ? setEditandoTickeo({...editandoTickeo, hora: e.target.value})
                    : setNuevoTickeo({...nuevoTickeo, hora: e.target.value})
                }
              />
            </div>
            <div className="flex items-end gap-2">
              {editandoTickeo ? (
                <>
                  <Button onClick={actualizarTickeoExistente} className="flex-1">
                    <Edit className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
                  <Button variant="outline" onClick={() => setEditandoTickeo(null)}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button onClick={registrarTickeo} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar
                </Button>
              )}
            </div>
          </div>

          {/* Filtro por fecha */}
          <div className="flex items-center gap-4 mb-4">
            <Label htmlFor="filtro-fecha" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Filtrar por fecha:
            </Label>
            <Input
              id="filtro-fecha"
              type="date"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
              className="w-auto"
            />
            {fechaFiltro && (
              <Button variant="outline" onClick={() => setFechaFiltro('')}>
                Limpiar filtro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Tickeos Registrados {fechaFiltro && `- ${fechaFiltro}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cargando ? (
            <div className="text-center py-6">
              <p>Cargando tickeos...</p>
            </div>
          ) : tickeosFiltrados.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                {fechaFiltro ? 'No hay tickeos registrados en esta fecha' : 'No hay tickeos registrados'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickeosFiltrados.map((tickeo) => (
                  <TableRow key={tickeo.id}>
                    <TableCell className="font-medium">{tickeo.fecha}</TableCell>
                    <TableCell>{tickeo.hora}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        tickeo.tipo === 'entrada' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {tickeo.tipo}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {tickeo.llego_tarde && (
                          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                            Tarde
                          </span>
                        )}
                        {tickeo.llego_temprano && (
                          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            Temprano
                          </span>
                        )}
                        {!tickeo.llego_tarde && !tickeo.llego_temprano && (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                            Normal
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditandoTickeo(tickeo)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => eliminarTickeoExistente(tickeo)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}