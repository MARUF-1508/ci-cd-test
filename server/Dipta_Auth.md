# Dipta Auth - JWT Authentication & RBAC Documentation

This document describes the isolated authentication and authorization
system implemented for `dipta_users`.

The authentication module provides user registration, login, JWT-based
authentication, protected routes, and role-based access control. The
existing post CRUD API remains separate except where authentication is
required for testing RBAC.

------------------------------------------------------------------------

# User Model & Database

**Table:** `dipta_users`

``` sql
CREATE TABLE dipta_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

The user role is restricted to:

    user
    admin

------------------------------------------------------------------------

## Types

User type contains:

``` ts
type DiptaRole = "user" | "admin";

type DiptaUser = {
  id: number;
  username: string;
  email: string;
  password: string;
  role: DiptaRole;
  created_at: Date;
  updated_at: Date;
};
```

Password is removed before sending user information through API
responses.

JWT payload:

``` ts
type DiptaJwtPayload = {
  id:number;
  username:string;
  email:string;
  role:DiptaRole;
};
```

------------------------------------------------------------------------

# JWT Authentication

JWT tokens are generated after successful registration and login.

JWT payload contains:

``` json
{
  "id":1,
  "username":"dipta",
  "email":"dipta@test.com",
  "role":"user"
}
```

Token usage:

    Authorization: Bearer <token>

The token is stored in Postman collection variables for protected
endpoint testing.

------------------------------------------------------------------------

# Middleware

## Authentication Middleware

`diptaAuthMiddleware`

Responsibilities:

-   Checks Authorization header
-   Extracts Bearer token
-   Verifies JWT token
-   Stores authenticated user information

Successful authentication stores:

``` ts
c.set("diptaUser", payload)
```

Authentication failures return:

    401 Unauthorized

------------------------------------------------------------------------

## Role Based Access Control Middleware

`diptaRoleMiddleware(requiredRole)`

Checks the role from JWT payload.

Example:

``` ts
diptaRoleMiddleware("admin")
```

Flow:

    JWT Verified
          |
          ↓
    Read User Role
          |
          ↓
    Role matches?
          |
      Yes → Allow request
          |
      No → 403 Forbidden

------------------------------------------------------------------------

# Routes

All authentication routes are mounted under:

    /api/dipta/auth

Available routes:

    POST /api/dipta/auth/register

    POST /api/dipta/auth/login

    GET /api/dipta/auth/me

    GET /api/dipta/auth/admin

------------------------------------------------------------------------

# POST /api/dipta/auth/register

Public endpoint used to create a new user.

## Request

``` json
{
    "username":"dipta",
    "email":"dipta@test.com",
    "password":"123456",
    "role":"user"
}
```

## Process

The endpoint:

-   Validates input
-   Checks duplicate email
-   Hashes password
-   Creates user
-   Generates JWT token

## Success Response

    201 Created

Example:

``` json
{
    "message":"User registered successfully",
    "user":{
        "id":1,
        "username":"dipta",
        "email":"dipta@test.com",
        "role":"user"
    },
    "token":"jwt_token"
}
```

------------------------------------------------------------------------

# POST /api/dipta/auth/login

Authenticates existing users.

## Request

``` json
{
    "email":"dipta@test.com",
    "password":"123456"
}
```

## Success Response

    200 OK

Returns JWT token.

Example:

``` json
{
    "message":"Login successful",
    "token":"jwt_token"
}
```

------------------------------------------------------------------------

# GET /api/dipta/auth/me

Protected endpoint.

Header:

    Authorization: Bearer <token>

Returns authenticated user information.

Success:

    200 OK

------------------------------------------------------------------------

# GET /api/dipta/auth/admin

Admin-only protected endpoint.

Requires:

    Authorization: Bearer <admin_token>

Uses:

``` ts
diptaAuthMiddleware
+
diptaRoleMiddleware("admin")
```

## Admin Access

Response:

    200 OK

Example:

``` json
{
    "message":"Admin access granted",
    "user":{
        "role":"admin"
    }
}
```

## Normal User Access

Using normal user token:

    403 Forbidden

This confirms RBAC implementation.

------------------------------------------------------------------------

# Postman Tests

File:

    server/tests/postman/dipta_auth.postman_collection.json

The collection contains:

-   User registration
-   User login
-   JWT token storage
-   Protected endpoint validation
-   Missing token test
-   Invalid token test
-   Duplicate email test
-   Admin registration
-   Admin login
-   User attempting admin endpoint
-   Admin accessing admin endpoint
-   Post creation authentication flow

The collection uses:

    POST /api/dipta/auth/register

    POST /api/dipta/auth/login

    GET /api/dipta/auth/me

    GET /api/dipta/auth/admin

    POST /api/posts

------------------------------------------------------------------------

# Postman Execution Order

Run requests in this order:

    1. register_user

    2. login_user

    3. Valid Token Protected Endpoint Test

    4. Missing Token

    5. Invalid token

    6. Duplicate_Email

    7. Register_Admin

    8. Login_Admin

    9. Create_post_user

    10. Register_2nd_user

    11. Log_in_second_user

    12. Test Admin Endpoint With User Token

    13. Admin Endpoint With Admin Token

------------------------------------------------------------------------

# RBAC Testing

## User Token

Request:

    GET /api/dipta/auth/admin

Authorization:

    Bearer {{token}}

Expected:

    403 Forbidden

Reason:

User role is:

    user

and does not have admin permission.

------------------------------------------------------------------------

## Admin Token

Request:

    GET /api/dipta/auth/admin

Authorization:

    Bearer {{admin_token}}

Expected:

    200 OK

Reason:

JWT contains:

    role = admin

and passes RBAC middleware.

------------------------------------------------------------------------

# Example cURL

## Register User

``` bash
curl -X POST http://localhost:5000/api/dipta/auth/register \
-H "Content-Type: application/json" \
-d '{"username":"dipta","email":"dipta@test.com","password":"123456","role":"user"}'
```

## Login

``` bash
curl -X POST http://localhost:5000/api/dipta/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"dipta@test.com","password":"123456"}'
```

## Protected Route

``` bash
curl http://localhost:5000/api/dipta/auth/me \
-H "Authorization: Bearer <token>"
```

## Admin Route

``` bash
curl http://localhost:5000/api/dipta/auth/admin \
-H "Authorization: Bearer <admin_token>"
```
