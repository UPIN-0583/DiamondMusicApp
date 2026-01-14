import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  login,
  register,
  getLikedSongs,
  likeSong,
  unlikeSong,
  getLikedArtists,
  followArtist,
  unfollowArtist,
} from '../../services/api';

// AsyncStorage keys
const AUTH_TOKEN_KEY = '@auth_token';
const AUTH_USER_KEY = '@auth_user';

// Helper functions for AsyncStorage
export const saveCredentials = async (token, user) => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving credentials:', error);
  }
};

export const clearCredentials = async () => {
  try {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
  } catch (error) {
    console.error('Error clearing credentials:', error);
  }
};

// Thunk to load stored credentials on app startup
export const loadStoredCredentials = createAsyncThunk(
  'auth/loadStoredCredentials',
  async (_, {rejectWithValue}) => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userJson = await AsyncStorage.getItem(AUTH_USER_KEY);

      if (token && userJson) {
        const user = JSON.parse(userJson);
        return {token, user};
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({email, password}, {rejectWithValue}) => {
    try {
      const response = await login(email, password);
      if (response.success) {
        return response;
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({username, password, email}, {rejectWithValue}) => {
    try {
      const response = await register(username, password, email);
      if (response.success) {
        return response;
      }
      return rejectWithValue(response.message);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchLikedSongs = createAsyncThunk(
  'auth/fetchLikedSongs',
  async (token, {rejectWithValue}) => {
    try {
      const response = await getLikedSongs(token);
      if (response.success) {
        return response.favouriteSongs;
      }
      return rejectWithValue(response.message);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const toggleLikeSong = createAsyncThunk(
  'auth/toggleLikeSong',
  async ({token, songId, isLiked}, {rejectWithValue}) => {
    try {
      const response = isLiked
        ? await unlikeSong(token, songId)
        : await likeSong(token, songId);
      if (response.success) {
        return {songId, isLiked: !isLiked};
      }
      return rejectWithValue(response.message);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const fetchLikedArtists = createAsyncThunk(
  'auth/fetchLikedArtists',
  async (token, {rejectWithValue}) => {
    try {
      const response = await getLikedArtists(token);
      if (response.success) {
        return response.favouriteArtists;
      }
      return rejectWithValue(response.message);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const toggleFollowArtist = createAsyncThunk(
  'auth/toggleFollowArtist',
  async ({token, artistId, isFollowed}, {rejectWithValue}) => {
    try {
      const response = isFollowed
        ? await unfollowArtist(token, artistId)
        : await followArtist(token, artistId);
      if (response.success) {
        return {artistId, isFollowed: !isFollowed};
      }
      return rejectWithValue(response.message);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    isRegistered: false,
    likedSongs: [],
    likedArtists: [],
  },
  reducers: {
    logout: state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.likedSongs = [];
      state.likedArtists = [];
    },
    resetError: state => {
      state.error = null;
    },
    resetRegisterSuccess: state => {
      state.isRegistered = false;
    },
    setCredentials: (state, action) => {
      const {user, token} = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = !!token;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
  },
  extraReducers: builder => {
    // Login
    builder
      .addCase(loginUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      });

    // Register
    builder
      .addCase(registerUser.pending, state => {
        state.isLoading = true;
        state.error = null;
        state.isRegistered = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isRegistered = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Register failed';
      });

    // Favorites
    builder.addCase(fetchLikedSongs.fulfilled, (state, action) => {
      state.likedSongs = action.payload || [];
    });
    builder.addCase(toggleLikeSong.fulfilled, (state, action) => {
      const {songId, isLiked} = action.payload;
      if (isLiked) {
        state.likedSongs.push({song_id: songId});
      } else {
        state.likedSongs = state.likedSongs.filter(
          s =>
            s.song_id !== songId && s.song_id?.toString() !== songId.toString(),
        );
      }
    });

    builder.addCase(fetchLikedArtists.fulfilled, (state, action) => {
      state.likedArtists = action.payload || [];
    });
    builder.addCase(toggleFollowArtist.fulfilled, (state, action) => {
      const {artistId, isFollowed} = action.payload;
      if (isFollowed) {
        state.likedArtists.push({artist_id: artistId});
      } else {
        state.likedArtists = state.likedArtists.filter(
          a =>
            a.artist_id !== artistId &&
            a.artist_id?.toString() !== artistId.toString(),
        );
      }
    });

    // Load stored credentials
    builder.addCase(loadStoredCredentials.fulfilled, (state, action) => {
      if (action.payload) {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      }
    });
  },
});

export const {logout, resetError, resetRegisterSuccess, setCredentials} =
  authSlice.actions;
export default authSlice.reducer;
