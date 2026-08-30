package app.loveme.paywall

import app.loveme.pack.PackSession

object PaywallGate {
    const val SAMPLE_LOCK_COUNT = 3

    fun isBuyer(session: PackSession): Boolean = session.role != "partner"

    fun canOpenQuestion(index: Int, entitled: Boolean): Boolean =
        index < SAMPLE_LOCK_COUNT || entitled

    fun shouldShow(
        session: PackSession,
        sampleLocks: Int,
        entitled: Boolean,
        dismissed: Boolean,
        index: Int
    ): Boolean {
        if (session.userId == null || !session.acceptedPartner) return false
        if (entitled || dismissed) return false
        if (sampleLocks < SAMPLE_LOCK_COUNT) return false
        if (index < SAMPLE_LOCK_COUNT - 1) return false
        return true
    }
}
