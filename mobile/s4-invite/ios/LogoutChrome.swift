import SwiftUI

/// S9 is not a separate screen. Handoff copy sits next to logout.
struct LogoutChrome: View {
    let label: String
    let action: () -> Void

    var body: some View {
        VStack(alignment: .trailing, spacing: 4) {
            Button(label, action: action)
                .frame(minHeight: 44)
            Text(S4Copy.logoutHandoff)
                .font(.caption)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.trailing)
        }
        .accessibilityElement(children: .combine)
    }
}
