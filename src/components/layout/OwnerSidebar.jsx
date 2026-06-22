import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Menu as MenuIcon, 
  History, 
  Beer, 
  X,
  LogOut,
  ChevronRight,
  Users,
  Grid
} from 'lucide-react';
import { clearStoredUser, getStoredUser } from '../../utils/auth';

const OwnerSidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const user = getStoredUser() || {};
  
  const navItems = [
    { name: 'ภาพรวมระบบ', path: '/', icon: <LayoutDashboard size={20} />, roles: ['owner'] },
    { name: 'จัดการโต๊ะ', path: '/manage-tables', icon: <Grid size={20} />, roles: ['owner', 'employee', 'cashier'] },
    { name: 'โต๊ะที่กำลังใช้งาน', path: '/active-bills', icon: <UtensilsCrossed size={20} />, roles: ['owner', 'employee', 'cashier'] },
    { name: 'จัดการเมนูร้าน', path: '/manage-menus', icon: <MenuIcon size={20} />, roles: ['owner'] },
    { name: 'ประวัติออเดอร์', path: '/order-history', icon: <History size={20} />, roles: ['owner', 'employee', 'cashier'] },
    { name: 'คลังสินค้าสต็อก', path: '/stock-beverage', icon: <Beer size={20} />, roles: ['owner', 'employee', 'cashier'] },
    { name: 'ประวัติสต็อก', path: '/stock-history', icon: <History size={20} />, roles: ['owner', 'employee', 'cashier'] },
    { name: 'จัดการพนักงาน', path: '/manage-employees', icon: <Users size={20} />, roles: ['owner'] },
  ];


  const handleLogout = () => {
    clearStoredUser();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-500"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-screen z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        bg-[#06231f] text-white w-[min(86vw,280px)] lg:w-[280px] shadow-2xl flex flex-col overflow-hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Logo */}
        <div className="p-6 lg:p-8 lg:pb-10 border-b border-emerald-900/60 flex justify-between items-center relative">
          <div className="relative z-10">
            <h1 className="text-xl lg:text-2xl font-black tracking-tighter text-white leading-tight uppercase">SATHANEEMHALA</h1>
            <p className="text-[10px] font-black tracking-[0.3em] text-amber-400 mt-1 uppercase">Management</p>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-emerald-950 rounded-xl transition-colors">
            <X size={24} className="text-emerald-100/70" />
          </button>
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-amber-400/10 rounded-full blur-3xl" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-5 lg:py-8 px-4 overflow-y-auto space-y-2 custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-emerald-100/40 uppercase tracking-[0.2em] mb-4">Main Menu</p>
          
          {navItems.filter(item => item.roles.includes(user.role)).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => { if(window.innerWidth < 1024) toggleSidebar(); }}
              className={({ isActive }) => `
                flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-amber-400 text-emerald-950 shadow-lg shadow-amber-400/20 translate-x-1' 
                  : 'text-emerald-50/60 hover:bg-emerald-950 hover:text-white'}
              `}
            >
              <div className="flex items-center gap-4">
                <span className="transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="font-bold text-sm">{item.name}</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
            </NavLink>
          ))}

        </nav>

        {/* Bottom Section */}
        <div className="p-4 lg:p-6 space-y-3 lg:space-y-4 border-t border-emerald-900/60">
          <NavLink
            to="/customer"
            target="_blank"
            className="flex items-center justify-center gap-3 w-full py-4 bg-emerald-950 hover:bg-emerald-900 text-amber-100 rounded-2xl transition-all font-black text-xs uppercase tracking-widest shadow-inner"
          >
            Store Front
          </NavLink>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-emerald-50/40 hover:text-rose-300 transition-colors font-bold text-sm group"
          >
            <div className="p-2 bg-emerald-950/70 rounded-lg group-hover:bg-rose-500/10 transition-colors">
              <LogOut size={16} />
            </div>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default OwnerSidebar;
