import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ACCOUNT_COPY, AUTH_COPY, COMING_SOON_TASTE_COPY, comingSoonPackLabel, LINE, PACK_DETAIL_COPY, PACK_LIST_COPY, PACK_LIST_ROWS, PAIR_COPY, RESULT_TASTE_COPY, S2_COPY, S2_EMAIL_BIND_COPY, S3_COPY, WORDMARK } from "./copy.js";
import { colors } from "./theme.js";

function pressableStyle(...parts) {
  return ({ pressed }) => {
    const disabled = parts.includes(styles.disabled);
    return [...parts, pressed && !disabled ? styles.pressed : null];
  };
}

function SafeScreen({ style, children, testID }) {
  return (
    <SafeAreaView style={[styles.safeFill, style]} testID={testID} accessibilityLabel={testID}>
      {children}
    </SafeAreaView>
  );
}

function AuthKeyboardShell({ testID, children }) {
  return (
    <SafeScreen testID={testID} style={styles.shell}>
      <KeyboardAvoidingView
        style={styles.flexFill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView keyboardShouldPersistTaps="handled" style={styles.flexFill} contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeScreen>
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
    <SafeScreen style={styles.shell} testID="splash">
      <Text style={styles.wordmark}>{WORDMARK}</Text>
      <Text style={styles.line}>{LINE}</Text>
    </SafeScreen>
  );
}

export function SignupScreen({ email = "", error = "", busy = false, onSubmitEmail, onBack }) {
  const [draft, setDraft] = useState(email);
  return (
    <SafeScreen style={styles.coverShell} testID="signup">
      <KeyboardAvoidingView
        style={styles.flexFill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
      <View style={styles.gateTop}>
        <BackButton onPress={onBack} testID="signup-back" />
        <Text style={styles.gateBrand}>{WORDMARK}</Text>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" style={styles.flexFill} contentContainerStyle={styles.gateScroll}>
        <View style={styles.gateCard}>
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
    </SafeScreen>
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
    <SafeScreen style={styles.shell} testID="sent">
      <View style={styles.card}>
        <Text style={styles.wordmarkSmall}>{WORDMARK}</Text>
        <Text style={styles.body}>{AUTH_COPY.sent}</Text>
        {email ? <Text style={styles.email}>{email}</Text> : null}
        <Pressable testID="sent-other-email" accessibilityRole="button" onPress={onUseOtherEmail} style={styles.secondary}>
          <Text style={styles.secondaryLabel}>다른 이메일로 요청</Text>
        </Pressable>
      </View>
    </SafeScreen>
  );
}

export function NoticeScreen({ email = "", error = "", busy = false, onAcknowledgeNotice }) {
  return (
    <SafeScreen style={styles.shell} testID="notice">
      <View style={styles.card}>
        <Text style={styles.wordmarkSmall}>{WORDMARK}</Text>
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
    </SafeScreen>
  );
}

export function PackListScreen({ onOpenMarriage, onOpenComingSoon, onOpenAccount }) {
  return (
    <SafeScreen style={styles.packShell} testID="pack-list">
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
            <Pressable
              key={row.id}
              testID={`pack-${row.id}`}
              accessibilityRole="button"
              onPress={() => onOpenComingSoon?.(row.id)}
              style={pressableStyle(styles.packCardRow)}
            >
              <Text style={styles.packRowLabelMuted}>{row.label}</Text>
              <Text style={styles.soonPlain}>{PACK_LIST_COPY.soon}</Text>
            </Pressable>
          )
        ))}
      </View>
    </SafeScreen>
  );
}

export function PackDetailScreen({ onBack, onSendLink }) {
  return (
    <SafeScreen style={styles.detailShell} testID="pack-detail">
      <View style={styles.navRow}>
        <BackButton onPress={onBack} testID="pack-detail-back" />
      </View>
      <Text style={styles.detailTitle}>{PACK_DETAIL_COPY.title}</Text>
      <Text style={styles.detailSubLeft}>{PACK_DETAIL_COPY.subtitle}</Text>
      <Text style={styles.samplesTitle}>{PACK_DETAIL_COPY.samplesTitle}</Text>
      <View style={styles.sampleStack}>
        {PACK_DETAIL_COPY.samples.map((sample, index) => (
          <View key={sample} testID={`pack-detail-sample-${index + 1}`} style={styles.sampleCard}>
            <Text style={styles.sampleNum}>{index + 1}</Text>
            <Text style={styles.sampleText}>{sample}</Text>
          </View>
        ))}
      </View>
      <View style={styles.lockCaption}>
        <View style={styles.lockMark} />
        <View style={styles.lockCaptionText}>
          {PACK_DETAIL_COPY.captionLines.map((line) => (
            <Text key={line} style={styles.sampleCaption}>{line}</Text>
          ))}
        </View>
      </View>
      <Pressable
        testID="pack-detail-cta"
        accessibilityRole="button"
        onPress={onSendLink}
        style={pressableStyle(styles.coverCta)}
      >
        <Text style={styles.primaryLabel}>🔗  {PACK_DETAIL_COPY.cta}</Text>
      </Pressable>
    </SafeScreen>
  );
}

export function ComingSoonScreen({ packId = "home-mgmt", onTasteResult, onBackToList }) {
  return (
    <SafeScreen style={styles.tasteShell} testID="coming-soon">
      <View style={styles.soonBadge}>
        <Text style={styles.soonBadgeLabel}>{COMING_SOON_TASTE_COPY.badge}</Text>
      </View>
      <Text style={styles.soonEyebrow}>{COMING_SOON_TASTE_COPY.eyebrow}</Text>
      <Text style={styles.soonTitle}>{comingSoonPackLabel(packId)}</Text>
      <Text style={styles.tasteHouse}>⌂♡</Text>
      <View style={styles.tasteCard}>
        <Text style={styles.tasteExperience}>{COMING_SOON_TASTE_COPY.experience}</Text>
        <View style={styles.tasteQuestionBox}>
          <Text style={styles.tasteQmark}>Q</Text>
          <Text style={styles.tasteQuestion}>{COMING_SOON_TASTE_COPY.sampleQuestion}</Text>
          <Text style={styles.tasteQuestionCaption}>{COMING_SOON_TASTE_COPY.sampleCaption}</Text>
        </View>
      </View>
      <Pressable
        testID="coming-soon-cta"
        accessibilityRole="button"
        onPress={onTasteResult}
        style={pressableStyle(styles.coverCta)}
      >
        <Text style={styles.primaryLabel}>{COMING_SOON_TASTE_COPY.cta}</Text>
      </Pressable>
      <Pressable testID="coming-soon-list" accessibilityRole="button" onPress={onBackToList} style={pressableStyle(styles.textLink)}>
        <Text style={styles.textLinkLabel}>{COMING_SOON_TASTE_COPY.backToList}</Text>
      </Pressable>
    </SafeScreen>
  );
}

export function TasteResultScreen({ onBackToList }) {
  return (
    <SafeScreen style={styles.tasteShell} testID="taste-result">
      <Text style={styles.tasteResultTitle}>{RESULT_TASTE_COPY.title}</Text>
      <View style={styles.tasteLabelsRow}>
        {Object.values(RESULT_TASTE_COPY.labels).map((label) => (
          <View key={label} style={label === RESULT_TASTE_COPY.label ? styles.tasteLabelPill : styles.tasteLabelChip}>
            <Text style={label === RESULT_TASTE_COPY.label ? styles.tasteLabelText : styles.tasteLabelChipText}>{label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.tasteQuestionCenter}>{RESULT_TASTE_COPY.question}</Text>
      <View style={styles.tasteAnswer}>
        <Text style={styles.tasteWho}>{RESULT_TASTE_COPY.me}</Text>
        <Text style={styles.tasteAnswerText}>{RESULT_TASTE_COPY.meAnswer}</Text>
      </View>
      <View style={styles.tasteAnswer}>
        <Text style={styles.tasteWho}>{RESULT_TASTE_COPY.partner}</Text>
        <Text style={styles.tasteAnswerText}>{RESULT_TASTE_COPY.partnerAnswer}</Text>
      </View>
      <Text style={styles.tasteResultCaption}>{RESULT_TASTE_COPY.caption}</Text>
      <Text style={styles.tasteResultExample}>{RESULT_TASTE_COPY.example}</Text>
      <Pressable
        testID="taste-result-cta"
        accessibilityRole="button"
        onPress={onBackToList}
        style={pressableStyle(styles.tasteListCta)}
      >
        <Text style={styles.primaryLabel}>{RESULT_TASTE_COPY.cta}</Text>
      </Pressable>
    </SafeScreen>
  );
}

export function AccountScreen({ email = "", busy = false, onBack, onLogout }) {
  return (
    <SafeScreen style={styles.accountShell} testID="account">
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
    <KeyboardAvoidingView
      style={styles.flexFill}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
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
    </SafeScreen>
  );
}

export function WorkspaceScreen({ email = "", onInvitePartner }) {
  return (
    <SafeScreen style={styles.shell} testID="workspace">
      <View style={styles.card}>
        <Text style={styles.wordmarkSmall}>{WORDMARK}</Text>
        <Text style={styles.title}>{S3_COPY.created}</Text>
        {email ? <Text style={styles.email}>{email}</Text> : null}
        <Pressable testID="invite-partner" accessibilityRole="button" onPress={onInvitePartner} style={styles.primary}>
          <Text style={styles.primaryLabel}>{S3_COPY.inviteCta}</Text>
        </Pressable>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  safeFill: {
    flex: 1,
    backgroundColor: colors.coverPaper
  },
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
  detailShell: {
    flex: 1,
    backgroundColor: colors.coverPaper,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 32
  },
  detailSubLeft: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8
  },
  samplesTitle: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 28,
    marginBottom: 12
  },
  sampleStack: {
    gap: 10
  },
  sampleCard: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  sampleNum: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: "500",
    width: 18
  },
  sampleText: {
    flex: 1,
    color: colors.ink,
    fontSize: 16,
    lineHeight: 24
  },
  sampleCaption: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20
  },
  lockCaption: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 18
  },
  lockMark: {
    width: 12,
    height: 14,
    marginTop: 3,
    borderWidth: 1.5,
    borderColor: colors.muted,
    borderRadius: 3
  },
  lockCaptionText: {
    flex: 1
  },
  tasteShell: {
    flex: 1,
    backgroundColor: colors.coverPaper,
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 32
  },
  soonBadge: {
    minHeight: 28,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.logout,
    alignItems: "center",
    justifyContent: "center"
  },
  soonBadgeLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700"
  },
  soonEyebrow: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 14
  },
  soonTitle: {
    color: colors.ink,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia, serif" }),
    fontSize: 36,
    fontWeight: "600",
    marginTop: 10
  },
  tasteHouse: {
    color: colors.ink,
    fontSize: 28,
    marginVertical: 18
  },
  tasteCard: {
    alignSelf: "stretch",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    borderRadius: 20,
    backgroundColor: "#fff"
  },
  tasteExperience: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12
  },
  tasteQuestionBox: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#f4ebe2"
  },
  tasteQmark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    overflow: "hidden",
    textAlign: "center",
    lineHeight: 22,
    backgroundColor: "#fff",
    color: colors.ink,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8
  },
  tasteQuestion: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 24
  },
  tasteQuestionCaption: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8
  },
  textLink: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8
  },
  textLinkLabel: {
    color: colors.ink,
    fontSize: 15
  },
  tasteResultTitle: {
    color: colors.ink,
    fontSize: 32,
    fontWeight: "700"
  },
  tasteLabelPill: {
    minHeight: 28,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#f4ebe2",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16
  },
  tasteLabelsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 16
  },
  tasteLabelChip: {
    minHeight: 28,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#f8f3ed",
    alignItems: "center",
    justifyContent: "center"
  },
  tasteLabelChipText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600"
  },
  tasteLabelText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700"
  },
  tasteQuestionCenter: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginTop: 18,
    marginBottom: 16
  },
  tasteAnswer: {
    alignSelf: "stretch",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#f4ebe2",
    marginBottom: 10
  },
  tasteWho: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#fff",
    color: colors.ink,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
    marginBottom: 8
  },
  tasteAnswerText: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22
  },
  tasteResultCaption: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 10
  },
  tasteResultExample: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 4
  },
  tasteListCta: {
    minHeight: 52,
    alignSelf: "stretch",
    marginTop: "auto",
    borderRadius: 16,
    backgroundColor: "#d8a07a",
    alignItems: "center",
    justifyContent: "center"
  },
  gateBrand: {
    alignSelf: "flex-start",
    color: colors.coral,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif", default: "Georgia, serif" }),
    fontSize: 22,
    fontWeight: "500",
    marginBottom: 12
  },
  gateTop: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8
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
    marginTop: 12
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
