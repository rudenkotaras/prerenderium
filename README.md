# Contenter

### Environment variables

> example can be found inside the file .env.example

- `PORT`: (integer) which port to listen to requests, default: 1
- `WORKERS`: (integer) how many workers to run, default: 1
- `CACHE_FILE`: (string) absolute path to the cache file, default: in-memory caching
- `DISABLE_CACHE`: (integer) if is 1, caching is disabled completely

### How to build

```
docker-compose build --no-cache contenter
```

### How to start

```
docker-compose up -d contenter
```
