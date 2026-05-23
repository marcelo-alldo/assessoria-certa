import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PaginationState {
  page: number;
}

const initialStatePagination: PaginationState = {
  page: 1,
};

const paginationSlice = createSlice({
  name: 'pagination',
  initialState: initialStatePagination,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;

      return state;
    },
    resetPage: (state) => {
      state.page = 1;

      return state;
    },
  },
});

export const { setPage, resetPage } = paginationSlice.actions;
export default paginationSlice.reducer;
export type { PaginationState };
