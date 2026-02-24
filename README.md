# Highcoo

A self-hosted image management app. Upload, organize, tag, and publish images through a clean web interface. Serves optimized images with optional watermarking via a public API.

## Features

- Image upload with automatic deduplication
- Tag-based organization with color coding
- Publish workflow (draft / unpublished / published)
- On-the-fly image resizing and format conversion
- Optional watermark overlay
- Public API for integrating images into your site
- Passkey (WebAuthn) authentication
- Soft delete with undo

## Getting Started

Highcoo runs as a Docker container with a PostgreSQL database.

```bash
# Clone the repository
git clone https://github.com/CordlessWool/highcoo.git
cd highcoo

# Configure environment
cp .env.example .env
# Edit .env and set POSTGRES_PASSWORD

# Start the full stack
docker compose --profile prod up -d
```

The app will be available at `http://localhost:3001`. Migrations run automatically on startup.

See [`.env.example`](.env.example) for all configuration options and [`docker-compose.yml`](docker-compose.yml) for the full service setup.

## Public API

Highcoo exposes a read-only API for published content — use it to display images on your website or blog.

| Endpoint | Description |
|---|---|
| `GET /pub/tags` | List all published tags |
| `GET /pub/tags/[slug]` | Get a single tag |
| `GET /pub/media` | List published media |
| `GET /pub/media/[slug]` | Get a single media item |
| `GET /coo/[slug]/w/[width]` | Serve an image at a given width |

All list endpoints support `?cursor=&limit=` for pagination.

### Image Sizes

| Width | Use case |
|---|---|
| 480 | Thumbnail / small |
| 1080 | Medium / card |
| 2048 | Large / full |

Any width up to 4096 is accepted.

## Development

```bash
# Install dependencies
bun install

# Start the database
docker compose up db -d

# Push the schema to the database
bun run db:push

# Start the dev server
bun run dev
```

The dev server runs at `http://localhost:5173`.

### Commands

```bash
bun run check          # Type-check
bun run lint           # Prettier + ESLint
bun run build          # Production build
bun run test:e2e       # E2E tests (port 4173)
bun run db:studio      # Drizzle Studio
bun run db:generate    # Generate migration
bun run db:migrate     # Run migrations
```

## License

[Apache License 2.0](LICENSE)
