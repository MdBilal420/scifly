# Groq API Setup for SciFly

SciFly uses the Groq API to generate dynamic educational content for different science topics. Follow these steps to set it up:

## 1. Get Your Free Groq API Key

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for a free account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the generated key

## 2. Configure Environment Variables

Create a `.env` file in the root directory of your project:

```bash
# Create .env file
touch .env
```

Add your API key to the `.env` file:

```env
REACT_APP_GROQ_API_KEY=your_actual_api_key_here
```

**Important:** 
- Replace `your_actual_api_key_here` with your real Groq API key
- Never commit your `.env` file to version control
- The `.env` file is already included in `.gitignore`

## 3. Test the Integration

After setting up the API key:

1. Start the application: `npm start`
2. Navigate to "Choose a Science Topic"
3. Select any topic and start a lesson
4. The app will automatically generate content using Groq AI

## 4. Fallback Content

If the API is unavailable or the key is not configured, SciFly will automatically use fallback content to ensure the app continues working.

## 5. API Usage

The app uses Groq's `mixtral-8x7b-32768` model for:
- **Lesson Content Generation**: Creates age-appropriate explanations for Grade 5 students
- **Quiz Questions**: Generates multiple-choice questions with explanations
- **Chat Responses**: Powers Simba's AI conversations

## Free Tier Limits

Groq offers generous free tier limits:
- High request limits for educational use
- Fast response times
- No credit card required for basic usage

## Troubleshooting

If you encounter issues:

1. **API Key Error**: Verify your key is correctly set in `.env`
2. **Network Issues**: Check your internet connection
3. **Rate Limits**: Wait a moment and try again
4. **Content Not Loading**: The app will show fallback content

For more help, visit the [Groq Documentation](https://console.groq.com/docs/). 