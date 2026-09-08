# Delivery address lookup

The booking popup uses browser location coordinates to generate a disabled Google Maps link and request a readable address. Customers can correct the address and add their flat number without changing the detected map pin. Both `address` and `mapsLink` are passed to the booking callback.

Enable the Google Geocoding API for your Google Cloud project and configure its server key in `backend/.env`:

```dotenv
GOOGLE_MAPS_API_KEY=your_server_key
```

Keep the key on the backend; never use a `VITE_` variable for it. Restrict it to the Geocoding API and your server IPs. Restart the backend after configuration. Google requires billing to use the service.

Run the backend on port 5000 and the frontend with `npm run dev`. Vite proxies `/api` to the backend. In production, proxy `/api` to your backend or configure `VITE_API_BASE_URL` with its origin before building.

Without a configured key, or when lookup fails, the captured Google Maps link is retained and the customer can enter the full address manually. Location access requires HTTPS or localhost.

The existing booking callback currently validates the rental dates only; it does not save or send customer details to a backend. Connect that callback to your booking storage or delivery notification service before relying on it for actual orders.

Google documentation: https://developers.google.com/maps/documentation/geocoding/requests-reverse-geocoding
