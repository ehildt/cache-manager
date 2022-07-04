# Getting Started

By default the Cache-Manager starts with the following setup:

```bash
PORT=3000
START_SWAGGER=false
PRINT_ENV=false

CACHE_MANAGER_TTL=300
CACHE_MANAGER_NAMESPACE_PREFIX=''
CACHE_MANAGER_TOKEN_SECRET='super-secret'

REDIS_PASS=''
REDIS_HOST='redis'
REDIS_PORT=6379
REDIS_TTL=600
REDIS_MAX_RESPONSES=100
REDIS_DB_INDEX=0
```

While this is pretty neat to kickoff some quick development aka with docker compose, you definitely want to update those envs for production! Your docker-compose.yml might look like this:

```yml
version: '3.9'
services:
  cache-manager:
    container_name: cache-manager
    image: cultify/cache-manager
    depends_on:
      - redis
    environment:
      - PORT=3000
      - START_SWAGGER=true
      - PRINT_ENV=true
      - CACHE_MANAGER_TTL=300
      - CACHE_MANAGER_NAMESPACE_PREFIX=''
      - CACHE_MANAGER_TOKEN_SECRET='super-secret'
      - REDIS_PASS=''
      - REDIS_HOST='redis'
      - REDIS_PORT=6379
      - REDIS_TTL=600
      - REDIS_MAX_RESPONSES=100
      - REDIS_DB_INDEX=0
    ports:
      - '3000:3000'

  redis:
    image: redis
    container_name: redis
    ports:
      - '6379:6379'
    command: redis-server --loglevel "warning"

networks:
  default:
    name: CACHE_MANAGER_NETWORK
```

## App Settings

- PORT `sets the app port`
- START_SWAGGER `enables the open-api; default false`
- PRINT_ENV `logs the envs; default false`

- CACHE_MANAGER_TTL `config object ttl`
- CACHE_MANAGER_NAMESPACE_PREFIX `the prefix for the serviceId; autogenerates if empty`
- CACHE_MANAGER_TOKEN_SECRET `the token secret`

- REDIS_PASS `the redis password`
- REDIS_HOST `the redis host aka localhost`
- REDIS_PORT `the redis port`
- REDIS_TTL `the time how long redis keeps a response in cache; default 5 seconds`
- REDIS_MAX_RESPONSES `maximum number of responses to store in the cache; default 100`
- REDIS_DB_INDEX `the redis database index; range 1-12`

## HTTPS (TLS/SSL)

The cache-manager comes with a self-signed tls/ssl setup, which does not have an expiration date.
It might be enough for you though for security reasons you might want to provide your own tls/ssl.
Do to so replace the `127.0.0.1.crt` and `127.0.0.1.key` in the `ssl` folder.
In docker you can map your tls/ssl setup with `-v $(pwd)/ssl:/app/ssl`.

## Caching Insights

Every config object is represented by it's serviceId and is stored for 300 seconds by default. To change this behavior simply update the `CACHE_MANAGER_TTL`. Setting it to 0 disables the expiration (ttl) for that particular serviceId. Whenever the config object is altered, the ttl is reset to 300 seconds (fallback) or whatever has been provided in the `CACHE_MANAGER_TTL`. There is a caveat though. Any in-memory solution implements a simple key-value storage. This means there is no such thing as a namespace or context ales custom implemented. The prefix is such a custom implementation of a namespace/context. Let's say your key (serviceId) is test1234, then the prefix will be appended and your serviceId turns into \<prefix>_test1234. If the prefix-serviceId combination is not unique, then all applications which use the same in-memory cache will alienate the config object. A good example would be the config-manager and cache-manager used together. Namely if the envs `CACHE_MANAGER_NAMESPACE_PREFIX` and `CONFIG_MANAGER_NAMESPACE_PREFIX` share the same value. In this case when creating a serviceId using the **cache-manager**, the ttl coming from `CACHE_MANAGER_TTL` is used. However, if you alter this serviceId using the **cache-manager**, then the ttl coming from the `CONFIG_MANAGER_TTL` is used. This is due to the fact that now both managers see the same serviceId and both manipulate the config object. This might be desired or unwanted so keep an eye out on the prefixes.
