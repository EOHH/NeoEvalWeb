import { LoginForm } from '../components/LoginForm';
import logo from '@/assets/images/neoeval_logo.png';

export const LoginPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#FAFAFA] relative overflow-hidden selection:bg-primary/20">

      {/* Background Glow */}
      <div className="absolute top-0 w-full h-full overflow-hidden pointer-events-none flex justify-center items-center">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-400/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-[420px] px-6 relative z-10 flex flex-col">

        {/* Header */}
        <div className="flex flex-col items-center mb-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
          <img
            src={logo}
            alt="Logo de Neo Eval"
            className="h-20 w-auto mb-4 drop-shadow-sm hover:scale-105 hover:drop-shadow-md transition-all duration-300 ease-in-out"
          />

          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Neo Eval
          </h1>

          <p className="text-sm text-gray-500 mt-2 text-center max-w-sm">
            Gestiona el futuro académico de tu institución con precisión y seguridad.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[24px] p-8 sm:p-10 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
          <LoginForm />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center animate-in fade-in duration-700 delay-300">
          <p className="text-[13px] text-gray-500">
            ¿Tu institución aún no utiliza Neo Eval?{' '}
            <a
              href="#"
              className="font-semibold text-gray-900 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded"
            >
              Solicitar una demo
            </a>
          </p>
        </div>

      </div>
    </div>
  );
};