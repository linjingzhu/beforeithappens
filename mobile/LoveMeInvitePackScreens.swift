import SwiftUI

enum LoveMeInvitePackCopy {
    static let packTitle = "질문집"
    static let packSubtitle = "결혼만 지금 열려 있어요."
    static let packSoon = "곧 열려요"
    static let inviteHeadline = "이 답이 비교되려면 파트너가 필요해요."
    static let inviteSub = "초대를 보내면 상대도 같은 질문을 받아요."
    static let copyLink = "링크 복사"
    static let instagram = "인스타그램"
    static let kakao = "카카오톡"
    static let myCode = "내 코드"
    static let copyCode = "복사"
    static let partnerCard = "상대 코드를 알고 있다면"
    static let partnerPlaceholder = "상대 코드 입력"
    static let connect = "연결하기"
}

struct LoveMePackListScreen: View {
    var onOpenMarriage: () -> Void = {}

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("LoveMe")
                .font(.system(size: 22, weight: .medium, design: .serif))
                .foregroundStyle(Color(red: 0.93, green: 0.47, blue: 0.37))
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
            }
            .buttonStyle(.plain)
            ForEach(["가정 경영", "임신", "출산", "육아"], id: \.self) { label in
                HStack {
                    Text(label)
                    Spacer()
                    Text(LoveMeInvitePackCopy.packSoon)
                        .font(.caption.weight(.bold))
                        .foregroundStyle(Color(red: 0.93, green: 0.47, blue: 0.37))
                }
                .padding(.vertical, 8)
            }
            Spacer()
        }
        .padding(28)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color(red: 0.99, green: 0.98, blue: 0.97))
    }
}

struct LoveMeInviteScreen: View {
    var pairCodeDisplay: String = ""
    var onCopyLink: () -> Void = {}
    var onShareInstagram: () -> Void = {}
    var onShareKakao: () -> Void = {}
    var onCopyCode: () -> Void = {}
    var onConnect: (String) -> Void = { _ in }
    @State private var partnerCode = ""

    var body: some View {
        VStack(spacing: 14) {
            Text("LoveMe")
                .font(.system(size: 22, weight: .medium, design: .serif))
                .foregroundStyle(Color(red: 0.93, green: 0.47, blue: 0.37))
            Text(LoveMeInvitePackCopy.inviteHeadline)
                .font(.title2.weight(.semibold))
                .multilineTextAlignment(.center)
            Text(LoveMeInvitePackCopy.inviteSub)
                .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
                .multilineTextAlignment(.center)
            HStack {
                Button(LoveMeInvitePackCopy.copyLink, action: onCopyLink)
                Button(LoveMeInvitePackCopy.instagram, action: onShareInstagram)
                Button(LoveMeInvitePackCopy.kakao, action: onShareKakao)
            }
            Text(LoveMeInvitePackCopy.myCode)
                .font(.caption)
                .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
            Text(pairCodeDisplay)
                .font(.title.weight(.bold))
            Button(LoveMeInvitePackCopy.copyCode, action: onCopyCode)
            VStack(alignment: .leading) {
                Text(LoveMeInvitePackCopy.partnerCard)
                TextField(LoveMeInvitePackCopy.partnerPlaceholder, text: $partnerCode)
                    .textInputAutocapitalization(.characters)
                    .padding(.horizontal, 14)
                    .frame(minHeight: 48)
                    .background(Color.white)
            }
            .padding(16)
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            Button(LoveMeInvitePackCopy.connect) { onConnect(partnerCode) }
                .buttonStyle(LoveMePrimaryButtonStyle())
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(red: 0.99, green: 0.98, blue: 0.97))
    }
}

enum LoveMePreviewDraft {
    static let key = "loveme.preview-q1.v1"

    static func loadChoiceId() -> String {
        let raw = UserDefaults.standard.string(forKey: key) ?? ""
        if let data = raw.data(using: .utf8),
           let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
           let choiceId = obj["choiceId"] as? String {
            return choiceId
        }
        return raw.hasPrefix("home-") ? raw : ""
    }

    static func save(choiceId: String, open: Bool, keepAnswer: Bool, saved: Bool) {
        let payload = "{\"choiceId\":\"\(choiceId)\",\"open\":\(open),\"keepAnswer\":\(keepAnswer),\"saved\":\(saved)}"
        UserDefaults.standard.set(payload, forKey: key)
    }

    static var wantsLoginGate: Bool {
        let raw = UserDefaults.standard.string(forKey: key) ?? ""
        return raw.contains("\"keepAnswer\":true")
    }

    static var isInFlight: Bool {
        let raw = UserDefaults.standard.string(forKey: key) ?? ""
        return raw.contains("\"open\":true") || raw.contains("\"keepAnswer\":true") || (raw.contains("home-") && !raw.contains("\"saved\":true"))
    }
}
