# LoveMe S2 social login pack

## Result

S2 keeps the exact magic-link copy and adds Kakao/Naver/Google start buttons on web, Expo, iOS, and Android. Missing-email accounts must bind email before invite accept. S4 KakaoTalk share stays `카카오톡`.

## Verified

- `npm test` — 126 passed
- `npm run lint`
- `npm run build`

## Residual

Provider token exchange stays stubbed until client secrets exist (`AB_OAUTH_*_CLIENT_ID` builds authorize URLs; `AB_DEV_OAUTH=1` enables local complete). Kakao/Naver emails are not trusted for account merge.
