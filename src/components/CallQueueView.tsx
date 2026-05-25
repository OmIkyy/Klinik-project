import { Megaphone, Play, RotateCcw, CheckCircle2, UserX, UserMinus, Plus, ListFilter, AlertTriangle, Volume2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PatientQueue, Polyclinic, VoiceSettings } from '../types';
import { useState } from 'react';
import { speakText } from '../constants';

interface CallQueueViewProps {
  queues: PatientQueue[];
  polyclinics: Polyclinic[];
  onUpdateQueueStatus: (queueId: string, status: PatientQueue['status']) => void;
  onCallQueue: (queue: PatientQueue, customText?: string) => void;
  voiceSettings: VoiceSettings;
}

export default function CallQueueView({
  queues,
  polyclinics,
  onUpdateQueueStatus,
  onCallQueue,
  voiceSettings,
}: CallQueueViewProps) {
  const [filterPoly, setFilterPoly] = useState<string>('all');
  const [customCallText, setCustomCallText] = useState<string>('');
  const [broadcastOutput, setBroadcastOutput] = useState<string>('');
  const [emptyPolyId, setEmptyPolyId] = useState<string | null>(null);

  // Handle playing custom announcements
  const handleCustomSpeak = () => {
    if (!customCallText.trim()) return;
    speakText(customCallText, voiceSettings);
    setBroadcastOutput(`Menyiarkan suara custom: "${customCallText}"`);
    setTimeout(() => setBroadcastOutput(''), 4000);
  };

  // Helper quick broadcast templates
  const quickBroadcasts = [
    { label: 'Harap Tertib', text: 'Mohon perhatian kepada seluruh pasien, harap menjaga ketertiban, ketenangan, dan kebersihan di lingkungan poliklinik. Terima kasih.' },
    { label: 'Dokter Istirahat', text: 'Pemberitahuan kepada para pasien. Dokter akan beristirahat sejenak selama lima belas menit. Harap bersabar menunggu.' },
    { label: 'Apotik Siap', text: 'Pemberitahuan, obat untuk resep obat saat ini sudah selesai disiapkan di apotek. Harap mengantri dengan tertib.' },
  ];

  // Helper to handle advancing queue
  const handleNextQueue = (polyclinicId: string) => {
    const poly = polyclinics.find(p => p.id === polyclinicId);
    if (!poly) return;
    setEmptyPolyId(null);

    // First: If there is an active 'dipanggil' patient, mark them as 'selesai'
    const activePatient = queues.find(q => q.polyclinicId === polyclinicId && q.status === 'dipanggil');
    if (activePatient) {
      onUpdateQueueStatus(activePatient.id, 'selesai');
    }

    // Second: Find the next 'menunggu' patient
    const nextPatient = queues
      .filter(q => q.polyclinicId === polyclinicId && q.status === 'menunggu')
      .sort((a, b) => a.number - b.number)[0];

    if (nextPatient) {
      // Mark next as 'dipanggil'
      onUpdateQueueStatus(nextPatient.id, 'dipanggil');
      // Trigger voice call!
      onCallQueue(nextPatient);
    } else {
      setEmptyPolyId(polyclinicId);
      setTimeout(() => setEmptyPolyId(null), 3500);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header screen */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-blue-600 stroke-[2]" />
          Panggil & Kelola Antrian Pasien
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Kelola panggilan loket per poliklinik secara live dan lakukan pengumuman suara otomatis.
        </p>
      </div>

      {/* Grid of Polyclinics Operator Boards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {polyclinics.map((poly) => {
          // Find currently called patient
          const activePatient = queues.find(
            (q) => q.polyclinicId === poly.id && q.status === 'dipanggil'
          );

          // Find count of remaining waiting patients for this polyclinic
          const waitingList = queues
            .filter((q) => q.polyclinicId === poly.id && q.status === 'menunggu')
            .sort((a, b) => a.number - b.number);
          
          const waitingCount = waitingList.length;
          const nextPatient = waitingList[0];

          return (
            <div
              key={poly.id}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Card Header styling with Clean Minimalism style */}
              <div className="border-b border-slate-200 p-5 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-base text-slate-800">{poly.name}</h3>
                  <span className="inline-block mt-1 font-mono text-[9px] text-blue-600 font-bold bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-sm">
                    {poly.room} (Prefix: {poly.prefix})
                  </span>
                </div>
                <div className="bg-white border border-slate-200 px-3 py-1 rounded-xl text-center">
                  <span className="block text-[8px] text-slate-400 uppercase font-bold tracking-wider leading-none">Menunggu</span>
                  <span className="font-mono font-bold text-lg text-slate-800 leading-none block mt-1">
                    {waitingCount}
                  </span>
                </div>
              </div>

              {/* Call Controls and Active Number */}
              <div className="p-5 space-y-4">
                {/* Inline warning for empty queue */}
                {emptyPolyId === poly.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    <span>Antrian untuk {poly.name} sudah habis!</span>
                  </motion.div>
                )}

                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Left Column: Big active number display */}
                  <div className="col-span-12 sm:col-span-5 text-center bg-slate-50 border border-slate-100 rounded-2xl py-5">
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase block mb-1">
                      SEDANG DIPANGGIL
                    </span>
                    <div className="text-4xl font-mono font-black text-blue-600 tracking-tight">
                      {activePatient ? activePatient.queueNumber : '--'}
                    </div>
                    <div className="text-xs text-slate-800 font-bold truncate px-3 mt-1.5 h-4">
                      {activePatient ? activePatient.name : 'Tidak ada panggilan'}
                    </div>
                  </div>

                  {/* Right Column: Interaction Controls */}
                  <div className="col-span-12 sm:col-span-7 flex flex-col gap-2">
                    {activePatient ? (
                      <>
                        {/* Call / Recall Speech Button */}
                        <button
                          onClick={() => onCallQueue(activePatient)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs shrink-0"
                        >
                          <Volume2 className="h-4 w-4" />
                          PANGGIL NOMOR ANTRIAN
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() => onUpdateQueueStatus(activePatient.id, 'selesai')}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors border border-slate-200"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                            Selesai
                          </button>
                          
                          <button
                            onClick={() => onUpdateQueueStatus(activePatient.id, 'dilewati')}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors border border-rose-100"
                          >
                            <UserX className="h-3.5 w-3.5" />
                            Lewati
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-center h-full text-center text-xs text-slate-400">
                        Loket aktif. Klik 'Panggil Berikutnya' untuk memanggil antrian pertama.
                      </div>
                    )}
                  </div>
                </div>

                {/* Queue advancement section */}
                <div className="pt-4 border-t border-slate-150 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Antrian Berikutnya
                    </span>
                    <p className="text-xs text-slate-600 font-bold truncate mt-0.5">
                      {nextPatient ? `${nextPatient.queueNumber} - ${nextPatient.name}` : '(Tidak ada data baru)'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleNextQueue(poly.id)}
                    disabled={waitingCount === 0}
                    className={`px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shrink-0 ${
                      waitingCount > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Panggil Berikutnya
                    <Play className="h-3 w-3 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Broadcast microphone text simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Custom audio broadcast controller */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-blue-600" />
              Custom Siaran Suara
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Ketikkan kalimat apa pun dan tekan tombol panggil untuk mengeluarkannya langsung lewat speaker audio klinik Anda.
            </p>

            <div className="mt-4 space-y-3">
              <textarea
                value={customCallText}
                onChange={(e) => setCustomCallText(e.target.value)}
                placeholder="Contoh: Perhatian! Seluruh pasien dimohon menyiapkan fotokopi KTP dan rujukan sebelum masuk poliklinik."
                className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-700 leading-relaxed focus:outline-hidden focus:border-blue-500/50 focus:bg-white transition-all shrink-0"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleCustomSpeak}
                  disabled={!customCallText.trim()}
                  className={`flex-1 py-2 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 ${
                    customCallText.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Volume2 className="h-4 w-4" />
                  Panggil Teks Custom
                </button>
                <button
                  onClick={() => setCustomCallText('')}
                  className="px-3 py-2 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold"
                >
                  Clear
                </button>
              </div>

              {broadcastOutput && (
                <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg text-center text-[11px] text-blue-700 animate-pulse font-mono">
                  {broadcastOutput}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
              Pengumuman Cepat (Quick Broadcast)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickBroadcasts.map((b) => (
                <button
                  key={b.label}
                  onClick={() => setCustomCallText(b.text)}
                  className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-blue-50 text-[10px] font-bold text-slate-600 hover:text-blue-700 border border-slate-150 transition-colors"
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live patient details registry logs */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                Rekap Data Antrian Pasien
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Arsip detail kehadiran seluruh antrian hari ini.
              </p>
            </div>

            {/* Polyclinic selection filter */}
            <div className="flex items-center gap-2">
              <ListFilter className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={filterPoly}
                onChange={(e) => setFilterPoly(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 rounded-lg p-1.5 focus:outline-hidden focus:bg-white"
              >
                <option value="all">Semua Poli</option>
                {polyclinics.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-150">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[9px] tracking-wider border-b border-slate-150">
                <tr>
                  <th className="p-3 pl-4">No Antrian</th>
                  <th className="p-3">Nama Pasien</th>
                  <th className="p-3">Poli Tujuan</th>
                  <th className="p-3">Tipe</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 pr-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queues
                  .filter((q) => filterPoly === 'all' || q.polyclinicId === filterPoly)
                  .map((q) => {
                    const poly = polyclinics.find((p) => p.id === q.polyclinicId);
                    
                    return (
                      <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 pl-4 font-mono font-bold text-slate-800">
                          {q.queueNumber}
                        </td>
                        <td className="p-3 font-bold text-slate-800">{q.name}</td>
                        <td className="p-3 text-slate-500 font-sans font-semibold">
                          {poly ? poly.name : 'Unknown'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-sm font-semibold text-[9px] ${
                            q.type === 'BPJS' 
                              ? 'bg-teal-50 text-teal-700 border border-teal-100' 
                              : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {q.type}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wide inline-block ${
                            q.status === 'dipanggil'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : q.status === 'menunggu'
                                ? 'bg-amber-100 text-amber-800'
                                : q.status === 'selesai'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-rose-100 text-rose-800'
                          }`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="p-3 pr-4 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => onCallQueue(q)}
                              title="Panggil Suara"
                              className="p-1.5 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 hover:scale-105 rounded-md transition-all whitespace-nowrap"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </button>
                            {q.status === 'menunggu' && (
                              <button
                                onClick={() => onUpdateQueueStatus(q.id, 'dipanggil')}
                                title="Set Dipanggil"
                                className="px-2 py-0.5 bg-blue-600 text-white hover:bg-blue-700 rounded-md text-[9px] font-bold"
                              >
                                Call
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                {queues.filter((q) => filterPoly === 'all' || q.polyclinicId === filterPoly).length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 text-xs font-sans">
                      Belum ada antrian terdaftar untuk kategori ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
