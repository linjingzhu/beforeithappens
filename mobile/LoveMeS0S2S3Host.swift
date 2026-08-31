import SwiftUI
import UserNotifications

enum LoveMeNativeScreen {
    case splash
    case signup
    case sent
    case bind
    case notice
    case packList
    case sampleQ
    case sampleResult
    case unlock
    case certificate
    case partnerWait
    case comingSoon
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
    @State private var comingSoonQuestion = ""
    @State private var pendingGate = ""
    @State private var signedIn = false
    @State private var acceptedPartner = false
    @State private var partnerEmail = ""
    @State private var isPartner = false
    @State private var hearts = 0
    @State private var shopOpen = false
    @State private var sampleTitle = ""
    @State private var sampleChoices: [(id: String, label: String)] = []
    @State private var sampleChoice = ""
    @State private var sampleReason = ""
    @State private var sampleMine = ""
    @State private var samplePartner = ""
    @State private var sampleIndex = 0
    @State private var samplePackLabel = "결혼"
    @State private var sameCount = 0
    @State private var closeCount = 0
    @State private var talkCount = 0

    var body: some View {
        Group {
            switch screen {
            case .splash:
                S0SplashScreen(onFinished: restoreSession)
            case .packList:
                LoveMePackListScreen(
                    hearts: hearts,
                    showHearts: !isPartner,
                    onOpenMarriage: {
                        samplePackLabel = "결혼"
                        sampleIndex = 0
                        sameCount = 0
                        closeCount = 0
                        talkCount = 0
                        startSample()
                    },
                    onOpenComingSoon: { id in
                        samplePackLabel = LoveMeInvitePackCopy.rows.first(where: { $0.id == id })?.label ?? "결혼"
                        sampleIndex = 0
                        sameCount = 0
                        closeCount = 0
                        talkCount = 0
                        if id == "marriage" {
                            startSample()
                        } else {
                            sampleTitle = samplePackLabel
                            sampleMine = ""
                            samplePartner = ""
                            screen = .sampleResult
                        }
                    },
                    onOpenAccount: { requireLogin("account") }
                )
            case .comingSoon:
                LoveMeComingSoonScreen(title: comingSoonTitle, question: comingSoonQuestion, onBackToList: { screen = .packList })
            case .sampleQ:
                LoveMeSampleQuestionScreen(
                    title: sampleTitle,
                    choices: sampleChoices,
                    choiceId: sampleChoice,
                    reason: sampleReason,
                    progressLabel: "\(samplePackLabel) \(sampleIndex + 1)/3",
                    onChoose: { sampleChoice = $0 },
                    onReason: { sampleReason = $0 },
                    onSubmit: submitSample,
                    onBack: { screen = .packList }
                )
            case .sampleResult:
                LoveMeSampleResultScreen(question: sampleTitle, mine: sampleMine, partner: samplePartner, onTogether: {
                    acceptedPartner = true
                    screen = isPartner ? .partnerWait : .unlock
                })
            case .unlock:
                LoveMeUnlockScreen(hearts: hearts, shopOpen: shopOpen, onUnlock: tapUnlock, onBuy: {
                    hearts += 12
                    shopOpen = false
                }, onLater: { shopOpen = false })
            case .certificate:
                LoveMeCertificateScreen(
                    packLabel: samplePackLabel,
                    sameCount: sameCount,
                    closeCount: closeCount,
                    talkCount: talkCount,
                    onHome: { screen = .packList }
                )
            case .partnerWait:
                LoveMePartnerWaitScreen()
            case .account:
                LoveMeAccountScreen(
                    email: email,
                    partnerEmail: partnerEmail,
                    acceptedPartner: acceptedPartner,
                    guest: !signedIn,
                    onBack: { screen = .packList },
                    onLogout: logout,
                    onLogin: { requireLogin("account") },
                    onInvite: { requireLogin("invite") }
                )
            case .invite:
                LoveMeInviteScreen(
                    pairCodeDisplay: pairCode,
                    onBack: { screen = .account },
                    onCopyLink: {},
                    onShareInstagram: {},
                    onShareKakao: {},
                    onCopyCode: {},
                    onConnect: { _ in
                        acceptedPartner = true
                        partnerEmail = "partner@email.com"
                        screen = .account
                    }
                )
            case .signup:
                S2SignupScreen(
                    phase: .signup,
                    email: email,
                    error: error,
                    busy: busy,
                    onSubmitEmail: requestLink,
                    onBack: cancelLogin,
                    firstRun: pendingGate == "home" || pendingGate.isEmpty
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

    private func startSample() {
        let titles = LoveMeInvitePackCopy.sampleTitles
        let idx = min(max(sampleIndex, 0), titles.count - 1)
        sampleTitle = titles[idx]
        sampleChoices = [
            ("a", "외부의 피로를 회복하는 조용한 안식처"),
            ("b", "가족과 친구가 자연스럽게 모이는 열린 공간"),
            ("c", "각자의 생활과 취향을 존중하는 독립적인 공간"),
            ("d", "함께 목표를 세우고 성장해 가는 생활의 기반")
        ]
        sampleChoice = ""
        sampleReason = ""
        screen = .sampleQ
    }

    private func classifyPair(myId: String, partnerId: String) -> String {
        guard let my = sampleChoices.firstIndex(where: { $0.id == myId }),
              let partner = sampleChoices.firstIndex(where: { $0.id == partnerId }) else { return "discuss" }
        if my == partner { return "aligned" }
        if abs(my - partner) == 1 { return "close" }
        return "discuss"
    }

    private func recordPair(myId: String, partnerId: String) {
        switch classifyPair(myId: myId, partnerId: partnerId) {
        case "aligned": sameCount += 1
        case "close": closeCount += 1
        default: talkCount += 1
        }
    }

    private func submitSample() {
        guard !sampleChoice.isEmpty, !sampleReason.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        let partnerId = sampleChoices.first(where: { $0.id != sampleChoice })?.id ?? sampleChoice
        recordPair(myId: sampleChoice, partnerId: partnerId)
        if sampleIndex >= 2 {
            sampleMine = sampleChoices.first(where: { $0.id == sampleChoice })?.label ?? ""
            samplePartner = sampleChoices.first(where: { $0.id == partnerId })?.label ?? ""
            screen = .sampleResult
            return
        }
        sampleIndex += 1
        startSample()
    }

    private func tapUnlock() {
        if hearts < 10 {
            shopOpen = true
        } else {
            hearts -= 10
            shopOpen = false
            screen = .certificate
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
                screen = .signup
                pendingGate = "home"
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
        pendingGate = "home"
        error = ""
        busy = false
        screen = .signup
    }

    private func resumePending(_ gate: String = "") {
        let pending = gate.isEmpty ? pendingGate : gate
        pendingGate = ""
        signedIn = true
        switch pending {
        case "invite", "connect":
            screen = .invite
            pairCode = "VIRT UAL1"
        case "account":
            screen = .account
        default:
            screen = .packList
        }
    }

    private func requestLink(_ value: String) {
        email = value
        busy = false
        resumePending(pendingGate.isEmpty ? "home" : pendingGate)
    }

    func openMagicLink(_ url: URL) {
        guard let token = LoveMeAuthApi.extractMagicLinkToken(from: url) else { return }
        Task {
            do {
                let session = try await client.consumeMagicLink(token: token)
                if let user = session["user"] as? [String: Any] {
                    email = user["email"] as? String ?? email
                }
                resumePending()
            } catch {
                self.error = "로그인 링크가 유효하지 않아요."
                screen = .signup
            }
        }
    }

    private func requestBind(_ value: String) {
        email = value
        resumePending()
    }

    private func ackNotice() {
        Task { _ = try? await client.acknowledgeNotice() }
        resumePending()
    }

    private func logout() {
        signedIn = false
        acceptedPartner = false
        email = ""
        hearts = 0
        pendingGate = "home"
        screen = .signup
    }
}
