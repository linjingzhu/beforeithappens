package com.beforeithappens.loveme

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
    const val account = "계정"
    const val packDetailTitle = "결혼"
    const val packDetailSub = "두 사람의 결혼 준비, 한곳에."
    const val samplesTitle = "예시 질문"
    val samples = listOf(
        "예상하지 못한 여유 자금이 생기면 어떻게 하고 싶나요?",
        "명절 당일 양가 일정이 겹친다면 어떤 기본 원칙을 선호하나요?",
        "우리에게 집은 어떤 의미에 가장 가까울까요?"
    )
    const val caption1 = "여기서 답하지 않아요."
    const val caption2 = "파트너가 연결된 다음 질문이 열려요."
    const val packDetailCta = "링크 보내기"
    const val email = "이메일"
    const val logout = "로그아웃"
    const val inviteHeadline = "링크 보내기"
    const val inviteSub = "초대를 보내면 상대도 같은 팩을 받아요."
    const val copyLink = "링크 복사"
    const val instagram = "인스타그램"
    const val kakao = "카카오톡"
    const val appCode = "앱에서 코드로 연결"
    const val myCode = "내 코드"
    const val copyCode = "복사"
    const val partnerCard = "상대 코드를 알고 있다면"
    const val partnerPlaceholder = "상대 코드 입력"
    const val connect = "연결하기"
}

@Composable
fun LoveMePackListScreen(onOpenMarriage: () -> Unit = {}, onOpenAccount: () -> Unit = {}) {
    val cream = Color(0xFFFDFBF7)
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(cream)
            .padding(28.dp)
    ) {
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("LoveMe", fontSize = 22.sp, fontWeight = FontWeight.Medium)
            TextButton(onClick = onOpenAccount) { Text(LoveMeInvitePackCopy.account, color = Color(0xFF2B2521)) }
        }
        Text(LoveMeInvitePackCopy.packTitle, fontSize = 34.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(top = 20.dp))
        Text(LoveMeInvitePackCopy.packSubtitle, color = Color(0xFF81756E), modifier = Modifier.padding(top = 8.dp, bottom = 20.dp))
        Button(
            onClick = onOpenMarriage,
            colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = Color(0xFF2B2521)),
            modifier = Modifier.fillMaxWidth()
        ) { Text("결혼 ›") }
        listOf("가정 경영", "임신", "출산", "육아").forEach { label ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 10.dp)
                    .background(Color.White, RoundedCornerShape(16.dp))
                    .padding(horizontal = 18.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(label)
                Text(LoveMeInvitePackCopy.packSoon, color = Color(0xFF81756E))
            }
        }
    }
}

@Composable
fun LoveMePackDetailScreen(onBack: () -> Unit = {}, onSendLink: () -> Unit = {}) {
    val cream = Color(0xFFFDFBF7)
    val coral = Color(0xFFEE775F)
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(cream)
            .padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        TextButton(onClick = onBack, modifier = Modifier.align(Alignment.Start)) { Text("‹", fontSize = 28.sp, color = Color(0xFF2B2521)) }
        Text(LoveMeInvitePackCopy.packDetailTitle, fontSize = 40.sp, fontWeight = FontWeight.Medium, modifier = Modifier.align(Alignment.Start))
        Text(LoveMeInvitePackCopy.packDetailSub, color = Color(0xFF81756E), modifier = Modifier.align(Alignment.Start).padding(top = 8.dp, bottom = 20.dp))
        Text(LoveMeInvitePackCopy.samplesTitle, color = Color(0xFF81756E), modifier = Modifier.align(Alignment.Start).padding(bottom = 12.dp))
        LoveMeInvitePackCopy.samples.forEachIndexed { index, sample ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 10.dp)
                    .background(Color.White, RoundedCornerShape(16.dp))
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("${index + 1}", color = Color(0xFF81756E), modifier = Modifier.padding(end = 14.dp))
                Text(sample, color = Color(0xFF2B2521))
            }
        }
        Text(LoveMeInvitePackCopy.caption1, color = Color(0xFF81756E), fontSize = 13.sp, modifier = Modifier.align(Alignment.Start).padding(top = 8.dp))
        Text(LoveMeInvitePackCopy.caption2, color = Color(0xFF81756E), fontSize = 13.sp, modifier = Modifier.align(Alignment.Start))
        Spacer(modifier = Modifier.weight(1f))
        Button(
            onClick = onSendLink,
            colors = ButtonDefaults.buttonColors(containerColor = coral),
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 52.dp)
        ) { Text(LoveMeInvitePackCopy.packDetailCta) }
    }
}

@Composable
fun LoveMeAccountScreen(email: String = "", onBack: () -> Unit = {}, onLogout: () -> Unit = {}) {
    val cream = Color(0xFFFDFBF7)
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(cream)
            .padding(24.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            TextButton(onClick = onBack) { Text("‹", fontSize = 28.sp, color = Color(0xFF2B2521)) }
            Text(LoveMeInvitePackCopy.account, fontSize = 22.sp, fontWeight = FontWeight.Bold)
        }
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 28.dp)
                .background(Color.White, RoundedCornerShape(16.dp))
                .padding(horizontal = 18.dp, vertical = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(LoveMeInvitePackCopy.email)
            Text(email)
        }
        Spacer(modifier = Modifier.weight(1f))
        TextButton(
            onClick = onLogout,
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 52.dp)
                .border(1.dp, Color(0xFFC45C4E), RoundedCornerShape(16.dp))
        ) { Text(LoveMeInvitePackCopy.logout, color = Color(0xFFC45C4E)) }
    }
}

@Composable
fun LoveMeInviteScreen(
    pairCodeDisplay: String = "",
    onBack: () -> Unit = {},
    onCopyLink: () -> Unit = {},
    onShareInstagram: () -> Unit = {},
    onShareKakao: () -> Unit = {},
    onCopyCode: () -> Unit = {},
    onConnect: (String) -> Unit = {}
) {
    var partnerCode by remember { mutableStateOf("") }
    val cream = Color(0xFFFDFBF7)
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(cream)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            TextButton(onClick = onBack) { Text("‹", fontSize = 28.sp, color = Color(0xFF2B2521)) }
            Text(LoveMeInvitePackCopy.inviteHeadline, fontSize = 22.sp, fontWeight = FontWeight.Bold)
        }
        Text(LoveMeInvitePackCopy.inviteSub, color = Color(0xFF81756E), textAlign = TextAlign.Center, modifier = Modifier.padding(top = 8.dp, bottom = 16.dp))
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFFF3EBE3), RoundedCornerShape(20.dp))
                .padding(14.dp)
        ) {
            Button(onClick = onCopyLink, colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = Color(0xFF2B2521)), modifier = Modifier.fillMaxWidth()) { Text(LoveMeInvitePackCopy.copyLink) }
            Button(onClick = onShareInstagram, colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = Color(0xFF2B2521)), modifier = Modifier.fillMaxWidth()) { Text(LoveMeInvitePackCopy.instagram) }
            Button(onClick = onShareKakao, colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = Color(0xFF2B2521)), modifier = Modifier.fillMaxWidth()) { Text(LoveMeInvitePackCopy.kakao) }
        }
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp)
                .background(Color(0xFFF3EBE3), RoundedCornerShape(20.dp))
                .padding(16.dp)
        ) {
            Text(LoveMeInvitePackCopy.appCode, color = Color(0xFF81756E), fontSize = 12.sp)
            Row(modifier = Modifier.padding(top = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(LoveMeInvitePackCopy.myCode)
                Text(pairCodeDisplay, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(start = 10.dp).weight(1f))
                TextButton(onClick = onCopyCode) { Text(LoveMeInvitePackCopy.copyCode) }
            }
            Text(LoveMeInvitePackCopy.partnerCard, color = Color(0xFF81756E), modifier = Modifier.padding(top = 12.dp, bottom = 8.dp))
            Row {
                OutlinedTextField(
                    value = partnerCode,
                    onValueChange = { partnerCode = it },
                    placeholder = { Text(LoveMeInvitePackCopy.partnerPlaceholder) },
                    modifier = Modifier.weight(1f)
                )
                Button(
                    onClick = { onConnect(partnerCode) },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD8C4B0), contentColor = Color(0xFF2B2521)),
                    modifier = Modifier.padding(start = 8.dp).heightIn(min = 48.dp)
                ) { Text(LoveMeInvitePackCopy.connect) }
            }
        }
    }
}
