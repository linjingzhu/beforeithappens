package com.beforeithappens.loveme

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

object LoveMeS2Copy {
    const val title = "두 사람의 결혼 준비, 한곳에"
    const val body = "비밀번호 없이 이메일로 로그인 링크를 보내드려요."
    const val cta = "로그인 링크 보내기"
    const val sent = "메일을 확인해 주세요. 링크는 10분 동안만 유효해요."
    const val afterLogin = "이 기기 임시 답은 이어지지 않아요."
    const val emailLabel = "이메일"
    const val ack = "확인"
    const val otherEmail = "다른 이메일로 요청"
    const val packDetailTitle = "결혼"
    const val packDetailSub = "두 사람의 결혼 준비, 한곳에."
    const val samplesTitle = "예시 질문"
    const val caption1 = "여기서 답하지 않아요."
    const val caption2 = "파트너가 연결된 다음 질문이 열려요."
    const val packDetailCta = "링크 보내기"
    const val bindTitle = "이메일을 연결해 주세요."
    const val bindCta = "이메일 연결하기"
    const val bindBody = "초대를 수락하려면 이메일을 연결해야 해요."
    const val oauthUnconfigured = "이 로그인은 아직 준비 중이에요. 이메일 링크로 시작해 주세요."
}

enum class S2SignupPhase { Signup, Sent, Notice, Bind }

@Composable
fun S2SignupScreen(
    phase: S2SignupPhase = S2SignupPhase.Signup,
    email: String = "",
    error: String = "",
    busy: Boolean = false,
    onSubmitEmail: (String) -> Unit = {},
    onUseOtherEmail: () -> Unit = {},
    onAcknowledgeNotice: () -> Unit = {},
    onBindEmail: (String) -> Unit = {},
    onBack: () -> Unit = {}
) {
    var emailDraft by remember { mutableStateOf(email) }
    val cream = Color(0xFFFDFBF7)
    val coral = Color(0xFFEE775F)
    if (phase == S2SignupPhase.Signup) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(cream)
                .systemBarsPadding()
                .padding(24.dp)
        ) {
            Row {
                TextButton(onClick = onBack) { Text("‹", fontSize = 28.sp, color = Color(0xFF2B2521)) }
                Text("LoveMe", color = coral, fontSize = 22.sp, fontWeight = FontWeight.Medium)
            }
            Column(
                modifier = Modifier
                    .padding(top = 28.dp)
                    .fillMaxWidth()
                    .background(Color.White, RoundedCornerShape(20.dp))
                    .padding(24.dp)
            ) {
                Text(LoveMeS2Copy.body, color = Color(0xFF81756E), modifier = Modifier.padding(bottom = 20.dp))
                Text(LoveMeS2Copy.emailLabel)
                OutlinedTextField(
                    value = emailDraft,
                    onValueChange = { emailDraft = it },
                    enabled = !busy,
                    singleLine = true,
                    placeholder = { Text(LoveMeS2Copy.emailLabel) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 48.dp)
                )
                Button(
                    onClick = { onSubmitEmail(emailDraft) },
                    enabled = !busy,
                    colors = ButtonDefaults.buttonColors(containerColor = coral),
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 48.dp)
                        .padding(top = 8.dp)
                ) { Text(LoveMeS2Copy.cta) }
                if (error.isNotEmpty()) {
                    Text(error, color = Color(0xFFB64838), modifier = Modifier.padding(top = 16.dp))
                }
            }
        }
        return
    }
    Column(modifier = Modifier.padding(22.dp)) {
        Text("AB · EMAIL SIGN IN", color = Color(0xFFEE775F), fontSize = 11.sp)
        if (phase == S2SignupPhase.Bind) {
            Text(
                LoveMeS2Copy.bindTitle,
                fontSize = 34.sp,
                color = Color(0xFF2B2521),
                modifier = Modifier.padding(top = 8.dp)
            )
        }
        when (phase) {
            S2SignupPhase.Signup -> { }
            S2SignupPhase.Bind -> {
                Text(LoveMeS2Copy.bindBody, color = Color(0xFF81756E), modifier = Modifier.padding(top = 12.dp, bottom = 20.dp))
                Text(LoveMeS2Copy.emailLabel)
                OutlinedTextField(
                    value = emailDraft,
                    onValueChange = { emailDraft = it },
                    enabled = !busy,
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 48.dp)
                )
                Button(
                    onClick = { onBindEmail(emailDraft) },
                    enabled = !busy,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEE775F)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 48.dp)
                        .padding(top = 8.dp)
                ) { Text(LoveMeS2Copy.bindCta) }
            }
            S2SignupPhase.Sent -> {
                Text(LoveMeS2Copy.sent, color = Color(0xFF81756E), modifier = Modifier.padding(top = 12.dp))
                if (email.isNotEmpty()) Text(email, modifier = Modifier.padding(top = 8.dp))
                OutlinedButton(
                    onClick = onUseOtherEmail,
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 48.dp)
                        .padding(top = 8.dp)
                ) { Text(LoveMeS2Copy.otherEmail) }
            }
            S2SignupPhase.Notice -> {
                Text(LoveMeS2Copy.afterLogin, color = Color(0xFF81756E), modifier = Modifier.padding(top = 12.dp))
                if (email.isNotEmpty()) Text(email, modifier = Modifier.padding(top = 8.dp))
                Button(
                    onClick = onAcknowledgeNotice,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEE775F)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 48.dp)
                        .padding(top = 8.dp)
                ) { Text(LoveMeS2Copy.ack) }
            }
        }
        if (error.isNotEmpty()) {
            Text(error, color = Color(0xFFB64838), modifier = Modifier.padding(top = 16.dp))
        }
    }
}

