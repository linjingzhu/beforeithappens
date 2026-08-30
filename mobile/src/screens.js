import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ACCOUNT_COPY, AUTH_COPY, LINE, PACK_DETAIL_COPY, PACK_LIST_COPY, PACK_LIST_ROWS, PAIR_COPY, S2_COPY, S2_EMAIL_BIND_COPY, S3_COPY, WORDMARK } from "./copy.js";
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

function BackButton({ onPress, testID = "back" }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel="back"
      onPress={onPress}
      style={pressableStyle(styles.backBtn)}
    >
      <Text style={styles.backChevron}>‹</Text>
    </Pressable>
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
          <Text style={styles.gateTitle}>{S2_COPY.title}</Text>
          <Text style={styles.body}>{S2_COPY.body}</Text>
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

export function PackListScreen({ onOpenMarriage, onOpenAccount }) {
  return (
    <View style={styles.packShell} testID="pack-list" accessibilityLabel="pack-list">
      <View style={styles.packTop}>
        <Text style={styles.coverBrand}>{WORDMARK}</Text>
        <Pressable testID="pack-account" accessibilityRole="button" onPress={onOpenAccount} style={pressableStyle(styles.accountEntry)}>
          <Text style={styles.accountEntryLabel}>{ACCOUNT_COPY.title}</Text>
        </Pressable>
      </View>
      <Text style={styles.packTitle}>{PACK_LIST_COPY.title}</Text>
      <Text style={styles.packSub}>{PACK_LIST_COPY.subtitle}</Text>
      <View style={styles.packStack}>
        {PACK_LIST_ROWS.map((row) => (
          row.open ? (
            <Pressable
              key={row.id}
              testID={`pack-${row.id}`}
              accessibilityRole="button"
              onPress={onOpenMarriage}
              style={pressableStyle(styles.packCardRow)}
            >
              <Text style={styles.packRowLabel}>{row.label}</Text>
              <Text style={styles.packChevron}>›</Text>
            </Pressable>
          ) : (
            <View key={row.id} testID={`pack-${row.id}`} style={styles.packCardRow}>
              <Text style={styles.packRowLabelMuted}>{row.label}</Text>
              <Text style={styles.soonPlain}>{PACK_LIST_COPY.soon}</Text>
            </View>
          )
        ))}
      </View>
    </View>
  );
}

export function PackDetailScreen({ onBack, onSendLink }) {
  return (
    <View style={styles.coverShell} testID="pack-detail" accessibilityLabel="pack-detail">
      <View style={styles.navRow}>
        <BackButton onPress={onBack} testID="pack-detail-back" />
      </View>
      <Text style={styles.detailTitle}>{PACK_DETAIL_COPY.title}</Text>
      <Text style={styles.detailSub}>{PACK_DETAIL_COPY.subtitle}</Text>
      <NotebookGraphic />
      <Text style={styles.coverBody}>{PACK_DETAIL_COPY.line1}</Text>
      <Text style={styles.coverBody}>{PACK_DETAIL_COPY.line2}</Text>
      <Text style={styles.coverBody}>{PACK_DETAIL_COPY.line3}</Text>
      <Pressable
        testID="pack-detail-cta"
        accessibilityRole="button"
        onPress={onSendLink}
        style={pressableStyle(styles.coverCta)}
      >
        <Text style={styles.primaryLabel}>{PACK_DETAIL_COPY.cta}</Text>
      </Pressable>
    </View>
  );
}

export function AccountScreen({ email = "", busy = false, onBack, onLogout }) {
  return (
    <View style={styles.accountShell} testID="account" accessibilityLabel="account">
      <View style={styles.navRowCenter}>
        <BackButton onPress={onBack} testID="account-back" />
        <Text style={styles.navTitle}>{ACCOUNT_COPY.title}</Text>
        <View style={styles.backBtn} />
      </View>
      <View style={styles.accountCard}>
        <Text style={styles.accountEmailLabel}>{ACCOUNT_COPY.email}</Text>
        <Text style={styles.accountEmailValue} testID="account-email">{email}</Text>
      </View>
      <Pressable
        testID="account-logout"
        accessibilityRole="button"
        disabled={busy}
        onPress={onLogout}
        style={pressableStyle(styles.logoutBtn, busy ? styles.disabled : null)}
      >
        <Text style={styles.logoutLabel}>{ACCOUNT_COPY.logout}</Text>
      </Pressable>
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
  onBack,
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
        <View style={styles.navRowCenter}>
          <BackButton onPress={onBack} testID="invite-back" />
          <Text style={styles.navTitle}>{PAIR_COPY.headline}</Text>
          <View style={styles.backBtn} />
        </View>
        <Text style={styles.inviteSub}>{PAIR_COPY.sub}</Text>
        <View style={styles.shareCard}>
          <Pressable testID="invite-copy-link" accessibilityRole="button" onPress={onCopyLink} style={pressableStyle(styles.shareBtnWide)}>
            <Text style={styles.shareIcon}>🔗</Text>
            <Text style={styles.shareBtnWideLabel}>{PAIR_COPY.copyLink}</Text>
          </Pressable>
          <Pressable testID="invite-instagram" accessibilityRole="button" onPress={onShareInstagram} style={pressableStyle(styles.shareBtnWide)}>
            <Text style={styles.shareIcon}>◎</Text>
            <Text style={styles.shareBtnWideLabel}>{PAIR_COPY.instagram}</Text>
          </Pressable>
          <Pressable testID="invite-kakao" accessibilityRole="button" onPress={onShareKakao} style={pressableStyle(styles.shareBtnWide)}>
            <Text style={styles.shareIcon}>💬</Text>
            <Text style={styles.shareBtnWideLabel}>{PAIR_COPY.kakao}</Text>
          </Pressable>
        </View>
        {copied ? <Text style={styles.copiedNote}>링크를 복사했어요.</Text> : null}
        <View style={styles.codeCard}>
          <Text style={styles.codeCardEyebrow}>{PAIR_COPY.appCode}</Text>
          <View style={styles.myCodeRow}>
            <Text style={styles.myCodeLabel}>{PAIR_COPY.myCode}</Text>
            <Text style={styles.myCodeInline} testID="invite-my-code">{pairCodeDisplay || "····"}</Text>
            <Pressable testID="invite-copy-code" accessibilityRole="button" onPress={onCopyCode} style={pressableStyle(styles.codeCopyBtn)}>
              <Text style={styles.codeCopyBtnLabel}>{codeCopied ? "복사됨" : PAIR_COPY.copyCode}</Text>
            </Pressable>
          </View>
          <View style={styles.codeDivider} />
          <Text style={styles.partnerHint}>{PAIR_COPY.partnerCard}</Text>
          <View style={styles.connectRow}>
            <TextInput
              testID="invite-partner-code"
              value={partnerCode}
              onChangeText={onChangePartnerCode}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!busy}
              placeholder={PAIR_COPY.partnerPlaceholder}
              placeholderTextColor={colors.muted}
              style={styles.connectInput}
            />
            <Pressable
              testID="invite-connect"
              accessibilityRole="button"
              disabled={busy}
              onPress={onConnect}
              style={pressableStyle(styles.connectBtn, busy ? styles.disabled : null)}
            >
              <Text style={styles.connectBtnLabel}>{PAIR_COPY.connect}</Text>
            </Pressable>
          </View>
        </View>
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
    color: colors.ink,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia, serif" }),
    fontSize: 26,
    fontWeight: "500"
  },
  coverBody: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 24,
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
    marginVertical: 28,
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
    backgroundColor: colors.muted,
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
  packShell: {
    flex: 1,
    backgroundColor: colors.coverPaper,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 32
  },
  packTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  accountEntry: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 4
  },
  accountEntryLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "600"
  },
  packTitle: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: "700",
    marginTop: 28
  },
  packSub: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 24
  },
  packStack: {
    gap: 10
  },
  packCardRow: {
    minHeight: 56,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16
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
  soonPlain: {
    color: colors.muted,
    fontSize: 14
  },
  navRow: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center"
  },
  navRowCenter: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  navTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "700"
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center"
  },
  backChevron: {
    color: colors.ink,
    fontSize: 32,
    lineHeight: 34,
    marginTop: -2
  },
  detailTitle: {
    color: colors.ink,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia, serif" }),
    fontSize: 40,
    fontWeight: "500",
    marginTop: 20
  },
  detailSub: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
    textAlign: "center"
  },
  accountShell: {
    flex: 1,
    backgroundColor: colors.coverPaper,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32
  },
  accountCard: {
    marginTop: 28,
    minHeight: 56,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  accountEmailLabel: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "600"
  },
  accountEmailValue: {
    color: colors.ink,
    fontSize: 15
  },
  logoutBtn: {
    minHeight: 52,
    marginTop: "auto",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.logout,
    alignItems: "center",
    justifyContent: "center"
  },
  logoutLabel: {
    color: colors.logout,
    fontSize: 16,
    fontWeight: "600"
  },
  inviteShell: {
    flex: 1,
    backgroundColor: colors.coverPaper
  },
  inviteScroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32
  },
  inviteSub: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 22
  },
  shareCard: {
    width: "100%",
    backgroundColor: colors.cream,
    borderRadius: 20,
    padding: 14,
    gap: 10
  },
  shareBtnWide: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 10
  },
  shareIcon: {
    fontSize: 16
  },
  shareBtnWideLabel: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "600"
  },
  copiedNote: {
    color: colors.coral,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8
  },
  codeCard: {
    width: "100%",
    backgroundColor: colors.cream,
    borderRadius: 20,
    padding: 16,
    marginTop: 16
  },
  codeCardEyebrow: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 12
  },
  myCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  myCodeLabel: {
    color: colors.ink,
    fontSize: 15
  },
  myCodeInline: {
    flex: 1,
    color: colors.ink,
    fontSize: 17,
    fontWeight: "600"
  },
  codeCopyBtn: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  codeCopyBtnLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "600"
  },
  codeDivider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 14
  },
  partnerHint: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 10
  },
  connectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  connectInput: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: "#fff",
    color: colors.ink
  },
  connectBtn: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#d8c4b0",
    alignItems: "center",
    justifyContent: "center"
  },
  connectBtnLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700"
  }
});
