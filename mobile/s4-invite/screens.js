import { useState } from "react";
import { Pressable, Share, StyleSheet, Text, TextInput, View } from "react-native";
import { formatRemaining, formatSentAt } from "../../src/auth.js";
import { colors } from "../src/theme.js";
import { S4_COPY, SAME_SESSION_COPY } from "./copy.js";
import { s4ViewModel } from "./flow.js";
import { s4ShareUrl, setHostShareIo } from "./host-mount.js";

// The phone has no navigator.share/clipboard. Mounting the S4 screen registers the RN
// Share bridge so 링크 복사 / 인스타그램 / 카카오톡 do something even when the host
// mounts them without handing in an io of its own.
setHostShareIo({
  share: async (payload) => { await Share.share({ message: payload.url, url: payload.url }); },
  clipboard: { writeText: async (text) => { await Share.share({ message: String(text || "") }); } }
});

function LogoutChrome({ label, onPress }) {
  return (
    <View style={styles.logoutCluster}>
      <Pressable testID="s4-logout" accessibilityRole="button" onPress={onPress} style={styles.logoutButton}>
        <Text style={styles.logoutLabel}>{label}</Text>
      </Pressable>
      <Text style={styles.handoff}>{S4_COPY.logoutHandoff}</Text>
    </View>
  );
}

export function InviteWaitingScreen({
  email = "",
  partnerEmail = "",
  invite = null,
  copied = false,
  copyFailed = null,
  error = "",
  onCopy,
  onShareInstagram,
  onShareChat,
  onSendOrResend,
  onLogout
}) {
  const model = s4ViewModel({
    email,
    partnerEmail,
    invite,
    copied,
    copyFailed,
    shareUrl: s4ShareUrl({ invite }),
    error
  });
  const [draft, setDraft] = useState(model.partnerEmail);
  return (
    <View style={styles.shell} testID="s4-invite-waiting" accessibilityLabel="s4-invite-waiting">
      <View style={styles.top}>
        <Text style={styles.brand}>AB</Text>
        <LogoutChrome label={S4_COPY.logout} onPress={onLogout} />
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>{S4_COPY.title}</Text>
        {invite ? (
          <>
            <Text style={styles.body}>{S4_COPY.share}</Text>
            <View style={styles.row}>
              <Pressable testID="s4-copy" accessibilityRole="button" onPress={onCopy} style={styles.secondary}>
                <Text style={styles.secondaryLabel}>{S4_COPY.copyLink}</Text>
              </Pressable>
              <Pressable testID="s4-instagram" accessibilityRole="button" onPress={onShareInstagram} style={styles.secondary}>
                <Text style={styles.secondaryLabel}>{S4_COPY.instagram}</Text>
              </Pressable>
              <Pressable testID="s4-kakao" accessibilityRole="button" onPress={onShareChat} style={styles.secondary}>
                <Text style={styles.secondaryLabel}>{S4_COPY.kakao}</Text>
              </Pressable>
            </View>
            {model.copyFailed ? <Text style={styles.copyFailed}>{model.copyFailed}</Text> : null}
            {model.shareUrl ? (
              <Text testID="s4-share-url" selectable style={styles.shareUrl}>{model.shareUrl}</Text>
            ) : null}
            {copied ? <Text style={styles.copied}>{S4_COPY.copied}</Text> : null}
            <Text style={styles.body}>{S4_COPY.deviceRule}</Text>
            <Text style={styles.body}>{S4_COPY.emailCheck}</Text>
            <Text style={styles.meta}>{formatRemaining(invite.remainingMs)}</Text>
            <Text style={styles.meta}>{formatSentAt(invite.lastSentAt)}</Text>
          </>
        ) : (
          <Text style={styles.body}>{S4_COPY.deviceRule}</Text>
        )}
        <Text style={styles.label}>파트너 이메일</Text>
        <TextInput
          testID="s4-email"
          value={draft}
          onChangeText={setDraft}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <Pressable
          testID="s4-send"
          accessibilityRole="button"
          onPress={() => onSendOrResend?.(draft)}
          style={styles.primary}
        >
          <Text style={styles.primaryLabel}>{model.primaryCta}</Text>
        </Pressable>
        {email ? <Text style={styles.email}>{email}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  );
}

export function SameSessionFailScreen({ onLogoutAndContinue }) {
  return (
    <View style={styles.shell} testID="same-session-fail" accessibilityLabel="same-session-fail">
      <View style={styles.top}>
        <Text style={styles.brand}>AB</Text>
        <LogoutChrome label={SAME_SESSION_COPY.cta} onPress={onLogoutAndContinue} />
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>{S4_COPY.title}</Text>
        <Text style={styles.body}>{SAME_SESSION_COPY.message}</Text>
        <Pressable testID="same-session-cta" accessibilityRole="button" onPress={onLogoutAndContinue} style={styles.primary}>
          <Text style={styles.primaryLabel}>{SAME_SESSION_COPY.cta}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: 16,
    paddingTop: 12
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12
  },
  brand: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "700"
  },
  logoutCluster: {
    alignItems: "flex-end",
    maxWidth: 180
  },
  logoutButton: {
    minHeight: 44,
    justifyContent: "center"
  },
  logoutLabel: {
    color: colors.muted,
    fontSize: 13,
    textDecorationLine: "underline"
  },
  handoff: {
    color: colors.muted,
    fontSize: 11,
    textAlign: "right",
    marginTop: 4
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 28
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: "500",
    marginBottom: 14
  },
  body: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 12
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12
  },
  secondary: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#fff",
    justifyContent: "center"
  },
  secondaryLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700"
  },
  copied: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12
  },
  copyFailed: {
    color: "#b64838",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8
  },
  shareUrl: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12
  },
  meta: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6
  },
  label: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800",
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
    marginBottom: 10
  },
  primary: {
    minHeight: 44,
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
  email: {
    color: colors.ink,
    fontSize: 14,
    marginTop: 12
  },
  error: {
    color: "#b64838",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 12
  }
});
