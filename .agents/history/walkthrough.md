# Walkthrough: Implementing Auth APIs - Login & Register

Completed implementation of user registration and login REST APIs with full Swagger documentation, layered architecture, and custom DNS network troubleshooting for MongoDB Atlas.

## 🚀 Accomplishments

1. **Architecture Realignment**:
   - Split application logic into standard layered modules:
     - `app.js` — Pure Express app middleware, routes, and global error handling.
     - `server.js` — Entry point loading environment variables and connecting to the database.
     - `src/configs/` — Central database and Swagger UI setups.
     - `src/models/` — MongoDB database schemas.
     - `src/daos/` — Direct data access objects isolating database logic.
     - `src/services/` — Business logic layer handling encryption, token signing, and validations.
     - `src/controllers/` — Thin controller functions handling request/response mappings.
     - `src/middlewares/` — Global error handler and input validators.

2. **Endpoints Created**:
   - `POST /auth/register` — Validates credentials, encrypts password using `bcryptjs` (salt rounds = 12), saves user, and issues a JWT token.
   - `POST /auth/login` — Authenticates user, compares password hashes, and issues a JWT token.

3. **Validation & Security**:
   - Implemented strict input validation with `express-validator` to ensure valid emails, minimum name length (2), and safe passwords (6+ chars).
   - Configured `jsonwebtoken` (JWT) for stateless session handling with customizable expiration.

4. **Interactive Documentation**:
   - Integrated `swagger-jsdoc` and `swagger-ui-express`.
   - Swagger interactive docs served at `http://localhost:5001/api-docs` with full security scheme capabilities (JWT Bearer Auth).

5. **DNS & Network Resolution Fix**:
   - Resolved local ISP/router DNS timeout blocks for MongoDB SRV records by rewriting connection URI to direct node shards in `.env`.

---

## 🔍 Validation Results

### API & Database Connection
The server boots clean and connects directly to the Atlas cloud replica set:
```
[nodemon] starting `node server.js`
✅ MongoDB connected: ac-1hafsqg-shard-00-00.xjr7ugi.mongodb.net
✅ Server running on http://localhost:5001
📚 Swagger docs at http://localhost:5001/api-docs
```

### Swagger UI Rendering
Verified visually in browser at `http://localhost:5001/api-docs`. Registration and login functions run successfully returning signed JSON Web Tokens.
