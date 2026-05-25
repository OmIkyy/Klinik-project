import { FileHeart, Plus, Users, School, ArrowRight, UserCheck, ShieldClose, Hourglass, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Polyclinic, Doctor, PatientQueue } from '../types';
import React, { useState } from 'react';

interface PoliDoctorViewProps {
  polyclinics: Polyclinic[];
  doctors: Doctor[];
  onAddPolyclinic: (poly: { name: string; prefix: string; room: string }) => void;
  onAddDoctor: (doctor: { name: string; specialization: string; polyclinicId: string }) => void;
  onUpdateDoctorStatus: (doctorId: string, status: Doctor['status']) => void;
  onDeletePolyclinic: (id: string) => void;
  onDeleteDoctor: (id: string) => void;
  queues: PatientQueue[];
}

export default function PoliDoctorView({
  polyclinics,
  doctors,
  onAddPolyclinic,
  onAddDoctor,
  onUpdateDoctorStatus,
  onDeletePolyclinic,
  onDeleteDoctor,
  queues,
}: PoliDoctorViewProps) {
  // New Polyclinic form state
  const [polyName, setPolyName] = useState('');
  const [polyPrefix, setPolyPrefix] = useState('');
  const [polyRoom, setPolyRoom] = useState('');

  // New Doctor form state
  const [docName, setDocName] = useState('');
  const [docSpec, setDocSpec] = useState('');
  const [docPolyId, setDocPolyId] = useState(polyclinics[0]?.id || '');

  // Screen status messages to replace window.alerts
  const [polyStatusMsg, setPolyStatusMsg] = useState({ text: '', type: '' });
  const [docStatusMsg, setDocStatusMsg] = useState({ text: '', type: '' });

  const handleAddPolySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPolyStatusMsg({ text: '', type: '' });

    if (!polyName.trim() || !polyPrefix.trim() || !polyRoom.trim()) {
      setPolyStatusMsg({ text: 'Mohon isi seluruh data poliklinik baru.', type: 'error' });
      return;
    }

    const cleanedPrefix = polyPrefix.trim().toUpperCase().slice(0, 1);
    
    // Check duplication
    if (polyclinics.some(p => p.prefix === cleanedPrefix)) {
      setPolyStatusMsg({ text: `Prefix "${cleanedPrefix}" sudah digunakan poliklinik lain.`, type: 'error' });
      return;
    }

    onAddPolyclinic({
      name: polyName.trim(),
      prefix: cleanedPrefix,
      room: polyRoom.trim(),
    });

    // Reset Form
    setPolyName('');
    setPolyPrefix('');
    setPolyRoom('');
    setPolyStatusMsg({ text: 'Poliklinik baru berhasil ditambahkan.', type: 'success' });
    setTimeout(() => setPolyStatusMsg({ text: '', type: '' }), 4000);
  };

  const handleAddDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDocStatusMsg({ text: '', type: '' });

    if (!docName.trim() || !docSpec.trim() || !docPolyId) {
      setDocStatusMsg({ text: 'Mohon lengkapi data dokter baru.', type: 'error' });
      return;
    }

    onAddDoctor({
      name: docName.trim(),
      specialization: docSpec.trim(),
      polyclinicId: docPolyId,
    });

    // Reset Form
    setDocName('');
    setDocSpec('');
    setDocStatusMsg({ text: 'Dokter baru berhasil didaftarkan ke sistem.', type: 'success' });
    setTimeout(() => setDocStatusMsg({ text: '', type: '' }), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header screen */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileHeart className="h-6 w-6 text-blue-600 stroke-[2]" />
          Data Poliklinik & Dokter
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Atur prefix antrian per poli, konfigurasikan ruang/loket, serta kelola status jaga para dokter medis.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Left Section: Polyclinic management */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Daftar Poliklinik Aktif</h3>
              <p className="text-xs text-slate-400 mt-1">Atur ruang, loket, dan prefix cetak antrian pasien.</p>
            </div>

            {/* Inline polyclinic messages */}
            {polyStatusMsg.text && (
              <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                polyStatusMsg.type === 'success' ? 'bg-blue-50 text-blue-800 border border-blue-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
              }`}>
                {polyStatusMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />}
                <span>{polyStatusMsg.text}</span>
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {polyclinics.map((p) => {
                const docCount = doctors.filter((d) => d.polyclinicId === p.id).length;
                const queueCount = queues.filter((q) => q.polyclinicId === p.id).length;

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-center w-12 shrink-0">
                        <span className="block text-[8px] text-slate-400 font-extrabold uppercase leading-none">Poli</span>
                        <span className="font-mono font-bold text-blue-600 text-sm leading-none block mt-1">
                          {p.prefix}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800">{p.name}</h4>
                        <span className="inline-block font-mono text-[9px] text-slate-500 font-bold bg-white border border-slate-100 px-1.5 py-0.5 rounded-sm mt-1">
                          Loket: {p.room}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-bold font-mono">
                        {docCount} Dr • {queueCount} Tiket
                      </span>
                      {polyclinics.length > 1 && (
                        <button
                          onClick={() => onDeletePolyclinic(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Hapus Poliklinik"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Form to add Polyclinic */}
            <form onSubmit={handleAddPolySubmit} className="pt-4 border-t border-slate-100 space-y-3.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Tambah Poliklinik Baru
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Nama Poli (cth: Poli Gigi)"
                  value={polyName}
                  onChange={(e) => {
                    setPolyStatusMsg({ text: '', type: '' });
                    setPolyName(e.target.value);
                  }}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-700 focus:outline-hidden focus:bg-white"
                />

                <input
                  type="text"
                  maxLength={1}
                  required
                  placeholder="Prefix (cth: B)"
                  value={polyPrefix}
                  onChange={(e) => {
                    setPolyStatusMsg({ text: '', type: '' });
                    setPolyPrefix(e.target.value);
                  }}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-center text-slate-700 uppercase focus:outline-hidden focus:bg-white"
                />

                <input
                  type="text"
                  required
                  placeholder="Konter (cth: Poli B)"
                  value={polyRoom}
                  onChange={(e) => {
                    setPolyStatusMsg({ text: '', type: '' });
                    setPolyRoom(e.target.value);
                  }}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-700 focus:outline-hidden focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all shadow-xs"
              >
                <Plus className="h-4 w-4" />
                SIMPAN POLIKLINIK KE SISTEM
              </button>
            </form>
          </div>
        </div>

        {/* Right Section: Doctors management */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Daftar Tenaga Medis / Dokter</h3>
              <p className="text-xs text-slate-400 mt-1">Arsip status kelengkapan tugas pelayanan kesehatan.</p>
            </div>

            {/* Inline doctor messages */}
            {docStatusMsg.text && (
              <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                docStatusMsg.type === 'success' ? 'bg-blue-50 text-blue-800 border border-blue-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
              }`}>
                {docStatusMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" /> : <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />}
                <span>{docStatusMsg.text}</span>
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {doctors.map((doc) => {
                const assocPoly = polyclinics.find((p) => p.id === doc.polyclinicId);
                const isBertugas = doc.status === 'bertugas';
                const isIstirahat = doc.status === 'istirahat';

                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border shrink-0 ${
                        isBertugas 
                          ? 'bg-blue-100 text-blue-600 border-blue-200' 
                          : isIstirahat 
                            ? 'bg-amber-100 text-amber-700 border-amber-200' 
                            : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}>
                        {doc.name.replace('dr. ', '').substring(0,2).toUpperCase()}
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 leading-none">{doc.name}</h4>
                        <p className="text-[10px] text-slate-400 font-sans mt-1 leading-none">{doc.specialization}</p>
                        <span className="inline-block font-mono text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-sm mt-1.5 uppercase">
                          {assocPoly ? assocPoly.name : 'Poli Umum'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Interactive toggle switch representation */}
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 text-[9px] font-bold">
                        <button
                          type="button"
                          onClick={() => onUpdateDoctorStatus(doc.id, 'bertugas')}
                          className={`px-2 py-1 rounded-md transition-all ${isBertugas ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                          On
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateDoctorStatus(doc.id, 'istirahat')}
                          className={`px-2 py-1 rounded-md transition-all ${isIstirahat ? 'bg-amber-400 text-white font-bold' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                          Rest
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateDoctorStatus(doc.id, 'tidak_aktif')}
                          className={`px-2 py-1 rounded-md transition-all ${doc.status === 'tidak_aktif' ? 'bg-slate-600 text-white font-bold' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                          Off
                        </button>
                      </div>

                      {doctors.length > 1 && (
                        <button
                          onClick={() => onDeleteDoctor(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Hapus Dokter"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Form to add Doctor */}
            <form onSubmit={handleAddDocSubmit} className="pt-4 border-t border-slate-100 space-y-3.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Pendaftaran Dokter Baru
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Nama dr. (cth: dr. Fauzan)"
                  value={docName}
                  onChange={(e) => {
                    setDocStatusMsg({ text: '', type: '' });
                    setDocName(e.target.value);
                  }}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-700 focus:outline-hidden focus:bg-white"
                />

                <input
                  type="text"
                  required
                  placeholder="Spesialisasi (cth: Bedah Gigi)"
                  value={docSpec}
                  onChange={(e) => {
                    setDocStatusMsg({ text: '', type: '' });
                    setDocSpec(e.target.value);
                  }}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-slate-700 focus:outline-hidden focus:bg-white"
                />

                <select
                  value={docPolyId}
                  onChange={(e) => {
                    setDocStatusMsg({ text: '', type: '' });
                    setDocPolyId(e.target.value);
                  }}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-hidden focus:bg-white"
                >
                  <option value="" disabled>Pilih Poliklinik</option>
                  {polyclinics.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all shadow-xs"
              >
                <Plus className="h-4 w-4" />
                SIMPAN JADWAL DOKTER JAGA
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
