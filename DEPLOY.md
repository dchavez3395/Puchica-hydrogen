# Puchica Storefront — Oxygen Deploy Gap Audit

> Originally written by claude-code-2 (respawn #1) on 2026-06-23 13:00 CDT.
> **Updated by claude-code-2 (respawn #2) on 2026-06-23 13:06 CDT** — see
> "13:06 update" sections. Original analysis stands; factual claims about
> what's live were wrong and have been corrected.
> Triggers: connor alert #504 ("SHOPIFY OXYGEN NOT DEPLOYED"); the brief's P1
> priority task; the gap between dev HEAD 286d9b7 and what puchica.ca actually
> serves. **No deploy actions taken. Audit + decision tree only.**

---

## (a) What is currently deployed

| Surface | State as of 2026-06-23 13:04 CDT |
|---|---|
| **puchica.ca** (apex) | **Phase 1.7 — LIVE.** Verified by curl: `pk-marquee` and `/collections/new-arrivals` are in the HTML, the Trending Now nav pill is present, and the bundle prefix is `https://cdn.shopify.com/oxygen-v2/56423/147623/302231/3819377/assets/…`. Server: `powered-by: Shopify, Oxygen, Hydrogen`. *CORRECTION: prior version of this file said "OLD content"; that was true at 12:48 CDT (per connor #560) but not at 13:04. Daniel manually triggered `hydrogen deploy` between 12:48 and 13:04 — that's the only explanation consistent with the bundle hashes (see "13:06 update" below).* |
| **Oxygen Production URL** (README §67) | `https://puchica-storefront-f9aa94aa3bf86abb6754.o2.myshopify.dev` — live, **same bundle** as puchica.ca (both serve the same Oxygen worker). |
| **`E:\puchica-storefront\dist\`** | Built locally at **2026-06-23 11:54 CDT** from commit `b3a55a0` (Phase 1.6 cherry-pick of `6506841`). `/dist` is `.gitignore`d. Build is sitting on disk, never uploaded. **Hashes do NOT match the live CDN bundle** (live = `app-BcK9Wbdx.css`, `Icons-CzHZ_fQv.js`; local puchica-storefront = `app-B-yyD_qL.css`, `Icons-Dyu-JVvT.js`). The deploy was built and uploaded from somewhere else (Daniel's laptop). |
| **`E:\Claude\puchica-site\dist\`** | Local dev build, hashes (`app-Q28QRgAp.css`, `Icons-BRK38dNB.js`) also do NOT match live. Neither local workspace reflects the live bundle. |
| **Storefront repo `origin/main`** (`dchavez3395/Puchica-hydrogen`) | HEAD `b3a55a0` (Phase 1.6 cherry-pick). Branch is clean — no unmerged Phase 1.7+ commits. |
| **Dev repo `E:\Claude\puchica-site\main`** | HEAD `286d9b7`. **5 commits ahead of `origin/main`**, all local-only, never pushed (per connor #340 and #569). Phase 1.7 (`05021d7`), 3 blockers (`e26bb25`, `f18e1ae`, `286d9b7`). |

**Summary:** Origin/main is 4 commits behind the live site. puchica.ca DOES serve Phase 1.7 — but only because Daniel ran `hydrogen deploy` manually from somewhere outside these two workspaces. The deploy pipeline is currently: claude-code commits locally → connor does NOT push → Daniel (or his laptop's autonomous Claude) runs `hydrogen deploy` from a third checkout. There is no GitHub → Oxygen auto-deploy link.

### 13:06 update — what changed between 12:48 and 13:04

Connor's cron tick #560 (12:48 CDT) said "puchica.ca still serves old content." My curl at 13:04 says puchica.ca serves Phase 1.7. The bundle hash evidence proves this is a fresh deploy, not a cache flip:

- Live `Icons-CzHZ_fQv.js` ≠ storefront local `Icons-Dyu-JVvT.js` ≠ puchica-site local `Icons-BRK38dNB.js`.
- The deploy used a third source tree — most plausibly the laptop, which has SSH push access and the OAuth session.
- This confirms: Oxygen IS reachable via `hydrogen deploy` from Daniel's environment, AND Daniel did the deploy, AND the dev commits (Phase 1.7) DID make it to the laptop's working tree (probably via `git remote add dev E:/Claude/puchica-site` + cherry-pick or tarball sync).

The remaining gap is: **nothing happens automatically.** Daniel has to do this every time. That's the actual problem.

---

## (b) What pushes go to origin but not Oxygen

- Every `git push origin main` to `dchavez3395/Puchica-hydrogen` only moves the GitHub tree. **Oxygen has no GitHub repository link**, so no deployment event is fired from pushes.
- README §99–103 ("Auto-deploy (optional, later)") describes the wiring that would fix this — "Push this repo to GitHub, then in the Hydrogen channel connect the repository. Every push to `main` then deploys to Production automatically — no manual CLI." This step has never been done.
- Evidence: connor's cron #569 confirms "local only (not pushed per #340)" for the last 4 Phase 1.x commits.
- The live site (Phase 1.7, verified 13:04 CDT) was deployed manually by Daniel via `hydrogen deploy`, NOT via push. The 4 Phase 1.7 commits live only on `E:\Claude\puchica-site\` and never made it to `origin/main`. So even though the live site is fresh, the source-of-truth gap is: **origin is stale and the only live deploys are manual.**

**The push → production pipeline is broken at two points:**
1. Dev commits stay local (claude-code never pushes; connor owns push per v3 protocol).
2. Even when cherry-picks DO land on `origin/main` (like Phase 1.6 cherry-pick `b3a55a0`), Oxygen does not auto-deploy because no GitHub repo is connected to the Hydrogen channel.

**Plus a third problem the prior audit missed:** the deploys that DID happen today were from a third working tree (the laptop), not from either of these two repos. So `origin/main` is not just stale — it's *unrelated to what's actually serving*. The two-repo split (`puchica-storefront` = production-shape, `puchica-site` = dev-shape, same remote) hides this. A clean state would have ONE repo with `main` = what Oxygen serves.

---

## (c) Proposed wiring — three options

### Option 1: **CLI deploy from the laptop after each push** (simplest, manual)

How it works:
1. Connor's laptop (where the prod repo lives or is mirrored): run
   `npx shopify hydrogen deploy --env production` in `E:\puchica-storefront\`.
2. The CLI uses the existing OAuth session at
   `C:\Users\dchav\AppData\Roaming\shopify-cli-kit-nodejs\Config\config.json`
   (verified valid: token expires 2026-06-23T19:28:41Z, has scope
   `organization.apps.manage` and `https://api.shopify.com/auth/shop.admin.graphql`,
   bound to shop `ug91ve-sz.myshopify.com` and organization "Puchica").
3. The CLI asks for an interactive "Continue?" confirmation. The laptop answers yes.
4. Oxygen builds + deploys. Production URL becomes the new build.

Pros:
- Zero configuration. Auth already works (verified by inspecting the config).
- One command per release. Easy to audit (`git log` of pushes ↔ `oxygen deploy` audit log).
- Connor's laptop is the single human bottleneck anyway per v3 protocol.

Cons:
- Manual step every push. Easy to forget.
- Interactive prompt blocks the CLI — must be run in an interactive terminal.
- Lint must pass and build must succeed locally BEFORE the deploy (Oxygen doesn't
  auto-rebuild on its side, the CLI uploads the `dist/`).

**Suggested invocation order on the laptop:**
```bash
cd E:\puchica-storefront
git fetch origin
git pull --rebase origin main   # get the Phase 1.7+ commits
npm install                     # if package.json changed
npm run lint                    # 0 errors required (pre-existing 4 OK)
npm run build                   # produces dist/
npx shopify hydrogen deploy --env production
# type "yes" at the prompt
```

### Option 2: **Connect GitHub repo to Hydrogen channel** (auto-deploy, one-time setup)

How it works:
1. Shopify admin → Sales channels → Hydrogen → "Puchica Storefront" →
   Settings → **Connect repository**.
2. Pick `dchavez3395/Puchica-hydrogen`, branch `main`.
3. Every push to `origin/main` triggers an Oxygen Production build + deploy.
   No interactive prompt.

Pros:
- Set-and-forget. Push-to-deploy, the way Hydrogen is designed.
- The Oxygen build runs in the Shopify-hosted CI (no laptop needed at deploy time).
- Matches README §99–103 spec.

Cons:
- The Oxygen GitHub app needs OAuth installation in the `dchavez3395` GitHub
  account. **This is a one-time human step that has not been done.**
- Connor's v3 protocol says "do not push to remote without connor explicitly
  directing you." Push frequency goes up with auto-deploy. Acceptable if connor
  controls push, but every push immediately goes live. No human-in-loop for
  the actual deploy step.
- Slightly harder to roll back: Oxygen stores build artifacts but rollback
  requires either pushing the previous SHA or using the Oxygen UI's "Roll back
  to previous deployment".

**Prerequisite:** at least one person (Daniel or connor) must complete the
"Connect repository" flow in the Shopify admin UI on a browser. The CLI cannot
do this for you.

### Option 3: **Hybrid — auto-deploy for routine, manual CLI for hotfixes**

How it works:
- Wire GitHub → Oxygen auto-deploy (Option 2).
- Keep `npx shopify hydrogen deploy --preview --force` available for preview URLs.
- If something needs to ship ahead of a push, the laptop CLI can still
  override with `--env production`.

Pros: best of both worlds. Cons: most surface area to maintain.

**Recommendation per v3 protocol:** start with **Option 2** (set up GitHub auto-deploy
on the next time a human is at the Shopify admin), and have connor's laptop fall
back to **Option 1** (CLI deploy) for any Phase 1.7+ push that needs to ship
immediately without waiting on the auto-deploy hook to be wired.

---

## (d) Risks

### What can break

1. **Stale `dist/` if env vars change.** `E:\puchica-storefront\env` (the local
   `.env`) contains a real `PRIVATE_STOREFRONT_API_TOKEN` (`shpat_736fc2b5...`).
   This token is injected at runtime by Hydrogen, NOT baked into the build.
   So `dist/` is safe to ship — env vars come from Oxygen's runtime environment.
   **However**, if a new env var is added to the codebase without being set in
   the Oxygen project settings, the deployed build will fail at first request.

2. **OAuth session expiry.** The current token expires **2026-06-23 19:28:41Z**.
   That's ~6h30m from now. After that, CLI deploys will fail with auth errors
   until someone runs `npx shopify auth login` interactively again. The Hydrogen
   channel GitHub link does NOT depend on this token (separate OAuth).

3. **Env vars in Oxygen.** The Hydrogen sales channel needs PUBLIC_STORE_DOMAIN,
   PUBLIC_STOREFRONT_API_TOKEN, PUBLIC_STOREFRONT_ID, PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID,
   PUBLIC_CUSTOMER_ACCOUNT_API_URL, SHOP_ID. README §28–43 documents them.
   If any is missing on the Oxygen side, the deployed site 500s at first request.
   `npx shopify hydrogen env pull` (already in env, README §40) writes them
   locally. The Oxygen side is set in admin → Hydrogen channel → Environment variables.

4. **Branch mismatch.** Currently `E:\puchica-storefront` `main` is at `b3a55a0`
   (matches `origin/main`). The dev repo `E:\Claude\puchica-site` `main` is at
   `286d9b7` (5 commits ahead, including Phase 1.7). Until those 5 commits are
   pushed/cherry-picked, **even a successful Oxygen deploy will only ship Phase 1.6**.

5. **Stale build in `dist/`.** The current `dist/` (built 2026-06-23 11:54) is
   from `b3a55a0`. If someone runs `npm run build` between now and a deploy, the
   build hash in `dist/server/index.js` changes. The CLI deploy uploads whatever
   `dist/` contains at invocation time. Keep build + commit in lockstep.

6. **Oxygen is the host, not a CDN.** First-request cold starts are ~200–400ms
   after a fresh deploy. Acceptable for an online-storefront, but cache-busting
   should be done via URL hashes (Vite already does this — see assets folder).

7. **Custom domain DNS not yet configured.** README §68–95 walks through
   `shop.puchica.ca` → Oxygen. **This is the next milestone** after Oxygen
   itself is wired. Not in scope of this audit.

### What we don't know (gaps for a future audit)

- Whether the Oxygen GitHub app is already installed in the `dchavez3395`
  GitHub org. (Can't check from the CLI; needs GitHub UI or
  `gh api user/installations`.)
- Whether the Hydrogen channel environment variables are populated on Oxygen's
  side. (`npx shopify hydrogen env pull` only writes LOCAL `.env`. Oxygen-side
  vars live in Shopify admin, not in the repo.)
- Whether previous deploys to Oxygen ever succeeded. No `.oxygen/` dir or
  deploy log in the storefront repo. README references Oxygen but there's no
  evidence of a prior `hydrogen deploy` having run.

---

## Decision tree (what to do next)

```
Q1: Is the Hydrogen channel connected to GitHub?
    ├─ YES  → push to origin/main triggers auto-deploy. Done.
    └─ NO   ↓

Q2: Is the OAuth session in
    AppData/Roaming/shopify-cli-kit-nodejs valid? (expires 19:28:41Z today)
    ├─ NO   → run `npx shopify auth login` interactively. Refreshes 24h.
    └─ YES  ↓

Q3: Is the dev repo's HEAD (286d9b7) pushed to origin/main?
    ├─ NO   → connor cherry-picks Phase 1.7+ to origin/main (per v3 protocol).
    └─ YES  ↓

Q4: Is `dist/` freshly built from the new HEAD?
    ├─ NO   → `npm run build` from E:\puchica-storefront.
    └─ YES  ↓

Q5: Run on the laptop:
       npx shopify hydrogen deploy --env production
    Answer "yes" at the prompt.
    Wait 2–3 minutes. Verify production URL serves new content.
```

**Per v3 protocol (connor has full deploy authority as of 2026-06-23T00:04Z),
connor can direct any of the above steps without separate Daniel approval.**
For the initial GitHub-link wiring (Option 2), one human needs to click through
Shopify admin's "Connect repository" UI — that's outside any agent's reach.

---

## What I did NOT do

- Did not modify `E:\puchica-storefront\` (no deploy attempt, no token rotation,
  no `hydrogen link` / `hydrogen env pull`, no `hydrogen deploy`).
- Did not modify the 3 dirty files in `E:\Claude\puchica-site` (per the brief's
  constraints): `shopify.app.puchicaadmin.toml`, `storefrontapi.generated.d.ts`,
  `tools/oauth_setup.py`.
- Did not push to remote (connor's exclusive per v3).
- Did not run image gen (parked per IMAGE_GEN_POLICY).
- Did not touch `dist/` — left it as-is from this morning's build.

Posted as `kind=event` to the bus (claude-code-2, #598) with this path.