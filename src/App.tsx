import { useState, useEffect } from 'react';
import { Menu, Activity } from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import CallQueueView from './components/CallQueueView';
import RegistrationView from './components/RegistrationView';
import PoliDoctorView from './components/PoliDoctorView';
import SettingsView from './components/SettingsView';
import { Polyclinic, Doctor, PatientQueue, VoiceSettings } from './types';
import {
  INITIAL_POLYCLINICS,
  INITIAL_DOCTORS,
  INITIAL_QUEUES,
  INITIAL_VOICE_SETTINGS,
  speakText,
} from './constants';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Load state from localStorage or fallback to defaults
  const [polyclinics, setPolyclinics] = useState<Polyclinic[]>(() => {
    const saved = localStorage.getItem('kp_polyclinics');
    return saved ? JSON.parse(saved) : INITIAL_POLYCLINICS;
  });

  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = localStorage.getItem('kp_doctors');
    return saved ? JSON.parse(saved) : INITIAL_DOCTORS;
  });

  const [queues, setQueues] = useState<PatientQueue[]>(() => {
    const saved = localStorage.getItem('kp_queues');
    return saved ? JSON.parse(saved) : INITIAL_QUEUES;
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem('kp_voice_settings');
    return saved ? JSON.parse(saved) : INITIAL_VOICE_SETTINGS;
  });

  // Persist states to localStorage when updated
  useEffect(() => {
    localStorage.setItem('kp_polyclinics', JSON.stringify(polyclinics));
  }, [polyclinics]);

  useEffect(() => {
    localStorage.setItem('kp_doctors', JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('kp_queues', JSON.stringify(queues));
  }, [queues]);

  useEffect(() => {
    localStorage.setItem('kp_voice_settings', JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  // Handler: Update Doctor Attendance Status
  const handleUpdateDoctorStatus = (doctorId: string, status: Doctor['status']) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === doctorId ? { ...d, status } : d))
    );
  };

  // Handler: Update Active Ticket Queue Status (e.g. 'menunggu' -> 'dipanggil' -> 'selesai')
  const handleUpdateQueueStatus = (queueId: string, status: PatientQueue['status']) => {
    setQueues((prev) =>
      prev.map((q) => {
        if (q.id === queueId) {
          const updated: PatientQueue = { ...q, status };
          if (status === 'dipanggil') {
            updated.calledAt = new Date().toISOString();
          }
          return updated;
        }
        return q;
      })
    );
  };

  // Handler: Build and pronounce queue call
  const handleCallQueue = (queue: PatientQueue, customText?: string) => {
    const associatedPoly = polyclinics.find((p) => p.id === queue.polyclinicId);
    const polyName = associatedPoly ? associatedPoly.name : 'Poliklinik';
    const roomName = associatedPoly ? associatedPoly.room : 'Lobby Utama';

    let spokenText = customText;
    if (!spokenText) {
      // Parse template tags: {number} and {room}
      spokenText = voiceSettings.template
        .replace('{number}', queue.queueNumber)
        .replace('{room}', roomName);
    }

    speakText(spokenText, voiceSettings);
  };

  // Handler: Register New Patient & Calculate Ticket
  const handleRegisterPatient = (patientData: {
    name: string;
    polyclinicId: string;
    type: 'BPJS' | 'MANDIRI';
  }): PatientQueue => {
    const associatedPoly = polyclinics.find((p) => p.id === patientData.polyclinicId);
    if (!associatedPoly) {
      throw new Error('Polyclinic destination is invalid.');
    }

    // Filter queue by current polyclinic destination to count max today's ticket number
    const polyQueues = queues.filter((q) => q.polyclinicId === patientData.polyclinicId);
    const maxNum = polyQueues.reduce((max, current) => (current.number > max ? current.number : max), 0);
    const nextNum = maxNum + 1;

    const formattedNumStr = `${associatedPoly.prefix}-${String(nextNum).padStart(2, '0')}`;

    const newPatient: PatientQueue = {
      id: `q-ts-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      queueNumber: formattedNumStr,
      number: nextNum,
      name: patientData.name,
      polyclinicId: patientData.polyclinicId,
      type: patientData.type,
      status: 'menunggu',
      registeredAt: new Date().toISOString(),
    };

    setQueues((prev) => [...prev, newPatient]);
    return newPatient;
  };

  // Handler: Add custom Polyclinic to list
  const handleAddPolyclinic = (pData: { name: string; prefix: string; room: string }) => {
    const newPoly: Polyclinic = {
      id: `poly-ts-${Date.now()}`,
      name: pData.name,
      prefix: pData.prefix.toUpperCase(),
      room: pData.room,
    };
    setPolyclinics((prev) => [...prev, newPoly]);
  };

  // Handler: Add custom Doc
  const handleAddDoctor = (dData: { name: string; specialization: string; polyclinicId: string }) => {
    const newDoc: Doctor = {
      id: `doc-ts-${Date.now()}`,
      name: dData.name,
      specialization: dData.specialization,
      polyclinicId: dData.polyclinicId,
      status: 'tidak_aktif',
      avatarSeed: dData.name.toLowerCase().replace(/\s/g, ''),
    };
    setDoctors((prev) => [...prev, newDoc]);
  };

  const handleDeletePolyclinic = (id: string) => {
    setPolyclinics((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDeleteDoctor = (id: string) => {
    setDoctors((prev) => prev.filter((d) => d.id !== id));
  };

  // Setting handlers: reset databases or restores
  const handleResetAllQueues = () => {
    setQueues([]);
  };

  const handleSeedDemoData = () => {
    setPolyclinics(INITIAL_POLYCLINICS);
    setDoctors(INITIAL_DOCTORS);
    setQueues(INITIAL_QUEUES);
    setVoiceSettings(INITIAL_VOICE_SETTINGS);
    localStorage.clear();
  };

  const handleUpdateVoiceSettings = (settings: Partial<VoiceSettings>) => {
    setVoiceSettings((prev) => ({ ...prev, ...settings }));
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-slate-50 font-sans text-slate-800 overflow-hidden select-none">
      {/* Mobile Backdrop overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Dynamic sidebar navigation rail */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpenOnMobile={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        {/* Mobile Header indicator */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-50 text-blue-600 p-2 rounded-xl flex items-center justify-center">
              <Activity className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-sans font-bold text-sm leading-none tracking-tight text-slate-900">
                Klinik Pro
              </h1>
              <span className="text-[10px] text-blue-500 font-medium font-mono leading-none block mt-0.5">Smart Queue v3.1</span>
            </div>
          </div>
          
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors focus:outline-hidden"
          >
            <Menu className="h-5 w-5 stroke-[2.5]" />
          </button>
        </header>

        {/* Main viewport area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative min-w-0 bg-slate-50/70">
          
          {/* Render active tabs views block */}
          {activeTab === 'dashboard' && (
            <DashboardView
              queues={queues}
              polyclinics={polyclinics}
              doctors={doctors}
              onUpdateDoctorStatus={handleUpdateDoctorStatus}
            />
          )}

          {activeTab === 'panggil' && (
            <CallQueueView
              queues={queues}
              polyclinics={polyclinics}
              onUpdateQueueStatus={handleUpdateQueueStatus}
              onCallQueue={handleCallQueue}
              voiceSettings={voiceSettings}
            />
          )}

          {activeTab === 'registrasi' && (
            <RegistrationView
              polyclinics={polyclinics}
              queues={queues}
              onRegisterPatient={handleRegisterPatient}
            />
          )}

          {activeTab === 'poli-dokter' && (
            <PoliDoctorView
              polyclinics={polyclinics}
              doctors={doctors}
              onAddPolyclinic={handleAddPolyclinic}
              onAddDoctor={handleAddDoctor}
              onUpdateDoctorStatus={handleUpdateDoctorStatus}
              onDeletePolyclinic={handleDeletePolyclinic}
              onDeleteDoctor={handleDeleteDoctor}
              queues={queues}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              voiceSettings={voiceSettings}
              onUpdateVoiceSettings={handleUpdateVoiceSettings}
              onResetAllQueues={handleResetAllQueues}
              onSeedDemoData={handleSeedDemoData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
