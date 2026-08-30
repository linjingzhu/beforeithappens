import SwiftUI

enum LoveMeNativeScreen {
    case splash
    case signup
    case sent
    case bind
    case notice
    case packList
    case packDetail
    case invite
    case account
    case workspace
}

struct LoveMeS0S2S3Host: View {
    var client: LoveMeAuthClient
    var onInvitePartner: () -> Void = {}

    @State private var screen: LoveMeNativeScreen = .splash
    @State private var email = ""
    @State private var error = ""
    @State private var busy = false
    @State private var pairCode = ""

    var body: some View {
        Group {
            switch screen {
            case .splash:
                S0SplashScreen(onFinished: restoreSession)
            case .packList:
                LoveMePackListScreen(
                    onOpenMarriage: { screen = .packDetail },
                    onOpenAccount: { screen = .account }
                )
            case .packDetail:
                LoveMePackDetailScreen(
                    onBack: { screen = .packList },
                    onSendLink: {
                        screen = .invite
                        Task { await loadPairCode() }
                    }
                )
            case .account:
                LoveMeAccountScreen(
                    email: email,
                    onBack: { screen = .packList },
                    onLogout: logout
                )
            case .invite:
                LoveMeInviteScreen(
                    pairCodeDisplay: pairCode,
                    onBack: { screen = .packDetail },
                    onCopyLink: {},
                    onShareInstagram: {},
                    onShareKakao: {},
                    onCopyCode: {},
                    onConnect: { _ in }
                )
                .task { await loadPairCode() }
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
                } else if (session?["notice"] as? String)?.isEmpty == false {
                    screen = .notice
                } else {
                    screen = .packList
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
                if (session["notice"] as? String)?.isEmpty == false {
                    screen = .notice
                } else {
                    screen = .packList
                }
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

    private func loadPairCode() async {
        if let payload = try? await client.myPairCode() {
            pairCode = payload["display"] as? String ?? payload["code"] as? String ?? ""
        }
    }

    private func ackNotice() {
        busy = true
        error = ""
        Task {
            do {
                _ = try await client.acknowledgeNotice()
                screen = .packList
            } catch {
                self.error = "로그인 링크를 보내지 못했어요. 잠시 후 다시 시도해 주세요."
            }
            busy = false
        }
    }

    private func logout() {
        Task {
            _ = try? await client.logout()
            email = ""
            pairCode = ""
            screen = .signup
        }
    }
}
