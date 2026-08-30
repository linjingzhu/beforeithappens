import SwiftUI

enum LoveMeS2Copy {
    static let title = "두 사람의 결혼 준비, 한곳에"
    static let body = "비밀번호 없이 이메일로 로그인 링크를 보내드려요."
    static let cta = "로그인 링크 보내기"
    static let sent = "메일을 확인해 주세요. 링크는 10분 동안만 유효해요."
    static let afterLogin = "이 기기 임시 답은 이어지지 않아요."
    static let emailLabel = "이메일"
    static let ack = "확인"
    static let otherEmail = "다른 이메일로 요청"
}

enum S2SignupPhase {
    case signup
    case sent
    case notice
}

struct S2SignupScreen: View {
    var phase: S2SignupPhase = .signup
    var email: String = ""
    var error: String = ""
    var busy: Bool = false
    var onSubmitEmail: (String) -> Void = { _ in }
    var onUseOtherEmail: () -> Void = {}
    var onAcknowledgeNotice: () -> Void = {}

    @State private var emailDraft = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("AB · EMAIL SIGN IN")
                .font(.caption.weight(.heavy))
                .foregroundStyle(Color(red: 0.93, green: 0.47, blue: 0.37))
            Text(LoveMeS2Copy.title)
                .font(.largeTitle.weight(.medium))
            if phase == .signup {
                Text(LoveMeS2Copy.body)
                    .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
                Text(LoveMeS2Copy.emailLabel)
                    .font(.caption.weight(.bold))
                TextField(LoveMeS2Copy.emailLabel, text: $emailDraft)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .padding(.horizontal, 14)
                    .frame(minHeight: 48)
                    .background(Color.white)
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color(red: 0.91, green: 0.87, blue: 0.84)))
                    .disabled(busy)
                Button(LoveMeS2Copy.cta) { onSubmitEmail(emailDraft) }
                    .buttonStyle(LoveMePrimaryButtonStyle())
                    .disabled(busy)
            } else if phase == .sent {
                Text(LoveMeS2Copy.sent)
                    .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
                if !email.isEmpty { Text(email) }
                Button(LoveMeS2Copy.otherEmail, action: onUseOtherEmail)
                    .frame(minHeight: 48)
            } else {
                Text(LoveMeS2Copy.afterLogin)
                    .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
                if !email.isEmpty { Text(email) }
                Button(LoveMeS2Copy.ack, action: onAcknowledgeNotice)
                    .buttonStyle(LoveMePrimaryButtonStyle())
            }
            if !error.isEmpty {
                Text(error)
                    .foregroundStyle(Color(red: 0.71, green: 0.28, blue: 0.22))
                    .font(.footnote.weight(.bold))
            }
        }
        .padding(22)
        .onAppear { emailDraft = email }
    }
}

struct LoveMePrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.bold))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity, minHeight: 48)
            .background(Color(red: 0.93, green: 0.47, blue: 0.37))
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .opacity(configuration.isPressed ? 0.85 : 1)
    }
}
