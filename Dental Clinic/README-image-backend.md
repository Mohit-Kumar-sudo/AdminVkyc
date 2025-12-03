# Image Backend for Gemini (GenAI) Processing

This backend provides a REST API for dental image upload and enhancement using Google Gemini (GenAI).

## Features
- POST `/api/upload-image` — Accepts `{ imageData }` (base64 DataURL), returns `{ generatedImage }` (base64 DataURL)
- Reads `GENAI_API_KEY` and `GOOGLE_APPLICATION_CREDENTIALS` from `.env` or uses `service-account.json` in project root
- Handles CORS and large image payloads

## Setup
1. Place your `.env` file in the project root:
   ```
   GENAI_API_KEY=your_google_genai_api_key
   PORT=4000
   GOOGLE_APPLICATION_CREDENTIALS=full_path_to_service-account.json
   ```
   Or just put `service-account.json` in the project root.

2. Install dependencies:
   ```powershell
   npm install express cors body-parser dotenv @google/genai
   ```

3. Start the backend:
   ```powershell
   npm run image-backend
   ```
   Or:
   ```powershell
   node image-backend.js
   ```

## Example Request
```json
POST /api/upload-image
{
  "imageData": "data:image/png;base64,..."
}
```

## Notes
- Ensure your Google Cloud service account JSON is valid and accessible.
- The backend will return the original image and a warning if GenAI fails or credentials are missing.
