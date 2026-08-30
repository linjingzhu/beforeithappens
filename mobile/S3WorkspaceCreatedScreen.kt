package com.beforeithappens.loveme

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

object LoveMeS3Copy {
    const val created = "워크스페이스가 만들어졌어요."
    const val inviteCta = "파트너 초대하기"
}

@Composable
fun S3WorkspaceCreatedScreen(
    email: String = "",
    onInvitePartner: () -> Unit = {}
) {
    Column(modifier = Modifier.padding(22.dp)) {
        Text("AB · WORKSPACE", color = Color(0xFFEE775F), fontSize = 11.sp)
        Text(LoveMeS3Copy.created, fontSize = 34.sp, color = Color(0xFF2B2521), modifier = Modifier.padding(top = 8.dp))
        if (email.isNotEmpty()) Text(email, modifier = Modifier.padding(top = 12.dp))
        Button(
            onClick = onInvitePartner,
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEE775F)),
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 48.dp)
                .padding(top = 16.dp)
        ) { Text(LoveMeS3Copy.inviteCta) }
    }
}
