import { Activity, LayoutDashboard, Megaphone, UserPlus, FileHeart, Settings, X } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpenOnMobile = false, onCloseMobile }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'panggil', label: 'Panggil Antrian', icon: Megaphone },
    { id: 'registrasi', label: 'Registrasi Pasien', icon: UserPlus },
    { id: 'poli-dokter', label: 'Data Poli & Dokter', icon: FileHeart },
    { id: 'settings', label: 'Pengaturan Suara', icon: Settings },
  ];

  return (
    <aside className={`
      w-72 bg-white border-r border-slate-200 text-slate-800 flex flex-col h-full shrink-0
      transition-transform duration-300 md:translate-x-0 md:relative md:flex z-50
      ${isOpenOnMobile ? 'translate-x-0 fixed inset-y-0 left-0 shadow-2xl' : '-translate-x-full absolute inset-y-0 left-0 md:translate-x-0'}
    `}>
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl flex items-center justify-center">
            <Activity className="h-6 w-6 stroke-[2.5]" id="brand-logo-icon" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-lg leading-tight tracking-tight text-slate-900 flex items-center gap-1.5">
              Klinik Sinta
            </h1>
            <span className="text-xs text-blue-500 font-medium font-mono">By MetroPedia</span>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation list */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-item-${item.id}`}
              onClick={() => {
                setActiveTab(item.id);
                if (onCloseMobile) {
                  onCloseMobile();
                }
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all relative duration-150 group ${
                isActive
                  ? 'text-blue-700 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute inset-0 bg-blue-50/80 rounded-lg"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  style={{ zIndex: 0 }}
                />
              )}
              <Icon
                className={`relative z-10 h-5 w-5 stroke-[2] transition-transform duration-200 ${
                  isActive ? 'text-blue-600' : 'text-slate-400 group-hover:scale-105'
                }`}
              />
              <span className="relative z-10">{item.label}</span>
              {isActive && (
                <span className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Status Footer */}
      <div className="p-5 border-t border-slate-100 bg-slate-50/50 text-slate-400 text-xs font-sans space-y-1">
        <div className="flex items-center gap-2 text-blue-600 font-mono font-medium">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping shrink-0" />
          <span>Sistem Antrian Aktif</span>
        </div>
        <p className="font-mono text-[10px] text-slate-400">Host: Cloud Run Container</p>
      </div>
    </aside>
  );
}
