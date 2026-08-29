import { Platform, StyleSheet, Text, View } from "react-native";
import { AUTH_COPY, LINE, WORDMARK } from "./copy.js";
import { colors } from "./theme.js";

export function SplashScreenView() {
  return (
    <View style={styles.shell} testID="splash" accessibilityLabel="splash">
      <Text style={styles.wordmark}>{WORDMARK}</Text>
      <Text style={styles.line}>{LINE}</Text>
    </View>
  );
}

export function SignupPlaceholder() {
  return (
    <View style={styles.shell} testID="signup" accessibilityLabel="signup">
      <View style={styles.card}>
        <Text style={styles.wordmarkSmall}>{WORDMARK}</Text>
        <Text style={styles.title}>{AUTH_COPY.title}</Text>
        <Text style={styles.body}>{AUTH_COPY.body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  wordmark: {
    color: colors.ink,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia, serif" }),
    fontSize: 44,
    fontWeight: "500",
    letterSpacing: -1.2,
    marginBottom: 16
  },
  wordmarkSmall: {
    color: colors.ink,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia, serif" }),
    fontSize: 22,
    fontWeight: "500",
    letterSpacing: -0.4,
    marginBottom: 12
  },
  line: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center"
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 32
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    lineHeight: 44,
    fontWeight: "500",
    letterSpacing: -0.8,
    marginBottom: 14
  },
  body: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 26
  }
});
