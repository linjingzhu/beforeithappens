package com.beforeithappens.loveme

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
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
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
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
}

enum class S2SignupPhase { Signup, Sent, Notice }

@Composable
fun S2SignupScreen(
    phase: S2SignupPhase = S2SignupPhase.Signup,
    email: String = "",
    error: String = "",
    busy: Boolean = false,
    onSubmitEmail: (String) -> Unit = {},
    onUseOtherEmail: () -> Unit = {},
    onAcknowledgeNotice: () -> Unit = {}
) {
    var emailDraft by remember { mutableStateOf(email) }
    Column(modifier = Modifier.padding(22.dp)) {
        Text("AB · EMAIL SIGN IN", color = Color(0xFFEE775F), fontSize = 11.sp)
        Text(LoveMeS2Copy.title, fontSize = 34.sp, color = Color(0xFF2B2521), modifier = Modifier.padding(top = 8.dp))
        when (phase) {
            S2SignupPhase.Signup -> {
                Text(LoveMeS2Copy.body, color = Color(0xFF81756E), modifier = Modifier.padding(top = 12.dp, bottom = 20.dp))
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
                    onClick = { onSubmitEmail(emailDraft) },
                    enabled = !busy,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEE775F)),
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 48.dp)
                        .padding(top = 8.dp)
                ) { Text(LoveMeS2Copy.cta) }
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
