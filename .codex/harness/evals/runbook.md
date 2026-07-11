# Release QA Runbook

Use `$pre-deploy-qa` before pushing or deploying changes that can affect runtime behavior.

## Local Checks

```bash
git status --short
node --check index.js
npm run build
```

When `index.js` exports the Vercel handler, smoke test routes:

```bash
node --input-type=module -e 'import handler from "./index.js"; async function hit(url){let body="";const headers={};const res={statusCode:0,setHeader(k,v){headers[k]=v},end(chunk){body+=chunk||""}};await handler({url},res);console.log(url,res.statusCode,headers["Content-Type"],body.includes("client.js"),body.slice(0,80).replace(/\s+/g," "));} await hit("/"); await hit("/app"); await hit("/styles.css"); await hit("/data/location-score/index.json");'
```

When the UI or harness shape changes, add a content smoke test:

- check that filters are present only on dashboard/watchlist and absent from admin-only settings
- check that the admin tab uses the same visual language as the other tabs
- check that fit score has a compact summary and a click-to-open evidence view
- check that the evidence view belongs to the same property that showed the score
- check that a startup refresh invalidates stale evidence from older model versions
- check that no user-facing chip or badge leaks internal source labels
- save the exact route, response body marker, and deployment alias used for the check

## Production Checks

After push:

```bash
npx vercel@53.4.0 inspect mybudongsan26.vercel.app
curl -I https://mybudongsan26.vercel.app
curl -I https://mybudongsan26.vercel.app/app
curl -I https://mybudongsan26.vercel.app/styles.css
curl -i -X POST https://mybudongsan26.vercel.app/api/admin/recovery -H 'Content-Type: application/json' -H 'x-recovery-secret: <shared-secret>' --data '{"recoveryName":"QA","recoveryEmail":"qa@example.com","tempPasscode":"CUP3LQE3","expiresAt":1783777205000,"origin":"https://mybudongsan26.vercel.app"}'
```

For content verification, fetch the page body and confirm a marker unique to the change exists.
For release fixes, also confirm that the alias target equals the newest deployment URL shown by `vercel deploy` or `vercel inspect`.

## Reporting

Use this structure:

```text
배포 QA 결과:
- Blocker: ...
- Warn: ...
- Pass: ...

검증:
- ...
```
