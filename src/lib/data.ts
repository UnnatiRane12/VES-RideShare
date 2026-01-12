
// This file is kept for type definitions, but mock data is no longer used.

export type User = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type Room = {
  id: string;
  name: string;
  ownerId: string;
  participantIds: string[];
  startPoint: string;
  destination: string;
  capacity: number;
  hasAuto: boolean;
  expiresAt: Date;
};
