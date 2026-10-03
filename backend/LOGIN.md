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
expiry and maximum age. Exceptions are POST /auth/login and
GET /availability/consoles for the customer site. GET /auth/me returns the
verified user. Invalid or expired tokens return 401.

Frontend interceptors attach the JWT and clear Redux/localStorage on protected
API 401 responses. A global timer also logs out at expiry without an API call;
focus and visibility checks handle sleeping tabs. Refresh does not extend expiry.

POST /api/v1/auth/managers accepts name, mobile, password and role as plain JSON.
It requires a valid bearer token and a currently active ADMIN account in the
database. The server checks the current database role, so a previously issued
ADMIN token does not authorize an account that has since been demoted or disabled.
The backend hashes passwords before insertion. The requested new account role
does not grant the caller permission to create it.

Use an existing active ADMIN account to add managers. For a new database, provision
the first ADMIN through a trusted database setup process using a bcrypt password
hash and a valid password-expiry date. There is no public first-user bypass.

`postman/security-managers.postman_collection.json` is an optional collection of
manual API test requests. The frontend, backend server, and deployment do not
load it. It contains no fixed backend hostname or port and no real credentials.

Import it into Postman and set `backendOrigin` to the backend origin from
`../network.config.json`, or to the deployed HTTPS origin. Do not append `/api/v1`
or a trailing slash; each request already includes its API path. Postman is a
separate client and does not automatically read the application's network config.
Use separate Postman environments for local and deployed backend addresses.

Set `loginMobile` and `loginPassword` for an existing administrator, run Login,
and copy the response token into `adminToken`. To create an account, fill
`managerName`, `managerMobile`, `managerPassword`, and `managerRole`. Creation
sends the bearer token automatically. Login and new-account details are separate
so editing a new manager's details does not overwrite the login credentials.
Keep actual credentials/tokens in local Postman values and out of committed
collection or environment exports. Both requests use normal JSON.

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
  optional boolean `isActive` (defaults to true). Requires an active ADMIN account.

Directory reads require a bearer token and a currently active manager account in the database, regardless of role. Creation and updates additionally require the ADMIN role. Administrators cannot deactivate or demote themselves.
Inactive accounts cannot log in. Duplicate mobile numbers return 409; missing
records return 404. Responses never include password hashes.

The frontend directory is `/admin/dashboard/managers`. Clicking a name or Add manager opens a shared centered modal for viewing, adding and updating without navigating away. It uses live API data, uppercase initial avatars,
search and status filters, and a table that scrolls within the viewport.
