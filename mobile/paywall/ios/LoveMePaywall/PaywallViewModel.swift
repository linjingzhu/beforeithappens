import Foundation
import SwiftUI

@MainActor
final class PaywallViewModel: ObservableObject {
    @Published var visible = false
    @Published var variant = "buyer"
    @Published var dismissed = false
    @Published var entitled = false
    @Published var busy = false
    @Published var error = ""

    let session: PackSession
    private let client: PaywallClient?

    init(session: PackSession, client: PaywallClient? = nil) {
        self.session = session
        self.client = client
    }

    var canPurchase: Bool { visible && variant == "buyer" && PaywallGate.isBuyer(session) }
    var title: String { variant == "partner" ? PaywallCopy.partnerTitle : PaywallCopy.buyerTitle }
    var body: String { variant == "partner" ? PaywallCopy.partnerBody : PaywallCopy.buyerBody }
    var cta: String { canPurchase ? PaywallCopy.buyerCta : "" }
    var secondary: String { canPurchase ? PaywallCopy.later : "" }
    var labels: [String] { [PaywallCopy.aligned, PaywallCopy.close, PaywallCopy.discuss] }

    func apply(sampleLocks: Int, entitled: Bool, index: Int) {
        self.entitled = entitled
        if entitled { dismissed = false }
        visible = PaywallGate.shouldShow(
            session: session,
            sampleLocks: sampleLocks,
            entitled: entitled,
            dismissed: dismissed,
            index: index
        )
        variant = PaywallGate.isBuyer(session) ? "buyer" : "partner"
    }

    func later() {
        dismissed = true
        visible = false
        error = ""
    }

    func purchase() async {
        guard canPurchase, let client else { return }
        busy = true
        do {
            let payload = try await client.purchase()
            entitled = payload["entitled"] as? Bool == true
            dismissed = false
            visible = false
            error = ""
        } catch {
            self.error = "failed"
        }
        busy = false
    }
}
