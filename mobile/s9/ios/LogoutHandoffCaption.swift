import SwiftUI

enum LoveMeS9Copy {
    static let logoutHandoff = "로그아웃 후 이 기기를 넘겨주세요."
}

/// Caption only. Place beside an existing logout control. Not a screen.
struct LogoutHandoffCaption: View {
    var body: some View {
        Text(LoveMeS9Copy.logoutHandoff)
            .font(.system(size: 11))
            .foregroundStyle(.secondary)
            .multilineTextAlignment(.trailing)
            .frame(maxWidth: 256, alignment: .trailing)
            .accessibilityIdentifier("s9-logout-handoff-caption")
            .accessibilityAddTraits(.isStaticText)
    }
}
