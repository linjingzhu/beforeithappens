import SwiftUI

enum LoveMeNativeScreen {
    case splash
    case signup
    case sent
    case bind
    case notice
    case workspace
}

struct LoveMeS0S2S3Host: View {
    var client: LoveMeAuthClient
    var onInvitePartner: () -> Void = {}

    @State private var screen: LoveMeNativeScreen = .splash
    @State private var email = ""
    @State private var error = ""
    @State private var busy = false

    var body: some View {
        Group {
            switch screen {
            case .splash:
                S0SplashScreen(onFinished: restoreSession)
            case .signup:
                S2SignupScreen(
                    phase: .signup,
                    email: email,
                    error: error,
                    busy: busy,
                    onSubmitEmail: requestLink
                )
            case .sent:
                S2SignupScreen(phase: .sent, email: email, error: error, onUseOtherEmail: { screen = .signup; error = "" })
            case .bind:
                S2SignupScreen(phase: .bind, email: email, error: error, busy: busy, onBindEmail: requestBind)
            case .notice:
                S2SignupScreen(phase: .notice, email: email, error: error, busy: busy, onAcknowledgeNotice: ackNotice)
            case .workspace:
                S3WorkspaceCreatedScreen(email: email, onInvitePartner: onInvitePartner)
            }
        }
    }

    private func restoreSession() {
        Task {
            let session = try? await client.currentSession()
            if let user = session?["user"] as? [String: Any] {
                email = user["email"] as? String ?? ""
                let needsEmail = user["needsEmail"] as? Bool == true || email.isEmpty
                if needsEmail {
                    screen = .bind
                } else {
                    screen = (session?["notice"] as? String)?.isEmpty == false ? .notice : .workspace
                }
            } else {
                screen = .signup
            }
        }
    }

    private func requestLink(_ value: String) {
        busy = true
        error = ""
        email = value
        Task {
            do {
                try await client.requestMagicLink(email: value)
                screen = .sent
            } catch LoveMeAuthError.invalidEmail {
                error = "이메일 주소를 다시 확인해 주세요."
            } catch {
                self.error = "로그인 링크를 보내지 못했어요. 잠시 후 다시 시도해 주세요."
            }
            busy = false
        }
    }

    func openMagicLink(_ url: URL) {
        guard let token = LoveMeAuthApi.extractMagicLinkToken(from: url) else { return }
        Task {
            do {
                let session = try await client.consumeMagicLink(token: token)
                if let user = session["user"] as? [String: Any] {
                    email = user["email"] as? String ?? email
                }
                screen = .notice
            } catch LoveMeAuthError.expired {
                error = "로그인 링크가 만료되었어요. 다시 요청해 주세요."
                screen = .signup
            } catch LoveMeAuthError.used {
                error = "이미 사용한 로그인 링크예요. 새 링크를 요청해 주세요."
                screen = .signup
            } catch {
                self.error = "로그인 링크가 유효하지 않아요."
                screen = .signup
            }
        }
    }

    private func requestBind(_ value: String) {
        busy = true
        error = ""
        email = value
        Task {
            do {
                try await client.requestEmailBind(email: value)
                screen = .sent
            } catch LoveMeAuthError.invalidEmail {
                error = "이메일 주소를 다시 확인해 주세요."
            } catch {
                self.error = "로그인 링크를 보내지 못했어요. 잠시 후 다시 시도해 주세요."
            }
            busy = false
        }
    }

    private func ackNotice() {
        busy = true
        error = ""
        Task {
            do {
                _ = try await client.acknowledgeNotice()
                screen = .workspace
            } catch {
                self.error = "로그인 링크를 보내지 못했어요. 잠시 후 다시 시도해 주세요."
            }
            busy = false
        }
    }
}
