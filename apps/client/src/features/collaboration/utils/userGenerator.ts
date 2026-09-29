const COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E2',
  '#F8B88B',
  '#A8E6CF',
];

const ADJECTIVES = ['Happy', 'Swift', 'Bright', 'Clever', 'Calm', 'Bold', 'Lively', 'Keen'];
const ANIMALS = ['Panda', 'Eagle', 'Tiger', 'Fox', 'Owl', 'Wolf', 'Bear', 'Lion'];

export function generateRandomUser() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  
  return {
    name: `${adjective} ${animal}`,
    color,
  };
}

export function generateUserId() {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
