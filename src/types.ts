export type DonationCategory = 'periferico' | 'componente eletronico' | 'notebook' | 'celular' | 'videogame' | 'pc' | 'rede' | 'outros';
export type DonationCondition = 'Novo' | 'Usado - Bom' | 'Para Conserto';
export type DonationStatus = 'available' | 'requested' | 'donated';
export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  ra: string;
  photoURL?: string;
  role: 'student' | 'admin';
}

export interface Donation {
  id: string;
  title: string;
  description: string;
  category: DonationCategory;
  condition: DonationCondition;
  photos: string[];
  donorId: string;
  donorName: string;
  status: DonationStatus;
  createdAt: any;
}

export interface DonationRequest {
  id: string;
  donationId: string;
  requesterId: string;
  requesterName: string;
  explanation: string;
  status: RequestStatus;
  createdAt: any;
}

export interface Chat {
  id: string;
  donationId: string;
  donorId: string;
  requesterId: string;
  lastMessage: string;
  updatedAt: any;
  donationTitle: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderPhotoURL?: string;
  text: string;
  createdAt: any;
}

export interface ImpactEvent {
  id: string;
  date: string;
  totalCollectedKg: number;
}
