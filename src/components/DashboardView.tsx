import { Users, UserCheck, Clock, UserX, User, ArrowRight, MonitorPlay } from 'lucide-react';
import { motion } from 'motion/react';
import { PatientQueue, Polyclinic, Doctor } from '../types';
import { useState, useEffect } from 'react';

interface DashboardViewProps {
  queues: PatientQueue[];
  polyclinics: Polyclinic[];
  doctors: Doctor[];
  onUpdateDoctorStatus: (doctorId: string, status: Doctor['status']) => void;
}

export default function DashboardView({
  queues,
  polyclinics,
  doctors,
  onUpdateDoctorStatus,
}: DashboardViewProps) {
  const [tickerTime, setTickerTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTickerTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Today's Summary
  const totalAntrian = queues.length;
  const sisaAntrian = queues.filter((q) => q.status === 'menunggu').length;
  const sudahDilayani = queues.filter((q) => q.status === 'selesai').length;
  const didalamPanggilan = queues.filter((q) => q.status === 'dipanggil').length;
  const dilewati = queues.filter((q) => q.status === 'dilewati').length;

  const currentFormattedTime = tickerTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const currentFormattedDate = tickerTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header section with Date Time and Active System badge */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight" id="dashboard-main-title">
            Pusat Kendali Antrian
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Sistem informasi layanan poliklinik terpadu & status medis klinik.
          </p>
        </div>
        <div className="text-left md:text-right">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            {currentFormattedDate}
          </div>
          <div className="text-2xl font-mono font-medium text-slate-800">
            {currentFormattedTime}
          </div>
        </div>
      </header>

      {/* Grid statistics (Rekap Pasien Hari Ini) */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Queue Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all duration-200">
          <div className="text-slate-400 text-xs font-bold uppercase mb-1">Total Pasien</div>
          <div className="text-3xl font-bold text-slate-800 font-mono tracking-tight">{totalAntrian}</div>
          <p className="text-slate-400 text-[10px] mt-1">Keseluruhan tiket terdaftar</p>
        </div>

        {/* Dipanggil Queue Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all duration-200">
          <div className="text-blue-500 text-xs font-bold uppercase mb-1">Sedang Dilayani</div>
          <div className="text-3xl font-bold text-blue-600 font-mono tracking-tight">{didalamPanggilan}</div>
          <p className="text-slate-400 text-[10px] mt-1">Pasien dipanggil / di poli</p>
        </div>

        {/* Remaining / Sisa Queue Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all duration-200">
          <div className="text-orange-500 text-xs font-bold uppercase mb-1">Sisa Antrian</div>
          <div className="text-3xl font-bold text-orange-600 font-mono tracking-tight">{sisaAntrian}</div>
          <p className="text-slate-400 text-[10px] mt-1 font-sans">Pasien sedang mengantri</p>
        </div>

        {/* Finished / Selesai Queue Card (Primary Blue Highlight) */}
        <div className="bg-blue-600 p-5 rounded-2xl text-white shadow-lg transition-all duration-200">
          <div className="text-blue-100 text-xs font-bold uppercase mb-1">Total Selesai</div>
          <div className="text-3xl font-bold font-mono tracking-tight">{sudahDilayani}</div>
          <p className="text-blue-100/80 text-[10px] mt-1">Telah selesai dilayani dokter</p>
        </div>

        {/* Skipped / Dilewati Queue Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 col-span-2 lg:col-span-1">
          <div className="text-rose-500 text-xs font-bold uppercase mb-1">Dilewati / Hold</div>
          <div className="text-3xl font-bold text-rose-600 font-mono tracking-tight">{dilewati}</div>
          <p className="text-slate-400 text-[10px] mt-1">Tidak hadir saat dipanggil</p>
        </div>
      </section>

      {/* Main Grid: Polyclinic Current Display & On-duty doctor status */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Part: Polyclinic display boards (TV Visual Queue) */}
        <div className="xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <MonitorPlay className="h-5 w-5 text-blue-600" />
              Monitor Televisi Antrian (Live Display)
            </h3>
            <span className="text-xs text-blue-600 font-semibold uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
              Layar Ruang Tunggu
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {polyclinics.map((poly) => {
              // Current active ticket is either status 'dipanggil' or most recent 'selesai' for this polyclinic. Let's find:
              const activeCall = queues.find(
                (q) => q.polyclinicId === poly.id && q.status === 'dipanggil'
              );
              const lastFinished = [...queues]
                .reverse()
                .find((q) => q.polyclinicId === poly.id && q.status === 'selesai');
              
              const currentNumberText = activeCall 
                ? activeCall.queueNumber 
                : lastFinished 
                  ? lastFinished.queueNumber 
                  : '--';
              
              const currentNameText = activeCall
                ? activeCall.name
                : lastFinished
                  ? `Selesai: ${lastFinished.name}`
                  : 'Belum ada antrian';

              const waitingCount = queues.filter(
                (q) => q.polyclinicId === poly.id && q.status === 'menunggu'
              ).length;

              const activeDoctor = doctors.find(
                (d) => d.polyclinicId === poly.id && d.status === 'bertugas'
              );

              return (
                <div
                  key={poly.id}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:translate-y-[-2px] transition-all duration-200"
                >
                  {/* Top bar */}
                  <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm tracking-tight">{poly.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono tracking-wider">{poly.room}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-blue-50 font-bold text-blue-600 border border-blue-100">
                        Prefix: {poly.prefix}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 text-center space-y-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Antrian Sekarang
                    </span>
                    <div className="py-2">
                      <motion.div
                        key={currentNumberText}
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`text-5xl font-black font-mono tracking-tight inline-block ${
                          activeCall ? 'text-blue-600 drop-shadow-[0_2px_12px_rgba(37,99,235,0.12)] bg-blue-50/50 px-8 py-3 rounded-2xl border border-blue-100/30' : 'text-slate-300'
                        }`}
                      >
                        {currentNumberText}
                      </motion.div>
                    </div>

                    <div className="text-xs font-semibold text-slate-700 truncate max-w-full px-4">
                      {currentNameText}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${waitingCount > 0 ? 'bg-amber-500 animate-ping' : 'bg-slate-300'}`} />
                        <span className="text-slate-500 text-[10px]">
                          Menunggu: <strong className="text-slate-700 font-mono font-bold">{waitingCount} Pasien</strong>
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 font-mono shrink-0">
                        {activeDoctor ? activeDoctor.name : 'Dokter Istirahat'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Running Ticker Tape */}
          <div className="bg-slate-900 text-slate-300 p-3 rounded-xl overflow-hidden relative flex items-center w-full shadow-inner border border-slate-800">
            <div className="absolute left-3 bg-blue-600 text-white font-bold px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider z-10 select-none">
              INFO
            </div>
            <div className="w-full flex shrink-0 whitespace-nowrap pl-16">
              <span className="animate-marquee inline-block font-sans text-xs tracking-wide text-slate-300">
                ✦ Jaga Kebersihan Lingkungan Klinik Pro ✦ Bagi Pembebanan BPJS silakan pastikan berkas rujukan dan KTP Anda lengkap ✦ Utamakan antrian tertib, kesembuhan Anda prioritas kami ✦ Hubungi meja registrasi jika nomor terlewat ✦
              </span>
            </div>
          </div>
        </div>

        {/* Right Part: On-duty Doctor Status Dashboard (Interaktif) */}
        <div className="xl:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-blue-600" />
              Status Dokter Hari Ini
            </h3>
            <span className="text-[9px] text-slate-400 font-semibold uppercase font-mono bg-slate-100 px-2 py-0.5 rounded-md">
              Live Control
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Ubah status bertugas dokter untuk memantau kehadiran medis saat ini.
            </p>

            <div className="space-y-3">
              {doctors.map((doc) => {
                const associatedPoly = polyclinics.find((p) => p.id === doc.polyclinicId);
                const isBertugas = doc.status === 'bertugas';
                const isIstirahat = doc.status === 'istirahat';

                return (
                  <div
                    key={doc.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all flex flex-col gap-2.5"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar representation matching the Clean Minimalism custom format */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                        isBertugas 
                          ? 'bg-blue-100 text-blue-600 border-blue-200' 
                          : isIstirahat 
                            ? 'bg-amber-100 text-amber-700 border-amber-200' 
                            : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}>
                        {doc.name.replace('dr. ', '').substring(0, 2).toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-slate-800 truncate leading-snug">{doc.name}</h4>
                        <p className="text-[10px] text-slate-500 leading-tight truncate">
                          {associatedPoly ? associatedPoly.name : 'Umum'}
                        </p>
                      </div>

                      {/* Small Active Pulse Indicator */}
                      <div className={`w-2 h-2 rounded-full ${
                        isBertugas 
                          ? 'bg-green-500 ring-4 ring-green-100' 
                          : isIstirahat 
                            ? 'bg-amber-500 ring-4 ring-amber-100' 
                            : 'bg-slate-300'
                      }`} />
                    </div>

                    {/* Compact Status Selectors */}
                    <div className="flex items-center gap-1 text-[9px] pt-1.5 border-t border-slate-100">
                      <button
                        onClick={() => onUpdateDoctorStatus(doc.id, 'bertugas')}
                        className={`flex-1 py-1 rounded-md font-bold transition-all ${
                          isBertugas
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        Bertugas
                      </button>
                      <button
                        onClick={() => onUpdateDoctorStatus(doc.id, 'istirahat')}
                        className={`flex-1 py-1 rounded-md font-bold transition-all ${
                          isIstirahat
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        Istirahat
                      </button>
                      <button
                        onClick={() => onUpdateDoctorStatus(doc.id, 'tidak_aktif')}
                        className={`flex-1 py-1 rounded-md font-bold transition-all ${
                          doc.status === 'tidak_aktif'
                            ? 'bg-slate-700 text-white'
                            : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        Off
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
