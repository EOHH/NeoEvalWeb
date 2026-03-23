import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/routes/LoginPage';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { ExamsPage } from '@/features/exams/routes/ExamsPage';
import { CreateExamPage } from '@/features/exams/routes/CreateExamPage';
import { QuestionsEditorPage } from '@/features/exams/routes/QuestionsEditorPage';
import { ExamDetailsPage } from './features/exams/routes/ExamDetailsPage';
import { EditExamPage } from './features/exams/routes/EditExamPage';

// Fusionamos tu DashboardPlaceholder con el nuevo diseño
const DashboardContent = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Bienvenido a NeoEval V2 🚀
      </h1>
      
      <p className="text-gray-500">
        Has iniciado sesión exitosamente. Aquí irá el contenido principal.
      </p>

      {/* Mantenemos tu visor de JSON para que puedas ver los datos reales que llegan de Railway */}
      <div className="bg-gray-50 rounded-lg p-4 text-left text-sm overflow-auto max-h-60 border border-gray-100 mx-auto max-w-2xl">
        <pre className="text-gray-700">{JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  );
};

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        
        {/* RUTAS PÚBLICAS */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />

        {/* RUTAS PRIVADAS (Envueltas en el MainLayout) */}
        {/* Esta es la magia: Si está autenticado, renderiza el Layout (Sidebar + Header) */}
        <Route 
          element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}
        >
          {/* Todas estas rutas se inyectarán en el <Outlet /> de MainLayout.tsx */}
          <Route path="/dashboard" element={<DashboardContent />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/exams/new" element={<CreateExamPage />} />
          <Route path="/exams/:id/edit" element={<EditExamPage />} />
          <Route path="/exams/:id" element={<ExamDetailsPage />} />
          <Route path="/exams/:id/questions" element={<QuestionsEditorPage />} />
          <Route path="/students" element={<div className="p-8">Módulo de Estudiantes en construcción...</div>} />
          <Route path="/settings" element={<div className="p-8">Configuración en construcción...</div>} />
        </Route>

        {/* Fallback: Cualquier ruta que no exista */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;