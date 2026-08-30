package com.beforeithappens.loveme.s9

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp

/**
 * Clusters an existing logout control with the S9 handoff caption.
 * This is chrome, not a screen, route, modal, or page.
 */
@Composable
fun LogoutHandoffChrome(
    modifier: Modifier = Modifier,
    logout: @Composable () -> Unit
) {
    Column(
        modifier = modifier.testTag("s9-logout-chrome"),
        horizontalAlignment = Alignment.End,
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        logout()
        LogoutHandoffCaption()
    }
}
