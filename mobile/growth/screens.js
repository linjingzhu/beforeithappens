import { Pressable, ScrollView, Share, Text, View } from "react-native";
import { createStyles } from "../src/responsive.js";
import { APP_GIFT_COPY, APP_RECOMMEND_COPY } from "./copy.js";
import { giftViewModel, recommendViewModel } from "./flow.js";
import { setGrowthShareIo } from "./host-mount.js";

// The phone has no navigator.share or clipboard. Mounting either screen registers the RN bridge,
// so the three share buttons do something even when the host mounts them without an io of its own.
setGrowthShareIo({
  share: async (payload) => { await Share.share({ message: payload.url, url: payload.url }); },
  clipboard: { writeText: async (text) => { await Share.share({ message: String(text || "") }); } }
});

/**
 * One sheet for both screens, built from the shared tokens.
 *
 * Balance comes from a single column capped at `maxContentWidth` and centred, so a Pro Max and a
 * tablet get breathing room instead of a stretched line; rhythm comes from `space()`, which gives
 * a short screen its margins back rather than pushing the primary action below the fold. Every
 * tappable target is built up from `hit`.
 */
const useStyles = createStyles(({ colors, fonts, font, lineHeight, space, gutter, radius, hit, layout, hairline, withAlpha }) => ({
  shell: { flex: 1, backgroundColor: colors.surface },
  scroll: { paddingHorizontal: gutter("lg"), paddingBottom: space("xxl") },
  column: { width: "100%", maxWidth: layout.maxContentWidth, alignSelf: "center" },
  navRow: { flexDirection: "row", alignItems: "center", minHeight: hit, marginTop: space("sm") },
  backBtn: { minWidth: hit, minHeight: hit, justifyContent: "center" },
  backLabel: { fontFamily: fonts.body, fontSize: font("bodyLarge"), color: colors.ink },
  navTitle: { flex: 1, textAlign: "center", fontFamily: fonts.title, fontSize: font("bodyLarge"), color: colors.ink },
  navSpacer: { minWidth: hit },

  title: { fontFamily: fonts.title, fontSize: font("display"), lineHeight: lineHeight("display", "tight"), color: colors.ink, marginTop: space("lg") },
  body: { fontFamily: fonts.body, fontSize: font("body"), lineHeight: lineHeight("body", "relaxed"), color: colors.muted, marginTop: space("sm") },

  codeCard: {
    marginTop: space("lg"),
    paddingVertical: space("lg"),
    paddingHorizontal: space("lg"),
    borderRadius: radius.lg,
    backgroundColor: withAlpha(colors.accent, 0.22),
    alignItems: "center"
  },
  codeLabel: { fontFamily: fonts.body, fontSize: font("footnote"), color: colors.muted },
  codeValue: { fontFamily: fonts.title, fontSize: font("hero"), letterSpacing: 2, color: colors.ink, marginTop: space("xs") },

  shareRow: { flexDirection: "row", marginTop: space("lg"), marginHorizontal: -space("xs") },
  shareBtn: {
    flex: 1,
    minHeight: hit,
    marginHorizontal: space("xs"),
    borderRadius: radius.pill,
    borderWidth: hairline,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center"
  },
  shareLabel: { fontFamily: fonts.body, fontSize: font("footnote"), color: colors.ink },
  linkText: { fontFamily: fonts.body, fontSize: font("caption"), lineHeight: lineHeight("caption", "relaxed"), color: colors.muted, marginTop: space("md") },
  notice: { fontFamily: fonts.body, fontSize: font("footnote"), color: colors.ink, marginTop: space("sm") },
  errorText: { fontFamily: fonts.body, fontSize: font("footnote"), color: colors.error, marginTop: space("sm") },

  statRow: { flexDirection: "row", marginTop: space("xl"), alignItems: "flex-end" },
  statValue: { fontFamily: fonts.title, fontSize: font("display"), color: colors.ink },
  statLabel: { fontFamily: fonts.body, fontSize: font("footnote"), color: colors.muted, marginLeft: space("sm"), paddingBottom: space("xs") },
  rule: { fontFamily: fonts.body, fontSize: font("footnote"), lineHeight: lineHeight("footnote", "relaxed"), color: colors.muted, marginTop: space("md") },

  primary: {
    minHeight: hit,
    marginTop: space("xl"),
    borderRadius: radius.pill,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space("lg")
  },
  primaryLabel: { fontFamily: fonts.body, fontSize: font("bodyLarge"), color: colors.surface },
  disabled: { opacity: 0.5 },

  sentTitle: { fontFamily: fonts.title, fontSize: font("title"), color: colors.ink, marginTop: space("xxl") },
  giftRow: {
    marginTop: space("lg"),
    paddingVertical: space("lg"),
    paddingHorizontal: space("lg"),
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.line
  },
  giftStatus: { fontFamily: fonts.body, fontSize: font("footnote"), color: colors.ink },
  revokeBtn: { minHeight: hit, marginTop: space("md"), justifyContent: "center" },
  revokeLabel: { fontFamily: fonts.body, fontSize: font("footnote"), color: colors.muted, textDecorationLine: "underline" }
}));

function pressed(...styles) {
  return ({ pressed: isPressed }) => [...styles, isPressed ? { opacity: 0.7 } : null];
}

function NavBar({ title, onBack, testID }) {
  const styles = useStyles();
  return (
    <View style={styles.navRow}>
      <Pressable accessibilityRole="button" testID={`${testID}-back`} onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backLabel}>←</Text>
      </Pressable>
      <Text style={styles.navTitle}>{title}</Text>
      <View style={styles.navSpacer} />
    </View>
  );
}

/** The invite screen's row, as one component, so the three surfaces cannot drift apart. */
export function ShareRow({ model, onCopy, onInstagram, onKakao, testID }) {
  const styles = useStyles();
  if (!model?.visible) return null;
  const handlers = [onCopy, onInstagram, onKakao];
  const keys = ["copy", "instagram", "kakao"];
  return (
    <View>
      <View style={styles.shareRow}>
        {model.buttons.map((label, index) => (
          <Pressable
            key={keys[index]}
            accessibilityRole="button"
            testID={`${testID}-${keys[index]}`}
            onPress={handlers[index]}
            style={pressed(styles.shareBtn)}
          >
            <Text style={styles.shareLabel}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {model.copyFailed ? <Text style={styles.errorText} accessibilityLiveRegion="assertive">{model.copyFailed}</Text> : null}
      {/* The link stays readable so a silent copy failure is still recoverable by long-press. */}
      <Text style={styles.linkText} selectable testID={`${testID}-url`}>{model.url}</Text>
      {model.copied ? <Text style={styles.notice} accessibilityLiveRegion="polite">{model.copied}</Text> : null}
    </View>
  );
}

export function RecommendScreen({
  code = "",
  url = "",
  joined = 0,
  credited = 0,
  rewardEvery = 3,
  copied = false,
  failed = false,
  error = "",
  onBack,
  onCopy,
  onInstagram,
  onKakao
}) {
  const styles = useStyles();
  const model = recommendViewModel({ code, url, joined, credited, rewardEvery, copied, failed, error });
  return (
    <View style={styles.shell} testID="recommend">
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          <NavBar title={APP_RECOMMEND_COPY.title} onBack={onBack} testID="recommend" />
          <Text style={styles.title}>{model.title}</Text>
          <Text style={styles.body}>{model.body}</Text>
          {model.code ? (
            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>{model.codeLabel}</Text>
              <Text style={styles.codeValue} selectable testID="recommend-code">{model.code}</Text>
            </View>
          ) : null}
          <ShareRow model={model.share} onCopy={onCopy} onInstagram={onInstagram} onKakao={onKakao} testID="recommend-share" />
          <View style={styles.statRow}>
            <Text style={styles.statValue} testID="recommend-joined">{model.joined}</Text>
            <Text style={styles.statLabel}>{model.countsLabel}</Text>
          </View>
          <Text style={styles.rule}>{model.rewardRule}</Text>
          {model.error ? <Text style={styles.errorText}>{model.error}</Text> : null}
        </View>
      </ScrollView>
    </View>
  );
}

export function GiftScreen({
  gifts = [],
  credits = 0,
  busy = false,
  error = "",
  copied = false,
  failed = false,
  activeUrl = "",
  onBack,
  onCreate,
  onRevoke,
  onCopy,
  onInstagram,
  onKakao
}) {
  const styles = useStyles();
  const model = giftViewModel({ gifts, credits, busy, error, copied, failed, activeUrl });
  return (
    <View style={styles.shell} testID="gift">
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          <NavBar title={APP_GIFT_COPY.title} onBack={onBack} testID="gift" />
          <Text style={styles.title}>{model.title}</Text>
          <Text style={styles.body}>{model.body}</Text>
          {model.creditLabel ? (
            <View style={styles.statRow}>
              <Text style={styles.statValue} testID="gift-credits">{model.credits}</Text>
              <Text style={styles.statLabel}>{model.creditLabel}</Text>
            </View>
          ) : null}
          {model.creditNote ? <Text style={styles.rule}>{model.creditNote}</Text> : null}
          {model.error ? <Text style={styles.errorText}>{model.error}</Text> : null}
          <Pressable
            accessibilityRole="button"
            testID="gift-create"
            disabled={model.busy}
            onPress={onCreate}
            style={pressed(styles.primary, model.busy ? styles.disabled : null)}
          >
            <Text style={styles.primaryLabel}>{model.cta}</Text>
          </Pressable>
          {model.sentTitle ? <Text style={styles.sentTitle}>{model.sentTitle}</Text> : null}
          {model.rows.map((row) => (
            <View key={row.id} style={styles.giftRow} testID={`gift-row-${row.id}`}>
              <Text style={styles.giftStatus}>{row.statusLabel}</Text>
              <ShareRow
                model={row.share}
                onCopy={() => onCopy?.(row.id)}
                onInstagram={() => onInstagram?.(row.id)}
                onKakao={() => onKakao?.(row.id)}
                testID={`gift-share-${row.id}`}
              />
              {row.revoke ? (
                <Pressable accessibilityRole="button" testID={`gift-revoke-${row.id}`} onPress={() => onRevoke?.(row.id)} style={pressed(styles.revokeBtn)}>
                  <Text style={styles.revokeLabel}>{row.revoke}</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
