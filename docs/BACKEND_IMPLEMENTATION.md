# Backend Service Implementation Example
## OpenAI Integration for BankGPT

This directory contains example implementations for the backend services needed to integrate OpenAI APIs into the BankGPT application.

### Project Structure
```
backend/
├── src/
│   ├── controllers/
│   │   └── chatController.js
│   ├── services/
│   │   ├── openaiService.js
│   │   ├── conversationService.js
│   │   └── cacheService.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   └── validation.js
│   ├── utils/
│   │   ├── prompts.js
│   │   ├── logger.js
│   │   └── metrics.js
│   ├── config/
│   │   └── index.js
│   └── app.js
├── tests/
├── package.json
└── README.md
```

### Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key and other settings
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

### API Endpoints

#### POST /api/chat
Send a message to the AI banking advisor.

**Request:**
```json
{
  "message": "What are the best savings account options?",
  "conversationId": "conv_123456"
}
```

**Response:**
```json
{
  "response": "For savings accounts, I recommend looking into high-yield savings accounts...",
  "conversationId": "conv_123456",
  "usage": {
    "promptTokens": 45,
    "completionTokens": 67,
    "totalTokens": 112
  }
}
```

#### GET /api/health
Check service health status.

**Response:**
```json
{
  "status": "healthy",
  "checks": {
    "openai": {"status": "healthy"},
    "database": {"status": "healthy"},
    "cache": {"status": "healthy"}
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Configuration

Environment variables required:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500
RATE_LIMIT_REQUESTS_PER_MINUTE=60
DAILY_COST_LIMIT=50
MONGODB_URI=mongodb://localhost:27017/bankgpt
REDIS_URL=redis://localhost:6379
NODE_ENV=development
PORT=3000
```

### Security Features

- **API Key Protection**: Never exposed to frontend
- **Rate Limiting**: Configurable per-user and global limits
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Secure cross-origin requests
- **Request Logging**: All requests logged for monitoring

### Cost Management

- **Token Tracking**: Monitor usage in real-time
- **Budget Alerts**: Automatic alerts at threshold levels
- **Response Caching**: Reduce duplicate API calls
- **Smart Prompts**: Optimized for token efficiency

### Monitoring

- **Health Checks**: Automated service monitoring
- **Performance Metrics**: Response time tracking
- **Error Tracking**: Comprehensive error logging
- **Usage Analytics**: Detailed usage statistics

### Deployment

The service is designed to be deployed using Docker:

```bash
docker build -t bankgpt-backend .
docker run -p 3000:3000 --env-file .env bankgpt-backend
```

For production deployment, use the provided docker-compose.yml with proper environment configuration.

### Testing

Run the test suite:

```bash
npm test                  # Run all tests
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:coverage    # Run tests with coverage
```

### Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Ensure all tests pass before submitting

### Support

For questions or issues, please refer to the main project documentation or create an issue in the repository.