# movieidiots: For the love of movies

A responsive React experience for the People's Bollywood Awards. The 2026 edition opens with a Best Picture ballot and is designed to add actor, actress, music, and future audience-award categories.

## Stack

- React 19 with component state and hooks.
- HTM for JSX-free tagged templates in the browser.
- Lucide React icons.
- Supabase JavaScript client, Auth, Postgres, RLS, and database RPCs.
- Responsive CSS; no build step is needed. React and Lucide modules load from esm.sh, so the page needs an internet connection.

## Run locally

Serve this folder over HTTP and open the address from the server. Do not open `index.html` directly; OAuth cannot return to a `file://` URL.

With Node.js installed, run `npx serve .`. The current local preview is at [http://localhost:8000](http://localhost:8000).

## Publish with GitHub Pages

Push the static site files to the `main` branch of `mittiwar/MovieBattle`. GitHub Pages publishes the project site at `https://mittiwar.github.io/MovieBattle/`. Check **Settings → Pages** for the live deployment status.

## Supabase setup

1. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor. It creates the poll tables, row-level security policies, voting and results RPCs, and the initial poll.
2. Copy [`config.example.js`](config.example.js) to `config.js` and add the project URL and public anon/publishable key. Never put a service-role key in browser code.
3. In Supabase Auth provider settings, enable **Google** and add the Google OAuth Web client ID and secret. In Google Cloud, add `https://mittiwar.github.io` as an authorized JavaScript origin and add the Supabase Auth callback URL shown on the Supabase Google provider page as an authorized redirect URI. In Supabase URL Configuration, set the site URL to `https://mittiwar.github.io/MovieBattle/` and add `https://mittiwar.github.io/MovieBattle/**` to the redirect URL allowlist. Add your local development origin there too when testing locally.
4. To let existing anonymous voters keep their ballot when upgrading to Google, enable **Allow manual linking** in Supabase Auth. New visitors use Google OAuth directly.
5. Enable CAPTCHA/bot protection in Supabase before promoting the poll widely. Google sign-in makes account identity more durable, but it cannot prevent determined users from voting with multiple Google accounts.
6. To create polls, set `{ "role": "admin" }` in your account's `app_metadata` in Supabase Auth. Do not use editable `user_metadata` for admin access.

Visitors sign in with Google before voting. The database enforces one vote per poll per Supabase user. Existing anonymous sessions can be upgraded through Google identity linking when manual linking is enabled.

## Annual awards setup

Run [`supabase/setup-awards-2026.sql`](supabase/setup-awards-2026.sql) once in the Supabase SQL Editor. It adds award category and year metadata, seeds the 20-film Best Picture ballot, closes voting at midnight on 31 December (India time), and keeps award totals hidden until noon that day. The home page and award ballots publish through GitHub Pages after the changes are pushed to `main`.

The 2026 film shortlist combines released and announced Hindi titles. Release plans can change; the schedule was cross-checked against [Filmibeat's 2026 Bollywood calendar](https://www.filmibeat.com/bollywood/movies-by-year/2026.html) and [BollywoodMDB's 2026 calendar](https://www.bollywoodmdb.com/movies/calendar-2026).

## Project files

- `index.html` loads project config, Supabase JS, and the React entry point.
- `app.js` contains React components and Supabase poll, auth, voting, results, and admin flows.
- `styles.css` contains the light, responsive interface.
- `config.example.js` is the public Supabase settings template.
- `supabase/schema.sql` defines the database and security policies.
