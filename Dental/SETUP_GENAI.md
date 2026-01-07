# Google GenAI Setup for Image Generation

## Quick Setup Steps

### 1. Install the Google GenAI Package

In the backend directory, run:
```bash
cd backend
npm install @google/genai
```

### 2. Get Your API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 3. Add API Key to Environment

Open `backend/.env` and add your API key:
```env
GENAI_API_KEY=your-actual-api-key-here
```

### 4. Restart the Backend Server

```bash
cd backend
npm start
```

## How It Works

1. **User uploads a photo** (before or after)
2. **Image is saved** to the server
3. **API automatically triggers** the Google GenAI model
4. **AI generates** an enhanced dental image
5. **Frontend displays** both original and AI-generated images

## Testing

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to a patient detail page
4. Upload a before or after photo
5. Watch the loading animation
6. See the AI-generated result appear with "AI Generated" badge

## Prompt Details

The AI is instructed to:
- Focus on teeth improvement only
- Subtly align and even out crowding/gaps
- Close small gaps (diastemas)
- Preserve patient identity (face, skin, hair)
- Avoid adding braces or unrealistic effects
- Keep natural lighting and shadows

## Cost Information

Google GenAI API pricing:
- Check current pricing at [Google AI Pricing](https://ai.google.dev/pricing)
- gemini-2.5-flash-image model is used
- Free tier available for testing

## Troubleshooting

### Error: "GENAI_API_KEY not set"
- Check that your `.env` file has the `GENAI_API_KEY` variable
- Restart the backend server after adding the key

### Error: "Module @google/genai not found"
- Run `npm install @google/genai` in the backend directory

### Generated image not showing
- Check browser console for errors
- Check backend terminal for error logs
- Verify the API key is valid

### AI returns no image
- Check the backend logs for the full API response
- Try with a different image
- Verify the image format is supported (JPEG/PNG)

## API Response Format

Success response:
```json
{
  "success": true,
  "generatedImage": "data:image/jpeg;base64,/9j/4AAQ...",
  "type": "before",
  "patientId": "..."
}
```

Error response (fallback to original):
```json
{
  "success": false,
  "generatedImage": "http://localhost:5000/uploads/...",
  "warning": "Error message",
  "type": "before",
  "patientId": "..."
}
```
