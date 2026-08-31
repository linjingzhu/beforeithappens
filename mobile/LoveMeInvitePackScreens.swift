import SwiftUI
import UserNotifications

enum LoveMeFont {
    static func title(_ size: CGFloat, weight: Font.Weight = .semibold) -> Font {
        .custom(weight == .regular ? "MaruBuri-Regular" : "MaruBuri-SemiBold", size: size)
    }
    static func body(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .custom(weight == .regular ? "Pretendard-Regular" : "Pretendard-SemiBold", size: size)
    }
}

enum LoveMeTheme {
    static let babyPink = Color(red: 0.965, green: 0.784, blue: 0.847)
    static let skyBlue = Color(red: 0.718, green: 0.851, blue: 0.941)
    static let charcoal = Color(red: 0.227, green: 0.200, blue: 0.220)
    static let muted = Color(red: 0.478, green: 0.447, blue: 0.471)
    static var screenGradient: LinearGradient {
        LinearGradient(colors: [babyPink, skyBlue], startPoint: .top, endPoint: .bottom)
    }
    static var buttonGradient: LinearGradient {
        LinearGradient(colors: [babyPink, skyBlue], startPoint: .leading, endPoint: .trailing)
    }
}

enum LoveMeInvitePackCopy {
    static let packTitle = "질문집"
    static let packSoon = "곧 열려요"
    static let account = "계정"
    static let login = "로그인"
    static let inviteCta = "연인을 초대하세요"
    static let logout = "로그아웃"
    static let rows: [(id: String, label: String, open: Bool, mark: String)] = [
        ("dating", "연애", false, "♡"),
        ("marriage", "결혼", true, "○"),
        ("home-mgmt", "가정 경영", false, "⌂"),
        ("pregnancy", "임신", false, "+"),
        ("birth", "출산", false, "✦"),
        ("parenting", "육아", false, "✶")
    ]
    static let homeMgmtQuestion = "가사와 시간은 어떻게 나누고 싶나요?"
    static let sampleTitles = [
        "예상하지 못한 여유 자금이 생기면 어떻게 하고 싶나요?",
        "명절 당일 양가 일정이 겹친다면 어떤 기본 원칙을 선호하나요?",
        "우리에게 집은 어떤 의미에 가장 가까울까요?"
    ]
    static let backToList = "목록으로"
    static let reason = "왜 그 선택인지 한 줄로 적어주세요."
    static let next = "다음"
    static let example = "예시입니다"
    static let together = "함께 풀어보기"
    static let aligned = "같음"
    static let close = "가까움"
    static let discuss = "이야기해요"
    static let unlockTitle = "두 사람 답을 비교했어요."
    static let unlockBody = "나머지 문항을 이어서 열 수 있어요."
    static let unlockCta = "열기"
    static let needHearts = "♡ 하트 10이 필요해요."
    static let shopTitle = "상점"
    static let shopCta = "29,000원에 하트 12"
    static let later = "나중에"
    static let partnerWait = "상대가 열면 이어집니다."
    static let certificateBody = "두 사람이 이 질문집을 마쳤어요"
    static let homeCta = "홈으로"
    static let debugDone = "수료"
    static let stampHeart = "♡"
    static let debug = "[debug]"
    static let inviteHeadline = "링크 보내기"
    static let inviteSub = "초대를 보내면 상대도 같은 팩을 받아요."
    static let copyLink = "링크 복사"
    static let instagram = "인스타그램"
    static let kakao = "카카오톡"
    static let appCode = "앱에서 코드로 연결"
    static let myCode = "내 코드"
    static let copyCode = "복사"
    static let partnerCard = "상대 코드를 알고 있다면"
    static let partnerPlaceholder = "상대 코드 입력"
    static let connect = "연결하기"
}

extension View {
    func loveMeSafeChrome(_ padding: CGFloat = 28, alignment: Alignment = .topLeading) -> some View {
        GeometryReader { proxy in
            self
                .padding(padding)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: alignment)
                .padding(.top, proxy.safeAreaInsets.top)
                .padding(.bottom, proxy.safeAreaInsets.bottom)
                .background(LoveMeTheme.screenGradient)
        }
        .ignoresSafeArea()
        .background(LoveMeTheme.screenGradient.ignoresSafeArea())
    }
}

struct LoveMeDebugLine: View {
    var extra: String = ""
    var body: some View {
        Text(extra.isEmpty ? LoveMeInvitePackCopy.debug : "\(LoveMeInvitePackCopy.debug) \(extra)")
            .font(.caption)
            .foregroundStyle(LoveMeTheme.muted)
    }
}

struct LoveMeHeartsChip: View {
    var balance: Int
    var body: some View {
        Text("♡ \(balance)")
            .foregroundStyle(LoveMeTheme.charcoal)
            .fontWeight(.semibold)
    }
}

struct LoveMeGradientButton: View {
    var title: String
    var action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(LoveMeFont.body(16, weight: .semibold))
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity, minHeight: 52)
                .background(LoveMeTheme.buttonGradient)
                .clipShape(RoundedRectangle(cornerRadius: 16))
        }
        .buttonStyle(.plain)
    }
}

struct LoveMePackListScreen: View {
    var hearts: Int = 0
    var showHearts: Bool = true
    var onOpenMarriage: () -> Void = {}
    var onOpenComingSoon: (String) -> Void = { _ in }
    var onOpenAccount: () -> Void = {}

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            if showHearts { LoveMeHeartsChip(balance: hearts).frame(maxWidth: .infinity) }
            Text(LoveMeInvitePackCopy.packTitle)
                .font(LoveMeFont.title(34))
                .foregroundStyle(LoveMeTheme.charcoal)
                .padding(.vertical, 16)
            ForEach(LoveMeInvitePackCopy.rows, id: \.id) { row in
                Button(action: { row.open ? onOpenMarriage() : onOpenComingSoon(row.id) }) {
                    HStack {
                        Text(row.mark)
                        Text(row.label).font(LoveMeFont.title(17))
                        Spacer()
                        Text(row.open ? "›" : LoveMeInvitePackCopy.packSoon)
                            .font(LoveMeFont.body(14))
                            .foregroundStyle(LoveMeTheme.muted)
                    }
                    .foregroundStyle(LoveMeTheme.charcoal)
                    .padding(.vertical, 16)
                }
                .buttonStyle(.plain)
                Divider()
            }
            Spacer()
            Button(LoveMeInvitePackCopy.account, action: onOpenAccount)
                .foregroundStyle(LoveMeTheme.charcoal)
                .frame(maxWidth: .infinity)
            LoveMeDebugLine()
        }
        .loveMeSafeChrome()
    }
}

struct LoveMeAccountScreen: View {
    var email: String = ""
    var partnerEmail: String = ""
    var acceptedPartner: Bool = false
    var guest: Bool = false
    var onBack: () -> Void = {}
    var onLogout: () -> Void = {}
    var onLogin: () -> Void = {}
    var onInvite: () -> Void = {}

    var body: some View {
        VStack(spacing: 16) {
            if guest {
                Text(LoveMeInvitePackCopy.account).font(.title2.weight(.bold))
                LoveMeGradientButton(title: LoveMeInvitePackCopy.login, action: onLogin)
            } else {
                ZStack {
                    Text(LoveMeInvitePackCopy.account).font(.title2.weight(.bold))
                    HStack { Button("‹", action: onBack).font(.title).foregroundStyle(LoveMeTheme.charcoal); Spacer() }
                }
                if acceptedPartner {
                    Text(partnerEmail.isEmpty ? email : partnerEmail)
                } else {
                    Text(email)
                    LoveMeGradientButton(title: LoveMeInvitePackCopy.inviteCta, action: onInvite)
                }
                Spacer()
                Button(LoveMeInvitePackCopy.logout, action: onLogout)
                    .foregroundStyle(LoveMeTheme.charcoal)
            }
            LoveMeDebugLine()
        }
        .foregroundStyle(LoveMeTheme.charcoal)
        .loveMeSafeChrome(24)
    }
}

struct LoveMeComingSoonScreen: View {
    var title: String = "가정 경영"
    var question: String = ""
    var onBackToList: () -> Void = {}

    var body: some View {
        VStack(spacing: 16) {
            Text(LoveMeInvitePackCopy.packSoon).foregroundStyle(LoveMeTheme.muted)
            Text(title).font(.largeTitle.weight(.bold))
            if !question.isEmpty { Text(question).multilineTextAlignment(.center) }
            Spacer()
            Button(LoveMeInvitePackCopy.backToList, action: onBackToList)
            LoveMeDebugLine()
        }
        .foregroundStyle(LoveMeTheme.charcoal)
        .loveMeSafeChrome()
    }
}

struct LoveMeSampleQuestionScreen: View {
    var title: String
    var choices: [(id: String, label: String)]
    var choiceId: String
    var reason: String
    var progressLabel: String = "결혼 1/3"
    var onChoose: (String) -> Void
    var onReason: (String) -> Void
    var onSubmit: () -> Void
    var onBack: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Button("‹", action: onBack).font(LoveMeFont.body(28)).foregroundStyle(LoveMeTheme.charcoal)
                Text(progressLabel).font(LoveMeFont.body(15))
                Spacer()
            }
            Text(title).font(LoveMeFont.title(22))
            ForEach(choices, id: \.id) { choice in
                Button(action: { onChoose(choice.id) }) {
                    HStack(alignment: .top, spacing: 12) {
                        Text(choiceId == choice.id ? "●" : "○")
                            .font(LoveMeFont.body(16))
                            .foregroundStyle(LoveMeTheme.muted)
                        Text(choice.label)
                            .font(LoveMeFont.body(15))
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .padding()
                    .background(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(choiceId == choice.id ? LoveMeTheme.charcoal : .clear, lineWidth: 1.5))
                }
                .buttonStyle(.plain)
            }
            HStack(spacing: 8) {
                Text("♡").foregroundStyle(LoveMeTheme.babyPink)
                Text(LoveMeInvitePackCopy.reason).font(LoveMeFont.body(14)).foregroundStyle(LoveMeTheme.muted)
            }
            TextField(LoveMeInvitePackCopy.reason, text: Binding(get: { reason }, set: onReason))
                .font(LoveMeFont.body(16))
                .textFieldStyle(.roundedBorder)
            LoveMeGradientButton(title: LoveMeInvitePackCopy.next, action: onSubmit)
            LoveMeDebugLine()
        }
        .foregroundStyle(LoveMeTheme.charcoal)
        .loveMeSafeChrome()
    }
}

struct LoveMeSampleResultScreen: View {
    var question: String
    var mine: String
    var partner: String
    var onTogether: () -> Void

    var body: some View {
        VStack(spacing: 12) {
            Text(LoveMeInvitePackCopy.example).foregroundStyle(LoveMeTheme.muted)
            HStack {
                Text(LoveMeInvitePackCopy.aligned)
                Text(LoveMeInvitePackCopy.close)
                Text(LoveMeInvitePackCopy.discuss)
            }
            Text(question).multilineTextAlignment(.center)
            VStack(alignment: .leading) { Text("나"); Text(mine) }.frame(maxWidth: .infinity, alignment: .leading).padding().background(.white.opacity(0.72)).clipShape(RoundedRectangle(cornerRadius: 16))
            VStack(alignment: .leading) { Text("상대"); Text(partner) }.frame(maxWidth: .infinity, alignment: .leading).padding().background(.white.opacity(0.72)).clipShape(RoundedRectangle(cornerRadius: 16))
            LoveMeGradientButton(title: LoveMeInvitePackCopy.together, action: onTogether)
            LoveMeDebugLine()
        }
        .foregroundStyle(LoveMeTheme.charcoal)
        .loveMeSafeChrome()
    }
}

struct LoveMeUnlockScreen: View {
    var hearts: Int = 0
    var shopOpen: Bool = false
    var onUnlock: () -> Void = {}
    var onBuy: () -> Void = {}
    var onLater: () -> Void = {}

    var body: some View {
        VStack(spacing: 14) {
            LoveMeHeartsChip(balance: hearts)
            Text(LoveMeInvitePackCopy.unlockTitle).font(.title.weight(.bold)).multilineTextAlignment(.center)
            Text(LoveMeInvitePackCopy.unlockBody).multilineTextAlignment(.center)
            LoveMeGradientButton(title: LoveMeInvitePackCopy.unlockCta, action: onUnlock)
            if hearts < 10 { Text(LoveMeInvitePackCopy.needHearts).foregroundStyle(LoveMeTheme.muted) }
            if shopOpen {
                VStack(spacing: 12) {
                    LoveMeHeartsChip(balance: hearts)
                    Text(LoveMeInvitePackCopy.shopTitle).font(.title.weight(.bold))
                    LoveMeGradientButton(title: LoveMeInvitePackCopy.shopCta, action: onBuy)
                    Button(LoveMeInvitePackCopy.later, action: onLater)
                }
                .padding()
                .background(.white.opacity(0.72))
                .clipShape(RoundedRectangle(cornerRadius: 20))
            }
            LoveMeDebugLine()
        }
        .foregroundStyle(LoveMeTheme.charcoal)
        .loveMeSafeChrome()
    }
}

struct LoveMePartnerWaitScreen: View {
    var body: some View {
        VStack {
            Spacer()
            Text(LoveMeInvitePackCopy.partnerWait)
                .font(.title3.weight(.medium))
                .foregroundStyle(LoveMeTheme.charcoal)
            Spacer()
            LoveMeDebugLine()
        }
        .loveMeSafeChrome()
    }
}

struct LoveMeCertificateScreen: View {
    var packLabel: String = "결혼"
    var sameCount: Int = 0
    var closeCount: Int = 0
    var talkCount: Int = 0
    var onHome: () -> Void = {}
    var body: some View {
        VStack(spacing: 16) {
            Spacer()
            Text(LoveMeInvitePackCopy.stampHeart)
                .font(.system(size: 64))
            Text(packLabel)
                .font(LoveMeFont.title(28))
            Text(LoveMeInvitePackCopy.certificateBody)
                .font(LoveMeFont.body(16))
                .multilineTextAlignment(.center)
            HStack(spacing: 8) {
                Text("\(LoveMeInvitePackCopy.aligned) \(sameCount)")
                Text("\(LoveMeInvitePackCopy.close) \(closeCount)")
                Text("\(LoveMeInvitePackCopy.discuss) \(talkCount)")
            }
            .font(LoveMeFont.body(13, weight: .semibold))
            Spacer()
            LoveMeGradientButton(title: LoveMeInvitePackCopy.homeCta, action: onHome)
            LoveMeDebugLine(extra: LoveMeInvitePackCopy.debugDone)
        }
        .foregroundStyle(LoveMeTheme.charcoal)
        .loveMeSafeChrome()
    }
}

struct LoveMeInviteScreen: View {
    var pairCodeDisplay: String = ""
    var onBack: () -> Void = {}
    var onCopyLink: () -> Void = {}
    var onShareInstagram: () -> Void = {}
    var onShareKakao: () -> Void = {}
    var onCopyCode: () -> Void = {}
    var onConnect: (String) -> Void = { _ in }
    @State private var partnerCode = ""

    var body: some View {
        VStack(spacing: 12) {
            HStack { Button("‹", action: onBack).font(.title); Text(LoveMeInvitePackCopy.inviteHeadline).font(.title2.weight(.bold)); Spacer() }
            Text(LoveMeInvitePackCopy.inviteSub).foregroundStyle(LoveMeTheme.muted)
            LoveMeGradientButton(title: LoveMeInvitePackCopy.copyLink, action: onCopyLink)
            Button(LoveMeInvitePackCopy.instagram, action: onShareInstagram)
            Button(LoveMeInvitePackCopy.kakao, action: onShareKakao)
            Text(LoveMeInvitePackCopy.myCode)
            Text(pairCodeDisplay)
            Button(LoveMeInvitePackCopy.copyCode, action: onCopyCode)
            TextField(LoveMeInvitePackCopy.partnerPlaceholder, text: $partnerCode)
                .textFieldStyle(.roundedBorder)
            LoveMeGradientButton(title: LoveMeInvitePackCopy.connect, action: { onConnect(partnerCode) })
            LoveMeDebugLine()
        }
        .foregroundStyle(LoveMeTheme.charcoal)
        .loveMeSafeChrome(24)
    }
}

func loveMeComingSoonQuestion(id: String) -> String {
    id == "home-mgmt" ? LoveMeInvitePackCopy.homeMgmtQuestion : ""
}
