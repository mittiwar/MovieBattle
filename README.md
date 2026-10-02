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
3. In Supabase Auth provider settings, enable **Allow anonymous sign-ins**. Anonymous sessions need no email or redirect URL. Add your deployed site URL to Supabase's site URL configuration for a correct deployment setup.
4. Enable CAPTCHA/bot protection in Supabase before promoting the poll widely. Anonymous identities are per browser installation, not verified people; clearing site data or switching devices can create another identity.
5. To create polls, set `{ "role": "admin" }` in your account's `app_metadata` in Supabase Auth. Do not use editable `user_metadata` for admin access.

Visitors start an anonymous Supabase session with the quick-vote sign-in button. The session and a browser storage marker persist across browser restarts. The database enforces one vote per poll per session; anonymous accounts are not a reliable way to prove one vote per person.

## Annual awards setup

Run [`supabase/setup-awards-2026.sql`](supabase/setup-awards-2026.sql) once in the Supabase SQL Editor. It adds award category and year metadata, seeds the 20-film Best Picture ballot, closes voting at midnight on 31 December (India time), and keeps award totals hidden until noon that day. The home page and award ballots publish through GitHub Pages after the changes are pushed to `main`.

The 2026 film shortlist combines released and announced Hindi titles. Release plans can change; the schedule was cross-checked against [Filmibeat's 2026 Bollywood calendar](https://www.filmibeat.com/bollywood/movies-by-year/2026.html) and [BollywoodMDB's 2026 calendar](https://www.bollywoodmdb.com/movies/calendar-2026).

## Project files

- `index.html` loads project config, Supabase JS, and the React entry point.
- `app.js` contains React components and Supabase poll, auth, voting, results, and admin flows.
- `styles.css` contains the light, responsive interface.
- `config.example.js` is the public Supabase settings template.
- `supabase/schema.sql` defines the database and security policies.
