import { configureStore } from '@reduxjs/toolkit';
import costReducer from './costSlice';

const store = configureStore({
  reducer: {
    cost: costReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
