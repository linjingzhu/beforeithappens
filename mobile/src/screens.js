import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AUTH_COPY, LINE, S2_EMAIL_BIND_COPY, S2_SOCIAL_COPY, S3_COPY, WORDMARK } from "./copy.js";
import { colors } from "./theme.js";

function pressableStyle(...parts) {
  return ({ pressed }) => {
    const disabled = parts.includes(styles.disabled);
    return [...parts, pressed && !disabled ? styles.pressed : null];
  };
}

function AuthKeyboardShell({ testID, children }) {
  return (
    <KeyboardAvoidingView
      style={styles.shell}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      testID={testID}
      accessibilityLabel={testID}
    >
      <ScrollView keyboardShouldPersistTaps="handled" style={styles.flexFill} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function SplashScreenView() {
  return (
    <View style={styles.shell} testID="splash" accessibilityLabel="splash">
      <Text style={styles.wordmark}>{WORDMARK}</Text>
      <Text style={styles.line}>{LINE}</Text>
    </View>
  );
}

export function SignupScreen({ email = "", error = "", busy = false, onSubmitEmail, onStartKakao, onStartNaver, onStartGoogle }) {
  const [draft, setDraft] = useState(email);
  return (
    <AuthKeyboardShell testID="signup">
      <Text style={styles.wordmarkSmall}>{WORDMARK}</Text>
      <Text style={styles.title}>{AUTH_COPY.title}</Text>
      <Text style={styles.body}>{AUTH_COPY.body}</Text>
      <Text style={styles.label}>이메일</Text>
      <TextInput
        testID="signup-email"
        value={draft}
        onChangeText={setDraft}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        editable={!busy}
        style={styles.input}
      />
      <Pressable
        testID="signup-cta"
        accessibilityRole="button"
        disabled={busy}
        onPress={() => onSubmitEmail?.(draft)}
        style={pressableStyle(styles.primary, busy ? styles.disabled : null)}
      >
        <Text style={styles.primaryLabel}>{AUTH_COPY.cta}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.divider}>{S2_SOCIAL_COPY.divider}</Text>
      <Pressable testID="signup-kakao" accessibilityRole="button" disabled={busy} onPress={onStartKakao} style={pressableStyle(styles.secondary, busy ? styles.disabled : null)}>
        <Text style={styles.secondaryLabel}>{S2_SOCIAL_COPY.kakao}</Text>
      </Pressable>
      <Pressable testID="signup-naver" accessibilityRole="button" disabled={busy} onPress={onStartNaver} style={pressableStyle(styles.secondary, busy ? styles.disabled : null)}>
        <Text style={styles.secondaryLabel}>{S2_SOCIAL_COPY.naver}</Text>
      </Pressable>
      <Pressable testID="signup-google" accessibilityRole="button" disabled={busy} onPress={onStartGoogle} style={pressableStyle(styles.secondary, busy ? styles.disabled : null)}>
        <Text style={styles.secondaryLabel}>{S2_SOCIAL_COPY.google}</Text>
      </Pressable>
    </AuthKeyboardShell>
  );
}

export function EmailBindScreen({ email = "", error = "", busy = false, onSubmitEmail }) {
  const [draft, setDraft] = useState(email);
  return (
    <AuthKeyboardShell testID="bind">
      <Text style={styles.wordmarkSmall}>{WORDMARK}</Text>
      <Text style={styles.title}>{S2_EMAIL_BIND_COPY.title}</Text>
      <Text style={styles.body}>{S2_EMAIL_BIND_COPY.body}</Text>
      <Text style={styles.label}>{S2_EMAIL_BIND_COPY.emailLabel}</Text>
      <TextInput
        testID="bind-email"
        value={draft}
        onChangeText={setDraft}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        editable={!busy}
        style={styles.input}
      />
      <Pressable
        testID="bind-cta"
        accessibilityRole="button"
        disabled={busy}
        onPress={() => onSubmitEmail?.(draft)}
        style={pressableStyle(styles.primary, busy ? styles.disabled : null)}
      >
        <Text style={styles.primaryLabel}>{S2_EMAIL_BIND_COPY.cta}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </AuthKeyboardShell>
  );
}

export function SentScreen({ email = "", onUseOtherEmail }) {
  return (
    <View style={styles.shell} testID="sent" accessibilityLabel="sent">
      <View style={styles.card}>
        <Text style={styles.wordmarkSmall}>{WORDMARK}</Text>
        <Text style={styles.title}>{AUTH_COPY.title}</Text>
        <Text style={styles.body}>{AUTH_COPY.sent}</Text>
        {email ? <Text style={styles.email}>{email}</Text> : null}
        <Pressable testID="sent-other-email" accessibilityRole="button" onPress={onUseOtherEmail} style={styles.secondary}>
          <Text style={styles.secondaryLabel}>다른 이메일로 요청</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function NoticeScreen({ email = "", error = "", busy = false, onAcknowledgeNotice }) {
  return (
    <View style={styles.shell} testID="notice" accessibilityLabel="notice">
      <View style={styles.card}>
        <Text style={styles.wordmarkSmall}>{WORDMARK}</Text>
        <Text style={styles.title}>{AUTH_COPY.title}</Text>
        <Text style={styles.body}>{AUTH_COPY.afterLogin}</Text>
        {email ? <Text style={styles.email}>{email}</Text> : null}
        <Pressable
          testID="notice-ack"
          accessibilityRole="button"
          disabled={busy}
          onPress={onAcknowledgeNotice}
          style={[styles.primary, busy ? styles.disabled : null]}
        >
          <Text style={styles.primaryLabel}>확인</Text>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  );
}

export function WorkspaceScreen({ email = "", onInvitePartner }) {
  return (
    <View style={styles.shell} testID="workspace" accessibilityLabel="workspace">
      <View style={styles.card}>
        <Text style={styles.wordmarkSmall}>{WORDMARK}</Text>
        <Text style={styles.title}>{S3_COPY.created}</Text>
        {email ? <Text style={styles.email}>{email}</Text> : null}
        <Pressable testID="invite-partner" accessibilityRole="button" onPress={onInvitePartner} style={styles.primary}>
          <Text style={styles.primaryLabel}>{S3_COPY.inviteCta}</Text>
        </Pressable>
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
  flexFill: {
    flex: 1,
    width: "100%"
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 24,
    width: "100%"
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
  },
  label: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 22,
    marginBottom: 8
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: "#fff",
    color: colors.ink
  },
  primary: {
    minHeight: 48,
    marginTop: 12,
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
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  secondaryLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700"
  },
  divider: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 4
  },
  email: {
    color: colors.ink,
    fontSize: 14,
    marginTop: 8
  },
  error: {
    color: "#b64838",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 14
  },
  disabled: {
    opacity: 0.4
  },
  pressed: {
    opacity: 0.72
  }
});
