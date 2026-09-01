# DNS: pointing lovemedialogue.com at GitHub Pages

The site builds and deploys; this is the last thing between it and a working address. It is done
once, at the registrar, and never again.

## What is there now

Asked directly, the authoritative nameservers hold exactly one address record:

```
lovemedialogue.com.  3600  IN  A   118.67.131.217          # the parking page, not GitHub
lovemedialogue.com.  3600  IN  NS  ns1..ns4.whoisdomain.kr.
                     no AAAA, no CNAME, no TXT
```

Two things follow. **The nameservers are already correct** — `whoisdomain.kr` is 후이즈's own DNS, and
네임서버 변경 rejects the same values with *"변경 전 네임서버와 동일한 네임서버"*, which is the
registrar saying there is nothing to change. And **that one A record is the whole problem**: an apex
cannot point at two places, so it has to be replaced rather than added to. TTL 3600 means the change
is visible within the hour.

## Two ways, pick by what the registrar offers
### Whois.co.kr: which screen

The domain is registered at 후이즈. Its domain menu has an item that *sounds* right and is not:

| Item | What it is | Use it? |
|---|---|---|
| **DNS 호스트 관리** (under 네임서버 고급설정) | Glue records — registering *your own machine* as a nameserver at the registry | **No.** The page says so itself: *"A 레코드 변경은 네임서버 호스팅 서비스를 이용하시기 바랍니다"* |
| **외부 서비스 도메인 연결** | A wizard for a fixed list of Korean services | **No.** GitHub Pages is not on it |
| **네임서버 변경** | Which nameservers the domain delegates to | **Start here** — it decides where the records get edited |

네임서버 변경 has already been checked: the domain is on 후이즈's own `whoisdomain.kr` nameservers, so
the records are 후이즈's to edit.

**The screen is 부가서비스 → 네임서버 고급설정.** Pick the domain, then open **A 레코드 관리
(네임서버 호스팅)**. CNAME has its own section on the same page. Confusingly this sits under the same
네임서버 고급설정 heading as DNS 호스트 관리, which is the wrong one — and DNS 호스트 관리 could not do
the job anyway: its 호스트 추가 form fixes the name as `____.lovemedialogue.com`, so the apex is not
expressible in it at all.

**The apex is a blank host name, not `@`.** The page states it: *"호스트명은 @, * 등의 특수문자를
포함할 수 없습니다"*. Leave the field empty.

**후이즈 has no AAAA.** The record types offered are MX, SPF(TXT), A, CNAME, PTR, SRV — that is the
whole list. So the four AAAA rows in route B cannot be entered and are not a failure: the site serves
correctly over IPv4 alone, and what is given up is reachability from IPv6-only networks, which some
mobile carriers use. If that ever matters, moving the nameservers (below) buys IPv6 back; it is not
worth doing for that reason alone today.

**Delete the parking record, do not add beside it.** `118.67.131.217` is 후이즈's parking page. If the
address survives propagation, the 파킹 서비스 itself is putting it back and has to be turned off.

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

At 후이즈 the host cell is **left empty** rather than `@`, and the AAAA rows are skipped — it offers no
AAAA record type. See the section above.

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
3. **Settings → Pages → Custom domain: type `lovemedialogue.com` and Save.** This is not optional
   and it is not filled in for you. The build writes a `CNAME` file into the artifact, and with the
   *branch*-based Pages that file alone registered the domain — with **GitHub Actions** deployment
   it does not. An unregistered domain means GitHub has no mapping from the hostname to this
   repository, and every request to it gets *"There isn't a GitHub Pages site here"* even though the
   deploy succeeded and the files are there. Saving the field runs the DNS check and starts the
   certificate.
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
