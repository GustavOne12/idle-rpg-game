import { LUNA } from './characters/luna.js';

export const CHARACTERS = {
  luna_01: LUNA,
};

export function getCharacter(id) {
  const template = CHARACTERS[id];
  if (!template) return null;
  return JSON.parse(JSON.stringify(template));
}

export function getAllCharacterIds() {
  return Object.keys(CHARACTERS);
}
