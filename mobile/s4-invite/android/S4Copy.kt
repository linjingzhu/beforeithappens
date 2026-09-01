package com.beforeithappens.invite

/** Exact Korean copy for the S4 invite-waiting pack. Do not paraphrase. */
object S4Copy {
    const val TITLE = "파트너 초대"
    const val SHARE = "링크를 보내 파트너를 초대하세요."
    const val COPY_LINK = "링크 복사"
    const val INSTAGRAM = "인스타그램"
    const val KAKAO = "카카오톡"
    const val COPIED = "링크를 복사했어요."
    const val COPY_FAILED = "복사하지 못했어요. 아래 링크를 길게 눌러 복사해 주세요."
    const val DEVICE_RULE = "같은 폰에서 두 계정을 동시에 쓸 수는 없어요."
    const val EMAIL_CHECK = "상대 이메일이 맞는지 다시 확인해 주세요."
    const val EDIT_RESEND = "이메일 고치고 링크 다시 만들기"
    const val SEND = "초대 링크 만들기"
    const val LOGOUT = "로그아웃"
    const val LOGOUT_HANDOFF = "로그아웃 후 이 기기를 넘겨주세요."
    const val EXPIRED = "초대가 만료됐어요. 구매자에게 새 링크를 부탁해 주세요."
    const val MISMATCH = "이 초대는 다른 이메일로 만들어졌어요. 초대받은 메일로 로그인해야 해요."
}

object SameSessionCopy {
    const val MESSAGE = "이 기기에 다른 계정으로 로그인되어 있어요."
    const val CTA = "로그아웃하고 넘기기"
    const val LOGOUT_HANDOFF = "로그아웃 후 이 기기를 넘겨주세요."
}

object InviteApi {
    const val SEND_PATH = "/api/invite"
    const val PREVIEW_PATH = "/api/invite/preview"
    const val ACCEPT_PATH = "/api/invite/accept"
    const val FORCE_LOGOUT_PATH = "/api/auth/force-logout"
}
