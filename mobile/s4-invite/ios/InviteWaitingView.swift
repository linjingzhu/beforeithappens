import SwiftUI

/// S4 buyer home: invite waiting only. No pack CTA, payment, role switch, or store return.
struct InviteWaitingView: View {
    let email: String
    let partnerEmail: String
    let inviteURL: String?
    let remaining: String
    let lastSent: String
    let copied: Bool
    let copyFailed: Bool
    let onCopy: () -> Void
    let onShareInstagram: () -> Void
    let onShareKakao: () -> Void
    let onSendOrResend: (String) -> Void
    let onLogout: () -> Void

    @State private var draftEmail: String = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("AB")
                Spacer()
                LogoutChrome(label: S4Copy.logout, action: onLogout)
            }
            Text(S4Copy.title)
                .font(.largeTitle)
            if let link = inviteURL {
                Text(S4Copy.share)
                HStack(spacing: 10) {
                    Button(S4Copy.copyLink, action: onCopy)
                        .frame(minHeight: 44)
                    Button(S4Copy.instagram, action: onShareInstagram)
                        .frame(minHeight: 44)
                    Button(S4Copy.kakao, action: onShareKakao)
                        .frame(minHeight: 44)
                }
                if copyFailed {
                    Text(S4Copy.copyFailed)
                }
                // UX_CONTRACT.md: the made link is readable and selectable, never buttons alone.
                Text(link)
                    .textSelection(.enabled)
                    .font(.footnote)
                if copied {
                    Text(S4Copy.copied)
                }
                Text(S4Copy.deviceRule)
                Text(S4Copy.emailCheck)
                Text(remaining)
                Text(lastSent)
            } else {
                Text(S4Copy.deviceRule)
            }
            TextField("파트너 이메일", text: $draftEmail)
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .frame(minHeight: 48)
            Button(inviteURL == nil ? S4Copy.send : S4Copy.editResend) {
                onSendOrResend(draftEmail)
            }
            .frame(minHeight: 44)
            if !email.isEmpty {
                Text(email)
            }
        }
        .padding()
        .onAppear {
            if draftEmail.isEmpty { draftEmail = partnerEmail }
        }
    }
}
