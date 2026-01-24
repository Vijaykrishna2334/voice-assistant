import { Avatar } from '@/types/avatar';

export const AVATARS: Avatar[] = [
  {
    id: 'aria',
    name: 'Aria',
    description: 'Your AI companion with charm and intelligence. Perfect for thoughtful conversations.',
    color: '#6366f1',
    colorClass: 'avatar-aria',
  },
  {
    id: 'ani',
    name: 'Ani',
    description: 'Energetic and expressive assistant. Brings life and enthusiasm to every interaction.',
    color: '#ec4899',
    colorClass: 'avatar-ani',
  },
  {
    id: 'sample',
    name: 'Sample',
    description: 'Classic demonstration avatar. Reliable and ready to assist with any task.',
    color: '#22c55e',
    colorClass: 'avatar-sample',
  },
];

export const getAvatarById = (id: string): Avatar | undefined => {
  return AVATARS.find((avatar) => avatar.id === id);
};
