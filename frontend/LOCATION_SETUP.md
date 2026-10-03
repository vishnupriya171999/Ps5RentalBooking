# Delivery address lookup

The booking popup uses browser location coordinates to generate a disabled Google Maps link and request a readable address. Customers can correct the address and add their flat number without changing the detected map pin. Both `address` and `mapsLink` are passed to the booking callback.

The frontend calls `POST /api/location/reverse`, but that endpoint is not yet
implemented in this backend. The following key setup will only take effect after
adding the backend geocoding handler. Configure its server key in `backend/.env`:

```dotenv
GOOGLE_MAPS_API_KEY=your_server_key
```

Keep the key on the backend; never use a `VITE_` variable for it. Restrict it to the Geocoding API and your server IPs. Restart the backend after configuration. Google requires billing to use the service.

Set local host and ports in `../network.config.json` and run each application's
`npm run dev`. Vite proxies `/api` to the shared backend address. In production,
configure `VITE_API_BASE_URL` with the backend origin before building, and allow
the frontend origin through backend `CORS_ORIGINS`. See
[Network configuration](../NETWORK_CONFIGURATION.md).

Without a configured key, or when lookup fails, the captured Google Maps link is retained and the customer can enter the full address manually. Location access requires HTTPS or localhost.

The existing booking callback currently validates the rental dates only; it does not save or send customer details to a backend. Connect that callback to your booking storage or delivery notification service before relying on it for actual orders.

Google documentation: https://developers.google.com/maps/documentation/geocoding/requests-reverse-geocoding
