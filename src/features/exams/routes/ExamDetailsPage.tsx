import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, Calendar, Clock, BookOpen, Users, 
  Trash2, Edit, FileEdit, AlertTriangle, ShieldAlert
} from 'lucide-react';

import { Button } from '@/components/elements/Button';
import { examsApi } from '../api/exams';

// Helper de fechas
const formatDate = (dateInput?: string | number[] | null) => {
  if (!dateInput) return 'No definida';
  try {
    let dateObj: Date;
    if (Array.isArray(dateInput)) {
      dateObj = new Date(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3] || 0, dateInput[4] || 0);
    } else {
      dateObj = new Date(dateInput);
    }
    if (isNaN(dateObj.getTime())) return 'Fecha inválida';
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    return 'Error en fecha';
  }
};

export const ExamDetailsPage = () => {
  const { id } = useParams();
  const examId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 1. Cargar los detalles generales del examen
  const { data: exam, isLoading: isLoadingExam, isError } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examsApi.getById(examId),
  });

  // 🚀 FIX: 2. Cargar específicamente la lista de preguntas
  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery({
    queryKey: ['questions', examId],
    queryFn: () => examsApi.getQuestionsByExam(examId),
  });

  // Mutación para eliminar
  const { mutate: deleteExam, isPending: isDeleting } = useMutation({
    mutationFn: () => examsApi.delete(examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      navigate('/exams', { replace: true });
    },
    onError: (err) => {
      console.error("Error al eliminar", err);
      alert("No se pudo eliminar el examen. Asegúrate de que no tenga respuestas de estudiantes vinculadas.");
      setIsDeleteModalOpen(false);
    }
  });

  if (isLoadingExam) {
    return <div className="p-20 text-center text-slate-500 animate-pulse">Cargando detalles del examen...</div>;
  }

  if (isError || !exam) {
    return (
      <div className="p-20 text-center">
        <ShieldAlert className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Examen no encontrado</h2>
        <Button className="mt-6" onClick={() => navigate('/exams')}>Volver a la lista</Button>
      </div>
    );
  }

  const isDraft = !exam.openingDate;

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* Botón de regreso */}
      <button 
        onClick={() => navigate('/exams')} 
        className="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Volver a mis exámenes
      </button>

      {/* HEADER PRINCIPAL */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 text-xs font-bold rounded-full border ${isDraft ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                {isDraft ? 'Borrador' : 'Publicado'}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{exam.examType}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{exam.title}</h1>
            <p className="text-slate-500 mt-2 max-w-2xl">{exam.description || 'Sin descripción detallada.'}</p>
          </div>
          
          <div className="flex gap-3 shrink-0">
            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300" onClick={() => setIsDeleteModalOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
            </Button>
            <Button variant="outline" onClick={() => navigate(`/exams/${examId}/edit`)}>
              <Edit className="h-4 w-4 mr-2" /> Editar Info
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: TARJETAS DE INFORMACIÓN */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Clasificación</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><BookOpen className="h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Materia</p>
                  <p className="font-semibold text-sm">{exam.subjectName || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Users className="h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Grupo asignado</p>
                  <p className="font-semibold text-sm">{exam.classGroup?.name || 'Sin asignar'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-5">Disponibilidad</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Calendar className="h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Apertura</p>
                  <p className="font-medium text-sm text-slate-800">{formatDate(exam.openingDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Calendar className="h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Cierre</p>
                  <p className="font-medium text-sm text-slate-800">{formatDate(exam.closingDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Clock className="h-5 w-5" /></div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Límite de Tiempo</p>
                  <p className="font-medium text-sm text-slate-800">{exam.timeLimitMinutes || 'Sin límite'} minutos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: PREGUNTAS */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Banco de Preguntas</h2>
                <p className="text-sm text-slate-500">Este examen contiene {questions.length} preguntas.</p>
              </div>
              <Button onClick={() => navigate(`/exams/${exam.id}/questions`)} className="bg-indigo-600">
                <FileEdit className="h-4 w-4 mr-2" /> Editar Preguntas
              </Button>
            </div>

            {/* Vista previa dinámica basada en la nueva consulta */}
            {isLoadingQuestions ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 animate-pulse">
                Cargando banco de preguntas...
              </div>
            ) : questions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                <AlertTriangle className="h-10 w-10 text-amber-400 mb-3" />
                <h3 className="font-bold text-slate-700">Examen Vacío</h3>
                <p className="text-sm text-slate-500 max-w-xs mt-1">Aún no has agregado preguntas a esta evaluación. Los estudiantes no podrán resolverla.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate(`/exams/${exam.id}/questions`)}>
                  Agregar mi primera pregunta
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Mostramos solo las primeras 3 como vista previa */}
                {questions.slice(0, 3).map((q: any, i: number) => (
                  <div key={q.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-start gap-3 transition-colors hover:bg-slate-100">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{q.questionType.replace('_', ' ')}</span>
                      <p className="text-sm font-medium text-slate-800 line-clamp-2 mt-0.5">{q.questionText}</p>
                    </div>
                  </div>
                ))}
                
                {questions.length > 3 && (
                  <div className="text-center pt-3 border-t border-slate-100 mt-4">
                    <span className="text-xs font-bold text-slate-400">Y {questions.length - 3} preguntas más...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-center text-slate-900">¿Eliminar este examen?</h2>
            <p className="text-center text-slate-500 mt-2 text-sm">
              Estás a punto de eliminar <strong>"{exam.title}"</strong>. Esta acción borrará todas sus preguntas y no se puede deshacer.
            </p>
            <div className="flex gap-3 mt-8">
              <Button className="flex-1" variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
                Cancelar
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => deleteExam()} isLoading={isDeleting}>
                Sí, eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};