import SwiftUI

struct PaywallBuyerView: View {
    @ObservedObject var model: PaywallViewModel
    var onPurchase: (() async -> Void)?
    var onLater: (() -> Void)?
    @State private var shopOpen = false

    var body: some View {
        VStack(spacing: 16) {
            Text("♡ 0")
            Text(PaywallCopy.buyerTitle)
                .font(.title2.weight(.semibold))
                .multilineTextAlignment(.center)
            Text(PaywallCopy.buyerBody)
                .foregroundStyle(LoveMeTheme.charcoal)
                .multilineTextAlignment(.center)
            Button(PaywallCopy.buyerCta) { shopOpen = true }
            .frame(maxWidth: .infinity, minHeight: 44)
            .background(LoveMeTheme.buttonGradient)
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .accessibilityIdentifier("paywall-purchase")
            Text(PaywallCopy.needHearts)
                .font(.footnote)
                .foregroundStyle(LoveMeTheme.muted)
            if shopOpen {
                Text(PaywallCopy.shopTitle)
                Button(PaywallCopy.shopCta) {
                    Task { if let onPurchase { await onPurchase() } else { await model.purchase() } }
                }
                Button(PaywallCopy.later) {
                    shopOpen = false
                    if let onLater { onLater() } else { model.later() }
                }
                .accessibilityIdentifier("paywall-later")
            }
            if !model.error.isEmpty {
                Text(model.error)
                    .font(.footnote)
                    .foregroundStyle(.red)
            }
        }
        .padding(24)
        .background(LoveMeTheme.screenGradient)
        .clipShape(RoundedRectangle(cornerRadius: 24))
        .accessibilityIdentifier("paywall-buyer")
    }
}

struct PaywallPartnerView: View {
    @ObservedObject var model: PaywallViewModel
    var onLater: (() -> Void)?

    var body: some View {
        VStack(spacing: 16) {
            Text(PaywallCopy.partnerTitle)
                .font(.title2.weight(.semibold))
                .multilineTextAlignment(.center)
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(LoveMeTheme.screenGradient)
        .accessibilityIdentifier("paywall-partner")
    }
}

struct PaywallOverlay: View {
    @ObservedObject var model: PaywallViewModel
    var onPurchase: (() async -> Void)?
    var onLater: (() -> Void)?

    var body: some View {
        if model.visible {
            ZStack(alignment: .bottom) {
                Color(red: 0.973, green: 0.953, blue: 0.929).opacity(0.72)
                if model.variant == "partner" {
                    PaywallPartnerView(model: model, onLater: onLater)
                        .padding(20)
                } else {
                    PaywallBuyerView(model: model, onPurchase: onPurchase, onLater: onLater)
                        .padding(20)
                }
            }
            .ignoresSafeArea()
        }
    }
}

struct RemainingPackGateHost: View {
    @ObservedObject var model: PackViewModel

    var body: some View {
        PaywallOverlay(
            model: model.remainingGate,
            onPurchase: { await model.purchaseRemaining() },
            onLater: { model.later() }
        )
    }
}

struct PaywallPackRootView: View {
    @ObservedObject var model: PackViewModel

    var body: some View {
        PackRootView(model: model)
    }
}
