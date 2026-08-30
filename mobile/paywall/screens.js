import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../src/theme.js";
import { PAYWALL_COPY } from "./contract/paywall-copy.js";

function ComparisonLabels({ labels = [PAYWALL_COPY.aligned, PAYWALL_COPY.close, PAYWALL_COPY.discuss] }) {
  return (
    <View style={styles.labels} accessibilityRole="text" testID="paywall-labels">
      {labels.map((label) => (
        <Text key={label} style={styles.labelChip}>{label}</Text>
      ))}
    </View>
  );
}

export function PaywallBuyerScreen({
  title = PAYWALL_COPY.buyerTitle,
  body = PAYWALL_COPY.buyerBody,
  cta = PAYWALL_COPY.buyerCta,
  secondary = PAYWALL_COPY.later,
  labels,
  busy = false,
  error = "",
  onPurchase,
  onLater
}) {
  return (
    <View style={styles.overlay} testID="paywall-buyer" accessibilityLabel="paywall-buyer">
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        <ComparisonLabels labels={labels} />
        <Pressable
          testID="paywall-purchase"
          accessibilityRole="button"
          disabled={busy}
          onPress={onPurchase}
          style={[styles.primary, busy ? styles.disabled : null]}
        >
          <Text style={styles.primaryLabel}>{cta}</Text>
        </Pressable>
        <Pressable
          testID="paywall-later"
          accessibilityRole="button"
          onPress={onLater}
          style={styles.secondary}
        >
          <Text style={styles.secondaryLabel}>{secondary}</Text>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  );
}

export function PaywallPartnerScreen({
  title = PAYWALL_COPY.partnerTitle,
  body = PAYWALL_COPY.partnerBody,
  secondary = PAYWALL_COPY.later,
  labels,
  onLater
}) {
  return (
    <View style={styles.overlay} testID="paywall-partner" accessibilityLabel="paywall-partner">
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        <ComparisonLabels labels={labels} />
        {onLater ? (
          <Pressable testID="paywall-later" accessibilityRole="button" onPress={onLater} style={styles.secondary}>
            <Text style={styles.secondaryLabel}>{secondary}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function PaywallOverlay({ view, onPurchase, onLater }) {
  if (!view?.visible) return null;
  if (view.variant === "partner") {
    return <PaywallPartnerScreen title={view.title} body={view.body} labels={view.labels} onLater={onLater} />;
  }
  return (
    <PaywallBuyerScreen
      title={view.title}
      body={view.body}
      cta={view.cta}
      secondary={view.secondary}
      labels={view.labels}
      busy={view.busy}
      error={view.error}
      onPurchase={onPurchase}
      onLater={onLater}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(248, 243, 237, 0.72)",
    justifyContent: "flex-end",
    padding: 20
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    marginBottom: 12
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    lineHeight: 38,
    fontWeight: "500",
    letterSpacing: -0.6,
    marginBottom: 12
  },
  body: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 16
  },
  labels: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18
  },
  labelChip: {
    color: colors.ink,
    backgroundColor: colors.soft,
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4
  },
  primary: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.coral,
    alignItems: "center",
    justifyContent: "center"
  },
  primaryLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700"
  },
  secondary: {
    minHeight: 48,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center"
  },
  secondaryLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700"
  },
  error: {
    color: "#b64838",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12
  },
  disabled: {
    opacity: 0.4
  }
});
