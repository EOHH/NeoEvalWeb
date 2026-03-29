import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { RegisterForm } from '../components/RegisterForm';
import logo from '@/assets/images/neoeval_logo.png';

export const RegisterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex bg-white selection:bg-indigo-500/30">
      
      {/* =========================================
          LADO IZQUIERDO: BRANDING (Oculto en Móvil)
          Misma estructura y animaciones que el Login
          ========================================= */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden">
        
        {/* Efectos de Gradiente de Fondo */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600/10 to-purple-600/20 z-0" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] z-0 animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[128px] z-0 animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 p-12 max-w-2xl text-white">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-white/5 p-3.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl">
              <img src={logo} alt="Neo Eval Logo" className="h-10 w-auto drop-shadow-md" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              NeoEval
            </span>
          </div>
          
          {/* Texto motivacional adaptado para el registro */}
          <h1 className="text-4xl xl:text-5xl font-bold leading-[1.15] tracking-tight mb-6">
            Empieza hoy a transformar la educación.
          </h1>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed font-light">
            Únete a la comunidad de instituciones que ya están definiendo el futuro. Crea tu cuenta en minutos y accede a un ecosistema avanzado de evaluación académica.
          </p>
          
          <div className="flex items-center gap-3 text-sm font-medium text-indigo-300 bg-indigo-950/50 w-fit px-4 py-2 rounded-full border border-indigo-500/20">
            <Sparkles className="h-4 w-4" />
            <span>Registro rápido y seguro para toda la institución</span>
          </div>
        </div>
      </div>

      {/* =========================================
          LADO DERECHO: FORMULARIO
          Misma estructura y animaciones que el Login
          ========================================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-[#FAFAFA] lg:bg-white py-12 lg:py-6">
        
        {/* Decoración sutil solo para el lado blanco en móvil */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none lg:hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-indigo-100 blur-[80px]" />
        </div>

        {/* Notarás que el max-w es un poco más ancho (500px) porque el formulario de registro es más complejo */}
        <div className="w-full max-w-[500px] relative z-10 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Header Móvil (Se muestra solo si el branding izquierdo está oculto) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img src={logo} alt="Neo Eval Logo" className="h-16 w-auto mb-4 drop-shadow-sm" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">NeoEval</h2>
          </div>

          <div className="mb-8 hidden lg:block">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Crea tu cuenta</h2>
            <p className="text-slate-500 mt-2 text-sm">Completa tus datos para empezar tu viaje en NeoEval.</p>
          </div>

          {/* Contenedor del Formulario (Shadow en móvil, transparente en PC) */}
          <div className="bg-white lg:bg-transparent rounded-[24px] p-8 lg:p-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:shadow-none border border-gray-100 lg:border-none">
            {/* 🔥 Aquí inyectamos tu RegisterForm funcional y condicional */}
            <RegisterForm />
          </div>

          {/* Footer de Enlaces adaptado para ir al Login */}
          <div className="mt-8 text-center flex flex-col gap-3">
            <p className="text-[14px] text-slate-500">
              ¿Ya tienes una cuenta?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 rounded px-1"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};