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

enum class LoveMeNativeScreen { Splash, Signup, Sent, Bind, Notice, PackList, PackDetail, ComingSoon, TasteResult, Invite, Account, Workspace }

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
    var pendingGate by remember { mutableStateOf("") }
    var signedIn by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    fun resumePending(gate: String = pendingGate) {
        pendingGate = ""
        signedIn = true
        when (gate) {
            "invite", "connect" -> {
                screen = LoveMeNativeScreen.Invite
            }
            "account" -> screen = LoveMeNativeScreen.Account
            else -> screen = LoveMeNativeScreen.PackList
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
        val returnToDetail = pendingGate == "invite" || pendingGate == "connect"
        pendingGate = ""
        error = ""
        busy = false
        screen = if (returnToDetail) LoveMeNativeScreen.PackDetail else LoveMeNativeScreen.PackList
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
                    screen = LoveMeNativeScreen.PackList
                }
            }
        }
        LoveMeNativeScreen.PackList -> LoveMePackListScreen(
            onOpenMarriage = { screen = LoveMeNativeScreen.PackDetail },
            onOpenComingSoon = { id ->
                comingSoonTitle = when (id) {
                    "pregnancy" -> "임신"
                    "birth" -> "출산"
                    "parenting" -> "육아"
                    else -> "가정 경영"
                }
                screen = LoveMeNativeScreen.ComingSoon
            },
            onOpenAccount = { requireLogin("account") }
        )
        LoveMeNativeScreen.ComingSoon -> LoveMeComingSoonScreen(
            title = comingSoonTitle,
            onTasteResult = { screen = LoveMeNativeScreen.TasteResult },
            onBackToList = { screen = LoveMeNativeScreen.PackList }
        )
        LoveMeNativeScreen.TasteResult -> LoveMeTasteResultScreen(
            onBackToList = { screen = LoveMeNativeScreen.PackList }
        )
        LoveMeNativeScreen.PackDetail -> LoveMePackDetailScreen(
            onBack = { screen = LoveMeNativeScreen.PackList },
            onSendLink = { requireLogin("invite") }
        )
        LoveMeNativeScreen.Account -> LoveMeAccountScreen(
            email = email,
            onBack = { screen = LoveMeNativeScreen.PackList },
            onLogout = {
                scope.launch {
                    withContext(Dispatchers.IO) { client.logout() }
                    email = ""
                    pairCode = ""
                    signedIn = false
                    pendingGate = ""
                    screen = LoveMeNativeScreen.PackList
                }
            }
        )
        LoveMeNativeScreen.Invite -> LoveMeInviteScreen(
            pairCodeDisplay = pairCode,
            onBack = { screen = LoveMeNativeScreen.PackDetail },
            onConnect = { _ -> requireLogin("connect") }
        )
        LoveMeNativeScreen.Signup -> S2SignupScreen(
            phase = S2SignupPhase.Signup,
            email = email,
            error = error,
            busy = busy,
            onSubmitEmail = { value ->
                email = value
                busy = true
                error = ""
                scope.launch {
                    val result = withContext(Dispatchers.IO) { client.requestMagicLink(value) }
                    val status = result["status"] as? Int ?: 500
                    if (status == 200) screen = LoveMeNativeScreen.Sent
                    else error = if ((result["body"] as? String)?.contains("invalid-email") == true)
                        "이메일 주소를 다시 확인해 주세요."
                    else "로그인 링크를 보내지 못했어요. 잠시 후 다시 시도해 주세요."
                    busy = false
                }
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
                busy = true
                error = ""
                scope.launch {
                    val result = withContext(Dispatchers.IO) { client.requestEmailBind(value) }
                    val status = result["status"] as? Int ?: 500
                    if (status == 200) screen = LoveMeNativeScreen.Sent
                    else error = if ((result["body"] as? String)?.contains("invalid-email") == true)
                        "이메일 주소를 다시 확인해 주세요."
                    else "로그인 링크를 보내지 못했어요. 잠시 후 다시 시도해 주세요."
                    busy = false
                }
            }
        )
        LoveMeNativeScreen.Notice -> S2SignupScreen(
            phase = S2SignupPhase.Notice,
            email = email,
            error = error,
            busy = busy,
            onAcknowledgeNotice = {
                busy = true
                error = ""
                scope.launch {
                    val result = withContext(Dispatchers.IO) { client.acknowledgeNotice() }
                    val status = result["status"] as? Int ?: 500
                    if (status == 200) resumePending()
                    else error = "로그인 링크를 보내지 못했어요. 잠시 후 다시 시도해 주세요."
                    busy = false
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
