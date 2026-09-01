# DNS: pointing lovemedialogue.com at GitHub Pages

The site builds and deploys; this is the last thing between it and a working address. It is done
once, at the registrar, and never again.

## What is there now

```
lovemedialogue.com  A  118.67.131.217
```

That is the registrar's parking page, not GitHub. **It has to go** — an apex name cannot point at
two places, and leaving it means the site loads intermittently or not at all.

## Two ways, pick by what the registrar offers

### A. One record, if the registrar supports `ALIAS` / `ANAME` / CNAME flattening

| Type | Host | Value |
|---|---|---|
| `ALIAS` (or `ANAME`) | `@` | `linjingzhu.github.io` |

Prefer this. It follows GitHub wherever it moves, so the addresses below stop being your problem.
Korean registrars vary: 가비아 and 후이즈 do not offer it on every plan, Cloudflare does (as CNAME
flattening) and is free if you move the nameservers there.

### B. Eight records, works at every registrar

| Type | Host | Value |
|---|---|---|
| `A` | `@` | `185.199.108.153` |
| `A` | `@` | `185.199.109.153` |
| `A` | `@` | `185.199.110.153` |
| `A` | `@` | `185.199.111.153` |
| `AAAA` | `@` | `2606:50c0:8000::153` |
| `AAAA` | `@` | `2606:50c0:8001::153` |
| `AAAA` | `@` | `2606:50c0:8002::153` |
| `AAAA` | `@` | `2606:50c0:8003::153` |

**Where these came from, and how to check them.** They are not quoted from memory: they are the
live answer for `linjingzhu.github.io`, the host that serves this repository's Pages site, read on
2026-09-01. Confirm before typing them in — the addresses have changed before and will again:

```sh
dig +short linjingzhu.github.io A
dig +short linjingzhu.github.io AAAA
```

GitHub's own list is under *Pages → Configuring a custom domain → Managing a custom domain*. If it
disagrees with the command above, believe GitHub.

The AAAA records are optional in the sense that the site works without them, and worth adding in the
sense that IPv6-only mobile networks exist.

### Either way: `www`

| Type | Host | Value |
|---|---|---|
| `CNAME` | `www` | `linjingzhu.github.io` |

Not required. It makes `www.lovemedialogue.com` redirect to the apex instead of failing, which is
what a visitor who types `www` out of habit expects.

## Then

1. **Wait.** Ten minutes to a few hours; a TTL is a promise other resolvers already cached.
2. **Check** — the first line should stop returning `118.67.131.217`:
   ```sh
   dig +short lovemedialogue.com
   curl -sI https://lovemedialogue.com/ | head -1
   ```
3. **Settings → Pages** re-runs its DNS check on its own. The Custom domain field is already filled
   from the `CNAME` file the build writes, so there is nothing to type.
4. **Enforce HTTPS** becomes tickable once the certificate is issued — usually within the hour after
   DNS resolves, occasionally longer. Tick it. The pages carry `https://` canonicals, so serving
   over `http` would contradict every one of them.

## If it does not come up

- `dig +short lovemedialogue.com` still shows the old address → the record was added but the old one
  was not deleted, or the TTL has not expired.
- Pages shows *"Domain does not resolve to the GitHub Pages server"* → DNS has not propagated yet.
  It re-checks; nothing to do but wait.
- The certificate never issues → remove the custom domain in Settings, save, add it back. That
  restarts the request, and is the documented remedy rather than a superstition.
