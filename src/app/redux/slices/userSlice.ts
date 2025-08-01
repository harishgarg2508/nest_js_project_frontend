import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isEmailVerified: boolean;
}

const initialState: UserState = {
  displayName: null,
  email: null,
  photoURL: null,
  isEmailVerified: false 
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
      state.isEmailVerified = action.payload.isEmailVerified;
    },
    toggleEmailVerification: (state) => {
      state.isEmailVerified = !state.isEmailVerified;
    },
    updatePhotoURL: (state, action: PayloadAction<string>) => {
      state.photoURL = action.payload;
    },
  },
});

export const { setUser, toggleEmailVerification, updatePhotoURL } = userSlice.actions;
export default userSlice.reducer;