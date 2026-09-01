import Foundation

/// Exact Korean copy for the S4 invite-waiting pack. Do not paraphrase.
enum S4Copy {
    static let title = "파트너 초대"
    static let share = "링크를 보내 파트너를 초대하세요."
    static let copyLink = "링크 복사"
    static let instagram = "인스타그램"
    static let kakao = "카카오톡"
    static let copied = "링크를 복사했어요."
    static let deviceRule = "같은 폰에서 두 계정을 동시에 쓸 수는 없어요."
    static let emailCheck = "상대 이메일이 맞는지 다시 확인해 주세요."
    static let editResend = "이메일 고치고 링크 다시 만들기"
    static let send = "초대 링크 만들기"
    static let logout = "로그아웃"
    static let logoutHandoff = "로그아웃 후 이 기기를 넘겨주세요."
    static let expired = "초대가 만료됐어요. 구매자에게 새 링크를 부탁해 주세요."
    static let mismatch = "이 초대는 다른 이메일로 만들어졌어요. 초대받은 메일로 로그인해야 해요."
}

enum SameSessionCopy {
    static let message = "이 기기에 다른 계정으로 로그인되어 있어요."
    static let cta = "로그아웃하고 넘기기"
    static let logoutHandoff = "로그아웃 후 이 기기를 넘겨주세요."
}

enum InviteAPI {
    static let sendPath = "/api/invite"
    static let previewPath = "/api/invite/preview"
    static let acceptPath = "/api/invite/accept"
    static let forceLogoutPath = "/api/auth/force-logout"
}
