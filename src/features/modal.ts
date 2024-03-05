import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

const initialState = {
  display: false,
  type: "",
};

const modalSlice = createSlice({
  name: "modal",
  reducers: {
    showModal: (state, action) => ({ display: action.payload.display, type: action.payload.type }),
    closeModal: (state, action) => ({display: action.payload.display, type: action.payload.type }),
  },
  initialState,
});

export const getModal = (state: RootState) => state.modal;

export const { showModal, closeModal } = modalSlice.actions;

export default modalSlice.reducer;
