package app.loveme.pack

object PackGate {
    fun canStartPack(session: PackSession): Boolean = session.canStartPack

    fun screen(session: PackSession): PackScreen = when {
        session.userId == null -> PackScreen.SIGNED_OUT
        !session.acceptedPartner -> PackScreen.LOCKED
        else -> PackScreen.READY
    }

    fun startCta(session: PackSession): String =
        if (canStartPack(session)) PackCopy.START_PACK else ""
}
