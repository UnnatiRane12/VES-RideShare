
export type User = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type Room = {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  participantIds: string[];
  startingPoint: string;
  destination: string;
  passengerLimit: number;
  autoStatus: boolean;
};
