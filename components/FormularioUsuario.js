'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function FormularioUsuario({ usuario = null, cargos = [], onSubmit, onCancel, isLoading = false }) {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        username: '',
        password: '',
        edad: ''
    })

    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (usuario) {
            setFormData({
                nombre: usuario.nombre || '',
                email: usuario.email || '',
                username: usuario.username || '',
                password: '', 
                edad: usuario.edad?.toString() || ''
            })
        }
    }, [usuario])

    const validarFormulario = () => {
        const newErrors = {}

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido'
        }

        if (!formData.edad || parseInt(formData.edad) <= 0 || parseInt(formData.edad) > 120) {
            newErrors.edad = 'La edad debe ser un número entre 1 y 120'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'El email no es válido'
        }

        if (!formData.username.trim()) {
            newErrors.username = 'El username es requerido'
        }

        if (!usuario && !formData.password.trim()) {
            newErrors.password = 'La contraseña es requerida'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (validarFormulario()) {
            const datosEnvio = {
                nombre: formData.nombre,
                email: formData.email,
                username: formData.username,
                edad: parseInt(formData.edad)
            }

            if (!usuario && formData.password) {
                datosEnvio.password = formData.password
            }

            onSubmit(datosEnvio)
        }
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
        
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }))
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>{usuario ? 'Editar Usuario' : 'Crear Usuario'}</CardTitle>
                <CardDescription>
                    {usuario 
                        ? 'Modifica los datos básicos del usuario' 
                        : 'Ingresa los datos del nuevo usuario. El cargo se asigna posteriormente en Gestión de Cargos.'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nombre */}
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                            id="nombre"
                            value={formData.nombre}
                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                            placeholder="Ingresa el nombre"
                            className={errors.nombre ? 'border-red-500' : ''}
                        />
                        {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="Ingresa el email"
                            className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    {/* Username */}
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={formData.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            placeholder="Ingresa el username"
                            className={errors.username ? 'border-red-500' : ''}
                        />
                        {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                    </div>

                    {/* Password (solo para nuevo usuario) */}
                    {!usuario && (
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                placeholder="Ingresa la contraseña"
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                        </div>
                    )}

                    {/* Edad */}
                    <div className="space-y-2">
                        <Label htmlFor="edad">Edad</Label>
                        <Input
                            id="edad"
                            type="number"
                            value={formData.edad}
                            onChange={(e) => handleInputChange('edad', e.target.value)}
                            placeholder="Ingresa la edad"
                            min="1"
                            max="120"
                            className={errors.edad ? 'border-red-500' : ''}
                        />
                        {errors.edad && <p className="text-sm text-red-500">{errors.edad}</p>}
                    </div>

                    {/* Información sobre gestión de cargos */}
                    {usuario && usuario.cargo_actual && (
                        <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                            <p className="text-sm text-blue-800">
                                <strong>Cargo actual:</strong> {usuario.cargo_actual.cargo} (${usuario.cargo_actual.sueldo})
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                Para cambiar el cargo, ve a <strong>Gestión de Cargos</strong>
                            </p>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex gap-2 pt-4">
                        <Button type="submit" disabled={isLoading} className="flex-1">
                            {isLoading ? 'Guardando...' : (usuario ? 'Actualizar' : 'Crear')}
                        </Button>
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                                Cancelar
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}