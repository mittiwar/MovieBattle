# movieidiots: For the love of movies

A responsive React fan-poll experience for movie lovers. The current edition celebrates Indian cinema icons, with nominee portraits, secure one-account voting, live fan results, passwordless email links, and an admin poll creator.

## Stack

- React 19 with component state and hooks.
- HTM for JSX-free tagged templates in the browser.
- Lucide React icons.
- Supabase JavaScript client, Auth, Postgres, RLS, and database RPCs.
- Responsive CSS; no build step is needed. React and Lucide modules load from esm.sh, so the page needs an internet connection.

## Run locally

Serve this folder over HTTP and open the address from the server. Do not open `index.html` directly; OAuth cannot return to a `file://` URL.

With Node.js installed, run `npx serve .`. The current local preview is at [http://localhost:8000](http://localhost:8000).

## Publish a phone-accessible site

The static files are packaged in [`movieidiots-site.zip`](movieidiots-site.zip). To publish them free on Cloudflare Pages, sign in to Cloudflare, open **Workers & Pages**, choose **Create application → Get started → Drag and drop your files**, name the project `movieidiots`, upload the ZIP, and deploy. Cloudflare will show the public `*.pages.dev` address.

After deployment, add that exact HTTPS address to **Supabase → Authentication → URL Configuration → Redirect URLs**. The email-link flow returns to the site's current origin, so the deployed address must be allow-listed before sign-in links can return to a phone.

## Supabase setup

1. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor. It creates the poll tables, row-level security policies, voting and results RPCs, and the initial poll.
2. Copy [`config.example.js`](config.example.js) to `config.js` and add the project URL and public anon/publishable key. Never put a service-role key in browser code.
3. In Supabase Auth provider settings, make sure Email is enabled. Add `http://localhost:8000` and your deployed site URL to the allowed redirect URLs.
4. Supabase's default email sender is intended for testing and only delivers to authorized team addresses. Configure a custom SMTP sender before opening sign-in to public users.
5. To create polls, set `{ "role": "admin" }` in your account's `app_metadata` in Supabase Auth. Do not use editable `user_metadata` for admin access.

The app checks whether email sign-in is enabled. Fans enter their email and receive a one-time sign-in link; new accounts are created after link confirmation. Voting is only available to signed-in users; the database enforces one vote per account.

## Project files

- `index.html` loads project config, Supabase JS, and the React entry point.
- `app.js` contains React components and Supabase poll, auth, voting, results, and admin flows.
- `styles.css` contains the light, responsive interface.
- `config.example.js` is the public Supabase settings template.
- `supabase/schema.sql` defines the database and security policies.
