import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CostState {
  projectName: string;
  region: string;
  vectorDb: string;
  modelId: string;
  storageGB: number;
  estimatedDocuments: number;
  estimatedQueries: number;
}

const initialState: CostState = {
  projectName: '',
  region: 'us-east-1',
  vectorDb: '',
  modelId: '',
  storageGB: 50,
  estimatedDocuments: 1000,
  estimatedQueries: 10000,
};

const costSlice = createSlice({
  name: 'cost',
  initialState,
  reducers: {
    setProjectName(state, action: PayloadAction<string>) {
      state.projectName = action.payload;
    },
    setRegion(state, action: PayloadAction<string>) {
      state.region = action.payload;
    },
    setVectorDb(state, action: PayloadAction<string>) {
      state.vectorDb = action.payload;
    },
    setModelId(state, action: PayloadAction<string>) {
      state.modelId = action.payload;
    },
    setStorageGB(state, action: PayloadAction<number>) {
      state.storageGB = action.payload;
    },
    setEstimatedDocuments(state, action: PayloadAction<number>) {
      state.estimatedDocuments = action.payload;
    },
    setEstimatedQueries(state, action: PayloadAction<number>) {
      state.estimatedQueries = action.payload;
    },
    resetCostState(state) {
      Object.assign(state, initialState);
    }
  }
});

export const {
  setProjectName,
  setRegion,
  setVectorDb,
  setModelId,
  setStorageGB,
  setEstimatedDocuments,
  setEstimatedQueries,
  resetCostState
} = costSlice.actions;

export default costSlice.reducer; 
