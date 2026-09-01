package com.beforeithappens.growth

/**
 * Exact Korean copy for the recommend and gift screens. Do not paraphrase.
 * Mirrors `src/growth.js`; a drift test compares these literals against it.
 */
object RecommendCopy {
    const val TITLE = "친구에게 추천하기"
    const val BODY = "링크를 보내면 친구도 여기서 시작할 수 있어요."
    const val CODE_LABEL = "내 추천 코드"
    const val COUNTS_LABEL = "함께 시작한 친구"
    const val REWARD_RULE = "추천한 친구가 결혼 팩을 열면 선물을 드려요."
}

object GiftCopy {
    const val TITLE = "결혼 팩 선물하기"
    const val BODY = "링크를 받은 사람이 열면, 그 사람의 팩이 열려요. 내 팩은 그대로예요."
    const val CTA = "선물 링크 만들기"
    const val SENT_TITLE = "보낸 선물"
    const val STATUS_WAITING = "아직 받지 않았어요"
    const val STATUS_USED = "받았어요"
    const val STATUS_EXPIRED = "기한이 지났어요"
    const val STATUS_REVOKED = "취소했어요"
    const val REVOKE = "링크 취소하기"
    const val CREDIT_LABEL = "보낼 수 있는 선물"
    const val CREDIT_RESTORED = "취소한 선물은 다시 보낼 수 있어요. 결제는 한 번만 해요."
    const val FREE_CTA = "선물 링크 다시 만들기"
    const val ARRIVED_TITLE = "선물이 도착했어요."
    const val ARRIVED_BODY = "결혼 팩을 열 수 있는 선물이에요."
    const val ACCEPT = "선물 받기"
    const val LOGIN_REQUIRED = "선물을 받으려면 먼저 로그인해 주세요."
}

object GiftErrorCopy {
    const val USED = "이미 사용된 선물이에요."
    const val EXPIRED = "선물의 기한이 지났어요. 보낸 사람에게 새 링크를 부탁해 주세요."
    const val REVOKED = "취소된 선물이에요."
    const val SELF = "내가 보낸 선물은 내가 받을 수 없어요."
    const val ALREADY_ENTITLED = "이미 팩이 열려 있어요. 이 선물은 다른 사람에게 보낼 수 있어요."

    /** An unfamiliar failure still gets a line rather than a blank screen. */
    fun lineFor(error: String): String = when (error) {
        "expired" -> EXPIRED
        "revoked" -> REVOKED
        "self" -> SELF
        "already-entitled" -> ALREADY_ENTITLED
        else -> USED
    }
}

/** The share row is the invite row on every surface. */
object GrowthShareCopy {
    const val COPY_LINK = "링크 복사"
    const val INSTAGRAM = "인스타그램"
    const val KAKAO = "카카오톡"
    const val COPIED = "링크를 복사했어요."
    const val COPY_FAILED = "복사하지 못했어요. 아래 링크를 길게 눌러 복사해 주세요."
}

object GrowthApi {
    const val REFERRAL_PATH = "/api/referral"
    const val CLAIM_PATH = "/api/referral/claim"
    const val CREATE_GIFT_PATH = "/api/gift"
    const val SENT_GIFTS_PATH = "/api/gift/sent"
    const val REVOKE_GIFT_PATH = "/api/gift/revoke"
    const val REDEEM_GIFT_PATH = "/api/gift/redeem"
    const val PREVIEW_GIFT_PATH = "/api/gift/preview"
}
