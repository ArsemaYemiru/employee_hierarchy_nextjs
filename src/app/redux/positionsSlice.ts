import { createSlice } from "@reduxjs/toolkit";

interface Position {
  id: number;
  name: string;
  parentId: number | null;
}

const initialState: Position[] = [];

const positionsSlice = createSlice({
  name: "positions",
  initialState,
  reducers: {
    addPosition: (state, action) => { state.push(action.payload); },
    removePosition: (state, action) => state.filter((pos) => pos.id !== action.payload),
  },
});

export const { addPosition, removePosition } = positionsSlice.actions;
export default positionsSlice.reducer;
