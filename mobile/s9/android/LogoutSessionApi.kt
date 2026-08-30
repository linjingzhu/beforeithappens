package com.beforeithappens.loveme.s9

/**
 * Reuses the web session and logout APIs. Does not invent a native auth screen.
 */
object LoveMeS9SessionApi {
    const val SESSION_PATH = "/api/auth/session"
    const val LOGOUT_PATH = "/api/auth/logout"
    const val FORCE_LOGOUT_PATH = "/api/auth/force-logout"

    suspend fun requestDeviceHandoffLogout(
        origin: String,
        sessionCookie: String? = null,
        post: suspend (path: String, cookieHeader: String?) -> Boolean
    ) {
        val cookie = sessionCookie?.takeIf { it.isNotEmpty() }?.let { "ab_session=$it" }
        val base = origin.trimEnd('/')
        if (post("$base$FORCE_LOGOUT_PATH", cookie)) return
        post("$base$LOGOUT_PATH", cookie)
    }
}
