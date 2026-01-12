export type User = {
  id: string;
  name: string;
  avatarUrl: string;
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

export const users: User[] = [
  { id: 'user-1', name: 'Alex Johnson', avatarUrl: 'https://picsum.photos/seed/user1/40/40' },
  { id: 'user-2', name: 'Maria Garcia', avatarUrl: 'https://picsum.photos/seed/user2/40/40' },
  { id: 'user-3', name: 'Chen Wei', avatarUrl: 'https://picsum.photos/seed/user3/40/40' },
  { id: 'user-4', name: 'Fatima Ahmed', avatarUrl: 'https://picsum.photos/seed/user4/40/40' },
  { id: 'user-5', name: 'David Smith', avatarUrl: 'https://picsum.photos/seed/user5/40/40' },
];

export const rooms: Room[] = [
  {
    id: 'room-1',
    name: "Morning Commute to VESIT",
    ownerId: 'user-1',
    participantIds: ['user-2'],
    startPoint: 'Chembur Station',
    destination: 'VESIT',
    capacity: 4,
    hasAuto: true,
    expiresAt: new Date(new Date().getTime() + 15 * 60000), // 15 minutes from now
  },
  {
    id: 'room-2',
    name: "Evening ride home",
    ownerId: 'user-3',
    participantIds: ['user-4', 'user-5'],
    startPoint: 'VESIT',
    destination: 'Kurla Station',
    capacity: 4,
    hasAuto: false,
    expiresAt: new Date(new Date().getTime() + 30 * 60000), // 30 minutes from now
  },
  {
    id: 'room-3',
    name: "Late night study group",
    ownerId: 'user-2',
    participantIds: [],
    startPoint: 'Ghatkopar',
    destination: 'VESIT',
    capacity: 3,
    hasAuto: true,
    expiresAt: new Date(new Date().getTime() + 60 * 60000), // 1 hour from now
  },
  {
    id: 'room-4',
    name: "To Kurla",
    ownerId: 'user-5',
    participantIds: ['user-1'],
    startPoint: 'VESIT',
    destination: 'Kurla Station',
    capacity: 4,
    hasAuto: false,
    expiresAt: new Date(new Date().getTime() + 5 * 60000), // 5 minutes from now
  },
];

export const findUserById = (id: string) => users.find(user => user.id === id);
export const findRoomById = (id: string) => rooms.find(room => room.id === id);
