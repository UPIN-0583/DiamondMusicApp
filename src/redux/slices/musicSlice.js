import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {
  getSongs,
  getArtists,
  getGlobalPlaylists,
  getUserPlaylists,
  createPlaylist,
  addSongToPlaylist,
  renamePlaylist,
  deletePlaylist,
  removeSongFromPlaylist,
} from '../../services/api';

// Async Thunks
export const fetchSongs = createAsyncThunk(
  'music/fetchSongs',
  async (_, {rejectWithValue}) => {
    try {
      const response = await getSongs();
      if (response.success) {
        return response.songs.map(song => ({
          id: song.song_id.toString(),
          url: song.audio_url,
          title: song.title,
          artist: song.name,
          artistId: song.artist_id,
          artwork: song.image_url,
          duration: song.duration,
          views: song.views,
        }));
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchArtists = createAsyncThunk(
  'music/fetchArtists',
  async (_, {rejectWithValue}) => {
    try {
      const response = await getArtists();
      if (response.success) {
        return response.artists.map(artist => ({
          id: artist.artist_id.toString(),
          name: artist.name,
          image: artist.image_url,
          bio: artist.bio,
        }));
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchPlaylists = createAsyncThunk(
  'music/fetchPlaylists',
  async (_, {rejectWithValue}) => {
    try {
      const PLACEHOLDER_IMAGE =
        'https://via.placeholder.com/400x400.png?text=Playlist';
      const response = await getGlobalPlaylists();
      if (response.success) {
        return response.playlists.map(playlist => ({
          id: playlist.playlist_id.toString(),
          name: playlist.name,
          image: playlist.image_url || PLACEHOLDER_IMAGE,
          category: playlist.description || 'Music',
        }));
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchUserPlaylists = createAsyncThunk(
  'music/fetchUserPlaylists',
  async (token, {rejectWithValue}) => {
    try {
      const response = await getUserPlaylists(token);
      if (response.success) {
        return response.playlists;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createNewPlaylist = createAsyncThunk(
  'music/createPlaylist',
  async ({token, name}, {rejectWithValue, dispatch}) => {
    try {
      const response = await createPlaylist(token, name);
      if (response.success) {
        dispatch(fetchUserPlaylists(token));
        return response.playlist;
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const addSongToPlaylistThunk = createAsyncThunk(
  'music/addSongToPlaylist',
  async ({token, playlistId, songId}, {rejectWithValue}) => {
    try {
      const response = await addSongToPlaylist(token, playlistId, songId);
      if (response.success) {
        return response.addedSong;
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const renamePlaylistThunk = createAsyncThunk(
  'music/renamePlaylist',
  async ({token, playlistId, name}, {rejectWithValue, dispatch}) => {
    try {
      const response = await renamePlaylist(token, playlistId, name);
      if (response.success) {
        dispatch(fetchUserPlaylists(token));
        return response.playlist;
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deletePlaylistThunk = createAsyncThunk(
  'music/deletePlaylist',
  async ({token, playlistId}, {rejectWithValue, dispatch}) => {
    try {
      const response = await deletePlaylist(token, playlistId);
      if (response.success) {
        dispatch(fetchUserPlaylists(token));
        return response.playlist;
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const removeSongFromPlaylistThunk = createAsyncThunk(
  'music/removeSongFromPlaylist',
  async ({token, playlistId, songId}, {rejectWithValue}) => {
    try {
      const response = await removeSongFromPlaylist(token, playlistId, songId);
      if (response.success) {
        return response.removedSong;
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Slice
const musicSlice = createSlice({
  name: 'music',
  initialState: {
    songs: [],
    artists: [],
    playlists: [],
    isLoadingSongs: false,
    isLoadingArtists: false,
    isLoadingPlaylists: false,
    userPlaylists: [],
    isLoadingUserPlaylists: false,
    error: null,
  },
  reducers: {},
  extraReducers: builder => {
    // Songs
    builder
      .addCase(fetchSongs.pending, state => {
        state.isLoadingSongs = true;
      })
      .addCase(fetchSongs.fulfilled, (state, action) => {
        state.isLoadingSongs = false;
        state.songs = action.payload;
      })
      .addCase(fetchSongs.rejected, (state, action) => {
        state.isLoadingSongs = false;
        state.error = action.payload;
      });

    // Artists
    builder
      .addCase(fetchArtists.pending, state => {
        state.isLoadingArtists = true;
      })
      .addCase(fetchArtists.fulfilled, (state, action) => {
        state.isLoadingArtists = false;
        state.artists = action.payload;
      })
      .addCase(fetchArtists.rejected, (state, action) => {
        state.isLoadingArtists = false;
        state.error = action.payload;
      });

    // Playlists
    builder
      .addCase(fetchPlaylists.pending, state => {
        state.isLoadingPlaylists = true;
      })
      .addCase(fetchPlaylists.fulfilled, (state, action) => {
        state.isLoadingPlaylists = false;
        state.playlists = action.payload;
      })
      .addCase(fetchPlaylists.rejected, (state, action) => {
        state.isLoadingPlaylists = false;
        state.error = action.payload;
      });

    // User Playlists
    builder
      .addCase(fetchUserPlaylists.pending, state => {
        state.isLoadingUserPlaylists = true;
      })
      .addCase(fetchUserPlaylists.fulfilled, (state, action) => {
        state.isLoadingUserPlaylists = false;
        state.userPlaylists = action.payload || [];
      })
      .addCase(fetchUserPlaylists.rejected, (state, action) => {
        state.isLoadingUserPlaylists = false;
        state.error = action.payload;
      });
  },
});

export default musicSlice.reducer;
