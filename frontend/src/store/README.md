# Redux state

store.ts only configures Redux. authSlice.ts contains login data types, initial
state, and the setLoginDetails/logout reducers. hooks.ts exports typed Redux hooks.

JWT decoding and saved-session loading live in ../auth/session.ts.
Persistence, expiry timers, and browser listeners live in ../auth/sessionLifecycle.ts.
main.tsx initializes the session once before rendering and cleans up on hot reload.

Read state with useAppSelector(state => state.auth.loginDetails?.user).
Update it with dispatch(setLoginDetails(details)) or dispatch(logout()).
