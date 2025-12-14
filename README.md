# Webpage Screenshot Tool

Capture full-page screenshots of any website in desktop and mobile viewports using Playwright in a container.

## Requirements

- [just](https://github.com/casey/just) - command runner
- `podman-compose`, `docker compose` (V2), or `docker-compose` (V1) - auto-detected

## Usage

```bash
# Basic screenshot (1920x1080 desktop + 390x844 mobile)
just screenshot example.com

# URL without scheme gets https:// added automatically
just screenshot google.com

# Full URL also works
just screenshot https://github.com

# Screenshot localhost (works thanks to network_mode: host)
just screenshot localhost:3000

# HD resolution (1920x1080)
just screenshot-hd example.com

# 4K resolution (3840x2160)
just screenshot-4k example.com

# Custom viewport sizes
just screenshot-custom example.com 1440 900 375 667
```

## Output

Screenshots are saved to `./output/`:
- `desktop_000.png`, `desktop_001.png`, ... - scrolling screenshots
- `desktop_full.png` - full page screenshot
- `mobile_000.png`, `mobile_001.png`, ... - scrolling screenshots
- `mobile_full.png` - full page screenshot

## Configuration

### Compose command

By default, auto-detects `podman-compose` → `docker-compose` → `docker compose`.

To override, create `.env`:
```bash
cp .env.example .env
# Edit .env and set COMPOSE_CMD
```

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DESKTOP_WIDTH` | 1920 | Desktop viewport width |
| `DESKTOP_HEIGHT` | 1080 | Desktop viewport height |
| `MOBILE_WIDTH` | 390 | Mobile viewport width |
| `MOBILE_HEIGHT` | 844 | Mobile viewport height |
| `SCROLL_STEP` | 800 | Pixels to scroll between screenshots |
| `SCROLL_DELAY` | 500 | Delay (ms) after each scroll |
| `TIMEOUT` | 30000 | Page load timeout (ms) |

## Other commands

```bash
just clean  # Remove all screenshots
just pull   # Pull the Playwright Docker image
```
