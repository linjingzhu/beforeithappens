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
### Whois.co.kr: which screen

The domain is registered at 후이즈. Its domain menu has an item that *sounds* right and is not:

| Item | What it is | Use it? |
|---|---|---|
| **DNS 호스트 관리** (under 네임서버 고급설정) | Glue records — registering *your own machine* as a nameserver at the registry | **No.** The page says so itself: *"A 레코드 변경은 네임서버 호스팅 서비스를 이용하시기 바랍니다"* |
| **외부 서비스 도메인 연결** | A wizard for a fixed list of Korean services | **No.** GitHub Pages is not on it |
| **네임서버 변경** | Which nameservers the domain delegates to | **Start here** — it decides where the records get edited |

There is no record editor in that menu. Where the records live depends on what 네임서버 변경 shows:

- 후이즈's own nameservers (`ns1.whois.co.kr`, `ns2.whois.co.kr`) → edit in 후이즈's DNS 관리 /
  네임서버 호스팅 area, reachable from the 네임서버 호스팅 서비스 link in that warning.
- Anything else → whoever runs those nameservers is holding the records.

You are on a record editor when there is a **record-type dropdown (A / AAAA / CNAME / MX / TXT) and
an add-record button**. A screen offering only a host name and an IP address is the wrong one.

**파킹 서비스 must be off.** It is what answers `118.67.131.217` today, and it can overwrite what you
enter. Delete the parking A record; if the address survives propagation, turn the parking service
itself off.

### Or move the nameservers, and skip all of it

Often faster than finding the right Korean-registrar screen, and better afterwards: point 네임서버
변경 at a DNS host with a plain record editor — Cloudflare is free and supports **CNAME flattening at
the apex**, which turns the eight records of route B into one of route A that follows GitHub
wherever it moves. The registrar side is then a single paste of two nameserver addresses into the
one menu item you were going to open anyway.

### A. One record, if the registrar supports `ALIAS` / `ANAME` / CNAME flattening

| Type | Host | Value |
|---|---|---|
| `ALIAS` (or `ANAME`) | `@` | `linjingzhu.github.io` |

Prefer this. It follows GitHub wherever it moves, so the addresses below stop being your problem.
Korean registrars vary and 후이즈 does not offer it here; Cloudflare does (as CNAME
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

Some editors want a trailing dot on a `CNAME` value (`linjingzhu.github.io.`) and some reject it. If
a save is refused, try it the other way before assuming the value is wrong.

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
