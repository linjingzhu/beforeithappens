import SwiftUI

/// Clusters an existing logout control with the S9 handoff caption.
/// This is chrome, not a screen, route, modal, or page.
struct LogoutHandoffChrome<Logout: View>: View {
    let logout: Logout

    init(@ViewBuilder logout: () -> Logout) {
        self.logout = logout()
    }

    var body: some View {
        VStack(alignment: .trailing, spacing: 4) {
            logout
            LogoutHandoffCaption()
        }
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("s9-logout-chrome")
    }
}
