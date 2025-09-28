'use client'
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TablaUsuarios from '@/components/TablaUsuarios';
import FormularioUsuario from '@/components/FormularioUsuario';
import DialogoConfirmacion from '@/components/DialogoConfirmacion';
import GestionHorarios from '@/components/GestionHorarios';
import DynamicRegistroTickeos from '@/components/DynamicRegistroTickeos';
import GestionCargos from '@/components/GestionCargos';
import {
  obtenerUsuarios, 
  crearUsuario, 
  actualizarUsuario, 
  eliminarUsuario,
  asignarCargoUsuario
} from '@/lib/usuarios';
import { obtenerCargos } from '@/lib/cargos';
import { 
  Users, 
  Clock, 
  CheckSquare, 
  Briefcase, 
  Menu, 
  X, 
  Sparkles, 
  Moon, 
  Sun,
  Zap,
  Star,
  Rocket,
  Crown
} from 'lucide-react';

export default function HomePage() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Estados para modales y vistas
  const [modalFormulario, setModalFormulario] = useState(false);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [usuarioEliminando, setUsuarioEliminando] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  
  // Estado para controlar la vista activa
  const [vistaActiva, setVistaActiva] = useState('usuarios');
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Efectos especiales
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Estado para verificar si estamos del lado del cliente
  const [isClientSide, setIsClientSide] = useState(false);

  // Efecto para seguir el mouse
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Throttle para mejor rendimiento
      requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Efecto para aplicar dark mode
  useEffect(() => {
    // Mover la lógica del tema al cliente
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
    
    setDarkMode(savedTheme === 'dark' || (!savedTheme && mediaQuery.matches));
    
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Cargar usuarios y cargos al montar el componente
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    setIsClientSide(true);
  }, []);

  const cargarDatosIniciales = async () => {
    setIsLoading(true);
    
    try {
      const [usuariosResponse, cargosResponse] = await Promise.all([
        obtenerUsuarios(),
        obtenerCargos()
      ]);

      if (usuariosResponse.error) {
        toast.error('Error al cargar usuarios: ' + usuariosResponse.error);
      } else {
        setUsuarios(usuariosResponse.data || []);
      }

      if (cargosResponse.error) {
        toast.error('Error al cargar cargos: ' + cargosResponse.error);
      } else {
        setCargos(cargosResponse.data || []);
      }
    } catch (error) {
      toast.error('Error al cargar datos: ' + error.message);
    }
    
    setIsLoading(false);
  };

  const cargarUsuarios = async () => {
    const { data, error } = await obtenerUsuarios();
    if (error) {
      toast.error('Error al cargar usuarios: ' + error);
    } else {
      setUsuarios(data || []);
    }
  };

  // Handlers para usuarios
  const handleNuevoUsuario = () => {
    setUsuarioEditando(null);
    setModalFormulario(true);
  };

  const handleEditarUsuario = (usuario) => {
    setUsuarioEditando(usuario);
    setModalFormulario(true);
  };

  const handleEliminarUsuario = (usuario) => {
    setUsuarioEliminando(usuario);
    setModalConfirmacion(true);
  };

  const handleSubmitFormulario = async (datosUsuario) => {
    setIsSubmitting(true);
    let result;
    
    try {
        if (usuarioEditando) {
            result = await actualizarUsuario(usuarioEditando.id, datosUsuario);
        } else {
            result = await crearUsuario(datosUsuario);
            
            if (result.data && datosUsuario.id_cargo) {
                await asignarCargoUsuario(
                    result.data.id, 
                    datosUsuario.id_cargo, 
                    datosUsuario.fecha_inicio_cargo || new Date().toISOString().split('T')[0]
                );
            }
        }

        if (result.error) {
            toast.error(
                usuarioEditando
                    ? 'Error al actualizar usuario: ' + result.error 
                    : 'Error al crear usuario: ' + result.error
            );
        } else {
            toast.success(
                usuarioEditando
                    ? '✨ Usuario actualizado correctamente'
                    : '🎉 Usuario creado correctamente'
            );
            setModalFormulario(false);
            cargarUsuarios();
        }
    } catch (error) {
        toast.error('Error en la operación: ' + error.message);
    }
    
    setIsSubmitting(false);
  };

  const handleConfirmarEliminacion = async () => {
    if (!usuarioEliminando) return;
    
    setIsSubmitting(true);
    const result = await eliminarUsuario(usuarioEliminando.id);

    if (result.error) {
      toast.error('Error al eliminar usuario: ' + result.error);
    } else {
      toast.success('🗑️ Usuario eliminado correctamente');
      setModalConfirmacion(false);
      setUsuarioEliminando(null);
      cargarUsuarios();
    }
    setIsSubmitting(false);
  };

  // Handlers para cambiar vistas
  const cambiarVista = (vista, usuario = null) => {
    setVistaActiva(vista);
    setUsuarioSeleccionado(usuario);
    setMenuAbierto(false);
  };

  const cerrarModalFormulario = () => {
    if (!isSubmitting) {
      setModalFormulario(false);
      setUsuarioEditando(null);
    }
  };

  const cerrarModalConfirmacion = () => {
    if (!isSubmitting) {
      setModalConfirmacion(false);
      setUsuarioEliminando(null);
    }
  };

  // Header moderno con efectos
  const HeaderModerno = () => (
    <div className="relative overflow-hidden particles">
      {/* Elementos decorativos animados */}
      <div className="absolute inset-0">
        <div className="absolute top-4 right-12 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-8 left-8 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-violet-600/20 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-xl animate-bounce-soft"></div>
      </div>
      
      {/* Cursor follower effect */}
      <div 
        className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ease-out"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      ></div>
      
      <div className="relative p-12 text-center">
        <div className="flex items-center justify-center gap-4 mb-6 animate-scale-in">
          <div className="p-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl shadow-2xl hover-glow animate-pulse-glow">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gradient animate-bounce-soft">
            Sistema Ejecutivo
          </h1>
          <div className="p-4 bg-gradient-to-br from-blue-500 to-teal-600 rounded-3xl shadow-2xl hover-glow animate-pulse-glow" style={{animationDelay: '1s'}}>
            <Rocket className="h-10 w-10 text-white" />
          </div>
        </div>
        
        <div className="mb-8 animate-fade-in" style={{animationDelay: '0.6s'}}>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-4">
            🚀 Plataforma de próxima generación para gestión empresarial
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Potenciado por Next.js 15, Supabase y tecnologías de vanguardia
          </p>
        </div>
        
        {/* Controles del header */}
        <div className="flex items-center justify-center gap-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setDarkMode(!darkMode)}
            className="glass-effect hover-neon group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <div className="relative flex items-center gap-2">
              {darkMode ? (
                <>
                  <Sun className="h-5 w-5 animate-rotate-slow" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5" />
                  <span>Modo Oscuro</span>
                </>
              )}
            </div>
          </Button>
          
          <div className="flex items-center gap-2 px-4 py-2 glass-effect rounded-full">
            <Star className="h-4 w-4 text-yellow-500 animate-pulse" />
            <span className="text-sm font-medium">v2.0 Pro</span>
            <Zap className="h-4 w-4 text-blue-500 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );

  // Estadísticas dinámicas
  const EstadisticasCard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in" style={{animationDelay: '0.4s'}}>
      <Card className="glass-effect-strong hover-lift hover-glow border-0 shadow-glow-primary">
        <CardContent className="p-6 text-center">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl w-fit mx-auto mb-4 animate-bounce-soft">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div className="text-3xl font-bold text-gradient mb-2">{usuarios.length}</div>
          <div className="text-sm text-muted-foreground">Usuarios Activos</div>
        </CardContent>
      </Card>
      
      <Card className="glass-effect-strong hover-lift hover-glow border-0 shadow-glow-accent">
        <CardContent className="p-6 text-center">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl w-fit mx-auto mb-4 animate-bounce-soft" style={{animationDelay: '1.5s'}}>
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <div className="text-3xl font-bold text-gradient mb-2">{cargos.length}</div>
          <div className="text-sm text-muted-foreground">Cargos Disponibles</div>
        </CardContent>
      </Card>
      
      <Card className="glass-effect-strong hover-lift hover-glow border-0 shadow-glow-destructive">
        <CardContent className="p-6 text-center">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl w-fit mx-auto mb-4 animate-bounce-soft" style={{animationDelay: '2s'}}>
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div className="text-3xl font-bold text-gradient mb-2">100%</div>
          <div className="text-sm text-muted-foreground">Rendimiento</div>
        </CardContent>
      </Card>
    </div>
  );

  // Menú de navegación con efectos 
  const MenuNavegacion = () => (
    <Card className="glass-effect-strong hover-lift animate-fade-in mb-8 border-0 shadow-2xl relative overflow-hidden">
      {/* Efecto de ondas */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
      
      <CardContent className="p-8 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Botón Usuarios */}
          <Button
            variant="ghost"
            onClick={() => cambiarVista('usuarios')}
            className={`h-auto p-6 flex-col gap-4 transition-all duration-500 group relative overflow-hidden ${
              vistaActiva === 'usuarios' 
                ? 'gradient-primary text-white shadow-glow-primary scale-105 hover-neon' 
                : 'hover:bg-muted/30 hover:scale-105 hover-glow'
            }`}
          >
            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            
            <div className={`p-4 rounded-2xl transition-all duration-300 ${
              vistaActiva === 'usuarios' 
                ? 'bg-white/20 shadow-lg' 
                : 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20'
            }`}>
              <Users className="h-8 w-8" />
            </div>
            <div className="text-center relative z-10">
              <div className="font-bold text-lg">Usuarios</div>
              <div className="text-sm opacity-80">Gestión Completa</div>
              <div className="text-xs opacity-60 mt-1">🎯 Control total</div>
            </div>
          </Button>
          
          {/* Botón Cargos */}
          <Button
            variant="ghost"
            onClick={() => cambiarVista('cargos')}
            className={`h-auto p-6 flex-col gap-4 transition-all duration-500 group relative overflow-hidden ${
              vistaActiva === 'cargos' 
                ? 'gradient-accent text-white shadow-glow-accent scale-105 hover-neon' 
                : 'hover:bg-muted/30 hover:scale-105 hover-glow'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            
            <div className={`p-4 rounded-2xl transition-all duration-300 ${
              vistaActiva === 'cargos' 
                ? 'bg-white/20 shadow-lg' 
                : 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 group-hover:from-emerald-500/20 group-hover:to-teal-500/20'
            }`}>
              <Briefcase className="h-8 w-8" />
            </div>
            <div className="text-center relative z-10">
              <div className="font-bold text-lg">Cargos</div>
              <div className="text-sm opacity-80">Administración</div>
              <div className="text-xs opacity-60 mt-1">💼 Jerarquías</div>
            </div>
          </Button>
          
          {/* Botón Horarios */}
          <Button
            variant="ghost"
            onClick={() => cambiarVista('horarios')}
            disabled={!usuarioSeleccionado}
            className={`h-auto p-6 flex-col gap-4 transition-all duration-500 group relative overflow-hidden ${
              vistaActiva === 'horarios' 
                ? 'gradient-secondary text-foreground shadow-lg scale-105' 
                : usuarioSeleccionado
                  ? 'hover:bg-muted/30 hover:scale-105 hover-glow' 
                  : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {usuarioSeleccionado && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            )}
            
            <div className={`p-4 rounded-2xl transition-all duration-300 ${
              vistaActiva === 'horarios' 
                ? 'bg-black/10 dark:bg-white/10 shadow-lg' 
                : 'bg-gradient-to-br from-orange-500/10 to-red-500/10 group-hover:from-orange-500/20 group-hover:to-red-500/20'
            }`}>
              <Clock className="h-8 w-8" />
            </div>
            <div className="text-center relative z-10">
              <div className="font-bold text-lg">Horarios</div>
              <div className="text-sm opacity-80 truncate max-w-[120px]">
                {usuarioSeleccionado ? usuarioSeleccionado.nombre : 'Sin seleccionar'}
              </div>
              <div className="text-xs opacity-60 mt-1">⏰ Turnos</div>
            </div>
          </Button>
          
          {/* Botón Tickeos */}
          <Button
            variant="ghost"
            onClick={() => cambiarVista('tickeos')}
            disabled={!usuarioSeleccionado}
            className={`h-auto p-6 flex-col gap-4 transition-all duration-500 group relative overflow-hidden ${
              vistaActiva === 'tickeos' 
                ? 'gradient-destructive text-white shadow-glow-destructive scale-105 hover-neon' 
                : usuarioSeleccionado
                  ? 'hover:bg-muted/30 hover:scale-105 hover-glow' 
                  : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {usuarioSeleccionado && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            )}
            
            <div className={`p-4 rounded-2xl transition-all duration-300 ${
              vistaActiva === 'tickeos' 
                ? 'bg-white/20 shadow-lg' 
                : 'bg-gradient-to-br from-violet-500/10 to-purple-500/10 group-hover:from-violet-500/20 group-hover:to-purple-500/20'
            }`}>
              <CheckSquare className="h-8 w-8" />
            </div>
            <div className="text-center relative z-10">
              <div className="font-bold text-lg">Tickeos</div>
              <div className="text-sm opacity-80 truncate max-w-[120px]">
                {usuarioSeleccionado ? usuarioSeleccionado.nombre : 'Sin seleccionar'}
              </div>
              <div className="text-xs opacity-60 mt-1">✅ Registro</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Renderizar contenido según la vista activa
  const renderContenido = () => {
    switch (vistaActiva) {
      case 'horarios':
        return usuarioSeleccionado ? (
          <div className="space-y-6 animate-fade-in">
            <Card className="glass-effect-strong border-0 shadow-2xl hover-lift relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg hover-glow">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-glow">Gestión de Horarios</span>
                    <div className="text-sm text-muted-foreground font-normal mt-1">
                      👤 {usuarioSeleccionado.nombre}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <GestionHorarios usuario={usuarioSeleccionado} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="glass-effect-strong border-0 shadow-2xl animate-scale-in hover-lift">
            <CardContent className="flex flex-col items-center justify-center p-16 text-center">
              <div className="p-8 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full mb-8 animate-pulse-glow">
                <Clock className="h-16 w-16 text-orange-500 animate-bounce-soft" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gradient">Gestión de Horarios</h3>
              <p className="text-muted-foreground max-w-md leading-relaxed text-lg">
                🎯 Selecciona un usuario desde la gestión de usuarios para administrar sus horarios de trabajo
              </p>
              <Button
                onClick={() => cambiarVista('usuarios')}
                className="mt-6 gradient-cosmic hover-glow"
              >
                <Users className="h-4 w-4 mr-2" />
                Ir a Usuarios
              </Button>
            </CardContent>
          </Card>
        );

      case 'tickeos':
        return usuarioSeleccionado ? (
          <div className="space-y-6 animate-fade-in">
            <Card className="glass-effect-strong border-0 shadow-2xl hover-lift relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500"></div>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl shadow-lg hover-glow">
                    <CheckSquare className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-glow">Registro de Tickeos</span>
                    <div className="text-sm text-muted-foreground font-normal mt-1">
                      👤 {usuarioSeleccionado.nombre}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <DynamicRegistroTickeos usuario={usuarioSeleccionado} />
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="glass-effect-strong border-0 shadow-2xl animate-scale-in hover-lift">
            <CardContent className="flex flex-col items-center justify-center p-16 text-center">
              <div className="p-8 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full mb-8 animate-pulse-glow">
                <CheckSquare className="h-16 w-16 text-violet-500 animate-bounce-soft" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gradient">Registro de Tickeos</h3>
              <p className="text-muted-foreground max-w-md leading-relaxed text-lg">
                ✅ Selecciona un usuario desde la gestión de usuarios para registrar sus entradas y salidas
              </p>
              <Button
                onClick={() => cambiarVista('usuarios')}
                className="mt-6 gradient-cosmic hover-glow"
              >
                <Users className="h-4 w-4 mr-2" />
                Ir a Usuarios
              </Button>
            </CardContent>
          </Card>
        );

      case 'cargos':
        return (
          <div className="space-y-6 animate-fade-in">
            <Card className="glass-effect-strong border-0 shadow-2xl hover-lift relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg hover-glow">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-glow">Gestión de Cargos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <GestionCargos cargos={cargos} onCargosChange={setCargos} />
              </CardContent>
            </Card>
          </div>
        );

      default: // 'usuarios'
        return (
          <div className="space-y-8 animate-fade-in">
            <HeaderModerno />
            <EstadisticasCard />
            
            <Card className="glass-effect-strong border-0 shadow-2xl hover-lift relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg hover-glow">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-glow">Gestión de Usuarios</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TablaUsuarios 
                  usuarios={usuarios} 
                  onNew={handleNuevoUsuario} 
                  onEdit={handleEditarUsuario} 
                  onDelete={handleEliminarUsuario}
                  onGestionarHorarios={(usuario) => cambiarVista('horarios', usuario)}
                  onRegistrarTickeos={(usuario) => cambiarVista('tickeos', usuario)}
                  isLoading={isLoading} 
                />
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  if (!isClientSide) {
    return null; // O un loading skeleton
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100 dark:from-slate-950 dark:via-blue-950/50 dark:to-indigo-950 relative overflow-hidden">
      {/* Elementos decorativos de fondo mejorados */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-violet-600/10 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 rounded-full blur-2xl animate-float" style={{animationDelay: '6s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-gradient-to-br from-orange-400/10 to-red-600/10 rounded-full blur-xl animate-rotate-slow"></div>
      </div>

      <main className="container mx-auto py-8 px-4 max-w-7xl relative z-10">
        {/* Menú de navegación */}
        <MenuNavegacion />
        
        {/* Contenido principal */}
        <div className="animate-slide-up">
          {renderContenido()}
        </div>

        {/* Modal de formulario de usuario mejorado */}
        <Dialog open={modalFormulario} onOpenChange={cerrarModalFormulario}>
          <DialogContent className="sm:max-w-md glass-effect-strong border-0 shadow-2xl animate-scale-in backdrop-blur-ultra">
            <DialogHeader className="pb-4 relative">
              <div className="absolute -top-2 -left-2 -right-2 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-lg"></div>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg hover-glow">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="text-gradient">
                  {usuarioEditando ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
                </span>
              </DialogTitle>
            </DialogHeader>
            <FormularioUsuario
              usuario={usuarioEditando}
              cargos={cargos}
              onSubmit={handleSubmitFormulario}
              onCancel={cerrarModalFormulario}
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>

        {/* Modal de confirmación moderno */}
        <DialogoConfirmacion
          open={modalConfirmacion}
          onOpenChange={setModalConfirmacion}
          onConfirm={handleConfirmarEliminacion}
          title="🗑️ Eliminar Usuario"
          description={
            usuarioEliminando
              ? `¿Estás seguro de que deseas eliminar a "${usuarioEliminando.nombre}"? Esta acción no se puede deshacer y se perderán todos los datos asociados.`
              : ''
          }
          confirmText="🗑️ Eliminar Definitivamente"
          cancelText="❌ Cancelar"
          isDestructive={true}
          isLoading={isSubmitting}
        />
      </main>
    </div>
  );
}