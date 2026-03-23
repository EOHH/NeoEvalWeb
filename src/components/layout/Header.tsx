import { Menu, LogOut, Bell } from 'lucide-react';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { Button } from '@/components/elements/Button';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Limpiamos el estado global
    clearAuth();
    // 2. Redirigimos al login (Más adelante conectaremos esto con la API de logout para borrar la cookie)
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 shrink-0">
      {/* Izquierda: Botón de menú móvil (placeholder por ahora) */}
      <div className="flex items-center">
        <button className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Derecha: Perfil de usuario y acciones */}
      <div className="flex items-center gap-4">
        {/* Notificaciones */}
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-white"></span>
        </button>

        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

        {/* Info del Usuario */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-900 leading-none mb-1">{user?.name || 'Usuario'}</span>
            <span className="text-xs text-gray-500 leading-none capitalize">{user?.userType?.toLowerCase()}</span>
          </div>
          
          {/* Avatar (Placeholder) */}
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>

        {/* Botón Logout */}
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-500 hover:text-destructive hover:bg-red-50" title="Cerrar sesión">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};