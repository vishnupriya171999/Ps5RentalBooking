# Login and sessions

POST /api/v1/auth/login accepts normal JSON with mobile and password.
The backend checks SECURITY_MANAGERS and compares PASSWORD using bcrypt.
Wrong credentials return 401 with the same common message. Expired passwords
return 403. Successful login returns a signed RS256 JWT and public manager details.
All stored roles can log in; add role-specific authorization when adding business APIs.

Tokens expire after 8 hours, or sooner if the password expires. JWT_PRIVATE_KEY
signs tokens and JWT_PUBLIC_KEY verifies them. Both remain backend configuration.
JWTs are signed, not encrypted. Frontend jwt-decode needs no secret key and does
not verify signatures. Use HTTPS in production for credentials and tokens.

The central authenticate middleware protects /api/v1 routes by default and
requires Authorization: Bearer <token>. It verifies signature, issuer, audience,
expiry and maximum age. Exceptions are POST /auth/login, POST /auth/managers,
and GET /availability/consoles for the customer site. GET /auth/me returns the
verified user. Invalid or expired tokens return 401.

Frontend interceptors attach the JWT and clear Redux/localStorage on protected
API 401 responses. A global timer also logs out at expiry without an API call;
focus and visibility checks handle sleeping tabs. Refresh does not extend expiry.

POST /api/v1/auth/managers accepts name, mobile, password and role as plain JSON.
No setup key or encryption script is required. The backend hashes passwords before insertion.
Creation is public as requested, so anyone who can reach it can create accounts.

Import postman/security-managers.postman_collection.json. Set baseUrl to
http://localhost:5000/api/v1 and fill mobile/password (plus adminName/role for
creation). Both requests use normal JSON without pre-request scripts.

npm test uses stubbed database queries and never creates real accounts.

## Managers directory

Run `npx tsx scripts/migrate-manager-status.ts` before deploying the manager API.
The migration adds `IS_ACTIVE` with a default of true for existing and new records;
it is safe to run again.

- `GET /api/v1/auth/managers`: list public account fields.
- `GET /api/v1/auth/managers/:mobile`: details using `findManagerByMobile`.
- `PUT /api/v1/auth/managers/:id`: update name, mobile, role and `isActive`.
  Password is optional; omitted or empty preserves the hash and expiry.
  A new password resets expiry to one month from the update.
- `POST /api/v1/auth/managers`: create with name, mobile, role, password and
  optional boolean `isActive` (defaults to true). The existing public creation
  contract remains unchanged.

Directory reads require a bearer token and a currently active manager account in the database, regardless of role. Updates additionally require the ADMIN role. Administrators cannot deactivate or demote themselves.
Inactive accounts cannot log in. Duplicate mobile numbers return 409; missing
records return 404. Responses never include password hashes.

The frontend directory is `/admin/dashboard/managers`. Clicking a name or Add manager opens a shared centered modal for viewing, adding and updating without navigating away. It uses live API data, uppercase initial avatars,
search and status filters, and a table that scrolls within the viewport.
