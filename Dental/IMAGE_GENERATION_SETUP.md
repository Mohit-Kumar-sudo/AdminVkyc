# Image Generation API Setup

## Overview
When a user uploads a before/after patient photo, the system now automatically triggers an image generation API to create an enhanced or AI-processed version of the image.

## Flow
1. User uploads an image (before or after photo)
2. Image is saved to the server
3. A POST request is made to `/api/patients/:id/generate-image`
4. The backend calls your AI image generation service
5. Generated image is returned and displayed to the user

## Frontend Implementation
- **File**: `frontend/src/app/dashboard/patients/[id]/page.tsx`
- **Features**:
  - Loading states during image generation
  - Display of both original and generated images
  - Error handling for failed generations
  - Disabled upload buttons during processing

## Backend Implementation
- **File**: `backend/Controllers/patientController.js`
- **Endpoint**: `POST /api/patients/:id/generate-image`
- **Request Body**:
  ```json
  {
    "type": "before" | "after",
    "imageId": "string",
    "imagePath": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "generatedImage": "url-to-generated-image",
    "type": "before" | "after",
    "patientId": "string"
  }
  ```

## Integrating Your AI Service

### Option 1: Replicate API
```javascript
const response = await fetch('https://api.replicate.com/v1/predictions', {
  method: 'POST',
  headers: {
    'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    version: "your-model-version",
    input: {
      image: `${process.env.BASE_URL}/${imagePath}`,
      prompt: "enhance dental image, professional medical quality"
    }
  })
});
```

### Option 2: Stability AI
```javascript
const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    init_image: imageBase64,
    text_prompts: [{ text: "enhance dental image", weight: 1 }]
  })
});
```

### Option 3: OpenAI DALL-E
```javascript
const response = await fetch('https://api.openai.com/v1/images/edits', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
  },
  body: formData // FormData with image file and prompt
});
```

## Environment Variables

Add these to your `.env` file:

```env
# Choose your AI service
AI_API_KEY=your-api-key-here
BASE_URL=http://localhost:5000

# Service-specific keys
REPLICATE_API_TOKEN=r8_xxx
STABILITY_API_KEY=sk-xxx
OPENAI_API_KEY=sk-xxx
```

## Customization

To customize the AI generation in `backend/Controllers/patientController.js`:

1. Replace the mock response in the `generateImage` function
2. Add your API service call
3. Handle the response and save the generated image
4. Update the response format if needed

## Testing

1. Start the backend: `cd backend && npm start`
2. Start the frontend: `cd frontend && npm run dev`
3. Upload a patient photo
4. Watch the loading animation
5. See the generated image appear with "AI Generated" badge

## Troubleshooting

- If generation fails, the original image is still saved
- Check console for error messages
- Verify your API key is correct
- Ensure the BASE_URL is accessible from the AI service
- Check network tab for API response details
