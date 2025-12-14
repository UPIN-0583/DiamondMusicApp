// API Configuration
// Sử dụng IP thực của máy tính để Android device có thể kết nối
const BASE_URL = 'http://192.168.100.12:5000/api';
// const BASE_URL = 'http://10.0.2.2:5000/api'; // Android emulator localhost
// const BASE_URL = 'http://localhost:5000/api'; // iOS simulator

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  let body = options.body;
  if (body && typeof body === 'object') {
    body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      body,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ============ SONG APIs ============
export const getSongs = async () => {
  return apiRequest('/song/all-songs');
};

// ============ ARTIST APIs ============
export const getArtists = async () => {
  return apiRequest('/artist/all-artists');
};

export const getArtistDetail = async id => {
  return apiRequest(`/artist/${id}`);
};

// ============ GLOBAL PLAYLIST APIs ============
export const getGlobalPlaylists = async () => {
  return apiRequest('/gplaylist/all-gplaylists');
};

export const getGlobalPlaylistDetail = async id => {
  return apiRequest(`/gplaylist/${id}`);
};

// ============ AUTH APIs ============
export const login = async (email, password) => {
  return apiRequest('/user/login', {
    method: 'POST',
    body: {email, password},
  });
};

export const register = async (username, password, email) => {
  return apiRequest('/user/register', {
    method: 'POST',
    body: {username, password, email},
  });
};

// ============ USER APIs (Protected) ============
export const getUserInfo = async token => {
  return apiRequest('/user/user-info', {
    headers: {token},
  });
};

// ============ USER PLAYLIST APIs (Protected) ============
export const getUserPlaylists = async token => {
  return apiRequest('/playlist/all-playlists', {
    headers: {token},
  });
};

export const createPlaylist = async (token, name) => {
  return apiRequest('/playlist/add-playlist', {
    method: 'POST',
    body: {name},
    headers: {token},
  });
};

export const addSongToPlaylist = async (token, playlist_id, song_id) => {
  return apiRequest('/playlist/add-song', {
    method: 'POST',
    body: {playlist_id, song_id},
    headers: {token},
  });
};

export const removeSongFromPlaylist = async (token, playlist_id, song_id) => {
  return apiRequest('/playlist/remove-song', {
    method: 'POST', // Route uses POST as per playlistRoute.js
    body: {playlist_id, song_id},
    headers: {token},
  });
};

export const renamePlaylist = async (token, playlist_id, name) => {
  return apiRequest('/playlist/rename-playlist', {
    method: 'PUT',
    body: {playlist_id, name},
    headers: {token},
  });
};

export const deletePlaylist = async (token, playlist_id) => {
  return apiRequest('/playlist/delete-playlist', {
    method: 'DELETE',
    body: {playlist_id},
    headers: {token},
  });
};

// ============ USER FAVOURITES APIs ============
export const getLikedSongs = async token => {
  return apiRequest('/user/liked-songs', {
    headers: {token},
  });
};

export const likeSong = async (token, song_id) => {
  return apiRequest('/user/add-favourite-song', {
    method: 'POST',
    body: {song_id},
    headers: {token},
  });
};

export const unlikeSong = async (token, song_id) => {
  return apiRequest('/user/remove-favourite-song', {
    method: 'DELETE',
    body: {song_id},
    headers: {token},
  });
};

export const getLikedArtists = async token => {
  return apiRequest('/user/liked-artists', {
    headers: {token},
  });
};

export const followArtist = async (token, artist_id) => {
  return apiRequest('/user/add-favourite-artist', {
    method: 'POST',
    body: {artist_id},
    headers: {token},
  });
};

export const unfollowArtist = async (token, artist_id) => {
  return apiRequest('/user/remove-favourite-artist', {
    method: 'DELETE',
    body: {artist_id},
    headers: {token},
  });
};

export const createPlaylistWithSongs = async (token, name, song_ids) => {
  return apiRequest('/playlist/create-with-songs', {
    method: 'POST',
    body: {name, song_ids},
    headers: {token},
  });
};

export const updateProfile = async (token, username, avatar_url) => {
  return apiRequest('/user/update-profile', {
    method: 'PUT',
    body: {username, avatar_url},
    headers: {token},
  });
};

export const changePassword = async (token, oldPassword, newPassword) => {
  return apiRequest('/user/change-password', {
    method: 'PUT',
    body: {oldPassword, newPassword},
    headers: {token},
  });
};

export const getUserStats = async token => {
  return apiRequest('/user/stats', {
    headers: {token},
  });
};
