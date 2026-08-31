import SwiftUI

enum LoveMeNativeScreen {
    case splash
    case signup
    case sent
    case bind
    case notice
    case packList
    case packDetail
    case comingSoon
    case tasteResult
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
    @State private var comingSoonTitle = "가정 경영"
    @State private var pendingGate = ""
    @State private var signedIn = false

    var body: some View {
        Group {
            switch screen {
            case .splash:
                S0SplashScreen(onFinished: restoreSession)
            case .packList:
                LoveMePackListScreen(
                    onOpenMarriage: { screen = .packDetail },
                    onOpenComingSoon: { id in
                        comingSoonTitle = [
                            "home-mgmt": "가정 경영",
                            "pregnancy": "임신",
                            "birth": "출산",
                            "parenting": "육아"
                        ][id] ?? "가정 경영"
                        screen = .comingSoon
                    },
                    onOpenAccount: { requireLogin("account") }
                )
            case .comingSoon:
                LoveMeComingSoonScreen(
                    title: comingSoonTitle,
                    onTasteResult: { screen = .tasteResult },
                    onBackToList: { screen = .packList }
                )
            case .tasteResult:
                LoveMeTasteResultScreen(onBackToList: { screen = .packList })
            case .packDetail:
                LoveMePackDetailScreen(
                    onBack: { screen = .packList },
                    onSendLink: { requireLogin("invite") }
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
                    onConnect: { _ in requireLogin("connect") }
                )
                .task { await loadPairCode() }
            case .signup:
                S2SignupScreen(
                    phase: .signup,
                    email: email,
                    error: error,
                    busy: busy,
                    onSubmitEmail: requestLink,
                    onBack: cancelLogin
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
                signedIn = true
                let needsEmail = user["needsEmail"] as? Bool == true || email.isEmpty
                if needsEmail {
                    screen = .bind
                } else if (session?["notice"] as? String)?.isEmpty == false {
                    screen = .notice
                } else {
                    screen = .packList
                }
            } else {
                signedIn = false
                screen = .packList
            }
        }
    }

    private func requireLogin(_ gate: String) {
        if signedIn {
            resumePending(gate)
            return
        }
        pendingGate = gate
        screen = .signup
    }

    private func cancelLogin() {
        let returnToDetail = pendingGate == "invite" || pendingGate == "connect"
        pendingGate = ""
        error = ""
        busy = false
        screen = returnToDetail ? .packDetail : .packList
    }

    private func resumePending(_ gate: String = "") {
        let pending = gate.isEmpty ? pendingGate : gate
        pendingGate = ""
        signedIn = true
        switch pending {
        case "invite", "connect":
            screen = .invite
            Task { await loadPairCode() }
        case "account":
            screen = .account
        default:
            screen = .packList
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
                    resumePending()
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
                resumePending()
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
            signedIn = false
            pendingGate = ""
            screen = .packList
        }
    }
}
