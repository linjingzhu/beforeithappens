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
    static let coverTitle = "두 사람의 결혼 준비, 한곳에"
    static let coverLine1 = "질문은 나만 먼저 답해요."
    static let coverLine2 = "비교는 둘이 낸 뒤에만 열려요."
    static let coverCta = "미리 질문 하나 보기"
    static let keepTitle = "이 답을 남기려면 로그인해 주세요"
    static let bindTitle = "이메일을 연결해 주세요."
    static let bindCta = "이메일 연결하기"
    static let bindBody = "초대를 수락하려면 이메일을 연결해야 해요."
    static let oauthUnconfigured = "이 로그인은 아직 준비 중이에요. 이메일 링크로 시작해 주세요."
}

enum S2SignupPhase {
    case signup
    case sent
    case notice
    case bind
}

struct S2SignupScreen: View {
    var phase: S2SignupPhase = .signup
    var email: String = ""
    var error: String = ""
    var busy: Bool = false
    var onSubmitEmail: (String) -> Void = { _ in }
    var onUseOtherEmail: () -> Void = {}
    var onAcknowledgeNotice: () -> Void = {}
    var onBindEmail: (String) -> Void = { _ in }

    @State private var emailDraft = ""

    var body: some View {
        if phase == .signup {
            loginGate
        } else {
            legacyCard
        }
    }

    private var loginGate: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("LoveMe")
                .font(.system(size: 22, weight: .medium, design: .serif))
                .foregroundStyle(Color(red: 0.93, green: 0.47, blue: 0.37))
            VStack(alignment: .leading, spacing: 12) {
                Text(LoveMeS2Copy.keepTitle)
                    .font(.title2.weight(.bold))
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
                if !error.isEmpty {
                    Text(error)
                        .foregroundStyle(Color(red: 0.71, green: 0.28, blue: 0.22))
                        .font(.footnote.weight(.bold))
                }
            }
            .padding(24)
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: 20))
            Spacer()
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(red: 0.99, green: 0.98, blue: 0.97))
        .onAppear { emailDraft = email }
    }

    private var legacyCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("AB · EMAIL SIGN IN")
                .font(.caption.weight(.heavy))
                .foregroundStyle(Color(red: 0.93, green: 0.47, blue: 0.37))
            Text(phase == .bind ? LoveMeS2Copy.bindTitle : LoveMeS2Copy.title)
                .font(.title2.weight(.bold))
            if phase == .bind {
                Text(LoveMeS2Copy.bindBody)
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
                Button(LoveMeS2Copy.bindCta) { onBindEmail(emailDraft) }
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

struct LoveMePreviewQ1Screen: View {
    var loggedIn: Bool = false
    var onKeepAnswer: () -> Void = {}
    var onContinue: () -> Void = {}

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("나만 보임")
                .font(.caption.weight(.heavy))
                .foregroundStyle(Color(red: 0.93, green: 0.47, blue: 0.37))
            Text("우리에게 집은 어떤 의미에 가장 가까울까요?")
                .font(.title2.weight(.medium))
            Button(loggedIn ? "계속하기" : "이 답 남기기", action: loggedIn ? onContinue : onKeepAnswer)
                .buttonStyle(LoveMePrimaryButtonStyle())
        }
        .padding(28)
    }
}

struct LoveMeCoverScreen: View {
    var onPreviewQuestion: () -> Void = {}

    var body: some View {
        VStack(spacing: 12) {
            Text("LoveMe")
                .font(.title.weight(.medium))
                .foregroundStyle(Color(red: 0.93, green: 0.47, blue: 0.37))
            Text("♡")
                .foregroundStyle(Color(red: 0.93, green: 0.47, blue: 0.37))
            Text(LoveMeS2Copy.coverTitle)
                .font(.title2.weight(.medium))
                .multilineTextAlignment(.center)
            RoundedRectangle(cornerRadius: 12)
                .fill(Color(red: 0.97, green: 0.94, blue: 0.89))
                .frame(width: 176, height: 176)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(style: StrokeStyle(lineWidth: 2, dash: [4]))
                        .foregroundStyle(Color(red: 0.84, green: 0.77, blue: 0.68))
                        .padding(8)
                )
                .overlay(Text("♡").font(.title).foregroundStyle(Color(red: 0.93, green: 0.47, blue: 0.37)))
                .overlay(alignment: .trailing) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color(red: 0.97, green: 0.94, blue: 0.89))
                        .frame(width: 30, height: 40)
                        .overlay(Circle().fill(Color(red: 0.78, green: 0.63, blue: 0.36)).frame(width: 12, height: 12))
                        .offset(x: 12)
                }
                .overlay(alignment: .bottomLeading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color(red: 0.93, green: 0.47, blue: 0.37))
                        .frame(width: 10, height: 24)
                        .offset(x: 28, y: 16)
                }
            Text(LoveMeS2Copy.coverLine1)
            Text(LoveMeS2Copy.coverLine2)
            Button(LoveMeS2Copy.coverCta, action: onPreviewQuestion)
                .buttonStyle(LoveMePrimaryButtonStyle())
        }
        .padding(28)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(red: 0.99, green: 0.98, blue: 0.97))
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
