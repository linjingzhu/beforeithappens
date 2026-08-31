package com.beforeithappens.loveme

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

object LoveMeS0Copy {
    const val brand = "LoveMe"
    const val title = "두 사람의 결혼 준비, 한곳에"
    const val holdMs = 1200L
}

@Composable
fun S0SplashScreen(onFinished: () -> Void = {}) {
    LaunchedEffect(Unit) {
        delay(LoveMeS0Copy.holdMs)
        onFinished()
    }
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF6C8D8))
            .padding(28.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = LoveMeS0Copy.brand, fontSize = 44.sp, color = Color(0xFF3A3338))
        Text("[debug]", color = Color(0xFF7A7278), modifier = Modifier.padding(top = 16.dp))
    }
}
