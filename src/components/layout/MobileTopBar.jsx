import { useEffect, useRef, useState } from 'react';
import { Menu, Bell, AlertTriangle, ReceiptText, Clock, PackageCheck, XCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const MobileTopBar = ({ toggleSidebar }) => {
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const notificationsRef = useRef(null);
  
  // Mapping paths to titles
  const titles = {
    '/': 'ภาพรวมระบบ',
    '/active-bills': 'โต๊ะที่ใช้งาน',
    '/manage-menus': 'จัดการเมนู',
    '/order-history': 'ประวัติออเดอร์',
    '/stock-beverage': 'คลังสินค้า',
    '/add-menu': 'เพิ่มเมนูใหม่',
  };

  const currentTitle = titles[location.pathname] || 'SATHANEEMHALA';

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || 'โหลดแจ้งเตือนไม่สำเร็จ');
      setNotifications(result.items || []);
      setNotificationCount(result.count || 0);
    } catch (err) {
      console.error('FETCH MOBILE NOTIFICATIONS ERROR:', err);
      setNotifications([]);
      setNotificationCount(0);
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

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-[70px] bg-white/90 backdrop-blur-md border-b border-emerald-900/10 z-40 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <button 
          onClick={toggleSidebar}
          className="p-2.5 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-emerald-800 transition-all active:scale-95 shrink-0"
        >
          <Menu size={22} />
        </button>
        <div className="flex flex-col min-w-0">
          <span className="font-black text-sm tracking-tight text-slate-900 truncate">{currentTitle}</span>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none mt-0.5">Mala Management</span>
        </div>
      </div>
      
      <div className="relative shrink-0" ref={notificationsRef}>
        <button
          onClick={() => {
            const nextOpen = !isNotificationsOpen;
            setIsNotificationsOpen(nextOpen);
            if (nextOpen) fetchNotifications();
          }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isNotificationsOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'}`}
        >
          <Bell size={19} />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-rose-500 rounded-full border-2 border-white text-white text-[10px] font-black flex items-center justify-center">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>

        {isNotificationsOpen && (
          <div className="absolute right-0 top-12 w-[calc(100vw-1.5rem)] max-w-[380px] bg-white rounded-2xl border border-emerald-900/10 shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-emerald-900/10 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 tracking-tight">แจ้งเตือนระบบ</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  สต็อก / บิล
                </p>
              </div>
              <button onClick={fetchNotifications} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                รีเฟรช
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-slate-400 font-bold text-sm">
                  ยังไม่มีแจ้งเตือน
                </div>
              ) : (
                notifications.map((item) => {
                  const notificationStyles = {
                    low_stock: { icon: <AlertTriangle size={18} />, className: 'bg-amber-100 text-amber-700' },
                    stock_adjust: { icon: <PackageCheck size={18} />, className: 'bg-emerald-100 text-emerald-700' },
                    bill_edit: { icon: <ReceiptText size={18} />, className: 'bg-blue-50 text-blue-600' },
                    bill_cancel: { icon: <XCircle size={18} />, className: 'bg-rose-100 text-rose-700' }
                  };
                  const style = notificationStyles[item.type] || notificationStyles.bill_edit;
                  return (
                    <div key={item.id} className="p-4 border-b border-slate-100 last:border-b-0">
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${style.className}`}>
                          {style.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 text-sm">{item.title}</p>
                          <p className="text-sm font-bold text-slate-600 mt-1 leading-relaxed break-words">{item.message}</p>
                          <div className="flex items-center gap-2 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            <Clock size={12} />
                            <span className="break-words">{item.meta || '-'}</span>
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
    </header>
  );
};

export default MobileTopBar;
