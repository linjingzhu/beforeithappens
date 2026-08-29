package com.beforeithappens.loveme

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

object LoveMeS0Copy {
    const val brand = "AB"
    const val title = "두 사람의 결혼 준비, 한곳에"
    const val tagline = "다가올 삶을, 함께 준비하다."
    const val english = "Before life changes, talk."
}

@Composable
fun S0SplashScreen(onFinished: () -> Unit = {}) {
    LaunchedEffect(Unit) {
        delay(1200)
        onFinished()
    }
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF8F3ED))
            .padding(28.dp),
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = LoveMeS0Copy.brand,
            color = Color.White,
            fontSize = 28.sp,
            modifier = Modifier
                .size(72.dp)
                .clip(CircleShape)
                .background(Color(0xFF2B2521))
                .padding(18.dp)
        )
        Text(text = LoveMeS0Copy.title, fontSize = 34.sp, color = Color(0xFF2B2521), modifier = Modifier.padding(top = 16.dp))
        Text(text = LoveMeS0Copy.tagline, color = Color(0xFF81756E), modifier = Modifier.padding(top = 12.dp))
        Text(text = LoveMeS0Copy.english, color = Color(0xFF81756E), fontSize = 13.sp)
    }
}
