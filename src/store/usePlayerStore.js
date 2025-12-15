import {create} from 'zustand';
import {getSongs, getArtists, getGlobalPlaylists} from '../services/api';

export const usePlayerStore = create((set, get) => ({
  // Track list state
  trackList: [],
  currentTrackIndex: 0,
  isPlaying: false,
  isLoading: false,
  error: null,

  // Artists state
  artists: [],
  isLoadingArtists: false,

  // Global Playlists state
  globalPlaylists: [],
  isLoadingPlaylists: false,

  // Actions for tracks
  setTrackList: list => set({trackList: list}),
  setCurrentTrackIndex: index => set({currentTrackIndex: index}),
  setIsPlaying: playing => set({isPlaying: playing}),

  // Fetch songs from API
  fetchSongs: async () => {
    set({isLoading: true, error: null});
    try {
      const response = await getSongs();
      if (response.success) {
        // Transform API data to track format
        const tracks = response.songs.map(song => ({
          id: song.song_id.toString(),
          url: song.audio_url,
          title: song.title,
          artist: song.name, // artist name from join
          artistId: song.artist_id,
          artwork: song.image_url,
          duration: song.duration,
          views: song.views,
        }));
        set({trackList: tracks, isLoading: false});
      } else {
        set({error: response.message, isLoading: false});
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      set({error: error.message, isLoading: false});
    }
  },

  // Fetch artists from API
  fetchArtists: async () => {
    set({isLoadingArtists: true});
    try {
      const response = await getArtists();
      if (response.success) {
        const artists = response.artists.map(artist => ({
          id: artist.artist_id.toString(),
          name: artist.name,
          image: artist.image_url,
          bio: artist.bio,
        }));
        set({artists, isLoadingArtists: false});
      } else {
        set({isLoadingArtists: false});
      }
    } catch (error) {
      console.error('Error fetching artists:', error);
      set({isLoadingArtists: false});
    }
  },

  // Fetch global playlists from API
  fetchGlobalPlaylists: async () => {
    set({isLoadingPlaylists: true});
    try {
      const PLACEHOLDER_IMAGE =
        'https://via.placeholder.com/400x400.png?text=Playlist';
      const response = await getGlobalPlaylists();
      if (response.success) {
        const playlists = response.playlists.map(playlist => ({
          id: playlist.playlist_id.toString(),
          name: playlist.name,
          image: playlist.image_url || PLACEHOLDER_IMAGE,
          category: playlist.description || 'Music',
        }));
        set({globalPlaylists: playlists, isLoadingPlaylists: false});
      } else {
        set({isLoadingPlaylists: false});
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      set({isLoadingPlaylists: false});
    }
  },
}));
