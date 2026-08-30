package com.beforeithappens.loveme

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
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
    const val coverTitle = "두 사람의 결혼 준비, 한곳에"
    const val coverLine1 = "질문은 나만 먼저 답해요."
    const val coverLine2 = "비교는 둘이 낸 뒤에만 열려요."
    const val coverCta = "미리 한 질문 보기"
    const val keepTitle = "이 답을 남기려면 로그인해 주세요"
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
    onBindEmail: (String) -> Unit = {}
) {
    var emailDraft by remember { mutableStateOf(email) }
    val cream = Color(0xFFFDFBF7)
    val coral = Color(0xFFEE775F)
    if (phase == S2SignupPhase.Signup) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(cream)
                .padding(24.dp)
        ) {
            Text("LoveMe", color = coral, fontSize = 22.sp, fontWeight = FontWeight.Medium)
            Column(
                modifier = Modifier
                    .padding(top = 28.dp)
                    .fillMaxWidth()
                    .background(Color.White, RoundedCornerShape(20.dp))
                    .padding(24.dp)
            ) {
                Text(LoveMeS2Copy.keepTitle, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Color(0xFF2B2521))
                Text(LoveMeS2Copy.body, color = Color(0xFF81756E), modifier = Modifier.padding(top = 12.dp, bottom = 20.dp))
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
        Text(
            if (phase == S2SignupPhase.Bind) LoveMeS2Copy.bindTitle else LoveMeS2Copy.title,
            fontSize = 34.sp,
            color = Color(0xFF2B2521),
            modifier = Modifier.padding(top = 8.dp)
        )
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

@Composable
fun LoveMeCoverScreen(onPreviewQuestion: () -> Unit = {}) {
    val cream = Color(0xFFFDFBF7)
    val coral = Color(0xFFEE775F)
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(cream)
            .padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("LoveMe", color = coral, fontSize = 28.sp, fontWeight = FontWeight.Medium)
        Text("♡", color = coral, fontSize = 18.sp, modifier = Modifier.padding(top = 8.dp, bottom = 16.dp))
        Text(
            LoveMeS2Copy.coverTitle,
            color = Color(0xFF2B2521),
            fontSize = 26.sp,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(bottom = 24.dp)
        )
        Box(
            modifier = Modifier
                .padding(bottom = 24.dp)
                .size(176.dp)
                .background(Color(0xFFF7F0E4), RoundedCornerShape(12.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text("♡", color = coral, fontSize = 32.sp)
        }
        Text(LoveMeS2Copy.coverLine1, color = Color(0xFF2B2521), textAlign = TextAlign.Center)
        Text(LoveMeS2Copy.coverLine2, color = Color(0xFF2B2521), textAlign = TextAlign.Center)
        Spacer(modifier = Modifier.weight(1f))
        Button(
            onClick = onPreviewQuestion,
            colors = ButtonDefaults.buttonColors(containerColor = coral),
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
        ) { Text(LoveMeS2Copy.coverCta) }
    }
}

@Composable
fun LoveMePreviewQ1Screen(onKeepAnswer: () -> Unit = {}) {
    Column(modifier = Modifier.padding(28.dp)) {
        Text("나만 보임", color = Color(0xFFEE775F), fontSize = 11.sp, fontWeight = FontWeight.Bold)
        Text("우리에게 집은 어떤 의미에 가장 가까울까요?", fontSize = 22.sp, modifier = Modifier.padding(top = 12.dp))
        Button(
            onClick = onKeepAnswer,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEE775F)),
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 48.dp)
                .padding(top = 16.dp)
        ) { Text("이 답 남기기") }
    }
}
