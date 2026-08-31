package com.beforeithappens.loveme

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.systemBarsPadding
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import android.graphics.Typeface
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

object LoveMeInvitePackCopy {
    const val packTitle = "질문집"
    const val packSoon = "곧 열려요"
    const val account = "계정"
    const val login = "로그인"
    const val inviteCta = "연인을 초대하세요"
    const val logout = "로그아웃"
    const val homeMgmtQuestion = "가사와 시간은 어떻게 나누고 싶나요?"
    const val backToList = "목록으로"
    const val reason = "왜 그 선택인지 한 줄로 적어주세요."
    const val next = "다음"
    const val example = "예시입니다"
    const val together = "함께 풀어보기"
    const val tasteAligned = "같음"
    const val tasteClose = "가까움"
    const val tasteDiscuss = "이야기해요"
    const val unlockTitle = "두 사람 답을 비교했어요."
    const val unlockBody = "나머지 문항을 이어서 열 수 있어요."
    const val unlockCta = "열기"
    const val needHearts = "♡ 하트 10이 필요해요."
    const val shopTitle = "상점"
    const val shopCta = "29,000원에 | ♡ 12"
    const val later = "나중에"
    const val partnerWait = "상대가 열면 이어집니다."
    const val debug = "[debug]"
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
    val sampleTitles = listOf(
        "예상하지 못한 여유 자금이 생기면 어떻게 하고 싶나요?",
        "명절 당일 양가 일정이 겹친다면 어떤 기본 원칙을 선호하나요?",
        "우리에게 집은 어떤 의미에 가장 가까울까요?"
    )
    val sampleChoices = listOf(
        "외부의 피로를 회복하는 조용한 안식처",
        "가족과 친구가 자연스럽게 모이는 열린 공간",
        "각자의 생활과 취향을 존중하는 독립적인 공간",
        "함께 목표를 세우고 성장해 가는 생활의 기반"
    )
}

private val Charcoal = Color(0xFF3A3338)
private val Muted = Color(0xFF7A7278)
private val BabyPink = Color(0xFFF6C8D8)
private val SkyBlue = Color(0xFFB7D9F0)
private val Card = Color(0xB8FFFFFF)

@Composable
fun rememberMaruBuri(): FontFamily {
    val context = LocalContext.current
    return remember {
        runCatching { FontFamily(Typeface.createFromAsset(context.assets, "fonts/MaruBuri-Regular.ttf")) }
            .getOrElse { FontFamily.Serif }
    }
}

@Composable
fun rememberPretendard(): FontFamily {
    val context = LocalContext.current
    return remember {
        runCatching { FontFamily(Typeface.createFromAsset(context.assets, "fonts/Pretendard-Regular.otf")) }
            .getOrElse { FontFamily.SansSerif }
    }
}

fun Modifier.loveMeSafeChrome(): Modifier = this
    .fillMaxSize()
    .background(BabyPink)
    .systemBarsPadding()

@Composable
fun LoveMePackListScreen(
    hearts: Int = 0,
    showHearts: Boolean = true,
    onOpenMarriage: () -> Unit = {},
    onOpenComingSoon: (String) -> Unit = {},
    onOpenAccount: () -> Unit = {}
) {
    val titleFont = rememberMaruBuri()
    val bodyFont = rememberPretendard()
    Column(
        modifier = Modifier
            .loveMeSafeChrome()
            .padding(28.dp)
    ) {
        if (showHearts) Text("♡ $hearts", color = Charcoal, fontWeight = FontWeight.SemiBold, fontFamily = bodyFont, modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Center)
        Text(LoveMeInvitePackCopy.packTitle, fontSize = 34.sp, fontWeight = FontWeight.SemiBold, color = Charcoal, fontFamily = titleFont, modifier = Modifier.padding(top = 12.dp, bottom = 16.dp))
        listOf(
            Triple("dating", "연애", false),
            Triple("marriage", "결혼", true),
            Triple("home-mgmt", "가정 경영", false),
            Triple("pregnancy", "임신", false),
            Triple("birth", "출산", false),
            Triple("parenting", "육아", false)
        ).forEach { pack ->
            Button(
                onClick = { if (pack.third) onOpenMarriage() else onOpenComingSoon(pack.first) },
                colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent, contentColor = Charcoal),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(pack.second, fontFamily = titleFont)
                    Text(if (pack.third) "›" else LoveMeInvitePackCopy.packSoon, color = Muted, fontFamily = bodyFont)
                }
            }
        }
        Spacer(modifier = Modifier.weight(1f))
        TextButton(onClick = onOpenAccount, modifier = Modifier.fillMaxWidth()) { Text(LoveMeInvitePackCopy.account, color = Charcoal) }
        Text(LoveMeInvitePackCopy.debug, color = Muted, modifier = Modifier.fillMaxWidth(), textAlign = TextAlign.Center)
    }
}

@Composable
fun LoveMeAccountScreen(
    email: String = "",
    partnerEmail: String = "",
    acceptedPartner: Boolean = false,
    guest: Boolean = false,
    onBack: () -> Unit = {},
    onLogout: () -> Unit = {},
    onLogin: () -> Unit = {},
    onInvite: () -> Unit = {}
) {
    Column(
        modifier = Modifier
            .loveMeSafeChrome()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        if (guest) {
            Text(LoveMeInvitePackCopy.account, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Charcoal)
            Button(
                onClick = onLogin,
                colors = ButtonDefaults.buttonColors(containerColor = SkyBlue, contentColor = Color.White),
                modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp).padding(top = 16.dp)
            ) { Text(LoveMeInvitePackCopy.login) }
        } else {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                TextButton(onClick = onBack) { Text("‹", fontSize = 28.sp, color = Charcoal) }
                Text(LoveMeInvitePackCopy.account, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Charcoal)
            }
            if (acceptedPartner) {
                Text(if (partnerEmail.isNotEmpty()) partnerEmail else email, color = Charcoal, modifier = Modifier.padding(top = 28.dp))
            } else {
                Text(email, color = Charcoal, modifier = Modifier.padding(top = 28.dp))
                Button(
                    onClick = onInvite,
                    colors = ButtonDefaults.buttonColors(containerColor = SkyBlue, contentColor = Color.White),
                    modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp).padding(top = 16.dp)
                ) { Text(LoveMeInvitePackCopy.inviteCta) }
            }
            Spacer(modifier = Modifier.weight(1f))
            TextButton(onClick = onLogout, modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp)) {
                Text(LoveMeInvitePackCopy.logout, color = Charcoal)
            }
        }
        Text(LoveMeInvitePackCopy.debug, color = Muted)
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
    Column(
        modifier = Modifier
            .loveMeSafeChrome()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            TextButton(onClick = onBack) { Text("‹", fontSize = 28.sp, color = Charcoal) }
            Text(LoveMeInvitePackCopy.inviteHeadline, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Charcoal)
        }
        Text(LoveMeInvitePackCopy.inviteSub, color = Muted, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 8.dp, bottom = 16.dp))
        Button(onClick = onCopyLink, colors = ButtonDefaults.buttonColors(containerColor = SkyBlue, contentColor = Color.White), modifier = Modifier.fillMaxWidth()) { Text(LoveMeInvitePackCopy.copyLink) }
        TextButton(onClick = onShareInstagram) { Text(LoveMeInvitePackCopy.instagram, color = Charcoal) }
        TextButton(onClick = onShareKakao) { Text(LoveMeInvitePackCopy.kakao, color = Charcoal) }
        Text(LoveMeInvitePackCopy.appCode, color = Muted, fontSize = 12.sp, modifier = Modifier.padding(top = 16.dp))
        Row(modifier = Modifier.padding(top = 10.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(LoveMeInvitePackCopy.myCode, color = Charcoal)
            Text(pairCodeDisplay, fontWeight = FontWeight.SemiBold, color = Charcoal, modifier = Modifier.padding(start = 10.dp).weight(1f))
            TextButton(onClick = onCopyCode) { Text(LoveMeInvitePackCopy.copyCode) }
        }
        Text(LoveMeInvitePackCopy.partnerCard, color = Muted, modifier = Modifier.padding(top = 12.dp, bottom = 8.dp))
        Row {
            OutlinedTextField(
                value = partnerCode,
                onValueChange = { partnerCode = it },
                placeholder = { Text(LoveMeInvitePackCopy.partnerPlaceholder) },
                modifier = Modifier.weight(1f)
            )
            Button(
                onClick = { onConnect(partnerCode) },
                colors = ButtonDefaults.buttonColors(containerColor = SkyBlue, contentColor = Color.White),
                modifier = Modifier.padding(start = 8.dp).heightIn(min = 48.dp)
            ) { Text(LoveMeInvitePackCopy.connect) }
        }
        Text(LoveMeInvitePackCopy.debug, color = Muted, modifier = Modifier.padding(top = 16.dp))
    }
}

@Composable
fun LoveMeComingSoonScreen(
    title: String = "가정 경영",
    question: String = "",
    onBackToList: () -> Unit = {}
) {
    Column(
        modifier = Modifier.loveMeSafeChrome().padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(LoveMeInvitePackCopy.packSoon, color = Muted)
        Text(title, fontSize = 36.sp, fontWeight = FontWeight.SemiBold, color = Charcoal, modifier = Modifier.padding(top = 10.dp))
        if (question.isNotEmpty()) {
            Text(question, color = Charcoal, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 16.dp))
        }
        Spacer(modifier = Modifier.weight(1f))
        TextButton(onClick = onBackToList) { Text(LoveMeInvitePackCopy.backToList, color = Charcoal) }
        Text(LoveMeInvitePackCopy.debug, color = Muted)
    }
}

@Composable
fun LoveMeSampleQuestionScreen(
    title: String,
    choices: List<Pair<String, String>>,
    choiceId: String,
    reason: String,
    progressLabel: String = "결혼 1/3",
    onChoose: (String) -> Unit,
    onReason: (String) -> Unit,
    onSubmit: () -> Unit,
    onBack: () -> Unit
) {
    val titleFont = rememberMaruBuri()
    val bodyFont = rememberPretendard()
    Column(
        modifier = Modifier.loveMeSafeChrome().padding(28.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            TextButton(onClick = onBack) { Text("‹", fontSize = 28.sp, color = Charcoal, fontFamily = bodyFont) }
            Text(progressLabel, fontSize = 15.sp, color = Charcoal, fontFamily = bodyFont)
        }
        Text(title, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = Charcoal, fontFamily = titleFont)
        choices.forEach { choice ->
            Button(
                onClick = { onChoose(choice.first) },
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.White,
                    contentColor = Charcoal
                ),
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
            ) {
                Row(modifier = Modifier.fillMaxWidth()) {
                    Text(if (choiceId == choice.first) "●" else "○", color = Muted, fontFamily = bodyFont)
                    Text(choice.second, textAlign = TextAlign.Start, modifier = Modifier.padding(start = 12.dp).fillMaxWidth(), fontFamily = bodyFont)
                }
            }
        }
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 16.dp)) {
            Text("♡", color = BabyPink)
            Text(LoveMeInvitePackCopy.reason, color = Muted, fontFamily = bodyFont, modifier = Modifier.padding(start = 8.dp))
        }
        OutlinedTextField(
            value = reason,
            onValueChange = onReason,
            placeholder = { Text(LoveMeInvitePackCopy.reason, fontFamily = bodyFont) },
            modifier = Modifier.fillMaxWidth()
        )
        Button(
            onClick = onSubmit,
            enabled = choiceId.isNotEmpty() && reason.trim().isNotEmpty(),
            colors = ButtonDefaults.buttonColors(containerColor = SkyBlue, contentColor = Color.White),
            modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp).padding(top = 12.dp)
        ) { Text(LoveMeInvitePackCopy.next, fontFamily = bodyFont) }
        Text(LoveMeInvitePackCopy.debug, color = Muted)
    }
}

@Composable
fun LoveMeSampleResultScreen(
    question: String,
    mine: String,
    partner: String,
    onTogether: () -> Unit
) {
    Column(
        modifier = Modifier.loveMeSafeChrome().padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(LoveMeInvitePackCopy.example, color = Muted)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(top = 12.dp)) {
            listOf(
                LoveMeInvitePackCopy.tasteAligned,
                LoveMeInvitePackCopy.tasteClose,
                LoveMeInvitePackCopy.tasteDiscuss
            ).forEach { label ->
                Text(label, color = Charcoal, fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }
        }
        Text(question, color = Charcoal, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 18.dp, bottom = 16.dp))
        Column(modifier = Modifier.fillMaxWidth().background(Card, RoundedCornerShape(16.dp)).padding(14.dp)) {
            Text("나", fontWeight = FontWeight.Bold, color = Charcoal)
            Text(mine, color = Charcoal, modifier = Modifier.padding(top = 8.dp))
        }
        Column(modifier = Modifier.fillMaxWidth().padding(top = 10.dp).background(Card, RoundedCornerShape(16.dp)).padding(14.dp)) {
            Text("상대", fontWeight = FontWeight.Bold, color = Charcoal)
            Text(partner, color = Charcoal, modifier = Modifier.padding(top = 8.dp))
        }
        Button(
            onClick = onTogether,
            colors = ButtonDefaults.buttonColors(containerColor = SkyBlue, contentColor = Color.White),
            modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp).padding(top = 16.dp)
        ) { Text(LoveMeInvitePackCopy.together) }
        Text(LoveMeInvitePackCopy.debug, color = Muted)
    }
}

@Composable
fun LoveMeUnlockScreen(
    hearts: Int = 0,
    shopOpen: Boolean = false,
    onUnlock: () -> Unit = {},
    onBuy: () -> Unit = {},
    onLater: () -> Unit = {}
) {
    Column(
        modifier = Modifier.loveMeSafeChrome().padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("♡ $hearts", color = Charcoal, fontWeight = FontWeight.SemiBold)
        Text(LoveMeInvitePackCopy.unlockTitle, fontSize = 26.sp, fontWeight = FontWeight.Bold, color = Charcoal, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 12.dp))
        Text(LoveMeInvitePackCopy.unlockBody, color = Charcoal, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 8.dp))
        Button(
            onClick = onUnlock,
            colors = ButtonDefaults.buttonColors(containerColor = SkyBlue, contentColor = Color.White),
            modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp).padding(top = 16.dp)
        ) { Text(LoveMeInvitePackCopy.unlockCta) }
        if (hearts < 10) Text(LoveMeInvitePackCopy.needHearts, color = Muted, modifier = Modifier.padding(top = 10.dp))
        if (shopOpen) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 20.dp)
                    .background(Card, RoundedCornerShape(20.dp))
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("♡ $hearts", color = Charcoal, fontWeight = FontWeight.SemiBold)
                Text(LoveMeInvitePackCopy.shopTitle, fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Charcoal, modifier = Modifier.padding(vertical = 12.dp))
                Button(
                    onClick = onBuy,
                    colors = ButtonDefaults.buttonColors(containerColor = SkyBlue, contentColor = Color.White),
                    modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp)
                ) { Text(LoveMeInvitePackCopy.shopCta) }
                TextButton(onClick = onLater) { Text(LoveMeInvitePackCopy.later, color = Muted) }
            }
        }
        Text(LoveMeInvitePackCopy.debug, color = Muted, modifier = Modifier.padding(top = 12.dp))
    }
}

@Composable
fun LoveMePartnerWaitScreen() {
    Column(
        modifier = Modifier.loveMeSafeChrome().padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Spacer(modifier = Modifier.weight(1f))
        Text(LoveMeInvitePackCopy.partnerWait, color = Charcoal, fontSize = 18.sp, fontWeight = FontWeight.Medium)
        Spacer(modifier = Modifier.weight(1f))
        Text(LoveMeInvitePackCopy.debug, color = Muted)
    }
}

@Composable
fun LoveMeCertificateScreen(
    packLabel: String = "결혼",
    onBackToList: () -> Unit = {}
) {
    Column(
        modifier = Modifier.loveMeSafeChrome().padding(28.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("이수증", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Color(0xFF3A3338))
        Text(packLabel, color = Color(0xFF3A3338), modifier = Modifier.padding(top = 12.dp))
        Text("두 사람 답을 비교한 예시입니다.", color = Color(0xFF3A3338), modifier = Modifier.padding(top = 8.dp))
        Text(LoveMeInvitePackCopy.example, color = Color(0xFF7A7278), modifier = Modifier.padding(top = 8.dp))
        Spacer(modifier = Modifier.weight(1f))
        TextButton(onClick = onBackToList) { Text(LoveMeInvitePackCopy.backToList, color = Color(0xFF3A3338)) }
        Text(LoveMeInvitePackCopy.debug, color = Color(0xFF7A7278))
    }
}
