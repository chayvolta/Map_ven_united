import { useMsal } from '@azure/msal-react';
import { LogIn } from 'lucide-react';
import { useState } from 'react';
import logoFitur from '../assets/logo-FITUR.png';
import { loginRequest } from '../authConfig';
import { TRANSLATIONS } from '../i18n/translations';

/**
 * Componente de Login con Azure AD (Microsoft Entra ID)
 */
export default function AzureLogin({ lang: initialLang = 'ES' }) {
  const { instance } = useMsal();
  const [lang, setLang] = useState(initialLang);
  const t = TRANSLATIONS[lang];

  const handleLogin = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Error en autenticación:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#022f2a] via-[#004d40] to-[#006b4f] relative overflow-hidden">
      <div className="absolute top-6 right-6 z-20 flex gap-2">
        <button
          onClick={() => setLang('ES')}
          className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
            lang === 'ES'
              ? 'bg-white text-[#022f2a] shadow-lg'
              : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
          }`}
        >
          ES
        </button>
        <button
          onClick={() => setLang('EN')}
          className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
            lang === 'EN'
              ? 'bg-white text-[#022f2a] shadow-lg'
              : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
          }`}
        >
          EN
        </button>
      </div>

      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white/95 backdrop-blur-xl p-12 rounded-[3rem] shadow-2xl w-full max-w-md border border-white/20 relative z-10">
        <div className="flex justify-center mb-8">
          <img src={logoFitur} alt="FITUR" className="h-20 w-auto" />
        </div>

        <div className="text-center mb-10">
          <h1 className="font-serif-display text-4xl text-[#022f2a] mb-3 tracking-tight">
            {t.auth_title}
          </h1>
          <p className="text-sm text-slate-600 font-light leading-relaxed">{t.auth_subtitle}</p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-[#d4a855] to-[#c49742] hover:from-[#b58b3b] hover:to-[#a67a32] text-white py-4 rounded-2xl font-bold text-sm tracking-wider uppercase transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group transform hover:scale-[1.02] active:scale-[0.98]"
          aria-label={t.auth_login_btn}
        >
          <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
          {t.auth_login_btn}
        </button>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">{t.auth_support}</p>
        </div>
      </div>
    </div>
  );
}
