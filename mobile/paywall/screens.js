import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../src/theme.js";
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

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(246, 200, 216, 0.2)",
    justifyContent: "flex-end",
    padding: 20
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    marginBottom: 12
  },
  hearts: { color: colors.charcoal, fontSize: 16, fontWeight: "600", textAlign: "center", marginBottom: 12 },
  title: { color: colors.charcoal, fontSize: 26, lineHeight: 34, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  body: { color: colors.charcoal, fontSize: 16, lineHeight: 24, marginBottom: 16, textAlign: "center" },
  need: { color: colors.muted, fontSize: 13, marginTop: 10, textAlign: "center" },
  shopTitle: { color: colors.charcoal, fontSize: 22, fontWeight: "700", textAlign: "center", marginTop: 18, marginBottom: 10 },
  primary: { minHeight: 48, borderRadius: 12, backgroundColor: colors.babyPink, alignItems: "center", justifyContent: "center" },
  primaryLabel: { color: "#fff", fontSize: 15, fontWeight: "700" },
  secondary: { minHeight: 48, marginTop: 10, alignItems: "center", justifyContent: "center" },
  secondaryLabel: { color: colors.charcoal, fontSize: 15 },
  error: { color: colors.error, fontSize: 13, fontWeight: "700", marginTop: 12 },
  disabled: { opacity: 0.4 },
  debug: { color: colors.muted, fontSize: 12, textAlign: "center", marginTop: 10 }
});
