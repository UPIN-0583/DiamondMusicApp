import {create} from 'zustand';
import TrackPlayer, {State, RepeatMode} from 'react-native-track-player';

export const usePlayerStore = create((set, get) => ({
  // ===== STATE =====
  // Track list state
  trackList: [],
  currentTrackIndex: 0,
  isLoading: false,
  error: null,

  // Player state
  playerState: State.None,

  // Player settings
  isShuffle: false,
  repeatMode: 0, // 0: Off, 1: Queue, 2: Track
  playbackSpeed: 1,

  // Current track info
  currentTrack: null,
  trackTitle: '',
  trackArtist: '',
  trackArtwork: '',

  // ===== SIMPLE SETTERS =====
  setTrackList: list => set({trackList: list}),
  setCurrentTrackIndex: index => set({currentTrackIndex: index}),
  setIsPlaying: playing => set({isPlaying: playing}),
  setPlayerState: state => set({playerState: state}),

  // ===== PLAYBACK ACTIONS =====

  /**
   * Play a song from the current queue
   */
  playTrack: async index => {
    const {trackList} = get();
    if (!trackList[index]) return;

    // Optimistic update
    set({
      currentTrackIndex: index,
      playerState: State.Buffering,
      currentTrack: trackList[index],
      trackTitle: trackList[index].title,
      trackArtist: trackList[index].artist,
      trackArtwork: trackList[index].artwork,
      error: null,
    });

    try {
      await TrackPlayer.reset();
      await TrackPlayer.add(trackList);
      await TrackPlayer.skip(index);
      await TrackPlayer.play();
      // State will be updated by PlaybackState event to Playing
    } catch (error) {
      console.error('playTrack error:', error);
      set({error: error.message, playerState: State.None});
    }
  },

  /**
   * Load new queue and play
   */
  playFromQueue: async (songs, index = 0) => {
    // Optimistic update
    set({
      trackList: songs,
      currentTrackIndex: index,
      playerState: State.Buffering,
      currentTrack: songs[index],
      trackTitle: songs[index].title,
      trackArtist: songs[index].artist,
      trackArtwork: songs[index].artwork,
      error: null,
    });

    try {
      await TrackPlayer.reset();
      await TrackPlayer.add(songs);
      await TrackPlayer.skip(index);
      await TrackPlayer.play();
      // State will be updated by PlaybackState event to Playing
    } catch (error) {
      console.error('playFromQueue error:', error);
      set({error: error.message, playerState: State.None});
    }
  },

  /**
   * Toggle Play/Pause
   */
  togglePlayback: async () => {
    const {playerState} = get();

    try {
      const idx = await TrackPlayer.getActiveTrackIndex();
      if (idx == null) return;

      if (playerState === State.Paused || playerState === State.Ready) {
        await TrackPlayer.play();
        // State will be updated by PlaybackState event
      } else {
        await TrackPlayer.pause();
        // State will be updated by PlaybackState event
      }
    } catch (error) {
      console.error('togglePlayback error:', error);
    }
  },

  /**
   * Skip to next track
   */
  skipToNext: async () => {
    const {isShuffle, trackList, currentTrackIndex} = get();

    try {
      if (isShuffle && trackList.length > 1) {
        // Random next song (different from current)
        let randomIdx;
        do {
          randomIdx = Math.floor(Math.random() * trackList.length);
        } while (randomIdx === currentTrackIndex);

        await TrackPlayer.skip(randomIdx);
        // State will be updated by PlaybackActiveTrackChanged event
      } else {
        await TrackPlayer.skipToNext();
        // State will be updated by PlaybackActiveTrackChanged event
      }
    } catch (error) {
      console.error('skipToNext error:', error);
    }
  },

  /**
   * Skip to previous track
   */
  skipToPrevious: async () => {
    try {
      await TrackPlayer.skipToPrevious();
      // State will be updated by PlaybackActiveTrackChanged event
    } catch (error) {
      console.error('skipToPrevious error:', error);
    }
  },

  /**
   * Toggle shuffle mode
   */
  toggleShuffle: () => {
    const {isShuffle} = get();
    set({isShuffle: !isShuffle});
  },

  /**
   * Set repeat mode (0: Off, 1: Queue, 2: Track)
   */
  setRepeatMode: async mode => {
    const modes = [RepeatMode.Off, RepeatMode.Queue, RepeatMode.Track];
    try {
      await TrackPlayer.setRepeatMode(modes[mode]);
      set({repeatMode: mode});
    } catch (error) {
      console.error('setRepeatMode error:', error);
    }
  },

  /**
   * Cycle through repeat modes
   */
  cycleRepeatMode: async () => {
    const {repeatMode} = get();
    const newMode = (repeatMode + 1) % 3;
    await get().setRepeatMode(newMode);
    return newMode;
  },

  /**
   * Set playback speed
   */
  setPlaybackSpeed: async speed => {
    try {
      await TrackPlayer.setRate(speed);
      set({playbackSpeed: speed});
    } catch (error) {
      console.error('setPlaybackSpeed error:', error);
    }
  },

  /**
   * Seek to position
   */
  seekTo: async position => {
    try {
      await TrackPlayer.seekTo(position);
    } catch (error) {
      console.error('seekTo error:', error);
    }
  },

  /**
   * Update current track info (from TrackPlayer events)
   */
  updateCurrentTrack: track => {
    if (!track) return;
    set({
      currentTrack: track,
      trackTitle: track.title || '',
      trackArtist: track.artist || '',
      trackArtwork: track.artwork || '',
    });
  },

  /**
   * Load track info on mount
   */
  loadTrackInfo: async () => {
    try {
      const track = await TrackPlayer.getActiveTrack();
      if (track) {
        set({
          currentTrack: track,
          trackTitle: track.title,
          trackArtist: track.artist,
          trackArtwork: track.artwork,
        });
      }

      // Also load current playback state
      const state = await TrackPlayer.getPlaybackState();
      if (state && state.state) {
        set({playerState: state.state});
      }
    } catch (error) {
      console.log('loadTrackInfo error:', error);
    }
  },

  resetPlayer: async () => {
    try {
      await TrackPlayer.reset();
      set({
        trackList: [],
        currentTrackIndex: 0,
        playerState: State.None,
        currentTrack: null,
        trackTitle: '',
        trackArtist: '',
        trackArtwork: '',
      });
    } catch (error) {
      console.error('Error resetting player:', error);
    }
  },
}));
