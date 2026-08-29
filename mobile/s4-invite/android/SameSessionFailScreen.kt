package com.beforeithappens.invite

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

/** Independent same-session failure screen. Not a role switch. */
@Composable
fun SameSessionFailScreen(onLogoutAndContinue: () -> Unit) {
    Column(modifier = Modifier.padding(16.dp)) {
        Row {
            Text("AB")
            LogoutChrome(label = SameSessionCopy.CTA, onClick = onLogoutAndContinue)
        }
        Text(S4Copy.TITLE)
        Text(SameSessionCopy.MESSAGE)
        Button(onClick = onLogoutAndContinue, modifier = Modifier.defaultMinSize(minHeight = 44.dp)) {
            Text(SameSessionCopy.CTA)
        }
    }
}
