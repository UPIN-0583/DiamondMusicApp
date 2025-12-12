import { create } from 'zustand';

export const usePlayerStore = create(set => ({
  trackList: [
    {
      id: '1',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      title: 'Song 1',
      artist: 'Artist 1',
      artwork: 'https://picsum.photos/200/200?id=1',
    },
    {
      id: '2',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      title: 'Song 2',
      artist: 'Artist 2',
      artwork: 'https://picsum.photos/200/200?id=2',
    },
    {
      id: '3',
      url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      title: 'Song 3',
      artist: 'Artist 3',
      artwork: 'https://picsum.photos/200/200?id=3',
    },
  ],
  currentTrackIndex: 0,
  isPlaying: false,

  setTrackList: list => set({ trackList: list }),
  setCurrentTrackIndex: index => set({ currentTrackIndex: index }),
  setIsPlaying: playing => set({ isPlaying: playing }),
}));
