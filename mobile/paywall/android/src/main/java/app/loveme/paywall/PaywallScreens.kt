package app.loveme.paywall

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import app.loveme.pack.PackRootScreen
import app.loveme.pack.PackViewModel

private val Paper = Color(0xFFF8F3ED)
private val Card = Color(0xFFFFFDFA)
private val Soft = Color(0xFFFCE8E1)
private val Coral = Color(0xFFEE775F)
private val Ink = Color(0xFF2B2521)
private val Muted = Color(0xFF81756E)

@Composable
fun ComparisonLabels(labels: List<String> = listOf(PaywallCopy.ALIGNED, PaywallCopy.CLOSE, PaywallCopy.DISCUSS)) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.semantics { contentDescription = "paywall-labels" }
    ) {
        labels.forEach { label ->
            Text(
                label,
                color = Ink,
                modifier = Modifier
                    .background(Soft, RoundedCornerShape(999.dp))
                    .padding(horizontal = 10.dp, vertical = 6.dp)
            )
        }
    }
}

@Composable
fun PaywallBuyerScreen(model: PaywallViewModel) {
    Column(
        Modifier
            .fillMaxWidth()
            .background(Card, RoundedCornerShape(24.dp))
            .padding(24.dp)
            .semantics { contentDescription = "paywall-buyer" },
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(PaywallCopy.BUYER_TITLE, color = Ink)
        Text(PaywallCopy.BUYER_BODY, color = Muted)
        ComparisonLabels(model.labels)
        Button(
            onClick = { model.purchase() },
            enabled = !model.busy,
            colors = ButtonDefaults.buttonColors(containerColor = Coral),
            modifier = Modifier.heightIn(min = 44.dp).semantics { contentDescription = PaywallCopy.BUYER_CTA }
        ) {
            Text(PaywallCopy.BUYER_CTA)
        }
        OutlinedButton(
            onClick = { model.later() },
            modifier = Modifier.heightIn(min = 44.dp).semantics { contentDescription = PaywallCopy.LATER }
        ) {
            Text(PaywallCopy.LATER)
        }
        if (model.error.isNotEmpty()) Text(model.error, color = Color(0xFFB64838))
    }
}

@Composable
fun PaywallPartnerScreen(model: PaywallViewModel) {
    Column(
        Modifier
            .fillMaxWidth()
            .background(Card, RoundedCornerShape(24.dp))
            .padding(24.dp)
            .semantics { contentDescription = "paywall-partner" },
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(PaywallCopy.PARTNER_TITLE, color = Ink)
        Text(PaywallCopy.PARTNER_BODY, color = Muted)
        ComparisonLabels(model.labels)
    }
}

@Composable
fun PaywallOverlay(model: PaywallViewModel) {
    if (!model.visible) return
    Box(
        Modifier
            .fillMaxSize()
            .background(Paper.copy(alpha = 0.72f)),
        contentAlignment = Alignment.BottomCenter
    ) {
        Box(Modifier.padding(20.dp)) {
            if (model.variant == "partner") PaywallPartnerScreen(model) else PaywallBuyerScreen(model)
        }
    }
}

@Composable
fun RemainingPackGateHost(model: PackViewModel) {
    PaywallOverlay(model.remainingGate)
}

@Composable
fun PaywallPackRootScreen(model: PackViewModel) {
    Box(Modifier.fillMaxSize()) {
        PackRootScreen(model)
        RemainingPackGateHost(model)
    }
}
