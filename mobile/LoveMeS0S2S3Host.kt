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

enum class LoveMeNativeScreen { Splash, Signup, Sent, Bind, Notice, Workspace }

@Composable
fun LoveMeS0S2S3Host(
    client: LoveMeAuthClient,
    onInvitePartner: () -> Unit = {}
) {
    var screen by remember { mutableStateOf(LoveMeNativeScreen.Splash) }
    var email by remember { mutableStateOf("") }
    var error by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

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
                        else -> LoveMeNativeScreen.Workspace
                    }
                } else {
                    screen = LoveMeNativeScreen.Signup
                }
            }
        }
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
            }
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
                    if (status == 200) screen = LoveMeNativeScreen.Workspace
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

fun openMagicLink(client: LoveMeAuthClient, url: String): Pair<LoveMeNativeScreen, String> {
    val token = LoveMeAuthApi.extractMagicLinkToken(url) ?: return LoveMeNativeScreen.Signup to "로그인 링크가 유효하지 않아요."
    val result = client.consumeMagicLink(token)
    val status = result["status"] as? Int ?: 500
    val body = result["body"] as? String ?: ""
    if (status == 200 && body.contains("\"needsEmail\":true")) return LoveMeNativeScreen.Bind to ""
    if (status == 200 && body.contains("\"notice\"")) return LoveMeNativeScreen.Notice to ""
    val error = when {
        body.contains("expired") -> "로그인 링크가 만료되었어요. 다시 요청해 주세요."
        body.contains("used") -> "이미 사용한 로그인 링크예요. 새 링크를 요청해 주세요."
        else -> "로그인 링크가 유효하지 않아요."
    }
    return LoveMeNativeScreen.Signup to error
}
