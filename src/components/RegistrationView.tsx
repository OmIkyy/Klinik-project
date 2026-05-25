import { UserPlus, Receipt, Users, Plus, Smartphone, Asterisk, CheckCircle2, Ticket, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Polyclinic, PatientQueue } from '../types';
import React, { useState } from 'react';

interface RegistrationViewProps {
  polyclinics: Polyclinic[];
  queues: PatientQueue[];
  onRegisterPatient: (patientData: {
    name: string;
    polyclinicId: string;
    type: 'BPJS' | 'MANDIRI';
  }) => PatientQueue;
}

export default function RegistrationView({
  polyclinics,
  queues,
  onRegisterPatient,
}: RegistrationViewProps) {
  // Form State
  const [name, setName] = useState('');
  const [selectedPolyId, setSelectedPolyId] = useState(polyclinics[0]?.id || '');
  const [type, setType] = useState<'BPJS' | 'MANDIRI'>('MANDIRI');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Ticket Receipt modal
  const [activeReceipt, setActiveReceipt] = useState<PatientQueue | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  // Auto-fill random mock names
  const mockNames = [
    'Rahmat Hidayat',
    'Amelia Putri',
    'Bambang Wijaja',
    'Siti Khodijah',
    'Surya Saputra',
    'Diana Ross',
    'Agus Setiawan',
  ];

  const handleFillRandom = () => {
    setErrorMessage('');
    const randomIndex = Math.floor(Math.random() * mockNames.length);
    setName(mockNames[randomIndex]);
    const randomPoly = polyclinics[Math.floor(Math.random() * polyclinics.length)];
    if (randomPoly) setSelectedPolyId(randomPoly.id);
    setType(Math.random() > 0.4 ? 'BPJS' : 'MANDIRI');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Mohon masukkan nama pasien terlebih dahulu.');
      return;
    }

    if (!selectedPolyId) {
      setErrorMessage('Mohon pilih tujuan poliklinik.');
      return;
    }

    // Register patient
    const registered = onRegisterPatient({
      name: name.trim(),
      polyclinicId: selectedPolyId,
      type,
    });

    // Populate the ticket modal for visual receipt print
    setActiveReceipt(registered);

    // Reset inputs
    setName('');
    setPhone('');
    setNotes('');
  };

  // Simulate ticket printing trigger
  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      setActiveReceipt(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in relative font-sans">
      {/* Header screen */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-blue-600 stroke-[2]" />
          Registrasi Pasien Baru
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Daftarkan pasien ke antrian poliklinik dan otomatis cetak nomor cetakan antrian digital.
        </p>
      </div>

      {/* Inline Error Message (Replaces blocked window.alert) */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: Comprehensive Input Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Form Antrian Baru</h3>
            <button
              type="button"
              onClick={handleFillRandom}
              className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <Ticket className="h-3.5 w-3.5 text-slate-500" />
              Demo Autofill
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                Nama Lengkap Pasien <Asterisk className="h-2.5 w-2.5 text-rose-500" />
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setErrorMessage('');
                  setName(e.target.value);
                }}
                placeholder="Contoh: Muhammad Rizky"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-blue-500/50 focus:bg-white transition-all font-semibold"
              />
            </div>

            {/* Polyclinic Destination & Queue numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  Poliklinik Tujuan <Asterisk className="h-2.5 w-2.5 text-rose-500" />
                </label>
                <select
                  value={selectedPolyId}
                  onChange={(e) => setSelectedPolyId(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:bg-white transition-all font-bold"
                >
                  {polyclinics.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.room})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Phone Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  Nomor Handphone (HP)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 font-bold">
                    +62
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="812345678"
                    className="w-full text-xs p-3 pl-12 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Custom patient treatment Type (BPJS / Mandiri) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Jenis Jaminan Pasien
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  onClick={() => setType('MANDIRI')}
                  className={`border p-4 rounded-xl flex flex-col justify-center cursor-pointer transition-all ${
                    type === 'MANDIRI'
                      ? 'border-blue-500 bg-blue-50/50 text-blue-950 ring-2 ring-blue-500/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  <span className="font-bold text-xs uppercase text-slate-800">UMUM / MANDIRI</span>
                  <span className="text-[9px] text-slate-400 mt-1">Non-BPJS tunai/debit</span>
                </label>

                <label
                  onClick={() => setType('BPJS')}
                  className={`border p-4 rounded-xl flex flex-col justify-center cursor-pointer transition-all ${
                    type === 'BPJS'
                      ? 'border-blue-500 bg-blue-50/50 text-blue-950 ring-2 ring-blue-500/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  <span className="font-bold text-xs uppercase text-blue-700">BPJS KESEHATAN</span>
                  <span className="text-[9px] text-slate-400 mt-1">Kartu rujukan sesuai faskes</span>
                </label>
              </div>
            </div>

            {/* Custom symptoms / comments */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Catatan Rujukan / Keluhan Utama
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Pemeriksaan gigi graham bengkak sejak kemarin malam..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed focus:outline-hidden focus:bg-white transition-all h-20"
              />
            </div>

            {/* Button submits */}
            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/10 flex items-center justify-center gap-2"
            >
              <Receipt className="h-4.5 w-4.5" />
              DAFTAR & CETAK TIKET
            </button>
          </form>
        </div>

        {/* Right column: Interactive real-time metrics showing summary of waiting queues per segment */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            Distribusi Antrian Saat Ini
          </h3>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
            <p className="text-xs text-slate-500 leading-normal">
              Statistik perbandingan jumlah pasien yang sedang mengantri saat ini di masing-masing poliklinik.
            </p>

            <div className="space-y-4 pt-1">
              {polyclinics.map((p) => {
                const totalInPoly = queues.filter((q) => q.polyclinicId === p.id).length;
                const waitingInPoly = queues.filter(
                  (q) => q.polyclinicId === p.id && q.status === 'menunggu'
                ).length;
                const percent = totalInPoly > 0 ? (waitingInPoly / totalInPoly) * 100 : 0;

                return (
                  <div key={p.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-700">
                      <span className="font-bold">{p.name}</span>
                      <span className="font-mono text-slate-500 text-[10px] font-semibold">
                        {waitingInPoly} Antre / {totalInPoly} Total
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent > 0 ? Math.max(percent, 8) : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tanda Bukti Antrian - Thermal Ticket Modal */}
      <AnimatePresence>
        {activeReceipt && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white text-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-150 relative overflow-hidden"
            >
              {/* Receipt Visuals with dashed line cuts */}
              <div className="border border-slate-200 border-dashed rounded-xl p-5 text-center space-y-4 relative bg-slate-50/50">
                
                <div className="space-y-1">
                  <h4 className="font-black text-xs tracking-widest text-slate-900 leading-none uppercase">
                    KLINIK PRO SENTRA MEDIKA
                  </h4>
                  <p className="text-[8px] text-slate-400 font-mono tracking-wide">
                    Jl. Kesehatan Raya No. 45, Jakarta Selatan
                  </p>
                </div>

                <div className="h-px bg-slate-200 border-dashed border-b my-2" />

                <div>
                  <span className="text-[9px] text-slate-400 tracking-wider font-extrabold uppercase">
                    POLIKLINIK TUJUAN
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {polyclinics.find((p) => p.id === activeReceipt.polyclinicId)?.name}
                  </p>
                  <p className="text-[9px] text-blue-600 font-mono font-bold leading-none mt-0.5">
                    {polyclinics.find((p) => p.id === activeReceipt.polyclinicId)?.room}
                  </p>
                </div>

                <div>
                  <span className="text-[9px] text-slate-400 tracking-wider font-extrabold uppercase">
                    NOMOR ANTRIAN ANDA
                  </span>
                  <h2 className="text-5xl font-black font-mono text-slate-900 my-1 pb-1">
                    {activeReceipt.queueNumber}
                  </h2>
                </div>

                <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-100/80">
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold font-sans">
                    <span>Pasien</span>
                    <span className="text-slate-800 font-bold">{activeReceipt.name}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold font-sans">
                    <span>Jenis Pasien</span>
                    <span className={`font-bold ${activeReceipt.type === 'BPJS' ? 'text-blue-600' : 'text-slate-700'}`}>
                      {activeReceipt.type}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
                    <span>Waktu Cetak</span>
                    <span className="text-slate-500">
                      {new Date(activeReceipt.registeredAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <p className="text-[9px] text-slate-400 leading-snug font-sans italic">
                  "Sisa Antrian di Belakang: {queues.filter(q => q.polyclinicId === activeReceipt.polyclinicId && q.status === 'menunggu').length} pasien. Mohon antre dengan tertib demi kenyamanan bersama."
                </p>
              </div>

              {/* Action buttons on receipt printer */}
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl tracking-wider uppercase transition-all flex items-center justify-center gap-2"
                >
                  {isPrinting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mencetak Slip Thermal...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-white shrink-0" />
                      CETAK TANDA BUKTI SLIP
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setActiveReceipt(null)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold rounded-xl transition-colors"
                >
                  Tutup Slip
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
