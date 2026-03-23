import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  BookOpen,
  Clock,
  ChevronRight,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { Button } from '@/components/elements/Button';
import { teachersApi } from '@/features/teachers/api/teachersApi';

// ✅ Helper corregido para formatear fechas
const formatTimeAgo = (dateInput?: string | number[] | null) => {
  if (!dateInput) return 'Fecha desconocida';

  try {
    const dateObj = Array.isArray(dateInput)
      ? new Date(
          dateInput[0],
          (dateInput[1] ?? 1) - 1,
          dateInput[2] ?? 1,
          dateInput[3] ?? 0,
          dateInput[4] ?? 0
        )
      : new Date(dateInput);

    const diffDays = Math.floor(
      (Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return dateObj.toLocaleDateString('es-ES');
  } catch {
    return 'Fecha inválida';
  }
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const { data: exams, isLoading: loadingExams, isError: errorExams } = useQuery({
    queryKey: ['teacher', 'exams', user?.id],
    queryFn: () => teachersApi.getExams(user?.id as number),
    enabled: !!user?.id,
  });

  const { data: groups, isLoading: loadingGroups } = useQuery({
    queryKey: ['teacher', 'groups', user?.id],
    queryFn: () => teachersApi.getGroups(user?.id as number),
    enabled: !!user?.id,
  });

  const stats = useMemo(() => {
    const uniqueStudents = new Set();

    groups?.forEach((group: any) => {
      group.students?.forEach((student: any) => {
        uniqueStudents.add(student.id);
      });
    });

    const activeExams = exams?.filter((e: any) => !e.isCompleted).length || 0;

    return [
      {
        label: 'Exámenes Totales',
        value: exams?.length || 0,
        icon: BookOpen,
        color: 'text-indigo-600',
        bg: 'bg-indigo-100',
      },
      {
        label: 'Grupos Activos',
        value: groups?.length || 0,
        icon: Users,
        color: 'text-emerald-600',
        bg: 'bg-emerald-100',
      },
      {
        label: 'Total Estudiantes',
        value: uniqueStudents.size,
        icon: Users,
        color: 'text-blue-600',
        bg: 'bg-blue-100',
      },
      {
        label: 'Exámenes en curso',
        value: activeExams,
        icon: Clock,
        color: 'text-amber-600',
        bg: 'bg-amber-100',
      },
    ];
  }, [exams, groups]);

  const recentExams = useMemo(() => {
    if (!exams) return [];
    return [...exams]
      .sort((a: any, b: any) => Number(b.id) - Number(a.id))
      .slice(0, 5);
  }, [exams]);

  const isLoading = loadingExams || loadingGroups;

  if (errorExams) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-10 w-10 mb-2" />
        <p>Error al conectar con el servidor. Verifica tu sesión.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 rounded-3xl shadow-lg shadow-indigo-500/20 text-white">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            ¡Hola de nuevo, {user?.name || 'Profesor'}! 👋
          </h1>
          <p className="text-indigo-100 mt-2 text-sm md:text-base max-w-xl">
            Resumen de tu actividad académica. Tienes {stats[3]?.value || 0} evaluaciones activas.
          </p>
        </div>

        <div className="shrink-0 mt-4 md:mt-0">
          <Button
            onClick={() => navigate('/exams/new')}
            className="bg-white text-indigo-700 hover:bg-indigo-50 border-none font-bold shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Examen
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white h-24 rounded-2xl border border-gray-100 shadow-sm animate-pulse"
            />
          ))
        ) : (
          stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
              >
                <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* EXAMS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Tus últimos exámenes
            </h2>
            <button
              onClick={() => navigate('/exams')}
              className="text-sm text-indigo-600 font-semibold hover:text-indigo-800"
            >
              Ver todos →
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden min-h-[200px]">
            {isLoading && (
              <div className="p-5 text-center text-gray-400">Cargando actividad...</div>
            )}

            {!isLoading && recentExams.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Aún no has creado ningún examen.
              </div>
            )}

            {!isLoading &&
              recentExams.map((exam: any, index: number) => (
                <div
                  key={exam.id}
                  className={`p-5 flex justify-between items-center hover:bg-gray-50 cursor-pointer ${
                    index !== recentExams.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                  onClick={() => navigate(`/exams/${exam.id}`)}
                >
                  <div>
                    <h4 className="font-semibold">{exam.title}</h4>
                    <div className="text-xs text-gray-500 flex gap-3 mt-1">
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {exam.subjectName || 'General'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(exam.openingDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        exam.isCompleted
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {exam.isCompleted ? 'Completado' : 'Activo'}
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* QUICK ACCESS */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            Accesos Rápidos
          </h2>

          <div className="bg-slate-900 p-6 rounded-2xl text-white space-y-4">
            <button onClick={() => navigate('/groups')}>
              Ver Grupos ({groups?.length || 0})
            </button>

            <button onClick={() => navigate('/exams')}>
              Banco de Preguntas
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};