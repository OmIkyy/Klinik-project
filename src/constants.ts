import { Polyclinic, Doctor, PatientQueue, VoiceSettings } from './types';

export const INITIAL_POLYCLINICS: Polyclinic[] = [
  { id: 'poly-gigi', name: 'Poli Gigi', prefix: 'A', room: 'Poli A' },
  { id: 'poly-umum', name: 'Poli Umum', prefix: 'B', room: 'Poli B' },
  { id: 'poly-anak', name: 'Poli Anak', prefix: 'C', room: 'Poli C' },
  { id: 'poly-kandungan', name: 'Poli Kandungan', prefix: 'D', room: 'Poli D' },
];

export const INITIAL_DOCTORS: Doctor[] = [
  { id: 'doc-1', name: 'dr. Andi Wijaya, Sp.KGA', specialization: 'Dokter Gigi Anak', polyclinicId: 'poly-gigi', status: 'bertugas', avatarSeed: 'andi' },
  { id: 'doc-2', name: 'dr. Rina Amalia', specialization: 'Dokter Umum', polyclinicId: 'poly-umum', status: 'bertugas', avatarSeed: 'rina' },
  { id: 'doc-3', name: 'dr. Budi Santoso, Sp.A', specialization: 'Spesialis Anak', polyclinicId: 'poly-anak', status: 'istirahat', avatarSeed: 'budi' },
  { id: 'doc-4', name: 'dr. Siti Rahma, Sp.OG', specialization: 'Spesialis Kandungan', polyclinicId: 'poly-kandungan', status: 'bertugas', avatarSeed: 'siti' },
];

export const INITIAL_QUEUES: PatientQueue[] = [
  {
    id: 'q-1',
    queueNumber: 'A-01',
    number: 1,
    name: 'Budi Darmawan',
    polyclinicId: 'poly-gigi',
    type: 'BPJS',
    status: 'selesai',
    registeredAt: '2026-05-24T08:15:00Z',
    calledAt: '2026-05-24T08:30:00Z',
  },
  {
    id: 'q-2',
    queueNumber: 'B-01',
    number: 1,
    name: 'Citra Kirana',
    polyclinicId: 'poly-umum',
    type: 'MANDIRI',
    status: 'selesai',
    registeredAt: '2026-05-24T08:20:00Z',
    calledAt: '2026-05-24T08:45:00Z',
  },
  {
    id: 'q-3',
    queueNumber: 'A-02',
    number: 2,
    name: 'Dewi Lestari',
    polyclinicId: 'poly-gigi',
    type: 'BPJS',
    status: 'menunggu',
    registeredAt: '2026-05-24T09:10:00Z',
  },
  {
    id: 'q-4',
    queueNumber: 'B-02',
    number: 2,
    name: 'Eko Prasetyo',
    polyclinicId: 'poly-umum',
    type: 'MANDIRI',
    status: 'menunggu',
    registeredAt: '2026-05-24T09:15:00Z',
  },
  {
    id: 'q-5',
    queueNumber: 'C-01',
    number: 1,
    name: 'Farhan Alatas',
    polyclinicId: 'poly-anak',
    type: 'BPJS',
    status: 'menunggu',
    registeredAt: '2026-05-24T09:30:00Z',
  },
];

export const INITIAL_VOICE_SETTINGS: VoiceSettings = {
  pitch: 1.0,
  rate: 0.85, // slightly slower for better clarity in Indonesia speech
  volume: 1.0,
  template: 'Nomor antrian {number}. Silakan masuk ke {room}',
  selectedVoice: '',
};

// Advanced text-to-speech engine helper in Indonesian
export function speakText(text: string, settings: VoiceSettings) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  // Cancel any ongoing speeches
  window.speechSynthesis.cancel();

  // Polishing Indonesian pronuniciations
  // E.g., replace 'A-01' with 'A satu', 'B-12' with 'B dua belas'
  let parsedText = text;
  
  // Format hyphenated numbers (like A-01, B-05, C-12)
  parsedText = parsedText.replace(/([A-Za-z])-0*(\d+)/g, '$1, $2');
  
  // Custom substitutions for smoother clinic experience
  parsedText = parsedText.replace(/Poli A/gi, 'poliklinik A');
  parsedText = parsedText.replace(/Poli B/gi, 'poliklinik B');
  parsedText = parsedText.replace(/Poli C/gi, 'poliklinik C');
  parsedText = parsedText.replace(/Poli D/gi, 'poliklinik D');

  const utterance = new SpeechSynthesisUtterance(parsedText);
  utterance.pitch = settings.pitch;
  utterance.rate = settings.rate;
  utterance.volume = settings.volume;

  // Search for Indonesian voice
  const voices = window.speechSynthesis.getVoices();
  let selectedVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('IND') || v.lang.includes('ind'));
  
  // Try selected voice from settings
  if (settings.selectedVoice) {
    const matched = voices.find(v => v.name === settings.selectedVoice);
    if (matched) selectedVoice = matched;
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
  } else {
    // Fallback to standard en-US or any Indonesian language tag
    utterance.lang = 'id-ID';
  }

  window.speechSynthesis.speak(utterance);
}
