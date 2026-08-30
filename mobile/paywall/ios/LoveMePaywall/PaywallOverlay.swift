import SwiftUI

struct PaywallBuyerView: View {
    @ObservedObject var model: PaywallViewModel
    var onPurchase: (() async -> Void)?
    var onLater: (() -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(PaywallCopy.buyerTitle)
                .font(.title2.weight(.semibold))
            Text(PaywallCopy.buyerBody)
                .foregroundStyle(.secondary)
            labelRow
            Button(PaywallCopy.buyerCta) {
                Task { if let onPurchase { await onPurchase() } else { await model.purchase() } }
            }
            .buttonStyle(.borderedProminent)
            .tint(Color(red: 0.933, green: 0.467, blue: 0.373))
            .frame(minHeight: 44)
            .accessibilityIdentifier("paywall-purchase")
            Button(PaywallCopy.later) {
                if let onLater { onLater() } else { model.later() }
            }
            .frame(minHeight: 44)
            .accessibilityIdentifier("paywall-later")
            if !model.error.isEmpty {
                Text(model.error)
                    .font(.footnote)
                    .foregroundStyle(.red)
            }
        }
        .padding(24)
        .background(Color(red: 1, green: 0.992, blue: 0.980))
        .clipShape(RoundedRectangle(cornerRadius: 24))
        .accessibilityIdentifier("paywall-buyer")
    }

    private var labelRow: some View {
        HStack(spacing: 8) {
            ForEach(model.labels, id: \.self) { label in
                Text(label)
                    .font(.caption.weight(.bold))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Color(red: 0.988, green: 0.910, blue: 0.882))
                    .clipShape(Capsule())
            }
        }
        .accessibilityIdentifier("paywall-labels")
    }
}

struct PaywallPartnerView: View {
    @ObservedObject var model: PaywallViewModel
    var onLater: (() -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(PaywallCopy.partnerTitle)
                .font(.title2.weight(.semibold))
            Text(PaywallCopy.partnerBody)
                .foregroundStyle(.secondary)
            HStack(spacing: 8) {
                Text(PaywallCopy.aligned)
                Text(PaywallCopy.close)
                Text(PaywallCopy.discuss)
            }
            .font(.caption.weight(.bold))
            .accessibilityIdentifier("paywall-labels")
            Button(PaywallCopy.later) {
                if let onLater { onLater() } else { model.later() }
            }
            .frame(minHeight: 44)
            .accessibilityIdentifier("paywall-later")
        }
        .padding(24)
        .background(Color(red: 1, green: 0.992, blue: 0.980))
        .clipShape(RoundedRectangle(cornerRadius: 24))
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
