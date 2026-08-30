package com.beforeithappens.invite

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

/** S4 buyer home: invite waiting only. No pack CTA, payment, role switch, or store return. */
@Composable
fun InviteWaitingScreen(
    email: String,
    partnerEmail: String,
    inviteUrl: String?,
    remaining: String,
    lastSent: String,
    copied: Boolean,
    onCopy: () -> Unit,
    onShareInstagram: () -> Unit,
    onShareKakao: () -> Unit,
    onSendOrResend: (String) -> Unit,
    onLogout: () -> Unit
) {
    var draft by remember { mutableStateOf(partnerEmail) }
    Column(modifier = Modifier.padding(16.dp)) {
        Row {
            Text("AB")
            LogoutChrome(label = S4Copy.LOGOUT, onClick = onLogout)
        }
        Text(S4Copy.TITLE)
        if (inviteUrl != null) {
            Text(S4Copy.SHARE)
            Row {
                OutlinedButton(onClick = onCopy, modifier = Modifier.defaultMinSize(minHeight = 44.dp)) {
                    Text(S4Copy.COPY_LINK)
                }
                OutlinedButton(onClick = onShareInstagram, modifier = Modifier.defaultMinSize(minHeight = 44.dp)) {
                    Text(S4Copy.INSTAGRAM)
                }
                OutlinedButton(onClick = onShareKakao, modifier = Modifier.defaultMinSize(minHeight = 44.dp)) {
                    Text(S4Copy.KAKAO)
                }
            }
            if (copied) Text(S4Copy.COPIED)
            Text(S4Copy.DEVICE_RULE)
            Text(S4Copy.EMAIL_CHECK)
            Text(remaining)
            Text(lastSent)
        } else {
            Text(S4Copy.DEVICE_RULE)
        }
        OutlinedTextField(value = draft, onValueChange = { draft = it }, label = { Text("파트너 이메일") })
        Button(
            onClick = { onSendOrResend(draft) },
            modifier = Modifier.defaultMinSize(minHeight = 44.dp)
        ) {
            Text(if (inviteUrl == null) S4Copy.SEND else S4Copy.EDIT_RESEND)
        }
        if (email.isNotEmpty()) Text(email)
    }
}
