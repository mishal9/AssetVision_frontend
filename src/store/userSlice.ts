import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/auth';
import { type UserInfoResponse } from '@/services/api';

/**
 * User state interface
 */
interface UserState {
  isAuthenticated: boolean;
  user: {
    id?: number;
    username?: string;
    email?: string;
    avatar?: string;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

/**
 * Async thunk to fetch user information
 */
export const fetchUserInfo = createAsyncThunk(
  'user/fetchUserInfo',
  async (_, { rejectWithValue }) => {
    try {
      const userInfo = await authService.getUserInfo();
      return userInfo;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user info');
    }
  }
);

/**
 * User slice
 */
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        
        // Extract user data from the response
        const userData = action.payload;
        
        if (userData && userData.user) {
          state.user = {
            id: userData.user.id,
            username: userData.user.username,
            email: userData.user.email,
            // Generate avatar from initials if no avatar URL is provided
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.user.username)}&background=random`,
          };
        }
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
