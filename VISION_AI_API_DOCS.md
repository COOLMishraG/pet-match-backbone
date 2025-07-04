# Vision AI Integration API Documentation

## 🎯 Overview

The pets API now includes Vision AI capabilities that can automatically detect animal types and breeds from images. This enhances the user experience by reducing manual input and ensuring data accuracy.

## 🔑 Setup

### 1. Get Google Vision AI API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Vision API
4. Create credentials:
   - **Option A**: Create an API Key (simpler)
   - **Option B**: Create a Service Account JSON (more secure)

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Option A: API Key (Development)
GOOGLE_VISION_API_KEY=your_api_key_here

# Option B: Service Account (Production)
GOOGLE_VISION_KEY_FILE=./config/google-vision-service-account.json
```

## 📡 New API Endpoints

### 1. Analyze Image (File Upload)

**POST** `/pets/analyze-image`

Analyze an uploaded image to detect animal type and breed.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` (file)

**Response:**
```json
{
  "suggestedAnimal": "DOG",
  "confidence": 0.95,
  "suggestedBreed": "golden retriever",
  "allLabels": ["dog", "golden retriever", "canine", "pet", "animal"]
}
```

**Example using curl:**
```bash
curl -X POST http://localhost:3000/pets/analyze-image \
  -F "image=@./my-pet-photo.jpg"
```

### 2. Analyze Image URL

**POST** `/pets/analyze-image-url`

Analyze an image from a URL to detect animal type and breed.

**Request:**
```json
{
  "imageUrl": "https://example.com/pet-image.jpg"
}
```

**Response:**
```json
{
  "suggestedAnimal": "CAT",
  "confidence": 0.87,
  "suggestedBreed": "persian",
  "allLabels": ["cat", "persian", "feline", "pet", "animal"]
}
```

### 3. Create Pet with AI (File Upload)

**POST** `/pets/create-with-ai`

Create a pet with automatic animal detection from uploaded image.

**Request:**
- Content-Type: `multipart/form-data`
- Body: 
  - `image` (file)
  - `name` (string)
  - `ownerId` (string)
  - `breed` (string, optional - will be auto-detected if not provided)
  - `age` (number)
  - `gender` (string)
  - Other pet fields...

**Response:**
```json
{
  "id": "uuid",
  "name": "Buddy",
  "animal": "DOG",
  "breed": "golden retriever",
  "age": 3,
  "gender": "MALE",
  "owner": { ... },
  "aiAnalysis": {
    "detectedAnimal": "DOG",
    "confidence": 0.95,
    "suggestedBreed": "golden retriever",
    "wasAutoDetected": true
  }
}
```

### 4. Create Pet with AI (Image URL)

**POST** `/pets/create-with-ai-url`

Create a pet with automatic animal detection from image URL.

**Request:**
```json
{
  "name": "Whiskers",
  "ownerId": "user-uuid",
  "age": 2,
  "gender": "FEMALE",
  "imageUrl": "https://example.com/cat-image.jpg"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Whiskers",
  "animal": "CAT",
  "breed": "persian",
  "age": 2,
  "gender": "FEMALE",
  "owner": { ... },
  "aiAnalysis": {
    "detectedAnimal": "CAT",
    "confidence": 0.87,
    "suggestedBreed": "persian",
    "wasAutoDetected": true
  }
}
```

## 🧠 AI Detection Logic

### Confidence Thresholds

- **High Confidence (>0.7)**: Auto-sets animal type
- **Medium Confidence (0.5-0.7)**: Suggests animal type but requires manual confirmation
- **Low Confidence (<0.5)**: Falls back to "OTHER" or requires manual input

### Supported Animal Types

The AI can detect and map to these enum values:

| Detected | Maps To | Keywords |
|----------|---------|----------|
| Dogs | `DOG` | dog, canine, puppy, retriever, bulldog, etc. |
| Cats | `CAT` | cat, feline, kitten, persian, siamese, etc. |
| Birds | `BIRD` | bird, avian, parrot, canary, cockatoo, etc. |
| Rabbits | `RABBIT` | rabbit, bunny, hare, cottontail |
| Hamsters | `HAMSTER` | hamster, gerbil, guinea pig |
| Fish | `FISH` | fish, goldfish, tropical fish |
| Reptiles | `REPTILE` | reptile, lizard, snake, turtle, gecko |
| Others | `OTHER` | anything else |

### Breed Detection

The AI can also suggest breeds for:
- **Dogs**: Golden Retriever, Labrador, Bulldog, German Shepherd, Poodle, etc.
- **Cats**: Persian, Siamese, Maine Coon, British Shorthair, etc.
- **Birds**: Parrot, Canary, Cockatoo, Parakeet, etc.

## 🔄 Fallback Behavior

1. **Image Analysis Fails**: Falls back to manual animal type requirement
2. **Low Confidence**: Suggests "OTHER" and requires manual confirmation
3. **No Animal Detected**: Throws error asking for manual input or better image
4. **API Error**: Logs warning and continues without AI detection

## 💡 Usage Examples

### Frontend Integration

```javascript
// Upload image and create pet
const formData = new FormData();
formData.append('image', imageFile);
formData.append('name', 'Buddy');
formData.append('ownerId', userId);
formData.append('age', '3');
formData.append('gender', 'MALE');

const response = await fetch('/pets/create-with-ai', {
  method: 'POST',
  body: formData
});

const pet = await response.json();
console.log('Created pet:', pet);
console.log('AI detected:', pet.aiAnalysis);
```

### Just Analyze Image First

```javascript
// First analyze the image
const formData = new FormData();
formData.append('image', imageFile);

const analysis = await fetch('/pets/analyze-image', {
  method: 'POST',
  body: formData
}).then(r => r.json());

// Show suggestions to user
console.log(`Detected: ${analysis.suggestedAnimal} (${analysis.confidence * 100}% confidence)`);
if (analysis.suggestedBreed) {
  console.log(`Suggested breed: ${analysis.suggestedBreed}`);
}

// Then create pet with user confirmation
const petData = {
  name: 'Buddy',
  animal: analysis.suggestedAnimal, // Use AI suggestion
  breed: analysis.suggestedBreed,   // Use AI suggestion
  age: 3,
  gender: 'MALE',
  ownerId: userId
};
```

## 🛡️ Error Handling

### Common Error Responses

```json
// Missing image
{
  "statusCode": 400,
  "message": "Image file is required",
  "error": "Bad Request"
}

// Analysis failed
{
  "statusCode": 400,
  "message": "Failed to analyze image",
  "error": "Bad Request"
}

// No animal detected and none provided
{
  "statusCode": 400,
  "message": "Animal type is required. Provide manually or upload a clear pet image for auto-detection.",
  "error": "Bad Request"
}
```

## 🚀 Benefits

1. **Reduced User Input**: Auto-detect animal type from photos
2. **Better Data Quality**: AI-powered breed suggestions
3. **Enhanced UX**: Smart form pre-filling
4. **Faster Onboarding**: Less manual typing required
5. **Accuracy**: Computer vision reduces human error

## 📈 Performance

- **Average Response Time**: 2-4 seconds for image analysis
- **Supported Image Formats**: JPEG, PNG, GIF, BMP, WebP
- **Max Image Size**: 20MB (Google Vision API limit)
- **Rate Limits**: Follow Google Vision API quotas

## 🔧 Configuration

Adjust confidence thresholds in `vision-ai.service.ts`:

```typescript
// Auto-set animal type if confidence is high enough
if (aiAnalysis && aiAnalysis.confidence > 0.7) { // Adjust this threshold
  finalPetData.animal = aiAnalysis.suggestedAnimal;
}
```

## 📊 Testing

Use the provided test images or your own pet photos to test the Vision AI integration:

```bash
# Test image analysis
curl -X POST http://localhost:3000/pets/analyze-image \
  -F "image=@./test-images/dog.jpg"

# Test pet creation with AI
curl -X POST http://localhost:3000/pets/create-with-ai \
  -F "image=@./test-images/cat.jpg" \
  -F "name=Test Cat" \
  -F "ownerId=user-123" \
  -F "age=2" \
  -F "gender=FEMALE"
```
