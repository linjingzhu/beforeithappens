import { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { ACCOUNT_COPY, AUTH_COPY, comingSoonPackLabel, PACK_LIST_COPY, PACK_LIST_ROWS, PAIR_COPY, S2_COPY, S2_EMAIL_BIND_COPY, S3_COPY, WITHDRAW_COPY, WORDMARK } from "./copy.js";
import { colors } from "./theme.js";
import { createStyles } from "./responsive.js";
import { GradientButtonWrap, ScreenGradient } from "./gradient.js";
import { debugLine } from "./virtual.js";
import { HEART_COPY, HEARTS, canUnlockRest, showsHeartBalance } from "../../src/hearts.js";
import { CERTIFICATE_COPY, comingSoonExistingQuestion, REASON_PROMPT, SAMPLE_LABELS, SAMPLE_NEXT, SAMPLE_RESULT_EXAMPLE, TOGETHER_CTA } from "../../src/marriage-sample.js";
import { requestLoveMeNotificationPermission } from "./notifications.js";
import { PACK_INTRO_COPY, PACK_INTRO_MOTION, packIntroLines, packIntroTitle } from "../../src/pack-intro.js";
import { GIFT_COPY, RECOMMEND_COPY } from "../../src/growth.js";

/**
 * Press and disabled feedback is opacity only: it does not change with the window, so it is
 * built once here and handed to the per-window sheet as `styles.pressed` / `styles.disabled`.
 */
const FEEDBACK = { pressed: { opacity: 0.72 }, disabled: { opacity: 0.4 } };

function pressableStyle(...parts) {
  return ({ pressed }) => {
    const disabled = parts.some((part) => part && part.opacity === FEEDBACK.disabled.opacity);
    return [...parts, pressed && !disabled ? FEEDBACK.pressed : null];
  };
}

function SafeScreen({ style, children, testID }) {
  const styles = useStyles();
  return (
    <ScreenGradient>
      <SafeAreaView style={[styles.safeFill, style]} testID={testID} accessibilityLabel={testID}>
        {children}
      </SafeAreaView>
    </ScreenGradient>
  );
}

function DebugLine({ extra = "" }) {
  const styles = useStyles();
  const line = debugLine(undefined, extra);
  if (!line) return null;
  return <Text style={styles.debug} testID="debug-line">{line}</Text>;
}

function HeartsChip({ balance }) {
  const styles = useStyles();
  return <Text style={styles.hearts} testID="hearts-balance">{`♡ ${balance}`}</Text>;
}

function PrimaryButton({ testID, label, onPress, disabled }) {
  const styles = useStyles();
  return (
    <Pressable testID={testID} accessibilityRole="button" disabled={disabled} onPress={onPress} style={pressableStyle(styles.primary, disabled ? styles.disabled : null)}>
      <GradientButtonWrap>
        <Text style={styles.primaryLabel}>{label}</Text>
      </GradientButtonWrap>
    </Pressable>
  );
}

function AuthKeyboardShell({ testID, children, contentStyle }) {
  const styles = useStyles();
  return (
    <KeyboardAvoidingView testID={testID} style={styles.flexFill} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" style={styles.flexFill} contentContainerStyle={contentStyle || styles.gateScroll}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function BackButton({ onPress, testID = "back" }) {
  const styles = useStyles();
  return (
    <Pressable testID={testID} accessibilityRole="button" accessibilityLabel="back" onPress={onPress} style={pressableStyle(styles.backBtn)}>
      <Text style={styles.backChevron}>‹</Text>
    </Pressable>
  );
}

export function SplashScreenView() {
  const styles = useStyles();
  return (
    <SafeScreen style={styles.centered} testID="splash">
      <Text style={styles.wordmark}>{WORDMARK}</Text>
      <DebugLine />
    </SafeScreen>
  );
}

export function SignupScreen({ email = "", error = "", busy = false, firstRun = false, onSubmitEmail, onBack }) {
  const styles = useStyles();
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
  const styles = useStyles();
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
  const styles = useStyles();
  return (
    <SafeScreen style={styles.centered} testID="sent">
      <Text style={styles.body}>{AUTH_COPY.sent}</Text>
      {email ? <Text style={styles.email}>{email}</Text> : null}
      <Pressable testID="sent-other-email" onPress={onUseOtherEmail} style={pressableStyle(styles.secondary)}>
        <Text style={styles.secondaryLabel}>다른 이메일로 요청</Text>
      </Pressable>
      <DebugLine />
    </SafeScreen>
  );
}

export function NoticeScreen({ email = "", error = "", busy = false, onAcknowledgeNotice }) {
  const styles = useStyles();
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
  const styles = useStyles();
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

/**
 * The narration a pack opens with: what it means for the two of them, and what the
 * questions ahead are about. Lines rise in one after another; Reduce Motion shows them at rest.
 */
export function PackIntroScreen({ packId = "marriage", onStart }) {
  const styles = useStyles();
  const lines = useMemo(() => packIntroLines(packId), [packId]);
  const steps = useRef(lines.map(() => new Animated.Value(0))).current;
  const [stillMotion, setStillMotion] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.resolve(AccessibilityInfo.isReduceMotionEnabled?.())
      .then((reduced) => { if (alive) setStillMotion(Boolean(reduced)); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (stillMotion) {
      steps.forEach((step) => step.setValue(1));
      return undefined;
    }
    const reveal = Animated.stagger(
      PACK_INTRO_MOTION.lineDelayMs,
      steps.map((step) => Animated.timing(step, {
        toValue: 1,
        duration: PACK_INTRO_MOTION.durationMs,
        useNativeDriver: true
      }))
    );
    reveal.start();
    return () => reveal.stop();
  }, [stillMotion, steps]);

  return (
    <SafeScreen style={styles.centered} testID="pack-intro">
      <Text style={styles.introTitle}>{packIntroTitle(packId)}</Text>
      <View style={styles.introLines}>
        {lines.map((line, index) => (
          <Animated.Text
            key={line}
            style={[styles.introLine, {
              opacity: steps[index],
              transform: [{
                translateY: steps[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [PACK_INTRO_MOTION.riseFrom, 0]
                })
              }]
            }]}
          >
            {line}
          </Animated.Text>
        ))}
      </View>
      <PrimaryButton testID="pack-intro-start" label={PACK_INTRO_COPY.start} onPress={onStart} />
      <DebugLine />
    </SafeScreen>
  );
}

export function PackDetailScreen({ onBack }) {
  const styles = useStyles();
  return (
    <SafeScreen testID="pack-detail">
      <BackButton onPress={onBack} testID="pack-detail-back" />
      <DebugLine />
    </SafeScreen>
  );
}

export function SampleQuestionScreen({
  question,
  choiceId = "",
  reason = "",
  error = "",
  progressLabel = "결혼 1/3",
  onChangeChoice,
  onChangeReason,
  onSubmit,
  onBack
}) {
  const styles = useStyles();
  return (
    <SafeScreen testID="sample-q" style={styles.detailShell}>
      <View style={styles.sampleTop}>
        <BackButton onPress={onBack} testID="sample-back" />
        <Text style={styles.sampleProgress}>{progressLabel}</Text>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollPad}>
        <Text style={styles.sampleTitle}>{question?.title || ""}</Text>
        {(question?.choices || []).map((choice) => (
          <Pressable
            key={choice.id}
            testID={`choice-${choice.id}`}
            onPress={() => onChangeChoice?.(choice.id)}
            style={({ pressed }) => [styles.choice, choiceId === choice.id ? styles.choiceOn : null, pressed ? styles.pressed : null]}
          >
            <Text style={styles.radio}>{choiceId === choice.id ? "●" : "○"}</Text>
            <Text style={styles.choiceLabel}>{choice.label}</Text>
          </Pressable>
        ))}
        <View style={styles.reasonRow}>
          <Text style={styles.reasonHeart}>♡</Text>
          <Text style={styles.reasonPrompt}>{REASON_PROMPT}</Text>
        </View>
        <TextInput
          testID="sample-reason"
          value={reason}
          onChangeText={onChangeReason}
          placeholder={REASON_PROMPT}
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <PrimaryButton testID="sample-next" label={SAMPLE_NEXT} disabled={!choiceId || !String(reason || "").trim()} onPress={onSubmit} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
      <DebugLine />
    </SafeScreen>
  );
}

export function SampleResultScreen({ question, myChoice, partnerChoice, onTogether }) {
  const styles = useStyles();
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
  const styles = useStyles();
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
  onInvite,
  onRecommend,
  onGift,
  onWithdraw
}) {
  const styles = useStyles();
  const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);
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
      <View style={styles.accountShare} testID="account-share">
        <Pressable testID="account-recommend" accessibilityRole="button" onPress={onRecommend} style={pressableStyle(styles.accountShareItem)}>
          <Text style={styles.accountShareLabel}>{RECOMMEND_COPY.title}</Text>
        </Pressable>
        <Pressable testID="account-gift" accessibilityRole="button" onPress={onGift} style={pressableStyle(styles.accountShareItem)}>
          <Text style={styles.accountShareLabel}>{GIFT_COPY.title}</Text>
        </Pressable>
      </View>
      <Pressable testID="account-logout" disabled={busy} onPress={onLogout} style={pressableStyle(styles.logoutBtn, busy ? styles.disabled : null)}>
        <Text style={styles.logoutLabel}>{ACCOUNT_COPY.logout}</Text>
      </Pressable>
      {confirmingWithdraw ? (
        <View style={styles.withdrawConfirm} testID="account-withdraw-confirm">
          <Text style={styles.withdrawTitle}>{WITHDRAW_COPY.title}</Text>
          <Text style={styles.withdrawBody}>{WITHDRAW_COPY.body}</Text>
          <Text style={styles.withdrawBody}>{WITHDRAW_COPY.partnerLine}</Text>
          <Pressable
            testID="account-withdraw-yes"
            disabled={busy}
            onPress={() => {
              setConfirmingWithdraw(false);
              onWithdraw?.();
            }}
            style={pressableStyle(styles.logoutBtn, busy ? styles.disabled : null)}
          >
            <Text style={styles.logoutLabel}>{WITHDRAW_COPY.confirm}</Text>
          </Pressable>
          <Pressable testID="account-withdraw-cancel" onPress={() => setConfirmingWithdraw(false)} style={pressableStyle(styles.textLink)}>
            <Text style={styles.textLinkLabel}>{WITHDRAW_COPY.cancel}</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable testID="account-withdraw" disabled={busy} onPress={() => setConfirmingWithdraw(true)} style={pressableStyle(styles.textLink)}>
          <Text style={styles.withdrawEntryLabel}>{WITHDRAW_COPY.entry}</Text>
        </Pressable>
      )}
      <DebugLine />
    </SafeScreen>
  );
}

export function UnlockRestScreen({ hearts = 0, shopOpen = false, onUnlock, onBuy, onLater }) {
  const styles = useStyles();
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
  const styles = useStyles();
  return (
    <SafeScreen style={styles.centered} testID="partner-wait">
      <Text style={styles.body}>{HEART_COPY.partnerWait}</Text>
      <DebugLine />
    </SafeScreen>
  );
}

export function CertificateScreen({
  packLabel = "결혼",
  counts = { aligned: 0, close: 0, discuss: 0 },
  onHome
}) {
  const styles = useStyles();
  return (
    <SafeScreen style={styles.certificateShell} testID="certificate">
      <Text style={styles.certificateStamp} accessible={false}>{CERTIFICATE_COPY.stamp}</Text>
      <Text style={styles.title}>{packLabel}</Text>
      <Text style={styles.body}>{CERTIFICATE_COPY.body}</Text>
      <View style={styles.labelsRow}>
        <Text style={styles.labelChip}>{`${SAMPLE_LABELS.aligned} ${Number(counts.aligned) || 0}`}</Text>
        <Text style={styles.labelChip}>{`${SAMPLE_LABELS.close} ${Number(counts.close) || 0}`}</Text>
        <Text style={styles.labelChip}>{`${SAMPLE_LABELS.discuss} ${Number(counts.discuss) || 0}`}</Text>
      </View>
      <View style={styles.certificateCta}>
        <PrimaryButton testID="certificate-home" label={CERTIFICATE_COPY.cta} onPress={onHome} />
      </View>
      <DebugLine extra={CERTIFICATE_COPY.debugExtra} />
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
  const styles = useStyles();
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
          <Text testID="invite-my-code" style={styles.codeValue}>{pairCodeDisplay || "····"}</Text>
          <Pressable testID="invite-copy-code" onPress={onCopyCode} style={pressableStyle(styles.textLink)}><Text style={styles.textLinkLabel}>{codeCopied ? "복사됨" : PAIR_COPY.copyCode}</Text></Pressable>
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
  const styles = useStyles();
  return (
    <SafeScreen style={styles.centered} testID="workspace">
      <Text style={styles.title}>{S3_COPY.created}</Text>
      {email ? <Text style={styles.email}>{email}</Text> : null}
      <PrimaryButton testID="invite-partner" label={S3_COPY.inviteCta} onPress={onInvitePartner} />
      <DebugLine />
    </SafeScreen>
  );
}

/**
 * The sheet as a function of the window. Every number comes from `src/design-tokens.js`:
 * type through `font`/`lineHeight` (scaled by width, clamped), vertical rhythm through
 * `space` (loosened on a tall phone, given back on a short one), horizontal gutters through
 * `gutter`, corners through `radius`, and control heights built up from `hit` so nothing
 * tappable can fall under the minimum target.
 */
export function buildStyles(t) {
  const { colors, fonts, font, lineHeight, space, gutter, radius, hit, hairline, layout } = t;
  return {
    safeFill: { flex: 1, width: "100%", maxWidth: layout.maxContentWidth, alignSelf: "center" },
    centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: gutter("xl") },
    flexFill: { flex: 1, width: "100%" },
    wordmark: { color: colors.charcoal, fontSize: font(44), fontWeight: "600", fontFamily: fonts.titleStrong },
    debug: { position: "absolute", bottom: space("md"), alignSelf: "center", color: colors.muted, fontSize: font("caption"), fontFamily: fonts.body },
    hearts: { color: colors.charcoal, fontSize: font("bodyLarge"), fontWeight: "600", textAlign: "center", marginTop: space("sm"), fontFamily: fonts.bodyStrong },
    primaryHit: { alignSelf: "stretch", marginTop: space("md") },
    primary: { alignSelf: "stretch", marginTop: space("md") },
    loginHero: { alignItems: "center", marginTop: space("xxl"), marginBottom: space("xxl") },
    loginScroll: { flexGrow: 1, justifyContent: "center", paddingBottom: space("xxxl") },
    emailField: {
      minHeight: hit + space("sm"),
      borderRadius: radius.md,
      backgroundColor: colors.white,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: gutter("lg"),
      gap: gutter("sm")
    },
    mailIcon: { color: colors.muted, fontSize: font("bodyLarge"), fontFamily: fonts.body },
    emailInput: { flex: 1, minHeight: hit + space("sm"), color: colors.charcoal, fontSize: font("bodyLarge"), padding: 0, fontFamily: fonts.body },
    primaryLabel: { color: colors.white, fontSize: font("bodyLarge"), fontWeight: "700", fontFamily: fonts.bodyStrong },
    pressed: FEEDBACK.pressed,
    disabled: FEEDBACK.disabled,
    backBtn: { width: hit, height: hit, alignItems: "center", justifyContent: "center" },
    backChevron: { color: colors.charcoal, fontSize: font("hero"), lineHeight: lineHeight("hero", "tight"), fontFamily: fonts.body },
    coverShell: { flex: 1, paddingHorizontal: gutter("xl"), paddingTop: space("md") },
    gateTop: { flexDirection: "row", alignItems: "center", gap: gutter("sm") },
    gateBrand: { color: colors.charcoal, fontSize: font("title"), fontWeight: "600", fontFamily: fonts.titleStrong },
    gateScroll: { flexGrow: 1, justifyContent: "center" },
    gateCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: gutter("xl") },
    body: { color: colors.charcoal, fontSize: font("bodyLarge"), lineHeight: lineHeight("bodyLarge"), textAlign: "center", marginTop: space("sm"), fontFamily: fonts.body },
    label: { color: colors.charcoal, fontSize: font("footnote"), fontWeight: "700", marginTop: space("lg"), marginBottom: space("sm"), fontFamily: fonts.bodyStrong },
    input: {
      minHeight: hit + space("xs"),
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: radius.md,
      paddingHorizontal: gutter("lg"),
      backgroundColor: colors.white,
      color: colors.charcoal,
      fontSize: font("bodyLarge"),
      fontFamily: fonts.body
    },
    error: { color: colors.error, fontSize: font("footnote"), fontWeight: "700", marginTop: space("md"), fontFamily: fonts.bodyStrong },
    title: { color: colors.charcoal, fontSize: font("display"), fontWeight: "700", textAlign: "center", fontFamily: fonts.titleStrong },
    email: { color: colors.charcoal, marginTop: space("sm"), fontFamily: fonts.body },
    codeValue: { color: colors.charcoal, fontSize: font("bodyLarge"), marginTop: space("xs"), fontFamily: fonts.body },
    secondary: {
      minHeight: hit + space("xs"),
      marginTop: space("md"),
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.line,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "stretch",
      backgroundColor: colors.card
    },
    secondaryLabel: { color: colors.charcoal, fontSize: font("body"), fontWeight: "700", fontFamily: fonts.bodyStrong },
    packShell: { flex: 1, paddingHorizontal: gutter("xl"), paddingTop: space("md"), paddingBottom: space("xl") },
    packTitle: { color: colors.charcoal, fontSize: font("hero"), fontWeight: "700", marginTop: space("md"), marginBottom: space("lg"), fontFamily: fonts.titleStrong },
    packStack: { gap: 0 },
    packCardRow: { minHeight: hit + space("md"), flexDirection: "row", alignItems: "center", borderBottomWidth: hairline, borderBottomColor: colors.line, gap: gutter("md") },
    packMark: { color: colors.charcoal, width: gutter("xl"), fontSize: font("bodyLarge"), fontFamily: fonts.body },
    packRowLabel: { flex: 1, color: colors.charcoal, fontSize: font("bodyLarge"), fontWeight: "600", fontFamily: fonts.titleStrong },
    packRowLabelMuted: { flex: 1, color: colors.charcoal, fontSize: font("bodyLarge"), fontFamily: fonts.title },
    packChevron: { color: colors.muted, fontSize: font("title"), fontFamily: fonts.body },
    soonPlain: { color: colors.muted, fontSize: font("footnote"), fontFamily: fonts.body },
    accountFooter: { marginTop: "auto", minHeight: hit + space("xs"), alignItems: "center", justifyContent: "center" },
    accountEntryLabel: { color: colors.charcoal, fontSize: font("bodyLarge"), fontWeight: "600", fontFamily: fonts.titleStrong },
    detailShell: { flex: 1, paddingHorizontal: gutter("xl"), paddingTop: space("sm") },
    scrollPad: { paddingBottom: space("xxl") },
    sampleTop: { flexDirection: "row", alignItems: "center", gap: gutter("xs") },
    sampleProgress: { color: colors.charcoal, fontSize: font("body"), fontFamily: fonts.body },
    sampleTitle: { color: colors.charcoal, fontSize: font("title"), fontWeight: "700", marginVertical: space("lg"), fontFamily: fonts.titleStrong },
    choice: {
      minHeight: hit + space("sm"),
      borderRadius: radius.md,
      backgroundColor: colors.white,
      paddingHorizontal: gutter("lg"),
      flexDirection: "row",
      alignItems: "center",
      gap: gutter("md"),
      marginBottom: space("sm")
    },
    choiceOn: { borderWidth: 1.5, borderColor: colors.charcoal },
    radio: { color: colors.muted, fontSize: font("bodyLarge"), fontFamily: fonts.body },
    choiceLabel: { flex: 1, color: colors.charcoal, fontSize: font("body"), lineHeight: lineHeight("body"), fontFamily: fonts.body },
    reasonRow: { flexDirection: "row", alignItems: "center", gap: gutter("sm"), marginTop: space("lg"), marginBottom: space("sm") },
    reasonHeart: { color: colors.babyPink, fontSize: font("bodyLarge") },
    reasonPrompt: { flex: 1, color: colors.muted, fontSize: font("footnote"), fontFamily: fonts.body },
    example: { color: colors.muted, fontSize: font("footnote"), marginBottom: space("sm"), fontFamily: fonts.body },
    labelsRow: { flexDirection: "row", gap: gutter("sm"), flexWrap: "wrap", justifyContent: "center", marginBottom: space("md") },
    labelChip: {
      color: colors.charcoal,
      backgroundColor: colors.card,
      overflow: "hidden",
      borderRadius: radius.pill,
      paddingHorizontal: gutter("md"),
      paddingVertical: space("xs"),
      fontSize: font("footnote"),
      fontWeight: "700",
      fontFamily: fonts.bodyStrong
    },
    answerCard: { alignSelf: "stretch", backgroundColor: colors.card, borderRadius: radius.lg, padding: gutter("lg"), marginBottom: space("sm") },
    who: { color: colors.charcoal, fontSize: font("caption"), fontWeight: "700", marginBottom: space("xs"), fontFamily: fonts.bodyStrong },
    introTitle: { color: colors.charcoal, fontSize: font("display"), marginBottom: space("xl"), fontFamily: fonts.titleStrong },
    introLines: { alignSelf: "stretch", paddingHorizontal: gutter("md"), marginBottom: space("xxl") },
    introLine: { color: colors.charcoal, fontSize: font("bodyLarge"), lineHeight: lineHeight("bodyLarge", "relaxed"), textAlign: "center", marginTop: space("sm"), fontFamily: fonts.body },
    soonBadge: { color: colors.muted, fontSize: font("footnote"), marginBottom: space("sm"), fontFamily: fonts.body },
    soonTitle: { color: colors.charcoal, fontSize: font("hero"), fontWeight: "700", marginBottom: space("lg"), fontFamily: fonts.titleStrong },
    textLink: { minHeight: hit, alignItems: "center", justifyContent: "center", marginTop: space("sm") },
    textLinkLabel: { color: colors.charcoal, fontSize: font("body"), fontFamily: fonts.body },
    accountShell: { flex: 1, paddingHorizontal: gutter("xl"), paddingTop: space("md"), paddingBottom: space("xl") },
    navRowCenter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    navTitle: { color: colors.charcoal, fontSize: font("title"), fontWeight: "700", fontFamily: fonts.titleStrong },
    accountEmailValue: { color: colors.charcoal, fontSize: font("bodyLarge"), marginTop: space("xl"), textAlign: "center", fontFamily: fonts.body },
    accountShare: { flexDirection: "row", marginTop: space("xl"), marginHorizontal: -space("xs") },
    accountShareItem: {
      flex: 1,
      minHeight: hit,
      marginHorizontal: space("xs"),
      borderRadius: radius.pill,
      borderWidth: hairline,
      borderColor: colors.line,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: space("sm")
    },
    accountShareLabel: { color: colors.charcoal, fontSize: font("footnote"), fontFamily: fonts.body, textAlign: "center" },
    logoutBtn: { minHeight: hit + space("xs"), marginTop: "auto", alignItems: "center", justifyContent: "center" },
    logoutLabel: { color: colors.charcoal, fontSize: font("bodyLarge"), textDecorationLine: "underline", fontFamily: fonts.body },
    withdrawEntryLabel: { color: colors.charcoal, fontSize: font("footnote"), textDecorationLine: "underline", fontFamily: fonts.body, opacity: 0.7 },
    withdrawConfirm: { marginTop: space("lg"), paddingHorizontal: gutter("xl"), alignItems: "center", gap: gutter("sm") },
    withdrawTitle: { color: colors.charcoal, fontSize: font("bodyLarge"), textAlign: "center", fontFamily: fonts.body },
    withdrawBody: { color: colors.charcoal, fontSize: font("footnote"), lineHeight: lineHeight("footnote", "relaxed"), textAlign: "center", fontFamily: fonts.body },
    need: { color: colors.muted, fontSize: font("footnote"), marginTop: space("sm"), fontFamily: fonts.body },
    shop: { alignSelf: "stretch", marginTop: space("xl"), backgroundColor: colors.card, borderRadius: radius.lg, padding: gutter("lg"), alignItems: "center" },
    shopTitle: { color: colors.charcoal, fontSize: font("display"), fontWeight: "700", marginVertical: space("md"), fontFamily: fonts.titleStrong },
    certificateShell: { flex: 1, alignItems: "center", paddingHorizontal: gutter("xl"), paddingBottom: space("xl") },
    certificateStamp: { fontSize: font(64), lineHeight: lineHeight(64, "tight"), marginTop: space("xxxl"), marginBottom: space("md"), color: colors.charcoal },
    certificateCta: { marginTop: "auto", alignSelf: "stretch", width: "100%" },
    inviteShell: { flex: 1 },
    inviteScroll: { paddingHorizontal: gutter("xl"), paddingBottom: space("xxl") }
  };
}

const useStyles = createStyles(buildStyles);
