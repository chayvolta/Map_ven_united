import { useMsal } from '@azure/msal-react';
import { User } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';

export default function UserInfo({ lang = 'ES' }) {
  const { accounts } = useMsal();
  const t = TRANSLATIONS[lang];

  const currentUser = accounts[0];
  const userName = currentUser?.name || currentUser?.username || t.auth_user_label;
  const userEmail = currentUser?.username || '';

  return (
    <div className="hidden md:flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200">
      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-[#022f2a] to-[#004d40] rounded-full">
        <User size={16} className="text-white" />
      </div>
      <div className="text-left">
        <p className="text-xs font-bold text-[#022f2a] leading-tight max-w-[150px] truncate">
          {userName}
        </p>
        <p className="text-[10px] text-slate-500 leading-tight max-w-[150px] truncate">
          {userEmail}
        </p>
      </div>
    </div>
  );
}
