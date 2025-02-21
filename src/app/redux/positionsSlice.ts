import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface Position {
  id: number;
  name: string;
  parentId: number | null | undefined;
  description?: string;
}

interface PositionsState {
  positions: Position[];
  loading: boolean;
  error: string | null;
}

const initialState: PositionsState = {
  positions: [],
  loading: false,
  error: null,
};

export const fetchPositions = createAsyncThunk("positions/fetchPositions", async () => {
  const response = await fetch("http://localhost:3000/position"); 
  if (!response.ok) {
    throw new Error("Failed to fetch positions");
  }
  return (await response.json()) as Position[];
});

export const addPositionAsync = createAsyncThunk(
  "positions/addPosition",
  async (newPosition: Omit<Position, "id">) => {
    const response = await fetch("http://localhost:3000/position", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPosition), // Ensure the body matches { name, parentId }
    });

    if (!response.ok) {
      throw new Error("Failed to add position");
    }

    return (await response.json()) as Position; // Return the inserted position
  }
);

const positionsSlice = createSlice({
  name: "positions",
  initialState,
  reducers: {
    addPosition: (state, action: PayloadAction<Position>) => {
      const exists = state.positions.some(
        (pos) => pos.name === action.payload.name && pos.parentId === action.payload.parentId
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchPositions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPositions.fulfilled, (state, action) => {
        state.positions = action.payload;
        state.loading = false;
      })
      .addCase(fetchPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch positions";
      })
      .addCase(addPositionAsync.fulfilled, (state, action) => {
        state.positions.push(action.payload);
      });
  },
});

export const { addPosition, removePosition, updatePosition } = positionsSlice.actions;
export default positionsSlice.reducer;