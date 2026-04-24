# Webpage Screenshot Tool

set dotenv-load

# Auto-detect compose command if not set in .env
# Priority: podman-compose -> docker compose (V2) -> docker-compose (V1 legacy)
compose_cmd := env('COMPOSE_CMD', '')
compose := if compose_cmd != '' {
    compose_cmd
  } else if `command -v podman-compose 2>/dev/null || true` != '' {
    'podman-compose'
  } else if `docker compose version 2>/dev/null || true` =~ 'Docker Compose' {
    'docker compose'
  } else {
    'docker-compose'
  }

default:
    @just --list

# Take screenshots of a URL (desktop + mobile)
screenshot url:
    URL={{url}} {{compose}} run --rm screenshots

# Take screenshots with custom desktop resolution
screenshot-hd url:
    URL={{url}} DESKTOP_WIDTH=1920 DESKTOP_HEIGHT=1080 {{compose}} run --rm screenshots

# Take screenshots with 4K resolution
screenshot-4k url:
    URL={{url}} DESKTOP_WIDTH=3840 DESKTOP_HEIGHT=2160 {{compose}} run --rm screenshots

# Take screenshots with custom viewport sizes
screenshot-custom url desktop_w="1920" desktop_h="1080" mobile_w="390" mobile_h="844":
    URL={{url}} \
    DESKTOP_WIDTH={{desktop_w}} DESKTOP_HEIGHT={{desktop_h}} \
    MOBILE_WIDTH={{mobile_w}} MOBILE_HEIGHT={{mobile_h}} \
    {{compose}} run --rm screenshots

# Clean output directory
clean:
    rm -rf output/*

# Pull the Playwright Docker image
pull:
    {{compose}} pull