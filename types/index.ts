export interface Prayer {
  id: string;
  name: string;
  completed: boolean;
  time?: string;
}

export interface Friend {
  id: string;
  name: string;
  points: number;
  avatar?: string;
}

export interface DuaCategory {
  id: string;
  title: string;
  description: string;
  duas: Dua[];
}

export interface Dua {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  english: string;
}

export interface Name99 {
  arabic: string;
  transliteration: string;
  english: string;
}