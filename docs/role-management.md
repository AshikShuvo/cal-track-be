# Role Management Guide

## Overview

The CalTrack API implements a hierarchical role-based access control (RBAC) system to manage user permissions and access to different features of the application.

## Role Hierarchy

The system has three role levels, each with increasing privileges:

1. **USER** (Base Level)
   - Access to personal features
   - Can manage own profile
   - Can create and view own food logs
   - Can connect with other users

2. **MODERATOR**
   - All USER permissions
   - Can review and moderate user content
   - Can assign nutrition goals to users
   - Can access moderation dashboard

3. **ADMIN**
   - All MODERATOR permissions
   - Full system access
   - Can manage user roles
   - Can access system settings
   - Can view system analytics

## Implementation

### 1. Using Role Decorators

```typescript
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('nutrition')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NutritionController {
  @Get('goals/:userId')
  @Roles(Role.MODERATOR)
  async getUserGoals(@Param('userId') userId: string) {
    // Only MODERATOR and ADMIN can access
  }

  @Post('system-settings')
  @Roles(Role.ADMIN)
  async updateSettings(@Body() settings: SystemSettings) {
    // Only ADMIN can access
  }
}
```

### 2. Checking User Roles in Services

```typescript
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UserService {
  async canModifyUser(currentUser: User, targetUserId: string): Promise<boolean> {
    if (currentUser.role === Role.ADMIN) return true;
    if (currentUser.role === Role.MODERATOR) return true;
    return currentUser.id === targetUserId;
  }
}
```

## Authentication

### Test Users

The system comes with pre-seeded test users for each role:

```typescript
// Regular User
email: 'user@example.com'
password: 'Password123!'
role: Role.USER

// Moderator
email: 'moderator@example.com'
password: 'Password123!'
role: Role.MODERATOR

// Admin
email: 'admin@example.com'
password: 'Password123!'
role: Role.ADMIN
```

### Getting JWT Token

```bash
# Login to get JWT token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Password123!"}'
```

## Testing Endpoints

### 1. User Level Endpoints

```bash
# Access user profile (all authenticated users)
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Moderator Level Endpoints

```bash
# Access moderation dashboard (MODERATOR and ADMIN only)
curl http://localhost:3000/api/moderation/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Admin Level Endpoints

```bash
# Access system settings (ADMIN only)
curl http://localhost:3000/api/admin/settings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Error Handling

The system returns appropriate HTTP status codes:

- **401 Unauthorized**: No valid JWT token provided
- **403 Forbidden**: Valid token but insufficient role permissions
- **404 Not Found**: Resource not found
- **400 Bad Request**: Invalid request parameters

Example error response:
```json
{
  "statusCode": 403,
  "message": "You need one of these roles to access this resource: ADMIN",
  "error": "Forbidden"
}
```

## Best Practices

1. **Always Use Guards Together**
   ```typescript
   @UseGuards(JwtAuthGuard, RolesGuard)  // Order matters!
   ```

2. **Role Inheritance**
   - Higher roles automatically include lower role permissions
   - No need to specify multiple roles if targeting higher roles

3. **Controller Level Guards**
   ```typescript
   @Controller('admin')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(Role.ADMIN)
   export class AdminController {
     // All endpoints require ADMIN role
   }
   ```

4. **Method Level Override**
   ```typescript
   @Controller('users')
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles(Role.USER)  // Default role for all endpoints
   export class UserController {
     @Get('moderation')
     @Roles(Role.MODERATOR)  // Override for specific endpoint
     moderationEndpoint() {
       // Only MODERATOR and ADMIN can access
     }
   }
   ```

## Testing

### Unit Tests

```typescript
describe('RolesGuard', () => {
  it('should allow access when user has required role', () => {
    // Test implementation
  });

  it('should deny access when user lacks required role', () => {
    // Test implementation
  });
});
```

### E2E Tests

```typescript
describe('Role-based endpoints', () => {
  it('should allow admin to access all endpoints', () => {
    // Test implementation
  });

  it('should restrict user from accessing admin endpoints', () => {
    // Test implementation
  });
});
```

## Troubleshooting

1. **Token Invalid or Expired**
   - Ensure your JWT token is valid and not expired
   - Check if you're including the token in the Authorization header

2. **Permission Denied**
   - Verify your user has the correct role
   - Check if you're using the correct role decorator

3. **Guards Not Working**
   - Ensure guards are in the correct order
   - Verify JWT strategy is properly configured

## Support

For additional support or to report security issues:
1. Open an issue in the repository
2. Contact the security team
3. Check the security documentation

Remember to never share your JWT tokens and always follow security best practices when handling role-based access control. 