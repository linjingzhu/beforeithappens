package com.beforeithappens.loveme

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

object LoveMeInvitePackCopy {
    const val packTitle = "질문집"
    const val packSubtitle = "결혼만 지금 열려 있어요."
    const val packSoon = "곧 열려요"
    const val inviteHeadline = "이 답이 비교되려면 파트너가 필요해요."
    const val inviteSub = "초대를 보내면 상대도 같은 질문을 받아요."
    const val copyLink = "링크 복사"
    const val instagram = "인스타그램"
    const val kakao = "카카오톡"
    const val myCode = "내 코드"
    const val copyCode = "복사"
    const val partnerCard = "상대 코드를 알고 있다면"
    const val partnerPlaceholder = "상대 코드 입력"
    const val connect = "연결하기"
}

@Composable
fun LoveMePackListScreen(onOpenMarriage: () -> Unit = {}) {
    val cream = Color(0xFFFDFBF7)
    val coral = Color(0xFFEE775F)
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(cream)
            .padding(28.dp)
    ) {
        Text("LoveMe", color = coral, fontSize = 22.sp, fontWeight = FontWeight.Medium)
        Text(LoveMeInvitePackCopy.packTitle, fontSize = 34.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 20.dp))
        Text(LoveMeInvitePackCopy.packSubtitle, color = Color(0xFF81756E), modifier = Modifier.padding(top = 8.dp, bottom = 20.dp))
        Button(
            onClick = onOpenMarriage,
            colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = Color(0xFF2B2521))
        ) { Text("결혼 ›") }
        listOf("가정 경영", "임신", "출산", "육아").forEach { label ->
            Text("$label  ${LoveMeInvitePackCopy.packSoon}", modifier = Modifier.padding(top = 12.dp))
        }
    }
}

@Composable
fun LoveMeInviteScreen(
    pairCodeDisplay: String = "",
    onCopyLink: () -> Unit = {},
    onShareInstagram: () -> Unit = {},
    onShareKakao: () -> Unit = {},
    onCopyCode: () -> Unit = {},
    onConnect: (String) -> Unit = {}
) {
    var partnerCode by remember { mutableStateOf("") }
    val cream = Color(0xFFFDFBF7)
    val coral = Color(0xFFEE775F)
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(cream)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("LoveMe", color = coral, fontSize = 22.sp, fontWeight = FontWeight.Medium)
        Text(LoveMeInvitePackCopy.inviteHeadline, fontSize = 24.sp, fontWeight = FontWeight.SemiBold, textAlign = TextAlign.Center)
        Text(LoveMeInvitePackCopy.inviteSub, color = Color(0xFF81756E), textAlign = TextAlign.Center, modifier = Modifier.padding(top = 8.dp, bottom = 16.dp))
        Button(onClick = onCopyLink, colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = coral)) { Text(LoveMeInvitePackCopy.copyLink) }
        Button(onClick = onShareInstagram, colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = coral)) { Text(LoveMeInvitePackCopy.instagram) }
        Button(onClick = onShareKakao, colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = coral)) { Text(LoveMeInvitePackCopy.kakao) }
        Text(LoveMeInvitePackCopy.myCode, color = Color(0xFF81756E), modifier = Modifier.padding(top = 20.dp))
        Text(pairCodeDisplay, fontSize = 28.sp, fontWeight = FontWeight.Bold)
        Button(onClick = onCopyCode, colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent, contentColor = coral)) { Text(LoveMeInvitePackCopy.copyCode) }
        Text(LoveMeInvitePackCopy.partnerCard, modifier = Modifier.padding(top = 16.dp))
        OutlinedTextField(
            value = partnerCode,
            onValueChange = { partnerCode = it },
            placeholder = { Text(LoveMeInvitePackCopy.partnerPlaceholder) },
            modifier = Modifier.fillMaxWidth()
        )
        Button(
            onClick = { onConnect(partnerCode) },
            colors = ButtonDefaults.buttonColors(containerColor = coral),
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 48.dp)
                .padding(top = 12.dp)
        ) { Text(LoveMeInvitePackCopy.connect) }
    }
}
