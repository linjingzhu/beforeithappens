import SwiftUI

enum LoveMeInvitePackCopy {
    static let packTitle = "질문집"
    static let packSubtitle = "결혼만 지금 열려 있어요."
    static let packSoon = "곧 열려요"
    static let account = "계정"
    static let packDetailTitle = "결혼"
    static let packDetailSub = "두 사람의 결혼 준비, 한곳에."
    static let samplesTitle = "예시 질문"
    static let samples = [
        "예상하지 못한 여유 자금이 생기면 어떻게 하고 싶나요?",
        "명절 당일 양가 일정이 겹친다면 어떤 기본 원칙을 선호하나요?",
        "우리에게 집은 어떤 의미에 가장 가까울까요?"
    ]
    static let caption1 = "여기서 답하지 않아요."
    static let caption2 = "파트너가 연결된 다음 질문이 열려요."
    static let packDetailCta = "링크 보내기"
    static let email = "이메일"
    static let logout = "로그아웃"
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
    static let soonBadge = "곧 열려요"
    static let soonEyebrow = "LoveMe coming-soon pack"
    static let experience = "임시 체험"
    static let sampleQuestion = "가사와 시간은 어떻게 나누고 싶나요?"
    static let sampleCaption = "예시입니다. 여기서 답하거나 팔지 않아요."
    static let tasteCta = "결과 맛보기"
    static let backToList = "목록으로"
    static let tasteResultTitle = "결과 맛보기"
    static let tasteLabel = "가까움"
    static let tasteAligned = "같음"
    static let tasteClose = "가까움"
    static let tasteDiscuss = "이야기해요"
    static let tasteMe = "나"
    static let tastePartner = "상대"
    static let tasteMeAnswer = "평일은 반반, 주말은 그때 그때요."
    static let tastePartnerAnswer = "한 사람이 메인으로 하고 나머지는 나눠요."
    static let tasteCaption = "진짜 비교는 열린 팩에서 둘이 낸 다음입니다."
    static let tasteExample = "예시입니다."
}

struct LoveMePackListScreen: View {
    var onOpenMarriage: () -> Void = {}
    var onOpenComingSoon: (String) -> Void = { _ in }
    var onOpenAccount: () -> Void = {}

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("LoveMe")
                    .font(.system(size: 22, weight: .medium, design: .serif))
                Spacer()
                Button(LoveMeInvitePackCopy.account, action: onOpenAccount)
                    .foregroundStyle(Color(red: 0.17, green: 0.15, blue: 0.13))
            }
            Text(LoveMeInvitePackCopy.packTitle)
                .font(.largeTitle.weight(.semibold))
            Text(LoveMeInvitePackCopy.packSubtitle)
                .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
            Button(action: onOpenMarriage) {
                HStack {
                    Text("결혼")
                    Spacer()
                    Text("›")
                }
                .padding(.horizontal, 18)
                .frame(minHeight: 56)
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 16))
            }
            .buttonStyle(.plain)
            ForEach([("home-mgmt", "가정 경영"), ("pregnancy", "임신"), ("birth", "출산"), ("parenting", "육아")], id: \.0) { pack in
                Button(action: { onOpenComingSoon(pack.0) }) {
                    HStack {
                        Text(pack.1)
                        Spacer()
                        Text(LoveMeInvitePackCopy.packSoon)
                            .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
                    }
                    .padding(.horizontal, 18)
                    .frame(minHeight: 56)
                    .background(Color.white)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .buttonStyle(.plain)
            }
            Spacer()
        }
        .padding(28)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(red: 0.99, green: 0.98, blue: 0.97))
    }
}

struct LoveMePackDetailScreen: View {
    var onBack: () -> Void = {}
    var onSendLink: () -> Void = {}

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Button("‹", action: onBack)
                .font(.title)
                .foregroundStyle(Color(red: 0.17, green: 0.15, blue: 0.13))
            Text(LoveMeInvitePackCopy.packDetailTitle)
                .font(.system(size: 40, weight: .medium, design: .serif))
            Text(LoveMeInvitePackCopy.packDetailSub)
                .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
            Text(LoveMeInvitePackCopy.samplesTitle)
                .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
                .padding(.top, 12)
            ForEach(Array(LoveMeInvitePackCopy.samples.enumerated()), id: \.offset) { index, sample in
                HStack(alignment: .center, spacing: 14) {
                    Text("\(index + 1)")
                        .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
                    Text(sample)
                }
                .padding(16)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 16))
            }
            HStack(alignment: .top, spacing: 10) {
                Image(systemName: "lock")
                    .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
                VStack(alignment: .leading, spacing: 2) {
                    Text(LoveMeInvitePackCopy.caption1)
                    Text(LoveMeInvitePackCopy.caption2)
                }
                .font(.footnote)
                .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
            }
            .padding(.top, 6)
            Spacer()
            Button(action: onSendLink) {
                Label(LoveMeInvitePackCopy.packDetailCta, systemImage: "link")
            }
            .buttonStyle(LoveMePrimaryButtonStyle())
        }
        .padding(28)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(red: 0.99, green: 0.98, blue: 0.97))
    }
}

struct LoveMeAccountScreen: View {
    var email: String = ""
    var onBack: () -> Void = {}
    var onLogout: () -> Void = {}

    var body: some View {
        VStack(spacing: 16) {
            ZStack {
                Text(LoveMeInvitePackCopy.account)
                    .font(.title2.weight(.bold))
                HStack {
                    Button("‹", action: onBack)
                        .font(.title)
                        .foregroundStyle(Color(red: 0.17, green: 0.15, blue: 0.13))
                    Spacer()
                }
            }
            HStack {
                Text(LoveMeInvitePackCopy.email)
                Spacer()
                Text(email)
            }
            .padding(.horizontal, 18)
            .frame(minHeight: 56)
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            Spacer()
            Button(LoveMeInvitePackCopy.logout, action: onLogout)
                .font(.body.weight(.semibold))
                .foregroundStyle(Color(red: 0.77, green: 0.36, blue: 0.31))
                .frame(maxWidth: .infinity, minHeight: 52)
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color(red: 0.77, green: 0.36, blue: 0.31)))
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(red: 0.99, green: 0.98, blue: 0.97))
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
        VStack(spacing: 14) {
            ZStack {
                Text(LoveMeInvitePackCopy.inviteHeadline)
                    .font(.title2.weight(.bold))
                HStack {
                    Button("‹", action: onBack)
                        .font(.title)
                        .foregroundStyle(Color(red: 0.17, green: 0.15, blue: 0.13))
                    Spacer()
                }
            }
            Text(LoveMeInvitePackCopy.inviteSub)
                .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
                .multilineTextAlignment(.center)
            VStack(spacing: 10) {
                Button(LoveMeInvitePackCopy.copyLink, action: onCopyLink)
                Button(LoveMeInvitePackCopy.instagram, action: onShareInstagram)
                Button(LoveMeInvitePackCopy.kakao, action: onShareKakao)
            }
            .padding(14)
            .frame(maxWidth: .infinity)
            .background(Color(red: 0.95, green: 0.92, blue: 0.89))
            .clipShape(RoundedRectangle(cornerRadius: 20))
            VStack(alignment: .leading, spacing: 10) {
                Text(LoveMeInvitePackCopy.appCode)
                    .font(.caption)
                    .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
                HStack {
                    Text(LoveMeInvitePackCopy.myCode)
                    Text(pairCodeDisplay)
                        .font(.body.weight(.semibold))
                    Spacer()
                    Button(LoveMeInvitePackCopy.copyCode, action: onCopyCode)
                }
                Text(LoveMeInvitePackCopy.partnerCard)
                    .font(.caption)
                    .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
                HStack {
                    TextField(LoveMeInvitePackCopy.partnerPlaceholder, text: $partnerCode)
                        .textInputAutocapitalization(.characters)
                        .padding(.horizontal, 14)
                        .frame(minHeight: 48)
                        .background(Color.white)
                    Button(LoveMeInvitePackCopy.connect) { onConnect(partnerCode) }
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(red: 0.95, green: 0.92, blue: 0.89))
            .clipShape(RoundedRectangle(cornerRadius: 20))
            Spacer()
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(red: 0.99, green: 0.98, blue: 0.97))
    }
}

struct LoveMeComingSoonScreen: View {
    var title: String = "가정 경영"
    var onTasteResult: () -> Void = {}
    var onBackToList: () -> Void = {}

    var body: some View {
        VStack(spacing: 12) {
            Text(LoveMeInvitePackCopy.soonBadge)
                .font(.caption.weight(.bold))
                .foregroundStyle(.white)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color(red: 0.77, green: 0.36, blue: 0.31))
                .clipShape(Capsule())
            Text(LoveMeInvitePackCopy.soonEyebrow)
                .font(.footnote)
                .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
            Text(title)
                .font(.system(size: 36, weight: .semibold, design: .serif))
            Text("⌂♡")
                .font(.title)
                .padding(.vertical, 8)
            VStack(alignment: .leading, spacing: 12) {
                Text(LoveMeInvitePackCopy.experience)
                    .font(.subheadline.weight(.bold))
                VStack(alignment: .leading, spacing: 8) {
                    Text("Q")
                        .font(.caption.weight(.bold))
                    Text(LoveMeInvitePackCopy.sampleQuestion)
                    Text(LoveMeInvitePackCopy.sampleCaption)
                        .font(.footnote)
                        .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color(red: 0.96, green: 0.92, blue: 0.89))
                .clipShape(RoundedRectangle(cornerRadius: 14))
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: 20))
            Spacer()
            Button(LoveMeInvitePackCopy.tasteCta, action: onTasteResult)
                .buttonStyle(LoveMePrimaryButtonStyle())
            Button(LoveMeInvitePackCopy.backToList, action: onBackToList)
                .foregroundStyle(Color(red: 0.17, green: 0.15, blue: 0.13))
        }
        .padding(28)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(red: 0.99, green: 0.98, blue: 0.97))
    }
}

struct LoveMeTasteResultScreen: View {
    var onBackToList: () -> Void = {}

    var body: some View {
        VStack(spacing: 12) {
            Text(LoveMeInvitePackCopy.tasteResultTitle)
                .font(.system(size: 32, weight: .bold))
            Text(LoveMeInvitePackCopy.tasteLabel)
                .font(.caption.weight(.bold))
                .padding(.horizontal, 14)
                .padding(.vertical, 6)
                .background(Color(red: 0.96, green: 0.92, blue: 0.89))
                .clipShape(Capsule())
            Text(LoveMeInvitePackCopy.sampleQuestion)
                .multilineTextAlignment(.center)
                .padding(.top, 6)
            VStack(alignment: .leading, spacing: 8) {
                Text(LoveMeInvitePackCopy.tasteMe)
                    .font(.caption.weight(.bold))
                Text(LoveMeInvitePackCopy.tasteMeAnswer)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(red: 0.96, green: 0.92, blue: 0.89))
            .clipShape(RoundedRectangle(cornerRadius: 16))
            VStack(alignment: .leading, spacing: 8) {
                Text(LoveMeInvitePackCopy.tastePartner)
                    .font(.caption.weight(.bold))
                Text(LoveMeInvitePackCopy.tastePartnerAnswer)
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(red: 0.96, green: 0.92, blue: 0.89))
            .clipShape(RoundedRectangle(cornerRadius: 16))
            Text(LoveMeInvitePackCopy.tasteCaption)
                .font(.footnote)
                .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
                .padding(.top, 8)
            Text(LoveMeInvitePackCopy.tasteExample)
                .font(.footnote)
                .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
            Spacer()
            Button(LoveMeInvitePackCopy.backToList, action: onBackToList)
                .buttonStyle(LoveMePrimaryButtonStyle())
        }
        .padding(28)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(red: 0.99, green: 0.98, blue: 0.97))
    }
}
