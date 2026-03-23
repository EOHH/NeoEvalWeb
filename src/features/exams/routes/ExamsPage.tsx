import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Clock, Calendar, MoreVertical, 
  Users, CheckCircle, Edit3, BookOpen, HelpCircle, AlertCircle, FileEdit
} from 'lucide-react';
import { useExams } from '../hooks/useExams';
import { Button } from '@/components/elements/Button';
import { Input } from '@/components/form/Input';
import type { ExamResponse } from '../types';

// Helper a prueba de balas para formatear fechas de Spring Boot
const formatDate = (dateInput?: string | number[] | null) => {
  if (!dateInput) return 'Sin fecha';
  
  try {
    let dateObj: Date;
    if (Array.isArray(dateInput)) {
      dateObj = new Date(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3] || 0, dateInput[4] || 0);
    } else {
      dateObj = new Date(dateInput);
    }

    if (isNaN(dateObj.getTime())) return 'Fecha inválida';

    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    return 'Error en fecha';
  }
};

// Helper para deducir el estado visual basado en las fechas y el isCompleted
const getExamStatusInfo = (exam: ExamResponse) => {
  if (exam.isCompleted) {
    return { label: 'Completado', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: CheckCircle };
  }
  
  if (!exam.openingDate) {
    return { label: 'Borrador', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Edit3 };
  }

  return { label: 'Publicado', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', icon: CheckCircle };
};

export const ExamsPage = () => {
  const { data: exams, isLoading, isError } = useExams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Filtro en tiempo real basado en el título o descripción
  const filteredExams = useMemo(() => {
    if (!exams) return [];
    if (!searchTerm) return exams;
    
    const lowerTerm = searchTerm.toLowerCase();
    return exams.filter(exam => 
      exam.title.toLowerCase().includes(lowerTerm) || 
      (exam.description?.toLowerCase().includes(lowerTerm) ?? false) ||
      (exam.subjectName?.toLowerCase().includes(lowerTerm) ?? false)
    );
  }, [exams, searchTerm]);

  // Manejador para navegar a los detalles
  const handleManageExam = (examId: number) => {
    navigate(`/exams/${examId}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mis Exámenes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona, crea y evalúa las pruebas de tus estudiantes.
          </p>
        </div>
        <Button 
          className="shrink-0 shadow-sm shadow-primary/20 bg-indigo-600 hover:bg-indigo-700"
          onClick={() => navigate('/exams/new')} 
        >
          <Plus className="mr-2 h-4 w-4" />
          Crear Examen
        </Button>
      </div>

      {/* Herramientas de Filtro */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="w-full max-w-sm relative">
          <Input 
            placeholder="Buscar por título o materia..." 
            leftIcon={<Search className="h-4 w-4 text-gray-400" />}
            className="bg-gray-50/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Contenedor de Tarjetas */}
      <div className="min-h-[400px]">
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white h-64 rounded-xl border border-gray-100 shadow-sm animate-pulse">
                <div className="h-full w-full bg-slate-100/50 rounded-xl"></div>
              </div>
            ))}
          </div>
        )}
        
        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <h3 className="text-lg font-bold text-red-800">Error de conexión</h3>
            <p className="text-red-600 text-sm max-w-md mt-1">No pudimos cargar tus exámenes. Verifica tu conexión o intenta recargar la página.</p>
            <Button variant="outline" className="mt-4 border-red-200 text-red-600 hover:bg-red-100" onClick={() => window.location.reload()}>Reintentar</Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredExams.length === 0 && (
           <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
               <Search className="h-8 w-8 text-indigo-400" />
             </div>
             <h3 className="text-lg font-bold text-slate-800">No se encontraron exámenes</h3>
             <p className="text-slate-500 max-w-sm mt-1">
               {searchTerm ? 'Intenta buscar con otras palabras clave.' : 'Crea tu primera evaluación para empezar a medir el conocimiento de tus alumnos.'}
             </p>
             {!searchTerm && (
               <Button className="mt-6 bg-indigo-600" onClick={() => navigate('/exams/new')}>
                 <Plus className="h-4 w-4 mr-2" /> Crear mi primer examen
               </Button>
             )}
           </div>
        )}

        {/* Lista de Exámenes */}
        {!isLoading && !isError && filteredExams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredExams.map((exam) => {
              const statusInfo = getExamStatusInfo(exam);
              const StatusIcon = statusInfo.icon;
              const isMenuOpen = activeMenuId === exam.id;

              return (
                <div 
                  key={exam.id} 
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group relative"
                  onMouseLeave={() => setActiveMenuId(null)}
                >
                  <div className="p-5 flex-1 flex flex-col cursor-pointer" onClick={() => handleManageExam(exam.id)}>
                    
                    {/* Badge y Menú */}
                    <div className="flex justify-between items-start mb-3 relative">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </span>
                      
                      {/* Botón 3 puntitos */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenuId(isMenuOpen ? null : exam.id); }}
                        className="text-gray-400 hover:text-indigo-600 transition-colors p-1.5 rounded-md hover:bg-indigo-50 -mr-2 -mt-1"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {/* Dropdown Menu Mágico */}
                      {isMenuOpen && (
                        <div className="absolute top-8 right-0 bg-white border border-gray-100 shadow-xl rounded-xl py-1 z-10 w-40 animate-in fade-in slide-in-from-top-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate(`/exams/${exam.id}/questions`); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center"
                          >
                            <FileEdit className="h-4 w-4 mr-2" /> Editar Preguntas
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Título y Descripción */}
                    <h3 className="text-lg font-bold text-gray-900 mb-1.5 leading-tight group-hover:text-indigo-600 transition-colors">
                      {exam.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1 leading-relaxed">
                      {exam.description || 'Sin descripción asignada.'}
                    </p>

                    {/* Metadatos Mapeados Correctamente con el Backend */}
                    <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-gray-100">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-indigo-700 font-bold bg-indigo-50 px-2 py-1 rounded-md">
                          <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                          <span className="truncate max-w-[110px]">{exam.subjectName || 'Materia general'}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 font-semibold bg-gray-50 px-2 py-1 rounded-md">
                          <HelpCircle className="h-3.5 w-3.5 mr-1" />
                          {(exam.questions?.length || exam.questionCount) || 0} preg.
                        </div>
                      </div>

                      {exam.classGroup?.name && (
                        <div className="flex items-center text-xs text-gray-600 font-medium">
                          <Users className="h-3.5 w-3.5 mr-2 text-gray-400" />
                          Grupo: <span className="font-semibold ml-1">{exam.classGroup.name}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center text-[11px] text-gray-400 font-medium">
                          <Calendar className="h-3 w-3 mr-1.5" />
                          {formatDate(exam.openingDate)}
                        </div>
                        <div className="flex items-center text-[11px] text-gray-400 font-medium">
                          <Clock className="h-3 w-3 mr-1.5" />
                          {exam.timeLimitMinutes || '∞'} min
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer de Acciones */}
                  <div className="bg-gray-50/80 px-5 py-3 flex justify-between items-center border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{exam.examType || 'General'}</span>
                    <Button 
                      variant="link" 
                      onClick={() => handleManageExam(exam.id)}
                      className="h-auto p-0 text-indigo-600 font-bold text-sm hover:text-indigo-800"
                    >
                      Gestionar Examen &rarr;
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};