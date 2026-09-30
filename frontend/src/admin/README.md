# Admin login

Open `/admin` to view the admin login screen. `AdminLogin.tsx`, its scoped
stylesheet, and its background image live in this directory.

This is a login-only screen matching the customer's dark blue theme, with a
full-screen PS5 photo background, a login card, and administrator welcome copy. It contains no
module descriptions or customer navigation. The separate customer website
remains at `/customer`.

The compact layout fits common desktop, tablet, and phone viewports without
page scrolling. Short viewports hide decorative content to prioritize the form.
Very small viewports or accessibility zoom can still scroll to keep controls reachable.
Small decorative controller icons fall behind the content and never intercept
pointer events. The photo background has no grid overlay. There is no motion button; background animations are
disabled automatically for reduced-motion preferences. Mobile
layouts use fewer controller icons and keep the welcome message in the form.

Mobile number/password fields use inline required-field validation with reserved error space. The mobile field accepts
a 10-digit Indian mobile number with a displayed +91 prefix. The password visibility control
works, but submission does not authenticate, save credentials, or grant access.
Valid submissions show no placeholder message; authentication will be connected later.
Future admin APIs must enforce authentication and admin authorization on the
server; the route itself is not an access-control boundary.

Background image: the PS5 image already referenced by the public site's hero,
stored locally for this page. Source:
https://images.unsplash.com/photo-1606144042614-b2417e99c4e3
