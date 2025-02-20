import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Position {
  id: number;
  name: string;
  parentId: number | null;
}

interface PositionsState {
  positions: Position[];
}

const initialState: PositionsState = {
  positions: [],
};

const positionsSlice = createSlice({
  name: "positions",
  initialState,
  reducers: {
    addPosition: (state, action: PayloadAction<Position>) => {
      const exists = state.positions.some(
        pos => pos.name === action.payload.name && pos.parentId === action.payload.parentId
      );
      if (!exists) {
        state.positions.push(action.payload);
      }
    },
    
    removePosition: (state, action: PayloadAction<number>) => {
      state.positions = state.positions.filter((pos) => pos.id !== action.payload);
    },
    updatePosition: (state, action: PayloadAction<Position>) => {
      const index = state.positions.findIndex((pos) => pos.id === action.payload.id);
      if (index !== -1) {
        state.positions[index] = action.payload;
      }
    },
  },
});

export const { addPosition, removePosition, updatePosition } = positionsSlice.actions;
export default positionsSlice.reducer;
