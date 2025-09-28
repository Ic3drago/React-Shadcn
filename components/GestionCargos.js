'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { Edit, Trash2, Plus, User, Briefcase } from 'lucide-react'
import { obtenerCargos, crearCargo, actualizarCargo, eliminarCargo } from '@/lib/cargos'
import { obtenerUsuarios, asignarCargoUsuario, eliminarCargoUsuario } from '@/lib/usuarios'

export default function GestionCargos() {
    const [cargos, setCargos] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [nuevoCargo, setNuevoCargo] = useState({
        cargo: '',
        sueldo: ''
    })
    const [asignacionCargo, setAsignacionCargo] = useState({
        id_usuario: '',
        id_cargo: '',
        fecha_inicio: new Date().toISOString().split('T')[0]
    })
    const [editandoCargo, setEditandoCargo] = useState(null)
    const [cargando, setCargando] = useState(false)

    // Cargar cargos y usuarios
    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        setCargando(true)
        
        const [cargosResponse, usuariosResponse] = await Promise.all([
            obtenerCargos(),
            obtenerUsuarios()
        ])

        if (cargosResponse.error) {
            toast.error('Error al cargar cargos: ' + cargosResponse.error)
        } else {
            setCargos(cargosResponse.data || [])
        }

        if (usuariosResponse.error) {
            toast.error('Error al cargar usuarios: ' + usuariosResponse.error)
        } else {
            setUsuarios(usuariosResponse.data || [])
        }
        
        setCargando(false)
    }

const agregarCargo = async () => {
  if (!nuevoCargo.cargo.trim() || !nuevoCargo.sueldo) {
    toast.error('Todos los campos son requeridos')
    return
  }

  const cargoParaEnviar = {
    cargo: nuevoCargo.cargo.trim(),
    sueldo: parseFloat(nuevoCargo.sueldo)
  }

  const result = await crearCargo(cargoParaEnviar)

  if (result.error) {
    toast.error('Error al crear cargo: ' + result.error)
  } else {
    toast.success('Cargo agregado correctamente')
    setNuevoCargo({ cargo: '', sueldo: '' })
    cargarDatos()
  }
}
    const actualizarCargoExistente = async () => {
        if (!editandoCargo.cargo.trim() || !editandoCargo.sueldo) {
            toast.error('Todos los campos son requeridos')
            return
        }

        const result = await actualizarCargo(editandoCargo.id, {
            cargo: editandoCargo.cargo,
            sueldo: parseFloat(editandoCargo.sueldo)
        })

        if (result.error) {
            toast.error('Error al actualizar cargo: ' + result.error)
        } else {
            toast.success('Cargo actualizado correctamente')
            setEditandoCargo(null)
            cargarDatos()
        }
    }

    const eliminarCargoExistente = async (cargo) => {
        const result = await eliminarCargo(cargo.id)

        if (result.error) {
            toast.error('Error al eliminar cargo: ' + result.error)
        } else {
            toast.success('Cargo eliminado correctamente')
            cargarDatos()
        }
    }

const asignarCargoAUsuario = async () => {
  if (!asignacionCargo.id_usuario || !asignacionCargo.id_cargo) {
    toast.error('Debes seleccionar un usuario y un cargo')
    return
  }

  const result = await asignarCargoUsuario(
    asignacionCargo.id_usuario,
    asignacionCargo.id_cargo,
    asignacionCargo.fecha_inicio
  )

  if (result.error) {
    toast.error('Error al asignar cargo: ' + result.error)
  } else {
    toast.success('Cargo asignado correctamente')
    setAsignacionCargo({
      id_usuario: '',
      id_cargo: '',
      fecha_inicio: new Date().toISOString().split('T')[0]
    })
    cargarDatos()
  }
}

    return (
        <div className="space-y-6">
            {/* Formulario para crear/editar cargos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        {editandoCargo ? 'Editar Cargo' : 'Agregar Nuevo Cargo'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cargo">Nombre del Cargo</Label>
                            <Input
                                id="cargo"
                                value={editandoCargo ? editandoCargo.cargo : nuevoCargo.cargo}
                                onChange={(e) => 
                                    editandoCargo 
                                        ? setEditandoCargo({...editandoCargo, cargo: e.target.value})
                                        : setNuevoCargo({...nuevoCargo, cargo: e.target.value})
                                }
                                placeholder="Ej: Desarrollador Frontend"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sueldo">Sueldo ($)</Label>
                            <Input
                                id="sueldo"
                                type="number"
                                value={editandoCargo ? editandoCargo.sueldo : nuevoCargo.sueldo}
                                onChange={(e) => 
                                    editandoCargo 
                                        ? setEditandoCargo({...editandoCargo, sueldo: e.target.value})
                                        : setNuevoCargo({...nuevoCargo, sueldo: e.target.value})
                                }
                                placeholder="Ej: 1500"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            {editandoCargo ? (
                                <>
                                    <Button onClick={actualizarCargoExistente} className="flex-1">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Actualizar
                                    </Button>
                                    <Button variant="outline" onClick={() => setEditandoCargo(null)}>
                                        Cancelar
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={agregarCargo} className="flex-1">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar Cargo
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Asignar cargo a usuario */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Asignar Cargo a Usuario
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="usuario">Usuario</Label>
                            <Select 
                                value={asignacionCargo.id_usuario} 
                                onValueChange={(value) => setAsignacionCargo({...asignacionCargo, id_usuario: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un usuario" />
                                </SelectTrigger>
                                <SelectContent>
                                    {usuarios.map((usuario) => (
                                        <SelectItem key={usuario.id} value={usuario.id}>
                                            {usuario.nombre} ({usuario.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cargo_asignar">Cargo</Label>
                            <Select 
                                value={asignacionCargo.id_cargo} 
                                onValueChange={(value) => setAsignacionCargo({...asignacionCargo, id_cargo: value})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un cargo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cargos.map((cargo) => (
                                        <SelectItem key={cargo.id} value={cargo.id}>
                                            {cargo.cargo}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
                            <Input
                                id="fecha_inicio"
                                type="date"
                                value={asignacionCargo.fecha_inicio}
                                onChange={(e) => setAsignacionCargo({...asignacionCargo, fecha_inicio: e.target.value})}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={asignarCargoAUsuario} className="flex-1">
                                <Plus className="h-4 w-4 mr-2" />
                                Asignar Cargo
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de cargos */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Cargos</CardTitle>
                </CardHeader>
                <CardContent>
                    {cargando ? (
                        <div className="text-center py-6">
                            <p>Cargando cargos...</p>
                        </div>
                    ) : cargos.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground">No hay cargos registrados</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Cargo</TableHead>
                                    <TableHead>Sueldo</TableHead>
                                    <TableHead>Usuarios Asignados</TableHead>
                                    <TableHead className="w-[100px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cargos.map((cargo) => {
                                    const usuariosConEsteCargo = usuarios.filter(usuario => 
                                        usuario.cargo_actual?.id === cargo.id
                                    )
                                    
                                    return (
                                        <TableRow key={cargo.id}>
                                            <TableCell className="font-medium">{cargo.cargo}</TableCell>
                                            <TableCell>${cargo.sueldo}</TableCell>
                                            <TableCell>
                                                {usuariosConEsteCargo.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {usuariosConEsteCargo.map(usuario => (
                                                            <div key={usuario.id} className="text-sm text-muted-foreground">
                                                                • {usuario.nombre}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">Sin usuarios asignados</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setEditandoCargo(cargo)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => eliminarCargoExistente(cargo)}
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