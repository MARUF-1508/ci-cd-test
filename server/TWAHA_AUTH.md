# TWAHA Auth API Documentation

Base URL: `http://localhost:5000/api/twaha/auth`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

Tokens are obtained via `/login` or `/register` endpoints.

---

## Endpoints

### 1. Register User

**POST** `/register`

Register a new user account.

#### Request Body
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| username | string | Yes | 3-100 characters, trimmed |
| email | string | Yes | Valid email format, trimmed |
| password | string | Yes | 6-255 characters |

#### Success Response (201 Created)
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "twaha",
    "email": "twaha@gmail.com",
    "createdAt": "2026-09-05T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses
| Status | Code | Message |
|--------|------|---------|
| 400 | 210 | Invalid JSON body |
| 400 | 211 | Username is required |
| 400 | 212 | Username must be at least 3 characters |
| 400 | 213 | Username must be at most 100 characters |
| 400 | 214 | Email is required |
| 400 | 215 | Invalid email format |
| 400 | 216 | Password is required |
| 400 | 217 | Password must be at least 6 characters |
| 400 | 218 | Password must be at most 255 characters |
| 409 | 219 | Email already registered |
| 409 | 220 | Username already taken |
| 409 | 221 | User already exists |
| 500 | 222 | Failed to register user due to internal server error |

---

### 2. Login User

**POST** `/login`

Authenticate a user with email/username and password.

#### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| identifier (or email/username) | string | Yes | Email or username (trimmed) |
| password | string | Yes | User password |

#### Success Response (200 OK)
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "twaha"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses
| Status | Code | Message |
|--------|------|---------|
| 400 | 230 | Invalid JSON body |
| 400 | 231 | Email or username is required |
| 400 | 232 | Password is required |
| 401 | 234 | Invalid credentials |
| 500 | 234 | Failed to login due to internal server error |

---

### 3. Get Account Info

**GET** `/account-info`

Retrieve authenticated user's account information. **Requires authentication.**

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Success Response (200 OK)
```json
{
  "user": {
    "id": 1,
    "username": "twaha",
    "email": "twaha@gmail.com",
    "role": "USER",
    "createdAt": "2026-09-05T12:00:00.000Z"
  }
}
```

#### Error Responses
| Status | Code | Message |
|--------|------|---------|
| 401 | 300 | Unauthorized |
| 404 | 235 | User not found |
| 500 | 236 | Failed to fetch user |

---

### 4. Update Account Role

**PUT** `/update-account-role`

Update a user's role (ADMIN only). **Requires authentication and ADMIN role.**

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Request Body
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| username | string | Yes | Target username |
| role | string | Yes | Must be "USER" or "ADMIN" |

#### Success Response (200 OK)
```json
{
  "username": "twaha",
  "role": "ADMIN"
}
```

#### Error Responses
| Status | Code | Message |
|--------|------|---------|
| 400 | 230 | Invalid JSON body |
| 400 | 250 | Invalid request JSON: role can only be 'USER' or 'ADMIN' |
| 401 | 300 | Unauthorized |
| 401 | 302 | Unauthorized: Action requires 'ADMIN' role |
| 404 | 301 | User not found |
| 500 | 236 | Failed to fetch user |

---

## Data Models

### PublicUserInfo
```typescript
{
  id: number;
  username: string;
  email: string;
  role: string;          // "USER" | "ADMIN"
  createdAt: Date;       // ISO 8601 format
}
```

### JwtPayload
```typescript
{
  id: number;
  username: string;
  email: string;
}
```

## Error Format
All errors follow this structure:
```json
{
  "errCode": number,
  "errMsg": string
}
```

