import { useState, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, AlertTriangle } from 'lucide-react';
import { useLogin } from '../hooks/useLogin';
import { Button } from '@/components/elements/Button';
import { Input } from '@/components/form/Input';

const loginSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Formato de correo inválido'),
  password: z.string().min(6, 'Debe contener al menos 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/* ─────────────────────────────────────────────
   Password Input con ojito (compatible RHF)
   ───────────────────────────────────────────── */

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const PasswordInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        {...props}
        type={show ? 'text' : 'password'}
        className="pr-10"
      />

      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-150"
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

/* ───────────────────────────────────────────── */

export const LoginForm = () => {
  const { mutate: login, isPending, isError, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: LoginFormValues) => {
    login({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full">

      {/* Error Global */}
      {isError && (
        <div className="flex items-start gap-3 p-3.5 text-sm text-destructive bg-destructive/5 rounded-xl border border-destructive/10 animate-in slide-in-from-top-2 fade-in duration-300">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="font-medium leading-tight">
            {(error as any)?.response?.data?.message || 'Credenciales incorrectas o error de conexión.'}
          </p>
        </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-[13px] font-semibold text-gray-700 ml-1">
          Correo Institucional
        </label>
        <Input
          id="email"
          type="email"
          placeholder="docente@institucion.edu"
          autoComplete="email"
          disabled={isPending}
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between ml-1">
          <label htmlFor="password" className="text-[13px] font-semibold text-gray-700">
            Contraseña
          </label>
          <a
            href="#"
            className="text-[13px] font-medium text-primary hover:text-primary-hover hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <PasswordInput
          id="password"
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={isPending}
          {...register('password')}
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full mt-2 h-11 rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.2)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-[1px] transition-all duration-200"
        size="lg"
        isLoading={isPending}
        disabled={(!isValid && isDirty) || isPending}
      >
        Ingresar al sistema
      </Button>
    </form>
  );
};