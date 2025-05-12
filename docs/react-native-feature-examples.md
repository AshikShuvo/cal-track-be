# React Native Feature Examples

## Common Features Implementation Guide

### 1. Authentication Feature

#### Directory Structure
```
features/
└── auth/
    ├── components/
    │   ├── LoginForm.tsx
    │   ├── SignupForm.tsx
    │   ├── ForgotPasswordForm.tsx
    │   └── index.ts
    ├── screens/
    │   ├── LoginScreen.tsx
    │   ├── SignupScreen.tsx
    │   ├── ForgotPasswordScreen.tsx
    │   └── index.ts
    ├── services/
    │   └── auth-api.ts
    ├── store/
    │   ├── auth.slice.ts
    │   └── auth.selectors.ts
    ├── types/
    │   └── index.ts
    └── index.ts
```

#### API Endpoints
```typescript
// services/auth-api.ts
interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  REFRESH_TOKEN: '/api/auth/refresh-token',
};

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return api.post(AUTH_ENDPOINTS.LOGIN, credentials);
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    return api.post(AUTH_ENDPOINTS.SIGNUP, data);
  }
}
```

#### State Management
```typescript
// store/auth.slice.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isLoading: false,
    error: null,
  } as AuthState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<AuthResponse>) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});
```

### 2. User Profile Feature

#### Directory Structure
```
features/
└── profile/
    ├── components/
    │   ├── ProfileHeader.tsx
    │   ├── ProfileForm.tsx
    │   ├── AvatarUpload.tsx
    │   └── index.ts
    ├── screens/
    │   ├── ProfileScreen.tsx
    │   ├── EditProfileScreen.tsx
    │   └── index.ts
    ├── services/
    │   └── profile-api.ts
    └── types/
        └── index.ts
```

#### API Endpoints
```typescript
// services/profile-api.ts
interface ProfileUpdateData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: File;
}

const PROFILE_ENDPOINTS = {
  GET_PROFILE: '/api/users/profile',
  UPDATE_PROFILE: '/api/users/profile',
  UPLOAD_AVATAR: '/api/users/avatar',
};

class ProfileService {
  async getProfile(): Promise<User> {
    return api.get(PROFILE_ENDPOINTS.GET_PROFILE);
  }

  async updateProfile(data: ProfileUpdateData): Promise<User> {
    return api.put(PROFILE_ENDPOINTS.UPDATE_PROFILE, data);
  }
}
```

### 3. Product Listing Feature

#### Directory Structure
```
features/
└── products/
    ├── components/
    │   ├── ProductList.tsx
    │   ├── ProductCard.tsx
    │   ├── ProductFilters.tsx
    │   └── index.ts
    ├── screens/
    │   ├── ProductListScreen.tsx
    │   ├── ProductDetailScreen.tsx
    │   └── index.ts
    ├── services/
    │   └── products-api.ts
    ├── hooks/
    │   ├── useProducts.ts
    │   └── useProductFilters.ts
    └── types/
        └── index.ts
```

#### API Endpoints and Types
```typescript
// types/index.ts
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'name' | 'newest';
  page: number;
  limit: number;
}

// services/products-api.ts
const PRODUCT_ENDPOINTS = {
  LIST: '/api/products',
  DETAIL: (id: string) => `/api/products/${id}`,
  CATEGORIES: '/api/products/categories',
};

class ProductService {
  async getProducts(filters: ProductFilters): Promise<PaginatedResponse<Product>> {
    return api.get(PRODUCT_ENDPOINTS.LIST, { params: filters });
  }

  async getProductById(id: string): Promise<Product> {
    return api.get(PRODUCT_ENDPOINTS.DETAIL(id));
  }
}
```

### 4. Shopping Cart Feature

#### Directory Structure
```
features/
└── cart/
    ├── components/
    │   ├── CartList.tsx
    │   ├── CartItem.tsx
    │   ├── CartSummary.tsx
    │   └── index.ts
    ├── screens/
    │   ├── CartScreen.tsx
    │   └── CheckoutScreen.tsx
    ├── services/
    │   └── cart-api.ts
    ├── store/
    │   ├── cart.slice.ts
    │   └── cart.selectors.ts
    └── types/
        └── index.ts
```

#### State and API Implementation
```typescript
// types/index.ts
interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl: string;
}

interface Cart {
  items: CartItem[];
  total: number;
}

// store/cart.slice.ts
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0,
  } as Cart,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        item => item.productId === action.payload.productId
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.total = calculateTotal(state.items);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        item => item.productId !== action.payload
      );
      state.total = calculateTotal(state.items);
    },
  },
});
```

### 5. Order Processing Feature

#### Directory Structure
```
features/
└── orders/
    ├── components/
    │   ├── OrderList.tsx
    │   ├── OrderDetail.tsx
    │   ├── OrderStatus.tsx
    │   └── index.ts
    ├── screens/
    │   ├── OrdersScreen.tsx
    │   ├── OrderDetailScreen.tsx
    │   └── index.ts
    ├── services/
    │   └── orders-api.ts
    └── types/
        └── index.ts
```

#### API Endpoints and Types
```typescript
// types/index.ts
interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  shippingAddress: Address;
}

enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// services/orders-api.ts
const ORDER_ENDPOINTS = {
  CREATE: '/api/orders',
  LIST: '/api/orders',
  DETAIL: (id: string) => `/api/orders/${id}`,
  CANCEL: (id: string) => `/api/orders/${id}/cancel`,
};

class OrderService {
  async createOrder(orderData: CreateOrderDto): Promise<Order> {
    return api.post(ORDER_ENDPOINTS.CREATE, orderData);
  }

  async getOrders(): Promise<Order[]> {
    return api.get(ORDER_ENDPOINTS.LIST);
  }

  async getOrderById(id: string): Promise<Order> {
    return api.get(ORDER_ENDPOINTS.DETAIL(id));
  }
}
```

## Common Components Implementation

### 1. Form Components
```typescript
// components/common/FormInput.tsx
interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry,
}) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      style={[styles.input, error && styles.inputError]}
      secureTextEntry={secureTextEntry}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);
```

### 2. Loading States
```typescript
// components/common/LoadingState.tsx
interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  children,
}) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  return <>{children}</>;
};
```

## Navigation Configuration

```typescript
// navigation/AppNavigator.tsx
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  Orders: undefined;
  OrderDetail: { orderId: string };
  Profile: undefined;
  EditProfile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Auth" component={AuthNavigator} />
    <Stack.Screen name="Main" component={MainTabNavigator} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Cart" component={CartScreen} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen name="Orders" component={OrdersScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
  </Stack.Navigator>
);
```

## Theme Configuration

```typescript
// theme/index.ts
export const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    text: {
      primary: '#000000',
      secondary: '#8E8E93',
      error: '#FF3B30',
    },
    border: '#C7C7CC',
  },
  spacing: {
    xs: 4,
    small: 8,
    medium: 16,
    large: 24,
    xl: 32,
  },
  typography: {
    sizes: {
      small: 12,
      medium: 14,
      large: 16,
      xl: 20,
      xxl: 24,
    },
    weights: {
      regular: '400',
      medium: '500',
      bold: '700',
    },
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
  },
};
```

This guide provides specific implementation details for common mobile app features. Each feature includes:
- Complete directory structure
- API endpoint definitions
- Type definitions
- State management implementation
- Component structure
- Navigation configuration

Use these examples as templates when implementing new features in the application. 