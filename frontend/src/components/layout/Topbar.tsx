import { Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { useEffect } from 'react';

export default function Topbar() {
  const { user } = useAuthStore();
  const { unreadCount, setUnreadCount } = useNotificationStore();

  const { data } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.get('/api/notifications?unreadOnly=true&limit=1').then(r => r.data.unreadCount),
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (data !== undefined) setUnreadCount(data);
  }, [data, setUnreadCount]);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="text-lg font-semibold text-gray-800">CapitalFlow LMS</div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <span className="text-sm text-gray-700 font-medium hidden md:block">
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      </div>
    </header>
  );
}
