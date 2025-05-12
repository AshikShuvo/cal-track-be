# Food Upload Feature Manual

## Overview
The Food Upload feature allows users to upload food images for analysis. The system processes the image, analyzes its contents using AI, and stores the image for future reference.

## Endpoints

### POST /food-upload
Uploads a food image for analysis.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `file`: The food image file (supported formats: JPEG, PNG)

**Response:**
- **Success (200 OK):**
  ```json
  {
    "success": true,
    "storage": {
      "fileId": "abc",
      "url": "http://localhost/abc.jpg"
    },
    "analysis": {
      "name": "Pizza",
      "ingredients": ["dough", "cheese", "tomato sauce"],
      "nutrition": {
        "calories": 300,
        "protein": 12,
        "carbs": 35,
        "fat": 15
      }
    }
  }
  ```
- **Error (400 Bad Request):**
  ```json
  {
    "success": false,
    "error": {
      "code": "NO_ANALYSIS",
      "message": "Could not analyze"
    }
  }
  ```

## Usage Example
Using cURL:
```bash
curl -X POST http://localhost:3000/food-upload -F "file=@/path/to/food-image.jpg"
```

## Notes
- The uploaded image is temporarily stored in the `temp` directory and then processed.
- The AI analysis is performed using the ChatGptFoodService.
- Ensure the server has sufficient storage and processing capabilities for handling image uploads. 