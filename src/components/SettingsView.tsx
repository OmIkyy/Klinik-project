import { Settings, Volume2, Save, Trash2, RotateCcw, AlertTriangle, Key, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VoiceSettings } from '../types';
import React, { useEffect, useState } from 'react';
import { speakText } from '../constants';

interface SettingsViewProps {
  voiceSettings: VoiceSettings;
  onUpdateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  onResetAllQueues: () => void;
  onSeedDemoData: () => void;
}

export default function SettingsView({
  voiceSettings,
  onUpdateVoiceSettings,
  onResetAllQueues,
  onSeedDemoData,
}: SettingsViewProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testSpeech, setTestSpeech] = useState('Nomor antrian A sepuluh. Silakan masuk ke poliklinik gigi.');

  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleTestCall = () => {
    speakText(testSpeech, voiceSettings);
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateVoiceSettings({ template: e.target.value });
  };

  const idVoices = voices.filter(
    (v) => v.lang.startsWith('id') || v.lang.includes('IND') || v.lang.includes('ind')
  );

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans relative">
      {/* Header screen */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-600 stroke-[2]" />
          Pengaturan Suara Juru Panggil & Data
        </h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Atur format audio panggilan otomatis (Speech Synthesis), kecepatan suara, serta kelola backup base database.
        </p>
      </div>

      {/* Floating inline notification banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="bg-blue-600 text-white p-4 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md relative z-20"
          >
            <CheckCircle2 className="h-4.5 w-4.5 text-blue-100 shrink-0" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Voice synthesizer tuning Controls */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-blue-600" />
              Tuning Audio Call (Text-To-Speech)
            </h3>
            <p className="text-xs text-slate-400 mt-1">Sesuaikan intonasi, speed, dan kejelasan suara speaker clinic.</p>
          </div>

          <div className="space-y-5">
            {/* Template format */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Format Template Kalimat Panggilang
              </label>
              <input
                type="text"
                value={voiceSettings.template}
                onChange={handleTemplateChange}
                placeholder="Nomor antrian {number}. Silakan masuk ke {room}"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:border-blue-500/50 focus:bg-white font-semibold"
              />
              <span className="text-[10px] text-slate-400 block mt-1 leading-normal">
                Keterangan: Gunakan tag <strong className="text-slate-600 font-mono font-bold">{'{number}'}</strong> untuk nomor antrian pasien dan <strong className="text-slate-600 font-mono font-bold">{'{room}'}</strong> untuk nama loket/ruang poli.
              </span>
            </div>

            {/* Speeds & Pitch Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Speed rate range */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="uppercase tracking-wider text-slate-400 text-[10px] font-extrabold">Kecepatan Bicara (Rate)</span>
                  <span className="font-mono bg-slate-100 text-[10px] px-1.5 py-0.5 rounded-sm">{voiceSettings.rate}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={voiceSettings.rate}
                  onChange={(e) => onUpdateVoiceSettings({ rate: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-[9px] text-slate-400 block">Saran: Kecepatan <strong className="text-slate-600 font-bold">0.8x - 0.9x</strong> optimal untuk kejelasan speech di ruangan medis.</span>
              </div>

              {/* Pitch Range */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span className="uppercase tracking-wider text-slate-400 text-[10px] font-extrabold">Tinggi Nada (Pitch)</span>
                  <span className="font-mono bg-slate-100 text-[10px] px-1.5 py-0.5 rounded-sm">{voiceSettings.pitch}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={voiceSettings.pitch}
                  onChange={(e) => onUpdateVoiceSettings({ pitch: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-[9px] text-slate-400 block">Saran: Nada <strong className="text-slate-600 font-bold">1.0</strong> optimal untuk karakter operator standard.</span>
              </div>
            </div>

            {/* Voices list dropdown */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Pilih Karakter Suara Juru Panggil
              </label>

              <select
                value={voiceSettings.selectedVoice}
                onChange={(e) => onUpdateVoiceSettings({ selectedVoice: e.target.value })}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:bg-white"
              >
                <option value="">Deteksi Otomatis (Default Indonesia)</option>
                {idVoices.length > 0 ? (
                  idVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))
                ) : (
                  <option disabled>Tidak ada suara khusus Bahasa Indonesia ditemukan (Sistem akan menggunakan auto-fallback)</option>
                )}
                {voices
                  .filter((v) => !v.lang.startsWith('id') && (v.lang.includes('en') || v.lang.includes('JA')))
                  .slice(0, 10)
                  .map((v) => (
                    <option key={v.name} value={v.name}>
                      Fallback: {v.name} ({v.lang})
                    </option>
                  ))}
              </select>
            </div>

            {/* Tester Trigger */}
            <div className="pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-xl space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Uji Coba Pengeras Suara / Tester</span>
                <input
                  type="text"
                  value={testSpeech}
                  onChange={(e) => setTestSpeech(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 font-sans"
                />
              </div>

              <button
                type="button"
                onClick={handleTestCall}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Volume2 className="h-4 w-4" />
                TES SPEAKER SEKARANG
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Database reset, clearing, seeding controls */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">Manajemen Database & Demo</h3>
            <p className="text-xs text-slate-400 mt-1">Kelola reset memori antrian, dokter, dan poli.</p>
          </div>

          <div className="space-y-5">
            {/* Warning card details */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-amber-900 leading-none">Zona Tindakan Kritis</h4>
                <p className="text-[10px] text-amber-700 leading-relaxed mt-1">
                  Seluruh data disimpan pada browser lokal Anda (localStorage). Menghapus database akan mengulang seluruh antrian hari ini dari awal.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {/* Seed Demo Data Button */}
              <button
                type="button"
                onClick={() => setShowSeedConfirm(true)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-200 shadow-xs"
              >
                <RotateCcw className="h-4 w-4 text-slate-500" />
                RE-SEED DATA BAWAAN DEMO
              </button>

              {/* Clear All Databased queues */}
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 border border-rose-200 shadow-xs"
              >
                <Trash2 className="h-4 w-4 text-rose-600" />
                HAPUS SEMUA ANTRIAN (RESET 0)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Seeding Demo */}
      <AnimatePresence>
        {showSeedConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full h-11 w-11 flex items-center justify-center shrink-0">
                  <RotateCcw className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Pulihkan Antrian Demo?</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">
                    Langkah ini akan mereset data tersimpan Anda saat ini dan memuat ulang antrian pasien & poliklinik demo klinik standard.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setShowSeedConfirm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSeedDemoData();
                    setShowSeedConfirm(false);
                    triggerNotification('Berhasil memuat ulang seluruh data demo klinik standard.');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
                >
                  Ya, Seed Demo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Reset Total Queues */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex gap-3">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-full h-11 w-11 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Kosongkan Semua Antrian?</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">
                    PERINGATAN: Semua tiket antrian pasien saat ini akan dihapus total secara permanen. Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition-all"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetAllQueues();
                    setShowResetConfirm(false);
                    triggerNotification('Seluruh antrian pasien berhasil dikosongkan.');
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-all"
                >
                  Ya, Hapus Semua
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
