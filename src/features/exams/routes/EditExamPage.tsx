import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Clock, BookOpen, Info, ChevronRight, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/elements/Button';
import { Input } from '@/components/form/Input';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { academicApi } from '../api/academic';
import { examsApi } from '../api/exams';
import type { Subject, ClassGroup } from '../types';

const editExamSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  examType: z.string(),
  subjectId: z.string().min(1, 'La asignatura es obligatoria'),
  groupId: z.string().optional(),
  timeLimitMinutes: z.number().min(1, 'Mínimo 1 minuto'),
  openingDate: z.string().optional(),
  closingDate: z.string().optional(),
});

type FormValues = z.infer<typeof editExamSchema>;

// Convertidor exacto para java.time.Instant (De React a Spring Boot)
const formatToInstant = (dateStr?: string) => {
  if (!dateStr) return null;
  try { return new Date(dateStr).toISOString(); } catch (e) { return null; }
};

// Convertidor inverso (De Spring Boot a Input HTML datetime-local)
const formatForInput = (dateInput?: string | number[] | null) => {
  if (!dateInput) return '';
  try {
    let d: Date;
    if (Array.isArray(dateInput)) {
      d = new Date(Date.UTC(dateInput[0], dateInput[1] - 1, dateInput[2], dateInput[3] || 0, dateInput[4] || 0));
    } else {
      d = new Date(dateInput);
    }
    // Formatear a YYYY-MM-DDThh:mm (formato que exige datetime-local)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  } catch (e) {
    return '';
  }
};

export const EditExamPage = () => {
  const { id } = useParams();
  const examId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  // 1. CARGAMOS LOS DATOS ACTUALES DEL EXAMEN
  const { data: exam, isLoading: isLoadingExam } = useQuery({
    queryKey: ['exam', examId],
    queryFn: () => examsApi.getById(examId),
  });

  // 2. CARGAMOS ASIGNATURAS Y GRUPOS
  const { data: subjects, isLoading: ldSubs } = useQuery({
    queryKey: ['subjects', 'all'],
    queryFn: () => academicApi.getAllSubjects(),
  });

  const { data: groups, isLoading: ldGroups } = useQuery({
    queryKey: ['groups', user?.id],
    queryFn: () => academicApi.getGroupsByTeacher(user!.id),
    enabled: !!user?.id,
  });

  // 3. INICIALIZAMOS EL FORMULARIO
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(editExamSchema),
  });

  // 4. PRE-LLENAMOS EL FORMULARIO CUANDO EL EXAMEN CARGA
  useEffect(() => {
    if (exam) {
      reset({
        title: exam.title,
        description: exam.description || '',
        examType: exam.examType,
        subjectId: exam.subjectName ? String(subjects?.find((s: any) => s.name === exam.subjectName)?.id || '') : '',
        groupId: exam.classGroup?.id ? String(exam.classGroup.id) : '',
        timeLimitMinutes: exam.timeLimitMinutes || 60,
        openingDate: formatForInput(exam.openingDate),
        closingDate: formatForInput(exam.closingDate),
      });
    }
  }, [exam, subjects, reset]);

  // 5. MUTACIÓN DE ACTUALIZACIÓN (PUT)
  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) => examsApi.update(examId, {
      ...data,
      teacherId: user!.id,
      subjectId: Number(data.subjectId),
      groupId: data.groupId ? Number(data.groupId) : null,
      openingDate: formatToInstant(data.openingDate),
      closingDate: formatToInstant(data.closingDate),
      allowedAttempts: exam?.allowedAttempts || 1,
      averageDifficulty: exam?.averageDifficulty || 5.0
    } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam', examId] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      navigate(`/exams/${examId}`); // Volvemos a los detalles
    },
    onError: () => alert("Hubo un error al actualizar el examen.")
  });

  if (isLoadingExam) return <div className="p-20 text-center animate-pulse text-slate-500">Cargando datos del examen...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 px-2">
        <button onClick={() => navigate('/exams')} className="hover:text-indigo-600 transition-colors">Exámenes</button>
        <ChevronRight className="h-4 w-4" />
        <button onClick={() => navigate(`/exams/${examId}`)} className="hover:text-indigo-600 transition-colors">Detalles</button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-slate-900 font-medium">Editar</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 px-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Editar Examen</h1>
          <p className="text-slate-500 mt-1">Actualiza los datos generales de la evaluación.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" onClick={() => navigate(`/exams/${examId}`)}><ArrowLeft className="h-4 w-4 mr-2" /> Cancelar</Button>
          <Button onClick={handleSubmit((d) => mutate(d))} isLoading={isPending} className="bg-indigo-600">
            <Save className="h-4 w-4 mr-2" /> Guardar Cambios
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-indigo-600">
              <Info className="h-5 w-5" />
              <h2 className="font-bold uppercase tracking-wider text-xs">Información Básica</h2>
            </div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Título del Examen</label>
                <Input {...register('title')} error={errors.title?.message} className="bg-slate-50/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Descripción e Instrucciones</label>
                <textarea {...register('description')} className="w-full min-h-30 p-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-slate-700" />
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
                <label className="text-sm font-semibold text-slate-700">Límite (minutos)</label>
                <Input type="number" {...register('timeLimitMinutes', { valueAsNumber: true })} error={errors.timeLimitMinutes?.message} className="bg-slate-50/50" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl shadow-xl shadow-indigo-500/10">
            <div className="flex items-center gap-2 mb-6 text-indigo-400">
              <BookOpen className="h-5 w-5" />
              <h2 className="font-bold uppercase tracking-wider text-xs">Clasificación Académica</h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asignatura</label>
                <select {...register('subjectId')} className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm outline-none cursor-pointer">
                  <option value="">{ldSubs ? 'Cargando...' : 'Seleccionar asignatura...'}</option>
                  {Array.isArray(subjects) && subjects.map((s: Subject) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grupo de Clase</label>
                <select {...register('groupId')} className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm outline-none cursor-pointer">
                  <option value="">{ldGroups ? 'Cargando...' : 'Borrador (Sin grupo)'}</option>
                  {Array.isArray(groups) && groups.map((g: ClassGroup) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoría</label>
                <select {...register('examType')} className="w-full bg-slate-800 border-none rounded-xl p-3 text-sm outline-none cursor-pointer">
                  <option value="EXAM">Examen Oficial</option>
                  <option value="HOMEWORK">Tarea / Deber</option>
                  <option value="PRACTICE">Simulacro / Práctica</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};