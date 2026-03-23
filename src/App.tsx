import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth & Store
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { LoginPage } from '@/features/auth/routes/LoginPage';

// Layout
import { MainLayout } from '@/components/layout/MainLayout';

// Vistas Principales
import { DashboardPage } from '@/features/dashboard/routes/DashboardPage'; // Asegúrate de que esta ruta coincida con tu carpeta

// Vistas de Exámenes
import { ExamsPage } from '@/features/exams/routes/ExamsPage';
import { CreateExamPage } from '@/features/exams/routes/CreateExamPage';
import { EditExamPage } from '@/features/exams/routes/EditExamPage';
import { ExamDetailsPage } from '@/features/exams/routes/ExamDetailsPage';
import { QuestionsEditorPage } from '@/features/exams/routes/QuestionsEditorPage';

function App() {
  // Escuchamos el estado de autenticación de Zustand
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        
        {/* === RUTAS PÚBLICAS === */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />

        {/* === RUTAS PRIVADAS (Envueltas en el MainLayout) === */}
        {/* Esta es la magia: Si está autenticado, renderiza el Layout (Sidebar + Header) */}
        <Route 
          element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}
        >
          {/* Si entra a la raíz "/", lo mandamos al dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Todas estas rutas se inyectarán en el <Outlet /> de MainLayout.tsx */}
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Módulo de Exámenes */}
          <Route path="exams" element={<ExamsPage />} />
          <Route path="exams/new" element={<CreateExamPage />} />
          <Route path="exams/:id/edit" element={<EditExamPage />} />
          <Route path="exams/:id" element={<ExamDetailsPage />} />
          <Route path="exams/:id/questions" element={<QuestionsEditorPage />} />
          
          {/* Módulos en construcción */}
          <Route path="students" element={<div className="p-8">Módulo de Estudiantes en construcción...</div>} />
          <Route path="settings" element={<div className="p-8">Configuración en construcción...</div>} />
        </Route>

        {/* === FALLBACK (404) === */}
        {/* Cualquier ruta que no exista */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;