# VetSpec Module Usage Examples

## API Endpoints

### Create/Update Vet Specification
```
POST /vet-spec/:userId
PUT /vet-spec/:userId

Body:
{
  "experience": "5+ years",
  "rating": 4.9,
  "reviewCount": 127,
  "price": "$35/day",
  "available": true,
  "verified": true,
  "specialties": ["Dogs", "Cats", "Senior Pets"],
  "description": "Passionate pet lover with 5+ years of experience caring for dogs and cats of all sizes.",
  "responseTime": "1 hour",
  "petsSatCount": 200
}
```

### Get All Vet Specifications
```
GET /vet-spec
```

### Get Available Vets
```
GET /vet-spec/available
```

### Get Verified Vets
```
GET /vet-spec/verified
```

### Get Vet Spec by User ID
```
GET /vet-spec/:userId
```

### Update Availability
```
PATCH /vet-spec/:userId/availability

Body:
{
  "available": false
}
```

### Delete Vet Specification
```
DELETE /vet-spec/:userId
```

## Example Usage

### Creating a Vet Profile
```javascript
const vetData = {
  experience: '5+ years',
  rating: 4.9,
  reviewCount: 127,
  price: '$35/day',
  available: true,
  verified: true,
  specialties: ['Dogs', 'Cats', 'Senior Pets'],
  description: 'Passionate pet lover with 5+ years of experience caring for dogs and cats of all sizes.',
  responseTime: '1 hour',
  petsSatCount: 200
};

// Create vet specification for user with ID 'user-uuid'
const response = await fetch('/vet-spec/user-uuid', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(vetData),
});
```

### Fetching Available Vets
```javascript
const availableVets = await fetch('/vet-spec/available');
const vets = await availableVets.json();
```

## Database Schema

The VetSpec table includes:
- `id` (UUID) - Same as user ID, primary key
- `experience` - Years of experience (e.g., "5+ years")
- `rating` - Rating out of 5 (decimal)
- `reviewCount` - Number of reviews
- `price` - Price per day (e.g., "$35/day")
- `available` - Boolean availability status
- `verified` - Boolean verification status
- `specialties` - Array of specialties (e.g., ["Dogs", "Cats"])
- `description` - Text description
- `responseTime` - Response time (e.g., "1 hour")
- `petsSatCount` - Number of pets sat
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
- Foreign key relationship to User table with CASCADE delete
