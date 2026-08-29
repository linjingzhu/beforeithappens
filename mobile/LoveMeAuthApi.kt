package com.beforeithappens.loveme

import java.net.URI

object LoveMeAuthApi {
    const val magicLinkPath = "/api/auth/magic-link"
    const val consumePath = "/api/auth/consume"
    const val sessionPath = "/api/auth/session"
    const val ackNoticePath = "/api/auth/ack-notice"
    const val magicLinkTtlMs = 10 * 60 * 1000

    fun extractMagicLinkToken(url: String): String? {
        val uri = URI(url)
        if (uri.path == "/invite/accept" || uri.path == "/install" || uri.path == "/start") return null
        return uri.query
            ?.split("&")
            ?.map { it.split("=", limit = 2) }
            ?.firstOrNull { it.getOrNull(0) == "token" }
            ?.getOrNull(1)
    }
}
