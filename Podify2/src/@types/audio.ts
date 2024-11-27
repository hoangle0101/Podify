import {categoriesTypes} from '@utils/categories';
import { UserProfile } from 'src/store/auth';

export interface AudioData {
  id: string;
  title: string;
  about: string;
  category: categoriesTypes;
  file: string;
  poster?: string;
  owner: {
    name: string;
    id: string;
  };
}

export interface Playlist {
  id: string;
  title: string;
  owner: UserProfile;
  itemsCount: number;
  visibility: 'public' | 'private';
}

export interface RemovePlaylist {
  playlists: Playlist[];
}

export type historyAudio = {
  audioId: string;
  date: string;
  id: string;
  title: string;
};

export interface History {
  date: string;
  audios: historyAudio[];
}

export interface AudioRemove {
  audio: AudioData[]
}

export interface CompletePlaylist {
  id: string;
  title: string;
  audios: AudioData[];
}
