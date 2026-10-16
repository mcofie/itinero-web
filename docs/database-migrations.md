# Database migrations

Schema changes live in `supabase/migrations/` as `<14-digit timestamp>_<name>.sql`. Each file must be safe to run twice (`if not exists`, `drop … if exists`).

## How changes reach production

The Supabase project ("Cosco") is shared with another app, so its migration history also contains that app's migrations, which aren't in this repo. Plain `supabase db push` from this repo refuses to run against that history, so don't use it here.

When a push to `main` changes `supabase/migrations/`, the **Database migrations** GitHub workflow (`.github/workflows/migrate.yml`) instead fetches the remote history into a scratch folder, adds only this repo's migrations whose timestamp is **newer than the latest migration recorded remotely**, dry-runs, then pushes. Give new migrations the current date and time so they sort after everything already applied. Vercel deploys the app from the same push; the migration job usually finishes first. For a change the app can't run without, push the migration on its own first, then the code.

Run it by hand from the Actions tab (**Run workflow**).

### Applying by hand

With the Supabase CLI logged in and the project linked (`supabase/.temp/project-ref`), the same steps work locally:

```sh
work=$(mktemp -d) && mkdir -p "$work/supabase/migrations" "$work/supabase/.temp"
cp supabase/config.toml "$work/supabase/" && cp supabase/.temp/* "$work/supabase/.temp/"
supabase migration fetch --workdir "$work"
cp supabase/migrations/<new migration>.sql "$work/supabase/migrations/"
supabase db push --workdir "$work" --dry-run   # check it lists only your migration
supabase db push --workdir "$work"
```

Migrations up to `20261016140000_album_print_ready.sql` are applied in production (the last three on 2026-10-16 this way). Earlier ones were run in the SQL editor and aren't in the remote history; that's fine, because only newer files are ever pushed.

## Repository secrets

| Secret | Where to find it |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | Supabase dashboard → Account → Access tokens |
| `SUPABASE_DB_PASSWORD` | The database password (Project settings → Database) |
| `SUPABASE_PROJECT_REF` | The project ID in the dashboard URL |

## Checks

`.github/workflows/ci.yml` runs type-checking, lint and `npm test` on every push and pull request.
