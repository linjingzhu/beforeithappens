package app.loveme.paywall

import app.loveme.pack.PackSession

class PaywallViewModel(
    val session: PackSession,
    private val client: PaywallClient? = null
) {
    var visible: Boolean = false
        private set
    var variant: String = "buyer"
        private set
    var dismissed: Boolean = false
        private set
    var entitled: Boolean = false
        private set
    var busy: Boolean = false
        private set
    var error: String = ""
        private set

    val canPurchase: Boolean get() = visible && variant == "buyer" && PaywallGate.isBuyer(session)
    val title: String get() = if (variant == "partner") PaywallCopy.PARTNER_TITLE else PaywallCopy.BUYER_TITLE
    val body: String get() = if (variant == "partner") PaywallCopy.PARTNER_BODY else PaywallCopy.BUYER_BODY
    val cta: String get() = if (canPurchase) PaywallCopy.BUYER_CTA else ""
    val secondary: String get() = if (canPurchase) PaywallCopy.LATER else ""
    val labels: List<String> get() = listOf(PaywallCopy.ALIGNED, PaywallCopy.CLOSE, PaywallCopy.DISCUSS)

    fun apply(sampleLocks: Int, entitled: Boolean, index: Int) {
        this.entitled = entitled
        if (entitled) dismissed = false
        visible = PaywallGate.shouldShow(session, sampleLocks, entitled, dismissed, index)
        variant = if (PaywallGate.isBuyer(session)) "buyer" else "partner"
    }

    fun later() {
        dismissed = true
        visible = false
        error = ""
    }

    fun purchase() {
        if (!canPurchase) return
        val api = client ?: return
        busy = true
        val payload = api.purchase()
        if (payload.optBoolean("entitled") || payload.optBoolean("ok")) {
            entitled = payload.optBoolean("entitled", true)
            dismissed = false
            visible = false
            error = ""
        } else {
            error = payload.optString("error", "failed")
        }
        busy = false
    }
}
