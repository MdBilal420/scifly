import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Topic } from '../../data/topics';
import backendApi from '../../services/backendApi';

interface StorybookPart {
  type: 'text' | 'image';
  data: string;
  mime_type?: string;
}

interface StorybookState {
  storybookContent: StorybookPart[];
  isGeneratingContent: boolean;
  contentError: string | null;
}

const initialState: StorybookState = {
  storybookContent: [],
  isGeneratingContent: false,
  contentError: null,
};

export const generateStorybookContent = createAsyncThunk(
  'storybook/generateContent',
  async (topic: Topic, { rejectWithValue }) => {
    try {
      const prompt = `Using an Anime art style, create a storybook image for my brother Akito who is grade 5 learning about ${topic.title}. Akito loved spending his afternoons in his grandmother's garden. He watched the tiny sprouts push through the soil, growing taller and greener each day. How do they do it? he wondered, gently touching a vibrant leaf. How do plants eat?`;
      const response = await backendApi.post('/generate-storybook', { prompt });
      if (response.data.success) {
        return response.data.storybook;
      } else {
        return rejectWithValue(response.data.error);
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const storybookSlice = createSlice({
  name: 'storybook',
  initialState,
  reducers: {
    clearErrors(state) {
      state.contentError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateStorybookContent.pending, (state) => {
        state.isGeneratingContent = true;
        state.contentError = null;
      })
      .addCase(generateStorybookContent.fulfilled, (state, action: PayloadAction<StorybookPart[]>) => {
        state.isGeneratingContent = false;
        state.storybookContent = action.payload;
      })
      .addCase(generateStorybookContent.rejected, (state, action) => {
        state.isGeneratingContent = false;
        state.contentError = action.payload as string;
      });
  },
});

export const { clearErrors } = storybookSlice.actions;
export default storybookSlice.reducer;