import { useState, forwardRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  User, Mail, Lock, AlertTriangle, Briefcase, 
  BookOpen, Calendar, Users, Hash, GraduationCap 
} from 'lucide-react';
import { useRegister } from '../hooks/useRegister';
import { Button } from '@/components/elements/Button';
import { Input } from '@/components/form/Input';

/* ─────────────────────────────────────────────
   1. Esquema Zod Condicional Definitivo
   ───────────────────────────────────────────── */
// Definimos los roles como constantes estáticas para TS
const ROLES = ['TEACHER', 'STUDENT', 'PARENT'] as const;

const baseRegisterSchema = z.object({
  name: z.string().min(3, 'Ingresa tu nombre completo').max(100),
  email: z.string().min(1, 'El correo es requerido').email('Formato de correo inválido').max(100),
  password: z.string().min(8, 'Debe contener al menos 8 caracteres').max(100),
  
  // 🔥 FIX ZOD DEFINITIVO: Usamos el array 'as const' y pasamos el mensaje de error directamente como string
  userType: z.enum(ROLES, {
    message: 'Selecciona un tipo de cuenta válido'
}),
  
  // Campos opcionales base
  department: z.string().optional(),
  expertiseArea: z.string().optional(),
  educationalLevel: z.string().optional(),
  birthDate: z.string().optional(),
  relationship: z.string().optional(),
  // 🔥 FIX 2: Simplificado. El custom hook (useRegister) ya se encarga de convertirlo a Number para el backend.
  studentId: z.string().optional(),
});

const registerSchema = baseRegisterSchema.superRefine((data, ctx) => {
  if (data.userType === 'TEACHER') {
    if (!data.department || data.department.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ingresa tu departamento o facultad', path: ['department'] });
    }
    if (!data.expertiseArea || data.expertiseArea.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ingresa tu área de especialidad', path: ['expertiseArea'] });
    }
  }

  if (data.userType === 'STUDENT') {
    if (!data.birthDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Tu fecha de nacimiento es requerida', path: ['birthDate'] });
    }
    if (!data.educationalLevel) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecciona tu nivel educativo', path: ['educationalLevel'] });
    }
  }

  if (data.userType === 'PARENT') {
    if (!data.relationship) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Indica tu parentesco (ej. Padre, Madre)', path: ['relationship'] });
    }
    if (!data.studentId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ingresa el código/ID del estudiante', path: ['studentId'] });
    }
  }
});

type RegisterFormValues = z.infer<typeof registerSchema>;

/* ─────────────────────────────────────────────
   2. Componente Password Corregido
   ───────────────────────────────────────────── */
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
);

// 🔥 FIX 3: Extendemos las props para que TypeScript acepte 'leftIcon' y 'error'
interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input ref={ref} {...props} type={show ? 'text' : 'password'} className="pr-10" />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-150"
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

/* ─────────────────────────────────────────────
   3. Componente Principal
   ───────────────────────────────────────────── */
export const RegisterForm = () => {
  const { mutate: registerUser, isPending, isError, error } = useRegister();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      userType: 'STUDENT', 
    }
  });

  const selectedRole = useWatch({ control, name: 'userType' });

  const onSubmit = (data: RegisterFormValues) => {
    registerUser(data as any);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full animate-in fade-in duration-500">
      
      {isError && (
        <div className="flex items-start gap-3 p-3.5 text-sm text-destructive bg-destructive/5 rounded-xl border border-destructive/10">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="font-medium leading-tight">
            {(error as any)?.response?.data?.message || 'Error de conexión. Inténtalo más tarde.'}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-[13px] font-semibold text-gray-700 ml-1">Tipo de Cuenta</label>
        <div className="grid grid-cols-3 gap-2">
          {['STUDENT', 'TEACHER', 'PARENT'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setValue('userType', role as any, { shouldValidate: true })}
              className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all duration-200 ${
                selectedRole === role 
                  ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm' 
                  : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300 hover:bg-indigo-50/50'
              }`}
            >
              {role === 'STUDENT' ? 'Estudiante' : role === 'TEACHER' ? 'Profesor' : 'Apoderado'}
            </button>
          ))}
        </div>
        {errors.userType && <p className="text-xs text-red-500 ml-1">{errors.userType.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[13px] font-semibold text-gray-700 ml-1">Nombre Completo</label>
          <Input 
            placeholder="Ej: Juan Pérez" 
            disabled={isPending} 
            leftIcon={<User className="h-4 w-4" />}
            error={errors.name?.message}
            {...register('name')} 
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-700 ml-1">Correo Electrónico</label>
          <Input 
            type="email" 
            placeholder="correo@ejemplo.com" 
            disabled={isPending} 
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')} 
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-700 ml-1">Contraseña</label>
          <PasswordInput 
            placeholder="Mínimo 8 caracteres" 
            disabled={isPending} 
            leftIcon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register('password')} 
          />
        </div>
      </div>

      {selectedRole === 'TEACHER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-indigo-900 ml-1">Departamento</label>
            <Input 
              placeholder="Ej: Ciencias Exactas" 
              disabled={isPending} 
              leftIcon={<Briefcase className="h-4 w-4 text-indigo-500" />}
              error={errors.department?.message}
              {...register('department')} 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-indigo-900 ml-1">Especialidad</label>
            <Input 
              placeholder="Ej: Matemáticas" 
              disabled={isPending} 
              leftIcon={<BookOpen className="h-4 w-4 text-indigo-500" />}
              error={errors.expertiseArea?.message}
              {...register('expertiseArea')} 
            />
          </div>
        </div>
      )}

      {selectedRole === 'STUDENT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-emerald-900 ml-1">Fecha Nacimiento</label>
            <Input 
              type="date" 
              disabled={isPending} 
              leftIcon={<Calendar className="h-4 w-4 text-emerald-500" />}
              error={errors.birthDate?.message}
              {...register('birthDate')} 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-emerald-900 ml-1">Nivel Educativo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <GraduationCap className="h-4 w-4 text-emerald-500" />
              </div>
              <select 
                {...register('educationalLevel')}
                disabled={isPending}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.educationalLevel ? 'border-red-500' : 'border-emerald-200'} bg-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all`}
              >
                <option value="">Seleccionar nivel...</option>
                <option value="PRIMARIA">Primaria</option>
                <option value="SECUNDARIA">Secundaria</option>
                <option value="SUPERIOR">Superior</option>
              </select>
            </div>
            {errors.educationalLevel && <p className="text-xs text-red-500 mt-1 ml-1">{errors.educationalLevel.message}</p>}
          </div>
        </div>
      )}

      {selectedRole === 'PARENT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-amber-50/50 rounded-2xl border border-amber-100 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-amber-900 ml-1">Parentesco</label>
            <Input 
              placeholder="Ej: Madre, Padre" 
              disabled={isPending} 
              leftIcon={<Users className="h-4 w-4 text-amber-500" />}
              error={errors.relationship?.message}
              {...register('relationship')} 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-semibold text-amber-900 ml-1">ID del Estudiante</label>
            <Input 
              type="number"
              placeholder="Código" 
              disabled={isPending} 
              leftIcon={<Hash className="h-4 w-4 text-amber-500" />}
              error={errors.studentId?.message}
              {...register('studentId')} 
            />
          </div>
        </div>
      )}

      {/* 🔥 FIX 4: Se arregló la clase hover:-translate-y-px de Tailwind */}
      <Button
        type="submit"
        className="w-full h-12 mt-4 text-[15px] font-bold rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-px transition-all duration-200"
        size="lg"
        isLoading={isPending}
        disabled={(!isValid && isDirty) || isPending}
      >
        Crear mi cuenta
      </Button>

    </form>
  );
};