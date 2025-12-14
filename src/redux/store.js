import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import musicReducer from './slices/musicSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    music: musicReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
