package com.beforeithappens.loveme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

enum class LoveMeNativeScreen {
    Splash, Signup, Sent, Bind, Notice, PackList, SampleQ, SampleResult, Unlock, Certificate, PartnerWait, ComingSoon, Invite, Account, Workspace
}

@Composable
fun LoveMeS0S2S3Host(
    client: LoveMeAuthClient,
    onInvitePartner: () -> Unit = {}
) {
    var screen by remember { mutableStateOf(LoveMeNativeScreen.Splash) }
    var email by remember { mutableStateOf("") }
    var error by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var pairCode by remember { mutableStateOf("") }
    var comingSoonTitle by remember { mutableStateOf("가정 경영") }
    var comingSoonQuestion by remember { mutableStateOf("") }
    var pendingGate by remember { mutableStateOf("") }
    var signedIn by remember { mutableStateOf(false) }
    var acceptedPartner by remember { mutableStateOf(false) }
    var partnerEmail by remember { mutableStateOf("") }
    var isPartner by remember { mutableStateOf(false) }
    var hearts by remember { mutableStateOf(0) }
    var shopOpen by remember { mutableStateOf(false) }
    var sampleIndex by remember { mutableStateOf(0) }
    var sampleChoice by remember { mutableStateOf("") }
    var sampleReason by remember { mutableStateOf("") }
    var sampleMine by remember { mutableStateOf("") }
    var samplePartner by remember { mutableStateOf("") }
    var samplePackLabel by remember { mutableStateOf("결혼") }
    val scope = rememberCoroutineScope()

    fun resumePending(gate: String = pendingGate) {
        pendingGate = ""
        signedIn = true
        screen = when (gate) {
            "invite", "connect" -> {
                pairCode = "VIRT UAL1"
                LoveMeNativeScreen.Invite
            }
            "account" -> LoveMeNativeScreen.Account
            else -> LoveMeNativeScreen.PackList
        }
    }

    fun requireLogin(gate: String) {
        if (signedIn) {
            resumePending(gate)
            return
        }
        pendingGate = gate
        screen = LoveMeNativeScreen.Signup
    }

    fun cancelLogin() {
        pendingGate = "home"
        error = ""
        busy = false
        screen = LoveMeNativeScreen.Signup
    }

    fun startSample() {
        sampleChoice = ""
        sampleReason = ""
        screen = LoveMeNativeScreen.SampleQ
    }

    fun submitSample() {
        if (sampleChoice.isEmpty() || sampleReason.trim().isEmpty()) return
        sampleIndex += 1
        if (sampleIndex >= 3) {
            val choices = LoveMeInvitePackCopy.sampleChoices
            sampleMine = choices.getOrNull(sampleChoice.toIntOrNull() ?: 0) ?: choices.first()
            samplePartner = choices.first { it != sampleMine }
            screen = LoveMeNativeScreen.SampleResult
            return
        }
        startSample()
    }

    fun tapUnlock() {
        if (hearts < 10) {
            shopOpen = true
        } else {
            hearts -= 10
            shopOpen = false
            screen = LoveMeNativeScreen.Certificate
        }
    }

    when (screen) {
        LoveMeNativeScreen.Splash -> S0SplashScreen {
            scope.launch {
                val session = withContext(Dispatchers.IO) { client.currentSession() }
                val body = session["body"] as? String ?: ""
                if (body.contains("\"email\"")) {
                    email = Regex("\"email\"\\s*:\\s*\"([^\"]+)\"").find(body)?.groupValues?.get(1) ?: ""
                    val needsEmail = body.contains("\"needsEmail\":true") || email.isEmpty()
                    screen = when {
                        needsEmail -> LoveMeNativeScreen.Bind
                        body.contains("\"notice\":\"no-local-draft\"") -> LoveMeNativeScreen.Notice
                        else -> LoveMeNativeScreen.PackList
                    }
                    signedIn = screen != LoveMeNativeScreen.Bind
                } else {
                    signedIn = false
                    screen = LoveMeNativeScreen.Signup
                    pendingGate = "home"
                }
            }
        }
        LoveMeNativeScreen.PackList -> LoveMePackListScreen(
            hearts = hearts,
            showHearts = !isPartner,
            onOpenMarriage = {
                sampleIndex = 0
                samplePackLabel = "결혼"
                startSample()
            },
            onOpenComingSoon = { id ->
                samplePackLabel = when (id) {
                    "dating" -> "연애"
                    "pregnancy" -> "임신"
                    "birth" -> "출산"
                    "parenting" -> "육아"
                    else -> "가정 경영"
                }
                sampleMine = ""
                samplePartner = ""
                screen = LoveMeNativeScreen.SampleResult
            },
            onOpenAccount = { requireLogin("account") }
        )
        LoveMeNativeScreen.ComingSoon -> LoveMeComingSoonScreen(
            title = comingSoonTitle,
            question = comingSoonQuestion,
            onBackToList = { screen = LoveMeNativeScreen.PackList }
        )
        LoveMeNativeScreen.SampleQ -> LoveMeSampleQuestionScreen(
            title = LoveMeInvitePackCopy.sampleTitles.getOrElse(sampleIndex) { LoveMeInvitePackCopy.sampleTitles.last() },
            choices = LoveMeInvitePackCopy.sampleChoices.mapIndexed { index, label -> index.toString() to label },
            choiceId = sampleChoice,
            reason = sampleReason,
            onChoose = { sampleChoice = it },
            onReason = { sampleReason = it },
            onSubmit = { submitSample() },
            onBack = { screen = LoveMeNativeScreen.PackList }
        )
        LoveMeNativeScreen.SampleResult -> LoveMeSampleResultScreen(
            question = LoveMeInvitePackCopy.sampleTitles.last(),
            mine = sampleMine,
            partner = samplePartner,
            onTogether = {
                acceptedPartner = true
                screen = if (isPartner) LoveMeNativeScreen.PartnerWait else LoveMeNativeScreen.Unlock
            }
        )
        LoveMeNativeScreen.Unlock -> LoveMeUnlockScreen(
            hearts = hearts,
            shopOpen = shopOpen,
            onUnlock = { tapUnlock() },
            onBuy = {
                hearts += 12
                shopOpen = false
            },
            onLater = { shopOpen = false }
        )
        LoveMeNativeScreen.Certificate -> LoveMeCertificateScreen(
            packLabel = samplePackLabel,
            onBackToList = { screen = LoveMeNativeScreen.PackList }
        )
        LoveMeNativeScreen.PartnerWait -> LoveMePartnerWaitScreen()
        LoveMeNativeScreen.Account -> LoveMeAccountScreen(
            email = email,
            partnerEmail = partnerEmail,
            acceptedPartner = acceptedPartner,
            guest = !signedIn,
            onBack = { screen = LoveMeNativeScreen.PackList },
            onLogout = {
                scope.launch {
                    withContext(Dispatchers.IO) { client.logout() }
                    email = ""
                    pairCode = ""
                    signedIn = false
                    acceptedPartner = false
                    hearts = 0
                    pendingGate = "home"
                    screen = LoveMeNativeScreen.Signup
                }
            },
            onLogin = { requireLogin("account") },
            onInvite = { requireLogin("invite") }
        )
        LoveMeNativeScreen.Invite -> LoveMeInviteScreen(
            pairCodeDisplay = pairCode,
            onBack = { screen = LoveMeNativeScreen.Account },
            onConnect = { _ ->
                acceptedPartner = true
                partnerEmail = "partner@email.com"
                screen = LoveMeNativeScreen.Account
            }
        )
        LoveMeNativeScreen.Signup -> S2SignupScreen(
            phase = S2SignupPhase.Signup,
            email = email,
            error = error,
            busy = busy,
            firstRun = pendingGate == "home" || pendingGate.isEmpty(),
            onSubmitEmail = { value ->
                email = value
                resumePending(if (pendingGate.isEmpty()) "home" else pendingGate)
            },
            onBack = { cancelLogin() }
        )
        LoveMeNativeScreen.Sent -> S2SignupScreen(
            phase = S2SignupPhase.Sent,
            email = email,
            onUseOtherEmail = { screen = LoveMeNativeScreen.Signup; error = "" }
        )
        LoveMeNativeScreen.Bind -> S2SignupScreen(
            phase = S2SignupPhase.Bind,
            email = email,
            error = error,
            busy = busy,
            onBindEmail = { value ->
                email = value
                resumePending()
            }
        )
        LoveMeNativeScreen.Notice -> S2SignupScreen(
            phase = S2SignupPhase.Notice,
            email = email,
            error = error,
            busy = busy,
            onAcknowledgeNotice = {
                scope.launch {
                    withContext(Dispatchers.IO) { client.acknowledgeNotice() }
                    resumePending()
                }
            }
        )
        LoveMeNativeScreen.Workspace -> S3WorkspaceCreatedScreen(
            email = email,
            onInvitePartner = onInvitePartner
        )
    }
}

fun resumeNativeGate(pendingGate: String): LoveMeNativeScreen = when (pendingGate) {
    "invite", "connect" -> LoveMeNativeScreen.Invite
    "account" -> LoveMeNativeScreen.Account
    else -> LoveMeNativeScreen.PackList
}

fun openMagicLink(client: LoveMeAuthClient, url: String, pendingGate: String = ""): Pair<LoveMeNativeScreen, String> {
    val token = LoveMeAuthApi.extractMagicLinkToken(url) ?: return LoveMeNativeScreen.Signup to "로그인 링크가 유효하지 않아요."
    val result = client.consumeMagicLink(token)
    val status = result["status"] as? Int ?: 500
    val body = result["body"] as? String ?: ""
    if (status == 200 && body.contains("\"needsEmail\":true")) return LoveMeNativeScreen.Bind to ""
    if (status == 200 && body.contains("\"notice\":\"") && !body.contains("\"notice\":null")) {
        return LoveMeNativeScreen.Notice to ""
    }
    if (status == 200) return resumeNativeGate(pendingGate) to ""
    val error = when {
        body.contains("expired") -> "로그인 링크가 만료되었어요. 다시 요청해 주세요."
        body.contains("used") -> "이미 사용한 로그인 링크예요. 새 링크를 요청해 주세요."
        else -> "로그인 링크가 유효하지 않아요."
    }
    return LoveMeNativeScreen.Signup to error
}
