import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AUTH_COPY, COVER_COPY, LINE, PACK_LIST_COPY, PACK_LIST_ROWS, PAIR_COPY, PREVIEW_Q1_COPY, S2_EMAIL_BIND_COPY, S2_KEEP_COPY, S3_COPY, WORDMARK } from "./copy.js";
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

function NotebookGraphic() {
  return (
    <View style={styles.notebookWrap} accessibilityLabel="notebook">
      <View style={styles.notebookShadow} />
      <View style={styles.notebook}>
        <View style={styles.stitch}>
          <Text style={styles.notebookHeart}>♡</Text>
        </View>
        <View style={styles.strap}>
          <View style={styles.snap} />
        </View>
        <View style={styles.ribbon} />
      </View>
    </View>
  );
}

export function CoverScreen({ onPreviewQuestion }) {
  return (
    <View style={styles.coverShell} testID="cover" accessibilityLabel="cover">
      <Text style={styles.coverBrand}>{WORDMARK}</Text>
      <Text style={styles.coverHeart}>♡</Text>
      <Text style={styles.coverTitle}>{COVER_COPY.title}</Text>
      <NotebookGraphic />
      <Text style={styles.coverBody}>{COVER_COPY.line1}</Text>
      <Text style={styles.coverBody}>{COVER_COPY.line2}</Text>
      <Pressable
        testID="cover-cta"
        accessibilityRole="button"
        onPress={onPreviewQuestion}
        style={pressableStyle(styles.coverCta)}
      >
        <Text style={styles.primaryLabel}>{COVER_COPY.cta}</Text>
      </Pressable>
    </View>
  );
}

export function PreviewQ1Screen({
  question,
  choiceId = "",
  loggedIn = false,
  onSelectChoice,
  onKeepAnswer,
  onContinue
}) {
  const choices = question?.choices || [];
  return (
    <ScrollView
      testID="preview-q1"
      accessibilityLabel="preview-q1"
      style={styles.flexFill}
      contentContainerStyle={styles.previewScroll}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.card}>
        <Text style={styles.wordmarkSmall}>{WORDMARK}</Text>
        <Text style={styles.badge}>{PREVIEW_Q1_COPY.draftBadge}</Text>
        <Text style={styles.title}>{question?.title}</Text>
        <Text style={styles.body}>{question?.intent}</Text>
        {choices.map((choice) => (
          <Pressable
            key={choice.id}
            testID={`preview-choice-${choice.id}`}
            accessibilityRole="button"
            onPress={() => onSelectChoice?.(choice.id)}
            style={pressableStyle(styles.choice, choiceId === choice.id ? styles.choiceOn : null)}
          >
            <Text style={styles.choiceLabel}>{choice.label}</Text>
          </Pressable>
        ))}
        <Pressable
          testID="preview-keep"
          accessibilityRole="button"
          onPress={loggedIn ? onContinue : onKeepAnswer}
          style={pressableStyle(styles.primary, choiceId ? null : styles.disabled)}
        >
          <Text style={styles.primaryLabel}>{loggedIn ? PREVIEW_Q1_COPY.continueCta : PREVIEW_Q1_COPY.keepCta}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

export function SignupScreen({ email = "", error = "", busy = false, onSubmitEmail }) {
  const [draft, setDraft] = useState(email);
  return (
    <KeyboardAvoidingView
      style={styles.coverShell}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      testID="signup"
      accessibilityLabel="signup"
    >
      <Text style={styles.gateBrand}>{WORDMARK}</Text>
      <ScrollView keyboardShouldPersistTaps="handled" style={styles.flexFill} contentContainerStyle={styles.gateScroll}>
        <View style={styles.gateCard}>
          <Text style={styles.gateTitle}>{S2_KEEP_COPY.title}</Text>
          <Text style={styles.body}>{S2_KEEP_COPY.body}</Text>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            testID="signup-email"
            value={draft}
            onChangeText={setDraft}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!busy}
            placeholder="이메일"
            placeholderTextColor={colors.muted}
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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

export function PackListScreen({ onOpenMarriage }) {
  return (
    <View style={styles.packShell} testID="pack-list" accessibilityLabel="pack-list">
      <Text style={styles.coverBrand}>{WORDMARK}</Text>
      <Text style={styles.packTitle}>{PACK_LIST_COPY.title}</Text>
      <Text style={styles.packSub}>{PACK_LIST_COPY.subtitle}</Text>
      <View style={styles.packCard}>
        {PACK_LIST_ROWS.map((row) => (
          row.open ? (
            <Pressable
              key={row.id}
              testID={`pack-${row.id}`}
              accessibilityRole="button"
              onPress={onOpenMarriage}
              style={pressableStyle(styles.packRow)}
            >
              <Text style={styles.packRowLabel}>{row.label}</Text>
              <Text style={styles.packChevron}>›</Text>
            </Pressable>
          ) : (
            <View key={row.id} testID={`pack-${row.id}`} style={styles.packRow}>
              <Text style={styles.packRowLabelMuted}>{row.label}</Text>
              <View style={styles.soonPill}>
                <Text style={styles.soonLabel}>{PACK_LIST_COPY.soon}</Text>
              </View>
            </View>
          )
        ))}
      </View>
    </View>
  );
}

export function InviteScreen({
  pairCodeDisplay = "",
  partnerCode = "",
  copied = false,
  codeCopied = false,
  error = "",
  busy = false,
  onChangePartnerCode,
  onCopyLink,
  onShareInstagram,
  onShareKakao,
  onCopyCode,
  onConnect
}) {
  return (
    <KeyboardAvoidingView
      style={styles.inviteShell}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      testID="invite"
      accessibilityLabel="invite"
    >
      <ScrollView keyboardShouldPersistTaps="handled" style={styles.flexFill} contentContainerStyle={styles.inviteScroll}>
        <Text style={styles.coverBrand}>{WORDMARK}</Text>
        <Text style={styles.inviteHeadline}>{PAIR_COPY.headline}</Text>
        <Text style={styles.inviteSub}>{PAIR_COPY.sub}</Text>
        <View style={styles.shareRow}>
          <Pressable testID="invite-copy-link" accessibilityRole="button" onPress={onCopyLink} style={pressableStyle(styles.shareBtn)}>
            <Text style={styles.shareBtnLabel}>🔗 {PAIR_COPY.copyLink}</Text>
          </Pressable>
          <Pressable testID="invite-instagram" accessibilityRole="button" onPress={onShareInstagram} style={pressableStyle(styles.shareBtn)}>
            <Text style={styles.shareBtnLabel}>{PAIR_COPY.instagram}</Text>
          </Pressable>
          <Pressable testID="invite-kakao" accessibilityRole="button" onPress={onShareKakao} style={pressableStyle(styles.shareBtn)}>
            <Text style={styles.shareBtnLabel}>{PAIR_COPY.kakao}</Text>
          </Pressable>
        </View>
        {copied ? <Text style={styles.copiedNote}>링크를 복사했어요.</Text> : null}
        <Text style={styles.myCodeLabel}>{PAIR_COPY.myCode}</Text>
        <Text style={styles.myCodeValue} testID="invite-my-code">{pairCodeDisplay || "····"}</Text>
        <Pressable testID="invite-copy-code" accessibilityRole="button" onPress={onCopyCode} style={pressableStyle(styles.codeCopy)}>
          <Text style={styles.codeCopyLabel}>{codeCopied ? "복사됨" : PAIR_COPY.copyCode}</Text>
        </Pressable>
        <View style={styles.partnerCard}>
          <Text style={styles.partnerCardTitle}>{PAIR_COPY.partnerCard}</Text>
          <TextInput
            testID="invite-partner-code"
            value={partnerCode}
            onChangeText={onChangePartnerCode}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!busy}
            placeholder={PAIR_COPY.partnerPlaceholder}
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
        </View>
        <Pressable
          testID="invite-connect"
          accessibilityRole="button"
          disabled={busy}
          onPress={onConnect}
          style={pressableStyle(styles.coverCta, busy ? styles.disabled : null)}
        >
          <Text style={styles.primaryLabel}>{PAIR_COPY.connect}</Text>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  coverShell: {
    flex: 1,
    backgroundColor: colors.coverPaper,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 32
  },
  coverBrand: {
    color: colors.coral,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia, serif" }),
    fontSize: 28,
    fontWeight: "500",
    marginTop: 12
  },
  coverHeart: {
    color: colors.coral,
    fontSize: 18,
    marginTop: 8,
    marginBottom: 18
  },
  coverTitle: {
    color: colors.ink,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia, serif" }),
    fontSize: 26,
    lineHeight: 36,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 24
  },
  coverBody: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 26,
    textAlign: "center"
  },
  coverCta: {
    minHeight: 52,
    alignSelf: "stretch",
    marginTop: "auto",
    borderRadius: 16,
    backgroundColor: colors.coral,
    alignItems: "center",
    justifyContent: "center"
  },
  notebookWrap: {
    width: 196,
    height: 196,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  notebookShadow: {
    position: "absolute",
    width: 176,
    height: 176,
    borderRadius: 12,
    backgroundColor: "#e8d8c4",
    top: 16,
    left: 18
  },
  notebook: {
    width: 176,
    height: 176,
    backgroundColor: colors.cream,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.stitch
  },
  stitch: {
    flex: 1,
    margin: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.stitch,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  notebookHeart: {
    color: colors.coral,
    fontSize: 32
  },
  strap: {
    position: "absolute",
    right: -12,
    top: 68,
    width: 30,
    height: 40,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.stitch,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center"
  },
  snap: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.gold
  },
  ribbon: {
    position: "absolute",
    left: 28,
    bottom: -16,
    width: 10,
    height: 24,
    backgroundColor: colors.coral,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6
  },
  gateBrand: {
    alignSelf: "flex-start",
    color: colors.coral,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia, serif" }),
    fontSize: 22,
    fontWeight: "500",
    marginBottom: 12
  },
  gateScroll: {
    flexGrow: 1,
    justifyContent: "center",
    width: "100%"
  },
  gateCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.gateCard,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: "#2b2521",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  gateTitle: {
    color: colors.ink,
    fontSize: 22,
    lineHeight: 32,
    fontWeight: "700",
    marginBottom: 12
  },
  previewScroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: colors.coverPaper
  },
  badge: {
    alignSelf: "flex-start",
    color: colors.coral,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 10
  },
  choice: {
    minHeight: 48,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  choiceOn: {
    borderColor: colors.coral,
    backgroundColor: colors.soft
  },
  choiceLabel: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22
  },
  packShell: {
    flex: 1,
    backgroundColor: colors.coverPaper,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 32
  },
  packTitle: {
    color: colors.ink,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia, serif" }),
    fontSize: 34,
    fontWeight: "600",
    marginTop: 28
  },
  packSub: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 24
  },
  packCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden"
  },
  packRow: {
    minHeight: 56,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  packRowLabel: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "600"
  },
  packRowLabelMuted: {
    color: colors.ink,
    fontSize: 17
  },
  packChevron: {
    color: colors.muted,
    fontSize: 22
  },
  soonPill: {
    backgroundColor: colors.soft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  soonLabel: {
    color: colors.coral,
    fontSize: 12,
    fontWeight: "700"
  },
  inviteShell: {
    flex: 1,
    backgroundColor: colors.coverPaper
  },
  inviteScroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32
  },
  inviteHeadline: {
    color: colors.ink,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia, serif" }),
    fontSize: 26,
    lineHeight: 36,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 20
  },
  inviteSub: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 22
  },
  shareRow: {
    flexDirection: "row",
    gap: 8,
    width: "100%"
  },
  shareBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4
  },
  shareBtnLabel: {
    color: colors.coral,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center"
  },
  copiedNote: {
    color: colors.coral,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8
  },
  myCodeLabel: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 28
  },
  myCodeValue: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 6,
    marginTop: 8
  },
  codeCopy: {
    marginTop: 8,
    marginBottom: 24
  },
  codeCopyLabel: {
    color: colors.coral,
    fontSize: 13,
    fontWeight: "700"
  },
  partnerCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  partnerCardTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10
  }
});
