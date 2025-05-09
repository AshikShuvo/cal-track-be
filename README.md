# Calorie Tracker API

A comprehensive REST API for tracking daily calorie intake with social features and AI-powered food recognition.

## Features

- 🔐 OAuth2 Authentication (Google & Facebook)
- 📊 Daily/Monthly/Yearly Nutrition Reports
- 🤖 AI-Powered Food Image Analysis
- 👥 Social Connections & Food Log Sharing
- 👮 Role-Based Access Control
- 📱 Mobile-Friendly API Design
- 📚 OpenAPI (Swagger) Documentation

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: PostgreSQL with Prisma ORM
- **Documentation**: Swagger/OpenAPI
- **Authentication**: Passport.js with JWT
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd cal-track-be
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration.

4. Start the development server:
   ```bash
   npm run start:dev
   ```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3001/api/docs
```

## Mobile Integration

For detailed instructions on implementing authentication in your React Native mobile application, please refer to our [Authentication Implementation Guide](docs/auth-implementation.md).

The guide covers:
- Setting up authentication in React Native
- Implementing social login (Google & Facebook)
- Handling JWT tokens
- Error handling and best practices
- Code examples and troubleshooting

## Available Scripts

- `npm run start:dev` - Start the development server
- `npm run build` - Build the application
- `npm run start:prod` - Start the production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:cov` - Generate test coverage report

## Project Structure

```
src/
├── common/              # Common utilities, decorators, and interfaces
├── config/             # Configuration modules and validation
├── modules/            # Feature modules (auth, users, nutrition, etc.)
├── app.module.ts       # Main application module
└── main.ts            # Application entry point
```

## API Endpoints

- `GET /api/v1/health` - Health check endpoint
- `/api/v1/auth/*` - Authentication endpoints
- `/api/v1/users/*` - User management
- `/api/v1/nutrition/*` - Nutrition tracking

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Application port | 3001 |
| NODE_ENV | Environment | development |
| DATABASE_URL | PostgreSQL connection URL | - |
| JWT_SECRET | JWT signing key | - |
| GOOGLE_CLIENT_ID | Google OAuth client ID | - |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret | - |
| FACEBOOK_CLIENT_ID | Facebook OAuth client ID | - |
| FACEBOOK_CLIENT_SECRET | Facebook OAuth client secret | - |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

This project is licensed under the [MIT License](LICENSE).

## Support

For support, email [your-email@example.com](mailto:your-email@example.com) or open an issue in the repository.