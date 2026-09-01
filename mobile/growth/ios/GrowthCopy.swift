import Foundation

/// Exact Korean copy for the recommend and gift screens. Do not paraphrase.
/// Mirrors `src/growth.js`; a drift test compares these literals against it.
enum RecommendCopy {
    static let title = "친구에게 추천하기"
    static let body = "링크를 보내면 친구도 여기서 시작할 수 있어요."
    static let codeLabel = "내 추천 코드"
    static let countsLabel = "함께 시작한 친구"
    static let rewardRule = "추천한 친구가 결혼 팩을 열면 선물을 드려요."
}

enum GiftCopy {
    static let title = "결혼 팩 선물하기"
    static let body = "링크를 받은 사람이 열면, 그 사람의 팩이 열려요. 내 팩은 그대로예요."
    static let cta = "선물 링크 만들기"
    static let sentTitle = "보낸 선물"
    static let statusWaiting = "아직 받지 않았어요"
    static let statusUsed = "받았어요"
    static let statusExpired = "기한이 지났어요"
    static let statusRevoked = "취소했어요"
    static let revoke = "링크 취소하기"
    static let creditLabel = "보낼 수 있는 선물"
    static let creditRestored = "취소한 선물은 다시 보낼 수 있어요. 결제는 한 번만 해요."
    static let freeCta = "선물 링크 다시 만들기"
    static let arrivedTitle = "선물이 도착했어요."
    static let arrivedBody = "결혼 팩을 열 수 있는 선물이에요."
    static let accept = "선물 받기"
    static let loginRequired = "선물을 받으려면 먼저 로그인해 주세요."
}

enum GiftErrorCopy {
    static let used = "이미 사용된 선물이에요."
    static let expired = "선물의 기한이 지났어요. 보낸 사람에게 새 링크를 부탁해 주세요."
    static let revoked = "취소된 선물이에요."
    static let selfGift = "내가 보낸 선물은 내가 받을 수 없어요."
    static let alreadyEntitled = "이미 팩이 열려 있어요. 이 선물은 다른 사람에게 보낼 수 있어요."

    /// An unfamiliar failure still gets a line rather than a blank screen.
    static func line(for error: String) -> String {
        switch error {
        case "expired": return expired
        case "revoked": return revoked
        case "self": return selfGift
        case "already-entitled": return alreadyEntitled
        default: return used
        }
    }
}

/// The share row is the invite row on every surface.
enum GrowthShareCopy {
    static let copyLink = "링크 복사"
    static let instagram = "인스타그램"
    static let kakao = "카카오톡"
    static let copied = "링크를 복사했어요."
    static let copyFailed = "복사하지 못했어요. 아래 링크를 길게 눌러 복사해 주세요."
}

enum GrowthAPI {
    static let referralPath = "/api/referral"
    static let claimPath = "/api/referral/claim"
    static let createGiftPath = "/api/gift"
    static let sentGiftsPath = "/api/gift/sent"
    static let revokeGiftPath = "/api/gift/revoke"
    static let redeemGiftPath = "/api/gift/redeem"
    static let previewGiftPath = "/api/gift/preview"
}
