import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import logo from '@/assets/images/neoeval_logo.png';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Exámenes', path: '/exams', icon: FileText },
  { name: 'Estudiantes', path: '/students', icon: Users },
  { name: 'Configuración', path: '/settings', icon: Settings },
];

export const Sidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-gray-200 shadow-sm z-20 shrink-0">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <img src={logo} alt="Neo Eval" className="h-8 w-auto mr-3" />
        <span className="text-xl font-bold text-gray-900 tracking-tight">Neo Eval</span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer del Sidebar (opcional, ej. versión del sistema) */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 font-medium text-center">Neo Eval V2 - Pro</p>
      </div>
    </aside>
  );
};