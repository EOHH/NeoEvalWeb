import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Save, 
  Clock, 
  BookOpen, 
  Info, 
  AlertCircle, 
  ChevronRight 
} from 'lucide-react';

import { Button } from '@/components/elements/Button';
import { Input } from '@/components/form/Input';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { academicApi } from '../api/academic';
import { examsApi } from '../api/exams';
import type { Subject, ClassGroup } from '../types';

const createExamSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  examType: z.string(),
  subjectId: z.string().min(1, 'La asignatura es obligatoria'),
  groupId: z.string().optional(),
  timeLimitMinutes: z.number().min(1, 'Mínimo 1 minuto'),
  openingDate: z.string().optional(),
  closingDate: z.string().optional(),
});

type FormValues = z.infer<typeof createExamSchema>;

// 🚀 FIX: Convertidor exacto para java.time.Instant (Agrega la 'Z' de UTC)
const formatToInstant = (dateStr?: string) => {
  if (!dateStr) return null;
  try {
    // El input HTML da la fecha local (ej. 10:30 AM Lima)
    // Al pasarla por new Date() y .toISOString(), la convierte automáticamente 
    // al formato UTC con la 'Z' exacta que exige tu backend
    return new Date(dateStr).toISOString();
  } catch (e) {
    return null;
  }
};

export const CreateExamPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // --- CARGA DE ASIGNATURAS GLOBALES ---
  const { 
    data: subjects, 
    isLoading: ldSubs, 
    isError: isErrSubs 
  } = useQuery({
    queryKey: ['subjects', 'all'],
    queryFn: async () => {
      const data = await academicApi.getAllSubjects();
      return data;
    },
  });

  // --- CARGA DE GRUPOS DEL PROFESOR ---
  const { 
    data: groups, 
    isLoading: ldGroups 
  } = useQuery({
    queryKey: ['groups', user?.id],
    queryFn: () => academicApi.getGroupsByTeacher(user!.id),
    enabled: !!user?.id,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(createExamSchema),
    defaultValues: { 
      title: '',
      description: '',
      examType: 'EXAM', 
      subjectId: '',
      groupId: '',
      timeLimitMinutes: 60,
      openingDate: '',
      closingDate: ''
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) => examsApi.create({
      ...data,
      teacherId: user!.id,
      subjectId: Number(data.subjectId),
      groupId: data.groupId ? Number(data.groupId) : null,
      // 🚀 FIX APLICADO: Fechas con formato Instant
      openingDate: formatToInstant(data.openingDate),
      closingDate: formatToInstant(data.closingDate),
      allowedAttempts: 1,
      averageDifficulty: 5.0
    } as any),
    onSuccess: (res) => navigate(`/exams/${res.id}/questions`),
    onError: (error) => {
      console.error('Error al guardar el examen:', error);
      alert('Hubo un error de red al guardar el examen.');
    }
  });

  // Función auxiliar para renderizar las opciones de asignatura de forma segura
  const renderSubjectOptions = () => {
    if (ldSubs) return <option value="">Cargando asignaturas...</option>;
    if (isErrSubs) return <option value="">Error al cargar datos</option>;
    
    const list = Array.isArray(subjects) ? subjects : [];
    
    if (list.length === 0) return <option value="">No hay asignaturas en el sistema</option>;

    return (
      <>
        <option value="">Seleccionar asignatura...</option>
        {list.map((s: Subject) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </>
    );
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 px-2">
        <button onClick={() => navigate('/exams')} className="hover:text-primary transition-colors">Exámenes</button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-900 font-medium">Nuevo examen</span>
      </div>

      {/* Header Principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 px-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Crear Evaluación</h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Configura los parámetros técnicos y académicos del examen.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" onClick={() => navigate('/exams')} className="flex-1 md:flex-none">Cancelar</Button>
          <Button onClick={handleSubmit((d) => mutate(d))} isLoading={isPending} className="flex-1 md:flex-none">
            <Save className="h-4 w-4 mr-2" /> Guardar y Continuar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
        {/* Lado Izquierdo: Formulario */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-indigo-600">
              <Info className="h-5 w-5" />
              <h2 className="font-bold uppercase tracking-wider text-xs">Información Básica</h2>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Título del Examen</label>
                <Input 
                  {...register('title')} 
                  placeholder="Ej: Álgebra Lineal - Práctica 2" 
                  error={errors.title?.message}
                  className="bg-slate-50/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Descripción e Instrucciones</label>
                <textarea 
                  {...register('description')}
                  className="w-full min-h-30 p-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-700 placeholder:text-slate-400"
                  placeholder="Escribe aquí las instrucciones para los estudiantes..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-indigo-600">
              <Clock className="h-5 w-5" />
              <h2 className="font-bold uppercase tracking-wider text-xs">Tiempo y Disponibilidad</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Fecha de Apertura</label>
                <Input type="datetime-local" {...register('openingDate')} className="bg-slate-50/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Fecha de Cierre</label>
                <Input type="datetime-local" {...register('closingDate')} className="bg-slate-50/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Límite de Tiempo (minutos)</label>
                <Input 
                  type="number" 
                  {...register('timeLimitMinutes', { valueAsNumber: true })} 
                  leftIcon={<Clock className="h-4 w-4" />}
                  error={errors.timeLimitMinutes?.message}
                  className="bg-slate-50/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Configuración */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl shadow-xl shadow-indigo-500/10">
            <div className="flex items-center gap-2 mb-6 text-indigo-400">
              <BookOpen className="h-5 w-5" />
              <h2 className="font-bold uppercase tracking-wider text-xs">Clasificación Académica</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asignatura</label>
                <select 
                  {...register('subjectId')}
                  className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  {renderSubjectOptions()}
                </select>
                {errors.subjectId && <p className="text-xs text-red-400 mt-1">{errors.subjectId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grupo de Clase</label>
                <select 
                  {...register('groupId')}
                  className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  <option value="">{ldGroups ? 'Cargando grupos...' : 'Borrador (Sin grupo)'}</option>
                  {Array.isArray(groups) && groups.map((g: ClassGroup) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoría del Examen</label>
                <select 
                  {...register('examType')}
                  className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  <option value="EXAM">Examen Oficial</option>
                  <option value="HOMEWORK">Tarea / Deber</option>
                  <option value="PRACTICE">Simulacro / Práctica</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3 text-amber-800 shadow-sm animate-pulse-subtle">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              <strong>Tip de experto:</strong> Los exámenes en estado borrador solo son visibles para ti. Asígnale un grupo cuando estés listo para evaluar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};