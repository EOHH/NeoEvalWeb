import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout = () => {
  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      {/* Menú Lateral (Fijo) */}
      <Sidebar />

      {/* Área Principal */}
      <div className="flex flex-col flex-1 w-full min-w-0">
        {/* Barra Superior */}
        <Header />

        {/* Contenedor de las Vistas (Scrollable) */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Ancho máximo para pantallas ultrawide, centrado */}
          <div className="mx-auto max-w-7xl">
            {/* Aquí React Router inyectará el contenido de cada página */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};