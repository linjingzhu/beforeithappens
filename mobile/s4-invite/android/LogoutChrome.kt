package com.beforeithappens.invite

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

/** S9 is not a separate screen. Handoff copy sits next to logout. */
@Composable
fun LogoutChrome(label: String, onClick: () -> Unit) {
    Column(horizontalAlignment = Alignment.End) {
        TextButton(onClick = onClick, modifier = Modifier.defaultMinSize(minHeight = 44.dp)) {
            Text(label)
        }
        Text(S4Copy.LOGOUT_HANDOFF)
    }
}
