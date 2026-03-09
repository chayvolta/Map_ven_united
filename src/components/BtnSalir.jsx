import { useMsal } from '@azure/msal-react';
import { LogOut } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';

export default function BtnSalir({ lang = 'ES' }) {
  const { instance, accounts } = useMsal();
  const t = TRANSLATIONS[lang];

  const handleLogout = async () => {
    try {
      if (logoutType) {
        await instance.logoutPopup({
          postLogoutRedirectUri: window.location.origin,
          mainWindowRedirectUri: window.location.origin,
        });
      } else {
        await instance.logoutPopup({
          account: accounts[0],
          postLogoutRedirectUri: window.location.origin,
          onRedirectNavigate: () => false,
        });
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      });
    }
  };
  return (
    <button
      onClick={handleLogout}
      className="bg-red-500/90 hover:bg-red-600 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95"
      title={t.auth_logout}
      aria-label={t.auth_logout}
    >
      <LogOut size={16} />
      <span className="hidden sm:inline">{t.auth_logout_short}</span>
    </button>
  );
}
