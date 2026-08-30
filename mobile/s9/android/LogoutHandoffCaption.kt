package com.beforeithappens.loveme.s9

import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

object LoveMeS9Copy {
    const val LOGOUT_HANDOFF = "로그아웃 후 이 기기를 넘겨주세요."
}

/** Caption only. Place beside an existing logout control. Not a screen. */
@Composable
fun LogoutHandoffCaption(modifier: Modifier = Modifier) {
    Text(
        text = LoveMeS9Copy.LOGOUT_HANDOFF,
        fontSize = 11.sp,
        lineHeight = 16.sp,
        textAlign = TextAlign.End,
        modifier = modifier
            .widthIn(max = 256.dp)
            .testTag("s9-logout-handoff-caption")
    )
}
