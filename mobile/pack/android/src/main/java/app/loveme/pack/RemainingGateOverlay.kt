package app.loveme.pack

import androidx.compose.runtime.Composable

@Composable
fun RemainingGateOverlay(model: PackViewModel) {
    app.loveme.paywall.RemainingPackGateHost(model)
}
