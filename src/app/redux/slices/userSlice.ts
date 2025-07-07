import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

const initialState: UserState = {
  displayName: null,
  email: null,
  photoURL: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      console.log("Setting user state:", action.payload);
      state.displayName = action.payload.displayName;
      state.email = action.payload.email;
      state.photoURL = action.payload.photoURL;
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;