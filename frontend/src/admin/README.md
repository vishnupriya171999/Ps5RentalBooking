# Admin panel

Open `/admin` to sign in with a mobile number and password. Successful backend
authentication opens `/admin/dashboard`. Redux holds the login details and
localStorage restores them on refresh. Sign out clears both.

`AdminPanel.tsx` declares the routes. `AdminLogin.tsx` uses `useNavigate()` to open
the dashboard without a callback prop. `AdminDashboard.tsx` contains the responsive
dashboard and its sample views; records live in `dashboardData.ts`.

Search, status filters, order details, revenue periods, schedule, availability,
and inventory use fictional sample data. No booking or inventory mutations are
connected. Customer navigation stays at `/customer`.

The client route guard checks the local session. Before connecting real admin
records, protect backend endpoints with JWT verification and admin permissions.
See [Redux setup](../store/README.md) and [backend login](../../../backend/LOGIN.md).

The login matches the customer brand and dark theme. Its photo background has no
grid overlay. Decorative controllers fall behind the form and respect reduced motion.

Photo source: https://images.unsplash.com/photo-1606144042614-b2417e99c4e3
