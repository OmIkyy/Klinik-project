export interface Polyclinic {
  id: string;
  name: string;
  prefix: string;
  room: string;
}

export interface PatientQueue {
  id: string;
  queueNumber: string;
  number: number;
  name: string;
  polyclinicId: string;
  type: 'BPJS' | 'MANDIRI';
  status: 'menunggu' | 'dipanggil' | 'selesai' | 'dilewati';
  registeredAt: string;
  calledAt?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  polyclinicId: string;
  status: 'bertugas' | 'istirahat' | 'tidak_aktif';
  avatarSeed: string;
}

export interface VoiceSettings {
  pitch: number;
  rate: number;
  volume: number;
  template: string;
  selectedVoice: string;
}
