package app.loveme.paywall

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import app.loveme.pack.PackRootScreen
import app.loveme.pack.PackViewModel

private val Paper = Color(0xFFF6C8D8)
private val Card = Color(0xB8FFFFFF)
private val Charcoal = Color(0xFF3A3338)
private val Muted = Color(0xFF7A7278)
private val Sky = Color(0xFFB7D9F0)

@Composable
fun PaywallBuyerScreen(
    model: PaywallViewModel,
    onPurchase: () -> Unit = { model.purchase() },
    onLater: () -> Unit = { model.later() }
) {
    var shopOpen by remember { mutableStateOf(false) }
    Column(
        Modifier
            .fillMaxWidth()
            .background(Card, RoundedCornerShape(24.dp))
            .padding(24.dp)
            .semantics { contentDescription = "paywall-buyer" },
        verticalArrangement = Arrangement.spacedBy(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("♡ 0", color = Charcoal)
        Text(PaywallCopy.BUYER_TITLE, color = Charcoal)
        Text(PaywallCopy.BUYER_BODY, color = Charcoal)
        Button(
            onClick = { shopOpen = true },
            enabled = !model.busy,
            colors = ButtonDefaults.buttonColors(containerColor = Sky),
            modifier = Modifier.heightIn(min = 44.dp).semantics { contentDescription = PaywallCopy.BUYER_CTA }
        ) {
            Text(PaywallCopy.BUYER_CTA)
        }
        Text(PaywallCopy.NEED_HEARTS, color = Muted)
        if (shopOpen) {
            Text(PaywallCopy.SHOP_TITLE, color = Charcoal)
            Button(
                onClick = onPurchase,
                colors = ButtonDefaults.buttonColors(containerColor = Sky),
                modifier = Modifier.heightIn(min = 44.dp).fillMaxWidth()
            ) { Text(PaywallCopy.SHOP_CTA) }
            TextButton(onClick = { shopOpen = false; onLater() }) { Text(PaywallCopy.LATER) }
        }
        if (model.error.isNotEmpty()) Text(model.error, color = Color(0xFFB64838))
        Text("[debug]", color = Muted)
    }
}

@Composable
fun PaywallPartnerScreen(
    model: PaywallViewModel,
    onLater: () -> Unit = { model.later() }
) {
    Column(
        Modifier
            .fillMaxWidth()
            .background(Card, RoundedCornerShape(24.dp))
            .padding(24.dp)
            .semantics { contentDescription = "paywall-partner" },
        verticalArrangement = Arrangement.spacedBy(12.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(PaywallCopy.PARTNER_TITLE, color = Charcoal)
        Text("[debug]", color = Muted)
    }
}

@Composable
fun PaywallOverlay(
    model: PaywallViewModel,
    onPurchase: () -> Unit = { model.purchase() },
    onLater: () -> Unit = { model.later() }
) {
    if (!model.visible) return
    Box(
        Modifier
            .fillMaxSize()
            .background(Paper.copy(alpha = 0.72f)),
        contentAlignment = Alignment.BottomCenter
    ) {
        Box(Modifier.padding(20.dp)) {
            if (model.variant == "partner") {
                PaywallPartnerScreen(model, onLater = onLater)
            } else {
                PaywallBuyerScreen(model, onPurchase = onPurchase, onLater = onLater)
            }
        }
    }
}

@Composable
fun RemainingPackGateHost(model: PackViewModel) {
    PaywallOverlay(
        model = model.remainingGate,
        onPurchase = { model.purchaseRemaining() },
        onLater = { model.later() }
    )
}

@Composable
fun PaywallPackRootScreen(model: PackViewModel) {
    PackRootScreen(model)
}
