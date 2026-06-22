import { useEffect, useRef, useState } from 'react';
import { User, Bell, AlertTriangle, ReceiptText, Clock, PackageCheck, XCircle } from 'lucide-react';
import { getStoredUser } from '../../utils/auth';

const roleLabels = {
  owner: 'เจ้าของร้าน',
  cashier: 'แคชเชียร์',
  employee: 'พนักงานทั่วไป'
};

const OwnerNavbar = () => {
  const user = getStoredUser() || {};
  const displayName = user.nickname || user.owner_name || 'Admin Owner';
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationsRef = useRef(null);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await fetch('/api/notifications');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || 'โหลดแจ้งเตือนไม่สำเร็จ');
      }

      setNotifications(result.items || []);
      setNotificationCount(result.count || 0);
    } catch (err) {
      console.error('FETCH NOTIFICATIONS ERROR:', err);
      setNotifications([]);
      setNotificationCount(0);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleNotifications = () => {
    const nextOpen = !isNotificationsOpen;
    setIsNotificationsOpen(nextOpen);
    if (nextOpen) fetchNotifications();
  };

  return (
    <nav className="hidden lg:flex fixed top-0 right-0 left-[280px] h-[70px] bg-white/85 backdrop-blur-md border-b border-emerald-900/10 z-30 px-8 items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-xs font-bold text-emerald-700/60 uppercase tracking-widest">System Status: Active</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={handleToggleNotifications}
            className={`text-emerald-800/50 hover:text-emerald-800 transition-colors relative p-2 rounded-xl ${isNotificationsOpen ? 'bg-emerald-50 text-emerald-800' : ''}`}
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-rose-500 rounded-full border-2 border-white text-white text-[10px] font-black flex items-center justify-center">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-12 w-[380px] bg-white rounded-3xl border border-emerald-900/10 shadow-2xl overflow-hidden animate-slide-up">
              <div className="p-5 border-b border-emerald-900/10 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 tracking-tight">แจ้งเตือนระบบ</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    สินค้าใกล้หมด / ปรับสต็อก / แก้ไขหรือยกเลิกบิล
                  </p>
                </div>
                <button
                  onClick={fetchNotifications}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700"
                >
                  รีเฟรช
                </button>
              </div>

              <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                {loadingNotifications && notifications.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 font-bold text-sm">
                    กำลังโหลดแจ้งเตือน...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-bold text-sm">
                    ยังไม่มีแจ้งเตือน
                  </div>
                ) : (
                  notifications.map((item) => {
                    const notificationStyles = {
                      low_stock: {
                        icon: <AlertTriangle size={18} />,
                        className: 'bg-amber-100 text-amber-700'
                      },
                      stock_adjust: {
                        icon: <PackageCheck size={18} />,
                        className: 'bg-emerald-100 text-emerald-700'
                      },
                      bill_edit: {
                        icon: <ReceiptText size={18} />,
                        className: 'bg-blue-50 text-blue-600'
                      },
                      bill_cancel: {
                        icon: <XCircle size={18} />,
                        className: 'bg-rose-100 text-rose-700'
                      }
                    };
                    const style = notificationStyles[item.type] || notificationStyles.bill_edit;
                    return (
                      <div key={item.id} className="p-4 border-b border-slate-100 last:border-b-0 hover:bg-emerald-50/40 transition-colors">
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${style.className}`}>
                            {style.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 text-sm">{item.title}</p>
                            <p className="text-sm font-bold text-slate-600 mt-1 leading-relaxed break-words">
                              {item.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                              <Clock size={12} />
                              <span>{item.meta || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="h-8 w-[1px] bg-emerald-900/10" />
        
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900 leading-none">{displayName}</p>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
              {roleLabels[user.role] || user.role || 'พนักงาน'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
            <User size={20} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default OwnerNavbar;
