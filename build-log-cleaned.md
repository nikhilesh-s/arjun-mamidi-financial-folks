# Vercel Build Summary

- Region: Washington, D.C. (iad1)
- Machine: 2 cores / 8 GB
- Repo: nikhilesh-s/arjun-mamidi-financial-folks @ 1ec8902
- Cache: none (fresh build)

## Steps
1. Clone repo (0.7s) and run `vercel build`.
2. Install deps (npm) — standard warnings about old packages (rimraf, inflight, glob, critters, @humanwhocodes/*, eslint v8.49).
3. Next.js 13.5.1 detected; `npm run build` triggered.
4. Next build warning: `httpAgentOptions.timeout` not allowed → remove custom timeout from `next.config.js`.
5. During bundling, Next flagged missing optional deps `bufferutil` & `utf-8-validate` from `ws`. These are optional but silence warnings by installing them if desired.
6. Browserslist data outdated (`npx update-browserslist-db@latest`).
7. Build finished with warnings but succeeded; static routes: `/` and 404. First load JS ~138 kB.
8. Deployment + cache upload completed in ~50s build + 18s cache.

## Action Items
- Update `next.config.js` to remove invalid `httpAgentOptions.timeout`.
- Consider installing `bufferutil` & `utf-8-validate` to avoid ws warnings.
- Refresh Browserslist data locally and commit lockfile to keep CI clean.
