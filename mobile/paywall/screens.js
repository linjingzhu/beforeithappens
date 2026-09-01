import { Pressable, Text, View } from "react-native";
import { createStyles } from "../src/responsive.js";
import { PAYWALL_COPY } from "./contract/paywall-copy.js";
import { HEARTS, canUnlockRest } from "../../src/hearts.js";
import { debugLine } from "../src/virtual.js";

export function PaywallBuyerScreen({
  title = PAYWALL_COPY.buyerTitle,
  body = PAYWALL_COPY.buyerBody,
  cta = PAYWALL_COPY.buyerCta,
  hearts = HEARTS.start,
  shopOpen = false,
  busy = false,
  error = "",
  onUnlock,
  onPurchase,
  onLater
}) {
  const styles = useStyles();
  return (
    <View style={styles.overlay} testID="paywall-buyer" accessibilityLabel="paywall-buyer">
      <View style={styles.card}>
        <Text style={styles.hearts}>{`♡ ${hearts}`}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        <Pressable
          testID="paywall-purchase"
          accessibilityRole="button"
          disabled={busy}
          onPress={onUnlock || onPurchase}
          style={[styles.primary, busy ? styles.disabled : null]}
        >
          <Text style={styles.primaryLabel}>{cta}</Text>
        </Pressable>
        {!canUnlockRest(hearts) ? <Text style={styles.need}>{PAYWALL_COPY.needHearts}</Text> : null}
        {shopOpen ? (
          <View testID="paywall-shop">
            <Text style={styles.shopTitle}>{PAYWALL_COPY.shopTitle}</Text>
            <Pressable testID="shop-buy" onPress={onPurchase} style={styles.primary}>
              <Text style={styles.primaryLabel}>{PAYWALL_COPY.shopCta}</Text>
            </Pressable>
            {onLater ? (
              <Pressable testID="paywall-later" onPress={onLater} style={styles.secondary}>
                <Text style={styles.secondaryLabel}>{PAYWALL_COPY.later}</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {debugLine() ? <Text style={styles.debug}>{debugLine()}</Text> : null}
      </View>
    </View>
  );
}

export function PaywallPartnerScreen({
  title = PAYWALL_COPY.partnerTitle
}) {
  const styles = useStyles();
  return (
    <View style={styles.overlay} testID="paywall-partner" accessibilityLabel="paywall-partner">
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        {debugLine() ? <Text style={styles.debug}>{debugLine()}</Text> : null}
      </View>
    </View>
  );
}

export function PaywallOverlay({ view, onPurchase, onLater, onUnlock }) {
  if (!view?.visible) return null;
  if (view.variant === "partner") {
    return <PaywallPartnerScreen title={view.title} />;
  }
  return (
    <PaywallBuyerScreen
      title={view.title}
      body={view.body}
      cta={view.cta}
      hearts={view.hearts}
      shopOpen={view.shopOpen}
      busy={view.busy}
      error={view.error}
      onUnlock={onUnlock}
      onPurchase={onPurchase}
      onLater={onLater}
    />
  );
}

/**
 * The sheet as a function of the window. The overlay tint is the palette accent with an
 * alpha rather than a pasted colour, and the sheet keeps the font lock the rest of the app
 * follows: MaruBuri for titles, Pretendard for body, choices and buttons.
 */
export function buildStyles(t) {
  const { colors, fonts, font, lineHeight, space, gutter, radius, hit, layout, absoluteFill, withAlpha } = t;
  return {
    overlay: {
      ...absoluteFill,
      backgroundColor: withAlpha(colors.babyPink, 0.2),
      justifyContent: "flex-end",
      padding: gutter("lg")
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      paddingHorizontal: gutter("xl"),
      paddingVertical: space("xl"),
      marginBottom: space("md"),
      width: "100%",
      maxWidth: layout.maxContentWidth,
      alignSelf: "center"
    },
    hearts: { color: colors.charcoal, fontSize: font("bodyLarge"), fontWeight: "600", textAlign: "center", marginBottom: space("md"), fontFamily: fonts.bodyStrong },
    title: {
      color: colors.charcoal,
      fontSize: font("display"),
      lineHeight: lineHeight("display", "tight"),
      fontWeight: "700",
      marginBottom: space("md"),
      textAlign: "center",
      fontFamily: fonts.titleStrong
    },
    body: { color: colors.charcoal, fontSize: font("bodyLarge"), lineHeight: lineHeight("bodyLarge"), marginBottom: space("lg"), textAlign: "center", fontFamily: fonts.body },
    need: { color: colors.muted, fontSize: font("footnote"), marginTop: space("sm"), textAlign: "center", fontFamily: fonts.body },
    shopTitle: { color: colors.charcoal, fontSize: font("title"), fontWeight: "700", textAlign: "center", marginTop: space("lg"), marginBottom: space("sm"), fontFamily: fonts.titleStrong },
    primary: { minHeight: hit + space("xs"), borderRadius: radius.md, backgroundColor: colors.babyPink, alignItems: "center", justifyContent: "center" },
    primaryLabel: { color: colors.white, fontSize: font("body"), fontWeight: "700", fontFamily: fonts.bodyStrong },
    secondary: { minHeight: hit + space("xs"), marginTop: space("sm"), alignItems: "center", justifyContent: "center" },
    secondaryLabel: { color: colors.charcoal, fontSize: font("body"), fontFamily: fonts.body },
    error: { color: colors.error, fontSize: font("footnote"), fontWeight: "700", marginTop: space("md"), fontFamily: fonts.bodyStrong },
    disabled: { opacity: 0.4 },
    debug: { color: colors.muted, fontSize: font("caption"), textAlign: "center", marginTop: space("sm"), fontFamily: fonts.body }
  };
}

const useStyles = createStyles(buildStyles);
