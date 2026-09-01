import { useEffect, useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { colors } from "../src/theme.js";
import { createStyles } from "../src/responsive.js";
import { PACK_COPY } from "./contract/pack-copy.js";
import { createHostPack } from "./host-mount.js";

function saveLabel(saveStatus) {
  if (saveStatus === "saving") return PACK_COPY.saving;
  if (saveStatus === "failed") return PACK_COPY.saveFailed;
  return PACK_COPY.saved;
}

function Shell({ children, testID }) {
  const styles = useStyles();
  return (
    <SafeAreaView style={styles.shell} testID={testID} accessibilityLabel={testID}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

function Primary({ label, onPress, disabled, testID }) {
  const styles = useStyles();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.primary, disabled ? styles.disabled : null, pressed && !disabled ? styles.pressed : null]}
    >
      <Text style={styles.primaryLabel}>{label}</Text>
    </Pressable>
  );
}

function TextLink({ label, onPress, testID }) {
  const styles = useStyles();
  return (
    <Pressable testID={testID} accessibilityRole="button" onPress={onPress} style={styles.textLink}>
      <Text style={styles.textLinkLabel}>{label}</Text>
    </Pressable>
  );
}

export function PackLockedScreen({ view, onBack }) {
  const styles = useStyles();
  return (
    <Shell testID="pack-locked">
      <Text style={styles.title}>{view.title || PACK_COPY.title}</Text>
      <Text style={styles.body}>{view.body || PACK_COPY.lockedBody}</Text>
      <TextLink testID="pack-back" label={PACK_COPY.previous} onPress={onBack} />
    </Shell>
  );
}

export function PackReadyScreen({ view, busy, onStart, onBack }) {
  const styles = useStyles();
  return (
    <Shell testID="pack-ready">
      <Text style={styles.title}>{view.title || PACK_COPY.title}</Text>
      <Text style={styles.body}>{view.body || PACK_COPY.startBody}</Text>
      <Primary testID="pack-start" label={view.cta || PACK_COPY.startPack} onPress={onStart} disabled={busy} />
      {view.error ? <Text style={styles.error}>{view.error}</Text> : null}
      <TextLink testID="pack-back" label={PACK_COPY.previous} onPress={onBack} />
    </Shell>
  );
}

export function PackQuestionScreen({ view, busy, onChoice, onNote, onSubmit, onPrevious, onNext, onBack }) {
  const styles = useStyles();
  const q = view.question;
  return (
    <Shell testID="pack-question">
      <Text style={styles.badge}>{q.privacyBadge}</Text>
      <Text style={styles.stem}>{q.question.title}</Text>
      <Text style={styles.rule}>{q.privacyRule}</Text>
      <View style={styles.choices}>
        {(q.question.choices || []).map((choice) => {
          const selected = (q.mine.draftChoice || q.mine.submittedChoice) === choice.id;
          return (
            <Pressable
              key={choice.id}
              testID={`pack-choice-${choice.id}`}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              disabled={!q.canEditDraft || busy}
              onPress={() => onChoice(choice.id)}
              style={[styles.choice, selected ? styles.choiceSelected : null, !q.canEditDraft ? styles.disabled : null]}
            >
              <Text style={styles.choiceLabel}>{choice.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.noteLabel}>{`${q.noteLabel} · ${PACK_COPY.noteExclude}`}</Text>
      <TextInput
        testID="pack-note"
        multiline
        editable={q.canEditDraft && !busy}
        defaultValue={q.mine.privateNote || ""}
        onEndEditing={(event) => onNote(event.nativeEvent.text)}
        placeholder={q.noteHint}
        placeholderTextColor={colors.muted}
        style={styles.note}
      />

      {q.mine.submittedChoice ? (
        <Text style={styles.status}>{`${PACK_COPY.submittedMine} ${q.partnerStatus}`}</Text>
      ) : (
        <Text style={styles.status}>{PACK_COPY.submitHelp}</Text>
      )}

      <Primary
        testID="pack-submit"
        label={q.submitLabel}
        onPress={onSubmit}
        disabled={!q.canSubmit || busy}
      />
      {view.error ? <Text style={styles.error}>{view.error}</Text> : null}
      <Text style={styles.save}>{saveLabel(view.saveStatus)}</Text>

      <View style={styles.nav}>
        <TextLink testID="pack-previous" label={PACK_COPY.previous} onPress={onPrevious} />
        {view.canGoNext ? <TextLink testID="pack-next" label={PACK_COPY.next} onPress={onNext} /> : null}
      </View>
      <TextLink testID="pack-back" label="목록으로" onPress={onBack} />
    </Shell>
  );
}

export function PackRevealScreen({ view, busy, onProposal, onAgree, onHold, onReanswer, onPrevious, onNext, onBack }) {
  const styles = useStyles();
  const q = view.question;
  return (
    <Shell testID="pack-reveal">
      <Text style={styles.badge}>{q.privacyBadge}</Text>
      <Text style={styles.stem}>{q.question.title}</Text>
      {q.comparisonLabel ? <Text style={styles.comparison}>{q.comparisonLabel}</Text> : null}

      <View style={styles.answers}>
        <Text style={styles.answer}>{`나 · ${q.myChoiceLabel}`}</Text>
        <Text style={styles.answer}>{`상대 · ${q.theirChoiceLabel}`}</Text>
      </View>
      {q.lockHint ? <Text style={styles.rule}>{q.lockHint}</Text> : null}

      <TextInput
        testID="pack-proposal"
        multiline
        editable={!busy}
        defaultValue={q.shared.proposal || ""}
        onEndEditing={(event) => onProposal(event.nativeEvent.text)}
        placeholder={PACK_COPY.agreementPlaceholder}
        placeholderTextColor={colors.muted}
        style={styles.note}
      />

      <Primary testID="pack-agree" label={q.agreeLabel} onPress={onAgree} disabled={busy} />
      <TextLink testID="pack-hold" label={q.holdLabel} onPress={onHold} />
      {q.canReanswer ? <TextLink testID="pack-reanswer" label={q.reanswerLabel} onPress={onReanswer} /> : null}
      {view.error ? <Text style={styles.error}>{view.error}</Text> : null}
      <Text style={styles.save}>{saveLabel(view.saveStatus)}</Text>

      <View style={styles.nav}>
        <TextLink testID="pack-previous" label={PACK_COPY.previous} onPress={onPrevious} />
        {view.canGoNext ? <TextLink testID="pack-next" label={PACK_COPY.next} onPress={onNext} /> : null}
      </View>
      <TextLink testID="pack-back" label="목록으로" onPress={onBack} />
    </Shell>
  );
}

/**
 * The real two-person loop. It talks to /api/pack/* through the host session cookie;
 * nothing here simulates a partner.
 */
export function PackMount({ session, cookieAccess, fetchImpl, catalog, controller: injected, onExit }) {
  const controller = useMemo(
    () => injected || createHostPack({ session, cookieAccess, fetchImpl, catalog }),
    [injected, session, cookieAccess, fetchImpl, catalog]
  );
  const [view, setView] = useState(() => controller.view());
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let alive = true;
    setBusy(true);
    Promise.resolve(controller.startPack())
      .then((next) => { if (alive) setView(next); })
      .catch(() => {})
      .finally(() => { if (alive) setBusy(false); });
    return () => { alive = false; };
  }, [controller]);

  function run(work) {
    return async (...args) => {
      setBusy(true);
      try {
        setView(await Promise.resolve(work(...args)));
      } catch {
        /* the controller reports failures through saveStatus and error */
      } finally {
        setBusy(false);
      }
    };
  }

  if (view.screen === "locked") return <PackLockedScreen view={view} onBack={onExit} />;
  if (view.screen === "signed-out" || view.screen === "ready" || !view.question) {
    return <PackReadyScreen view={view} busy={busy} onStart={run(() => controller.startPack())} onBack={onExit} />;
  }
  if (view.question.screen === "reveal") {
    return (
      <PackRevealScreen
        view={view}
        busy={busy}
        onProposal={run((text) => controller.agree(text))}
        onAgree={run(() => controller.agree())}
        onHold={run(() => controller.hold())}
        onReanswer={run(() => controller.beginReanswer())}
        onPrevious={run(() => controller.go(-1))}
        onNext={run(() => controller.go(1))}
        onBack={onExit}
      />
    );
  }
  return (
    <PackQuestionScreen
      view={view}
      busy={busy}
      onChoice={run((choiceId) => controller.saveDraft({ draftChoice: choiceId }))}
      onNote={run((text) => controller.saveDraft({ privateNote: text }))}
      onSubmit={run(() => controller.submit())}
      onPrevious={run(() => controller.go(-1))}
      onNext={run(() => controller.go(1))}
      onBack={onExit}
    />
  );
}

/**
 * The sheet as a function of the window: type from `font`/`lineHeight`, vertical rhythm from
 * `space` (a short screen gets its margins back), gutters from `gutter`, corners from
 * `radius`, control heights built up from `hit`. Opacity feedback is the only thing here that
 * is not a design token — the token module holds no opacity scale.
 */
export function buildStyles(t) {
  const { colors, fonts, font, lineHeight, space, gutter, radius, hit, layout } = t;
  return {
    shell: { flex: 1, backgroundColor: colors.white },
    scroll: {
      padding: gutter("xl"),
      paddingBottom: space("xxxl"),
      width: "100%",
      maxWidth: layout.maxContentWidth,
      alignSelf: "center"
    },
    title: { color: colors.charcoal, fontSize: font("display"), marginBottom: space("md"), fontFamily: fonts.titleStrong },
    stem: { color: colors.charcoal, fontSize: font("title"), lineHeight: lineHeight("title"), marginBottom: space("sm"), fontFamily: fonts.title },
    body: { color: colors.charcoal, fontSize: font("body"), lineHeight: lineHeight("body"), marginBottom: space("lg"), fontFamily: fonts.body },
    rule: { color: colors.muted, fontSize: font("caption"), lineHeight: lineHeight("caption", "relaxed"), marginBottom: space("lg"), fontFamily: fonts.body },
    badge: { color: colors.muted, fontSize: font("caption"), marginBottom: space("sm"), fontFamily: fonts.body },
    choices: { marginBottom: space("lg") },
    choice: {
      minHeight: hit,
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: radius.md,
      padding: gutter("lg"),
      marginTop: space("sm"),
      backgroundColor: colors.white
    },
    choiceSelected: { borderColor: colors.babyPink, backgroundColor: colors.card },
    choiceLabel: { color: colors.charcoal, fontSize: font("body"), fontFamily: fonts.body },
    noteLabel: { color: colors.muted, fontSize: font("caption"), marginBottom: space("xs"), fontFamily: fonts.body },
    note: {
      minHeight: hit + space("xxl"),
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: radius.md,
      padding: gutter("md"),
      color: colors.charcoal,
      fontSize: font("body"),
      fontFamily: fonts.body,
      textAlignVertical: "top"
    },
    status: { color: colors.muted, fontSize: font("caption"), lineHeight: lineHeight("caption", "relaxed"), marginTop: space("md"), fontFamily: fonts.body },
    comparison: { color: colors.charcoal, fontSize: font("footnote"), fontWeight: "700", marginBottom: space("md"), fontFamily: fonts.body },
    answers: { marginBottom: space("md") },
    answer: { color: colors.charcoal, fontSize: font("body"), lineHeight: lineHeight("body", "relaxed"), fontFamily: fonts.body },
    primary: {
      minHeight: hit + space("sm"),
      borderRadius: radius.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.babyPink,
      marginTop: space("lg")
    },
    primaryLabel: { color: colors.charcoal, fontSize: font("bodyLarge"), fontFamily: fonts.bodyStrong },
    disabled: { opacity: 0.45 },
    pressed: { opacity: 0.8 },
    textLink: { minHeight: hit, alignItems: "center", justifyContent: "center", marginTop: space("sm") },
    textLinkLabel: { color: colors.muted, fontSize: font("footnote"), fontFamily: fonts.body },
    save: { color: colors.muted, fontSize: font("caption"), textAlign: "center", marginTop: space("sm"), fontFamily: fonts.body },
    error: { color: colors.error, fontSize: font("footnote"), marginTop: space("sm"), fontFamily: fonts.body },
    nav: { flexDirection: "row", justifyContent: "space-between", marginTop: space("md") }
  };
}

const useStyles = createStyles(buildStyles);
