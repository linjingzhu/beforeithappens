import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ACCOUNT_COPY, AUTH_COPY, comingSoonPackLabel, PACK_LIST_COPY, PACK_LIST_ROWS, PAIR_COPY, S2_COPY, S2_EMAIL_BIND_COPY, S3_COPY, WORDMARK } from "./copy.js";
import { colors } from "./theme.js";
import { GradientButtonWrap, ScreenGradient } from "./gradient.js";
import { debugLine } from "./virtual.js";
import { HEART_COPY, HEARTS, canUnlockRest, showsHeartBalance } from "../../src/hearts.js";
import { CERTIFICATE_COPY, comingSoonExistingQuestion, REASON_PROMPT, SAMPLE_LABELS, SAMPLE_RESULT_EXAMPLE, TOGETHER_CTA } from "../../src/marriage-sample.js";
import { requestLoveMeNotificationPermission } from "./notifications.js";

function pressableStyle(...parts) {
  return ({ pressed }) => {
    const disabled = parts.includes(styles.disabled);
    return [...parts, pressed && !disabled ? styles.pressed : null];
  };
}

function SafeScreen({ style, children, testID }) {
  return (
    <ScreenGradient>
      <SafeAreaView style={[styles.safeFill, style]} testID={testID} accessibilityLabel={testID}>
        {children}
      </SafeAreaView>
    </ScreenGradient>
  );
}

function DebugLine() {
  const line = debugLine();
  if (!line) return null;
  return <Text style={styles.debug} testID="debug-line">{line}</Text>;
}

function HeartsChip({ balance }) {
  return <Text style={styles.hearts} testID="hearts-balance">{`♡ ${balance}`}</Text>;
}

function PrimaryButton({ testID, label, onPress, disabled }) {
  return (
    <Pressable testID={testID} accessibilityRole="button" disabled={disabled} onPress={onPress} style={pressableStyle(styles.primary, disabled ? styles.disabled : null)}>
      <GradientButtonWrap>
        <Text style={styles.primaryLabel}>{label}</Text>
      </GradientButtonWrap>
    </Pressable>
  );
}

function AuthKeyboardShell({ testID, children, contentStyle }) {
  return (
    <KeyboardAvoidingView testID={testID} style={styles.flexFill} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" style={styles.flexFill} contentContainerStyle={contentStyle || styles.gateScroll}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function BackButton({ onPress, testID = "back" }) {
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel="back" onPress={onPress} style={pressableStyle(styles.backBtn)}>
      <Text style={styles.backChevron}>‹</Text>
    </Pressable>
  );
}

export function SplashScreenView() {
  return (
    <SafeScreen style={styles.centered} testID="splash">
      <Text style={styles.wordmark}>{WORDMARK}</Text>
      <DebugLine />
    </SafeScreen>
  );
}

export function SignupScreen({ email = "", error = "", busy = false, firstRun = false, onSubmitEmail, onBack }) {
  const [draft, setDraft] = useState(email);
  useEffect(() => {
    requestLoveMeNotificationPermission();
  }, []);
  return (
    <SafeScreen testID="signup" style={styles.coverShell}>
      <AuthKeyboardShell contentStyle={styles.loginScroll}>
        {firstRun ? null : (
          <View style={styles.gateTop}>
            <BackButton onPress={onBack} testID="signup-back" />
            <Text style={styles.body}>{S2_COPY.body}</Text>
          </View>
        )}
        <View style={styles.loginHero}>
          <Text style={styles.wordmark}>{WORDMARK}</Text>
        </View>
        <View style={styles.emailField}>
          <Text style={styles.mailIcon} accessibilityElementsHidden>✉</Text>
          <TextInput
            testID="signup-email"
            value={draft}
            onChangeText={setDraft}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!busy}
            placeholder={S2_COPY.emailPlaceholder}
            placeholderTextColor={colors.muted}
            style={styles.emailInput}
          />
        </View>
        <PrimaryButton testID="signup-cta" label={AUTH_COPY.cta} disabled={busy} onPress={() => onSubmitEmail?.(draft)} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </AuthKeyboardShell>
      <DebugLine />
    </SafeScreen>
  );
}

export function EmailBindScreen({ email = "", error = "", busy = false, onSubmitEmail }) {
  const [draft, setDraft] = useState(email);
  return (
    <SafeScreen style={styles.centered}>
      <AuthKeyboardShell testID="bind">
        <Text style={styles.title}>{S2_EMAIL_BIND_COPY.title}</Text>
        <Text style={styles.body}>{S2_EMAIL_BIND_COPY.body}</Text>
        <TextInput testID="bind-email" value={draft} onChangeText={setDraft} autoCapitalize="none" keyboardType="email-address" editable={!busy} style={styles.input} />
        <PrimaryButton testID="bind-cta" label={S2_EMAIL_BIND_COPY.cta} disabled={busy} onPress={() => onSubmitEmail?.(draft)} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </AuthKeyboardShell>
      <DebugLine />
    </SafeScreen>
  );
}

export function SentScreen({ email = "", onUseOtherEmail }) {
  return (
    <SafeScreen style={styles.centered} testID="sent">
      <Text style={styles.body}>{AUTH_COPY.sent}</Text>
      {email ? <Text style={styles.email}>{email}</Text> : null}
      <Pressable testID="sent-other-email" onPress={onUseOtherEmail} style={styles.secondary}>
        <Text style={styles.secondaryLabel}>다른 이메일로 요청</Text>
      </Pressable>
      <DebugLine />
    </SafeScreen>
  );
}

export function NoticeScreen({ email = "", error = "", busy = false, onAcknowledgeNotice }) {
  return (
    <SafeScreen style={styles.centered} testID="notice">
      <Text style={styles.body}>{AUTH_COPY.afterLogin}</Text>
      {email ? <Text style={styles.email}>{email}</Text> : null}
      <PrimaryButton testID="notice-ack" label="확인" disabled={busy} onPress={onAcknowledgeNotice} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <DebugLine />
    </SafeScreen>
  );
}

export function PackListScreen({ onOpenMarriage, onOpenComingSoon, onOpenAccount, hearts = HEARTS.start, session = null }) {
  return (
    <SafeScreen style={styles.packShell} testID="pack-list">
      {showsHeartBalance(session) ? <HeartsChip balance={hearts} /> : null}
      <Text style={styles.packTitle}>{PACK_LIST_COPY.title}</Text>
      <View style={styles.packStack}>
        {PACK_LIST_ROWS.map((row) => (
          <Pressable
            key={row.id}
            testID={`pack-${row.id}`}
            accessibilityRole="button"
            onPress={row.open ? onOpenMarriage : () => onOpenComingSoon?.(row.id)}
            style={pressableStyle(styles.packCardRow)}
          >
            <Text style={styles.packMark}>{row.mark}</Text>
            <Text style={row.open ? styles.packRowLabel : styles.packRowLabelMuted}>{row.label}</Text>
            <Text style={row.open ? styles.packChevron : styles.soonPlain}>{row.open ? "›" : PACK_LIST_COPY.soon}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable testID="pack-account" accessibilityRole="button" onPress={onOpenAccount} style={pressableStyle(styles.accountFooter)}>
        <Text style={styles.accountEntryLabel}>{ACCOUNT_COPY.title}</Text>
      </Pressable>
      <DebugLine />
    </SafeScreen>
  );
}

export function PackDetailScreen({ onBack }) {
  return (
    <SafeScreen testID="pack-detail">
      <BackButton onPress={onBack} testID="pack-detail-back" />
      <DebugLine />
    </SafeScreen>
  );
}

export function SampleQuestionScreen({ question, choiceId = "", reason = "", error = "", onChangeChoice, onChangeReason, onSubmit, onBack }) {
  return (
    <SafeScreen testID="sample-q" style={styles.detailShell}>
      <BackButton onPress={onBack} testID="sample-back" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollPad}>
        <Text style={styles.sampleTitle}>{question?.title || ""}</Text>
        {(question?.choices || []).map((choice) => (
          <Pressable
            key={choice.id}
            testID={`choice-${choice.id}`}
            onPress={() => onChangeChoice?.(choice.id)}
            style={[styles.choice, choiceId === choice.id ? styles.choiceOn : null]}
          >
            <Text style={styles.choiceLabel}>{choice.label}</Text>
          </Pressable>
        ))}
        <Text style={styles.label}>{REASON_PROMPT}</Text>
        <TextInput
          testID="sample-reason"
          value={reason}
          onChangeText={onChangeReason}
          placeholder={REASON_PROMPT}
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <PrimaryButton testID="sample-next" label="다음" disabled={!choiceId || !String(reason || "").trim()} onPress={onSubmit} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
      <DebugLine />
    </SafeScreen>
  );
}

export function SampleResultScreen({ question, myChoice, partnerChoice, onTogether }) {
  return (
    <SafeScreen testID="sample-result" style={styles.centered}>
      <Text style={styles.example}>{SAMPLE_RESULT_EXAMPLE}</Text>
      <View style={styles.labelsRow}>
        {Object.values(SAMPLE_LABELS).map((label) => (
          <Text key={label} style={styles.labelChip}>{label}</Text>
        ))}
      </View>
      <Text style={styles.body}>{question?.title || ""}</Text>
      <View style={styles.answerCard}><Text style={styles.who}>나</Text><Text style={styles.choiceLabel}>{myChoice?.label || ""}</Text></View>
      <View style={styles.answerCard}><Text style={styles.who}>상대</Text><Text style={styles.choiceLabel}>{partnerChoice?.label || ""}</Text></View>
      <PrimaryButton testID="together-cta" label={TOGETHER_CTA} onPress={onTogether} />
      <DebugLine />
    </SafeScreen>
  );
}

export function ComingSoonScreen({ packId = "home-mgmt", onBackToList }) {
  const question = comingSoonExistingQuestion(packId);
  return (
    <SafeScreen style={styles.centered} testID="coming-soon">
      <Text style={styles.soonBadge}>{PACK_LIST_COPY.soon}</Text>
      <Text style={styles.soonTitle}>{comingSoonPackLabel(packId)}</Text>
      {question ? <Text style={styles.body}>{question}</Text> : null}
      <Pressable testID="coming-soon-list" onPress={onBackToList} style={pressableStyle(styles.textLink)}>
        <Text style={styles.textLinkLabel}>목록으로</Text>
      </Pressable>
      <DebugLine />
    </SafeScreen>
  );
}

export function TasteResultScreen({ onBackToList }) {
  return <ComingSoonScreen onBackToList={onBackToList} />;
}

export function AccountScreen({
  email = "",
  partnerEmail = "",
  acceptedPartner = false,
  guest = false,
  busy = false,
  onBack,
  onLogout,
  onLogin,
  onInvite
}) {
  if (guest) {
    return (
      <SafeScreen style={styles.centered} testID="account">
        <Text style={styles.navTitle}>{ACCOUNT_COPY.title}</Text>
        <PrimaryButton testID="account-login" label={ACCOUNT_COPY.login} onPress={onLogin} />
        <DebugLine />
      </SafeScreen>
    );
  }
  return (
    <SafeScreen style={styles.accountShell} testID="account">
      <View style={styles.navRowCenter}>
        <BackButton onPress={onBack} testID="account-back" />
        <Text style={styles.navTitle}>{ACCOUNT_COPY.title}</Text>
        <View style={styles.backBtn} />
      </View>
      {acceptedPartner ? (
        <Text style={styles.accountEmailValue} testID="account-partner">{partnerEmail || email}</Text>
      ) : (
        <>
          <Text style={styles.accountEmailValue} testID="account-email">{email}</Text>
          <PrimaryButton testID="account-invite" label={ACCOUNT_COPY.invite} onPress={onInvite} />
        </>
      )}
      <Pressable testID="account-logout" disabled={busy} onPress={onLogout} style={pressableStyle(styles.logoutBtn, busy ? styles.disabled : null)}>
        <Text style={styles.logoutLabel}>{ACCOUNT_COPY.logout}</Text>
      </Pressable>
      <DebugLine />
    </SafeScreen>
  );
}

export function UnlockRestScreen({ hearts = 0, shopOpen = false, onUnlock, onBuy, onLater }) {
  return (
    <SafeScreen style={styles.centered} testID="unlock">
      <HeartsChip balance={hearts} />
      <Text style={styles.title}>{HEART_COPY.unlockTitle}</Text>
      <Text style={styles.body}>{HEART_COPY.unlockBody}</Text>
      <PrimaryButton testID="unlock-cta" label={HEART_COPY.unlockCta} onPress={onUnlock} />
      {!canUnlockRest(hearts) ? <Text style={styles.need}>{HEART_COPY.needHearts}</Text> : null}
      {shopOpen ? (
        <View style={styles.shop} testID="shop">
          <HeartsChip balance={hearts} />
          <Text style={styles.shopTitle}>{HEART_COPY.shopTitle}</Text>
          <PrimaryButton testID="shop-buy" label={HEART_COPY.shopCta} onPress={onBuy} />
          <Pressable testID="shop-later" onPress={onLater} style={pressableStyle(styles.textLink)}>
            <Text style={styles.textLinkLabel}>{HEART_COPY.later}</Text>
          </Pressable>
        </View>
      ) : null}
      <DebugLine />
    </SafeScreen>
  );
}

export function PartnerWaitScreen() {
  return (
    <SafeScreen style={styles.centered} testID="partner-wait">
      <Text style={styles.body}>{HEART_COPY.partnerWait}</Text>
      <DebugLine />
    </SafeScreen>
  );
}

export function CertificateScreen({ packLabel = "결혼", onBackToList }) {
  return (
    <SafeScreen style={styles.centered} testID="certificate">
      <Text style={styles.title}>{CERTIFICATE_COPY.title}</Text>
      <Text style={styles.body}>{packLabel}</Text>
      <Text style={styles.example}>{CERTIFICATE_COPY.body}</Text>
      <Text style={styles.example}>{SAMPLE_RESULT_EXAMPLE}</Text>
      <Pressable testID="certificate-list" onPress={onBackToList} style={pressableStyle(styles.textLink)}>
        <Text style={styles.textLinkLabel}>{CERTIFICATE_COPY.cta}</Text>
      </Pressable>
      <DebugLine />
    </SafeScreen>
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
    <SafeScreen style={styles.inviteShell} testID="invite">
      <KeyboardAvoidingView style={styles.flexFill} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.inviteScroll}>
          <View style={styles.navRowCenter}>
            <BackButton onPress={onBack} testID="invite-back" />
            <Text style={styles.navTitle}>{PAIR_COPY.headline}</Text>
            <View style={styles.backBtn} />
          </View>
          <PrimaryButton testID="invite-copy-link" label={PAIR_COPY.copyLink} onPress={onCopyLink} />
          <Pressable testID="invite-instagram" onPress={onShareInstagram} style={pressableStyle(styles.secondary)}><Text style={styles.secondaryLabel}>{PAIR_COPY.instagram}</Text></Pressable>
          <Pressable testID="invite-kakao" onPress={onShareKakao} style={pressableStyle(styles.secondary)}><Text style={styles.secondaryLabel}>{PAIR_COPY.kakao}</Text></Pressable>
          {copied ? <Text style={styles.body}>링크를 복사했어요.</Text> : null}
          <Text style={styles.label}>{PAIR_COPY.appCode}</Text>
          <Text style={styles.label}>{PAIR_COPY.myCode}</Text>
          <Text testID="invite-my-code">{pairCodeDisplay || "····"}</Text>
          <Pressable testID="invite-copy-code" onPress={onCopyCode}><Text>{codeCopied ? "복사됨" : PAIR_COPY.copyCode}</Text></Pressable>
          <TextInput
            testID="invite-partner-code"
            value={partnerCode}
            onChangeText={onChangePartnerCode}
            autoCapitalize="characters"
            editable={!busy}
            placeholder={PAIR_COPY.partnerPlaceholder}
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <PrimaryButton testID="invite-connect" label={PAIR_COPY.connect} disabled={busy} onPress={onConnect} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
      <DebugLine />
    </SafeScreen>
  );
}

export function WorkspaceScreen({ email = "", onInvitePartner }) {
  return (
    <SafeScreen style={styles.centered} testID="workspace">
      <Text style={styles.title}>{S3_COPY.created}</Text>
      {email ? <Text style={styles.email}>{email}</Text> : null}
      <PrimaryButton testID="invite-partner" label={S3_COPY.inviteCta} onPress={onInvitePartner} />
      <DebugLine />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  safeFill: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  flexFill: { flex: 1, width: "100%" },
  wordmark: { color: colors.charcoal, fontSize: 44, fontWeight: "600" },
  debug: { position: "absolute", bottom: 12, alignSelf: "center", color: colors.muted, fontSize: 12 },
  hearts: { color: colors.charcoal, fontSize: 16, fontWeight: "600", textAlign: "center", marginTop: 8 },
  primaryHit: { alignSelf: "stretch", marginTop: 12 },
  primary: { alignSelf: "stretch", marginTop: 12 },
  loginHero: { alignItems: "center", marginTop: 36, marginBottom: 36 },
  loginScroll: { flexGrow: 1, justifyContent: "center", paddingBottom: 48 },
  emailField: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10
  },
  mailIcon: { color: colors.muted, fontSize: 18 },
  emailInput: { flex: 1, minHeight: 52, color: colors.charcoal, fontSize: 16, padding: 0 },
  primaryLabel: { color: "#fff", fontSize: 16, fontWeight: "700" },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.4 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backChevron: { color: colors.charcoal, fontSize: 32, lineHeight: 34 },
  coverShell: { flex: 1, paddingHorizontal: 24, paddingTop: 12 },
  gateTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  gateBrand: { color: colors.charcoal, fontSize: 22, fontWeight: "600" },
  gateScroll: { flexGrow: 1, justifyContent: "center" },
  gateCard: { backgroundColor: colors.card, borderRadius: 20, padding: 24 },
  body: { color: colors.charcoal, fontSize: 16, lineHeight: 24, textAlign: "center", marginTop: 8 },
  label: { color: colors.charcoal, fontSize: 13, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 14, backgroundColor: "#fff", color: colors.charcoal, fontSize: 16 },
  error: { color: colors.error, fontSize: 13, fontWeight: "700", marginTop: 12 },
  title: { color: colors.charcoal, fontSize: 28, fontWeight: "700", textAlign: "center" },
  email: { color: colors.charcoal, marginTop: 8 },
  secondary: { minHeight: 48, marginTop: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", alignSelf: "stretch", backgroundColor: colors.card },
  secondaryLabel: { color: colors.charcoal, fontSize: 15, fontWeight: "700" },
  packShell: { flex: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 },
  packTitle: { color: colors.charcoal, fontSize: 34, fontWeight: "700", marginTop: 12, marginBottom: 16 },
  packStack: { gap: 0 },
  packCardRow: { minHeight: 56, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, gap: 12 },
  packMark: { color: colors.charcoal, width: 22, fontSize: 16 },
  packRowLabel: { flex: 1, color: colors.charcoal, fontSize: 17, fontWeight: "600" },
  packRowLabelMuted: { flex: 1, color: colors.charcoal, fontSize: 17 },
  packChevron: { color: colors.muted, fontSize: 22 },
  soonPlain: { color: colors.muted, fontSize: 14 },
  accountFooter: { marginTop: "auto", minHeight: 48, alignItems: "center", justifyContent: "center" },
  accountEntryLabel: { color: colors.charcoal, fontSize: 16, fontWeight: "600" },
  detailShell: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },
  scrollPad: { paddingBottom: 32 },
  sampleTitle: { color: colors.charcoal, fontSize: 22, fontWeight: "700", marginVertical: 16 },
  choice: { minHeight: 52, borderRadius: 14, backgroundColor: colors.card, paddingHorizontal: 14, justifyContent: "center", marginBottom: 8 },
  choiceOn: { borderWidth: 1.5, borderColor: colors.charcoal },
  choiceLabel: { color: colors.charcoal, fontSize: 15, lineHeight: 22 },
  example: { color: colors.muted, fontSize: 14, marginBottom: 8 },
  labelsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 12 },
  labelChip: { color: colors.charcoal, backgroundColor: colors.card, overflow: "hidden", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, fontSize: 13, fontWeight: "700" },
  answerCard: { alignSelf: "stretch", backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 10 },
  who: { color: colors.charcoal, fontSize: 12, fontWeight: "700", marginBottom: 6 },
  soonBadge: { color: colors.muted, fontSize: 13, marginBottom: 8 },
  soonTitle: { color: colors.charcoal, fontSize: 32, fontWeight: "700", marginBottom: 16 },
  textLink: { minHeight: 40, alignItems: "center", justifyContent: "center", marginTop: 8 },
  textLinkLabel: { color: colors.charcoal, fontSize: 15 },
  accountShell: { flex: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 },
  navRowCenter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  navTitle: { color: colors.charcoal, fontSize: 22, fontWeight: "700" },
  accountEmailValue: { color: colors.charcoal, fontSize: 16, marginTop: 28, textAlign: "center" },
  logoutBtn: { minHeight: 48, marginTop: "auto", alignItems: "center", justifyContent: "center" },
  logoutLabel: { color: colors.charcoal, fontSize: 16, textDecorationLine: "underline" },
  need: { color: colors.muted, fontSize: 13, marginTop: 10 },
  shop: { alignSelf: "stretch", marginTop: 24, backgroundColor: colors.card, borderRadius: 20, padding: 20, alignItems: "center" },
  shopTitle: { color: colors.charcoal, fontSize: 28, fontWeight: "700", marginVertical: 12 },
  inviteShell: { flex: 1 },
  inviteScroll: { paddingHorizontal: 24, paddingBottom: 32 }
});
