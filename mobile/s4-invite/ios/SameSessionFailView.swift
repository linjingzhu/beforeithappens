import SwiftUI

/// Independent same-session failure screen. Not a role switch.
struct SameSessionFailView: View {
    let onLogoutAndContinue: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("AB")
                Spacer()
                LogoutChrome(label: SameSessionCopy.cta, action: onLogoutAndContinue)
            }
            Text(S4Copy.title)
                .font(.largeTitle)
            Text(SameSessionCopy.message)
            Button(SameSessionCopy.cta, action: onLogoutAndContinue)
                .frame(minHeight: 44)
        }
        .padding()
    }
}
