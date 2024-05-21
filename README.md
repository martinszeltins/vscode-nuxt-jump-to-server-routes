A useful little extension that detects and allows you to click through to Nuxt server routes and additionally to fragments if you use `FRAGMENT_NAME` naming convention.

## Usage
This extension will detect Nuxt server route endpoints when you use composables like `useFetch`, `$fetch` or `useLazyFetch` and you will be able to hover over the route and click through to the file.

```ts
    const { data } = useFetch('/api/users') // Makes '/api/users' clickable
```

Enjoy!
