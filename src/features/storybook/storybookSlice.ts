import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { groqAPI } from '../../services/groqAPI';
import { Topic } from '../../data/topics';
import backendApi from '../../services/backendApi';

interface StorybookPage {
  text: string;
  image: string | null;
  isGeneratingImage: boolean;
  imageError: string | null;
}

interface StorybookState {
  pages: StorybookPage[];
  isGeneratingContent: boolean;
  contentError: string | null;
}

const initialState: StorybookState = {
  pages: [],
  isGeneratingContent: false,
  contentError: null,
};



export const generateStorybookPages = createAsyncThunk(
  'storybook/generatePages',
  async (topic: Topic, { getState, rejectWithValue }) => {
    try {
      const { user } = getState() as { user: { currentUser: any } };
      const pages = await groqAPI.generateStorybookPages(topic, user.currentUser);
      return pages;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const generatePageImage = createAsyncThunk(
  'storybook/generateImage',
  async ({ pageIndex, text, topic }: { pageIndex: number, text: string, topic: Topic }, { rejectWithValue }) => {
    try {
      const prompt = `Using an Anime art style, create a storybook image for my brother Ben, who is in grade 5 and learning about ${topic.title}.
      The image should visually represent the story described in the following text ${text}, but do not include any text or captions on the image itself. 
      Focus entirely on using visuals to convey the scene and main ideas from the story.

# Output Format:
- Provide only the image (no text or captions within the image).
- Ensure the visual accurately reflects the content and key moments from the supplied story text.

(For other topics or stories, follow this example by visually depicting the scene with Anime artwork, omitting any on-image text.)

---
**Reminder:**  
- Create an Anime-style storybook image based on the story text, but do NOT include any text or words on the image itself. Only use visual elements to communicate the story.`;
      const response = await backendApi.post('/generate-storybook', { prompt });
      if (response.data.success && response.data.storybook.length > 0) {
        const imagePart = response.data.storybook.find((part: any) => part.type === 'image');
        if (imagePart) {
          return { pageIndex, image: `data:${imagePart.mime_type};base64,${imagePart.data}` };
        }
      }
      return rejectWithValue('Image generation failed');
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
      state.pages.forEach(page => {
        page.imageError = null;
      });
    },
    resetStorybook(state) {
      state.pages = [];
      state.isGeneratingContent = false;
      state.contentError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateStorybookPages.pending, (state) => {
        state.isGeneratingContent = true;
        state.contentError = null;
        state.pages = [];
      })
      .addCase(generateStorybookPages.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.isGeneratingContent = false;
        state.pages = action.payload.map(text => ({
          text,
          image: null,
          isGeneratingImage: false,
          imageError: null,
        }));
      })
      .addCase(generateStorybookPages.rejected, (state, action) => {
        state.isGeneratingContent = false;
        state.contentError = action.payload as string;
      })
      .addCase(generatePageImage.pending, (state, action) => {
        const { pageIndex } = action.meta.arg;
        if (state.pages[pageIndex]) {
          state.pages[pageIndex].isGeneratingImage = true;
          state.pages[pageIndex].imageError = null;
        }
      })
      .addCase(generatePageImage.fulfilled, (state, action) => {
        const { pageIndex, image } = action.payload;
        if (state.pages[pageIndex]) {
          state.pages[pageIndex].isGeneratingImage = false;
          state.pages[pageIndex].image = image;
        }
      })
      .addCase(generatePageImage.rejected, (state, action) => {
        const { pageIndex } = action.meta.arg;
        if (state.pages[pageIndex]) {
          state.pages[pageIndex].isGeneratingImage = false;
          state.pages[pageIndex].imageError = action.payload as string;
        }
      });
  },
});

export const { clearErrors, resetStorybook } = storybookSlice.actions;
export default storybookSlice.reducer;