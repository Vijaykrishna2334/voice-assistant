# API Documentation

Base URL: `http://localhost:3001` (development)

## Authentication

All endpoints except `/api/auth/*` require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Auth

#### POST /api/auth/register

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbG...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST /api/auth/login

Login user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

#### POST /api/auth/logout

Logout current user.

**Headers:** Authorization required

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### GET /api/auth/me

Get current user profile.

**Headers:** Authorization required

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Conversations

#### POST /api/conversations

Create a new conversation.

**Headers:** Authorization required

**Request:**
```json
{
  "title": "My Conversation" // optional
}
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "title": "My Conversation",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### GET /api/conversations

Get all user conversations.

**Headers:** Authorization required

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "title": "My Conversation",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "messages": [
      {
        "id": "uuid",
        "conversationId": "uuid",
        "role": "assistant",
        "content": "Hello! How can I help?",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
]
```

#### GET /api/conversations/:id

Get a specific conversation with all messages.

**Headers:** Authorization required

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "title": "My Conversation",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "messages": [
    {
      "id": "uuid",
      "conversationId": "uuid",
      "role": "user",
      "content": "Hello",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid",
      "conversationId": "uuid",
      "role": "assistant",
      "content": "Hello! How can I help you today?",
      "timestamp": "2024-01-01T00:00:01.000Z",
      "emotion": "calm",
      "avatarState": "happy"
    }
  ]
}
```

#### POST /api/conversations/message

Send a message and get AI response.

**Headers:** Authorization required

**Request:**
```json
{
  "message": "What is quantum entanglement?",
  "conversationId": "uuid", // optional, creates new if not provided
  "documentIds": ["uuid"] // optional
}
```

**Response:**
```json
{
  "conversationId": "uuid",
  "messageId": "uuid",
  "response": "Quantum entanglement is a phenomenon where...",
  "emotion": "gentle",
  "avatarState": "thoughtful"
}
```

#### DELETE /api/conversations/:id

Delete a conversation.

**Headers:** Authorization required

**Response:**
```json
{
  "message": "Conversation deleted successfully"
}
```

### Documents

#### POST /api/documents/upload

Upload a document (PDF, DOCX, TXT).

**Headers:**
- Authorization required
- Content-Type: multipart/form-data

**Request:**
- Form data with `file` field

**Response:**
```json
{
  "documentId": "uuid",
  "filename": "report.pdf",
  "extractedText": "This is the beginning of the document..."
}
```

#### GET /api/documents

Get all user documents.

**Headers:** Authorization required

**Response:**
```json
[
  {
    "id": "uuid",
    "filename": "report.pdf",
    "fileType": "application/pdf",
    "fileSize": 102400,
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /api/documents/:id

Get a specific document.

**Headers:** Authorization required

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "filename": "report.pdf",
  "fileType": "application/pdf",
  "fileSize": 102400,
  "filePath": "/uploads/xyz.pdf",
  "extractedText": "Full document text...",
  "uploadedAt": "2024-01-01T00:00:00.000Z"
}
```

#### DELETE /api/documents/:id

Delete a document.

**Headers:** Authorization required

**Response:**
```json
{
  "message": "Document deleted successfully"
}
```

### Voice

#### POST /api/voice/transcribe

Transcribe audio to text.

**Headers:**
- Authorization required
- Content-Type: multipart/form-data

**Request:**
- Form data with `audio` field (audio file)

**Response:**
```json
{
  "text": "Transcribed text from audio"
}
```

#### POST /api/voice/synthesize

Convert text to speech.

**Headers:** Authorization required

**Request:**
```json
{
  "text": "Hello, how are you?"
}
```

**Response:**
- Binary audio data (audio/mpeg)

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message"
}
```

Common status codes:
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error
