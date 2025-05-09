You are an expert NestJS backend engineer. Help me generate a structured, production-ready backend project step by step using the following stack:

- NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- Swagger (OpenAPI)
- Social Authentication (Google and Facebook)

Please follow these instructions in strict sequential steps. Don’t skip any step unless I say so. At the end of each step, wait for me to confirm before proceeding to the next.

### Step 1: Project Setup
- Create a new NestJS project with TypeScript.
- Setup ESLint and Prettier for code formatting and linting.
- Configure `.env` support using `@nestjs/config`.

### Step 2: Swagger Integration
- Install and configure Swagger using `@nestjs/swagger`.
- Ensure Swagger UI is available at `/api` in development.
- Add a base API description and version info.

### Step 3: Database Configuration
- Install Prisma ORM and PostgreSQL dependencies.
- Setup a connection to PostgreSQL via `.env` file.
- Generate a basic `prisma/schema.prisma` file with a sample `User` model.
- Run `npx prisma generate` and `prisma migrate dev` to apply initial schema.

### Step 4: Authentication Module
- Setup OAuth2 login with Google and Facebook using `passport` strategies (`@nestjs/passport`, `passport-google-oauth20`, `passport-facebook`).
- Implement Auth module with login routes (`/auth/google`, `/auth/facebook`).
- After successful login, generate and return a JWT token.
- Create a `User` entity that stores basic profile info (id, name, email, profile image, provider).
- Protect routes using `JwtAuthGuard`.

### Step 5: Role Management
- Add `role` field in `User` model (`USER`, `MODERATOR`).
- Implement role-based access control in NestJS using custom decorators and guards.

### Step 6: Food Image Upload & AI SDK Integration
- Setup file/image upload endpoint using `@nestjs/platform-express` and Multer.
- Accept an image and store it temporarily.
- Integrate with an AI SDK (e.g., CalorieMama, Google Vision + Spoonacular) to extract:
  - Meal name
  - Ingredients
  - Nutritional values
- Save extracted data in database under a `FoodLog` model.

### Step 7: Nutrition Tracking
- Create `Nutrition` and `FoodLog` models in Prisma.
- Implement endpoints to fetch user's daily/monthly/yearly nutrition reports.
- Aggregate totals (calories, protein, etc.) in responses.

### Step 8: Moderator Goals
- Create a `Goal` model to store daily nutrition targets.
- Allow moderators to assign/edit user-specific nutrition goals.
- Implement routes to fetch and compare user's actual vs target intake.

### Step 9: Social Connections
- Implement user-to-user connection model (`Connection`) for sharing food logs.
- Endpoints: send request, accept, view connected users’ logs.

### Step 10: Finalize and Secure
- Protect all routes with proper guards.
- Add validation using `class-validator`.
- Add pagination and filtering where needed.
- Ensure Swagger is updated with all models and secured endpoints.
- Prepare `.env.example` and README.md with usage instructions.

Wait for my confirmation after each step before continuing. Ask me if I want to modify or add anything before moving forward.
