package com.beforeithappens.loveme

import java.net.HttpURLConnection
import java.net.URI
import java.net.URL

object LoveMeAuthApi {
    const val magicLinkPath = "/api/auth/magic-link"
    const val consumePath = "/api/auth/consume"
    const val sessionPath = "/api/auth/session"
    const val ackNoticePath = "/api/auth/ack-notice"
    const val oauthStartPath = "/api/auth/oauth/start"
    const val emailBindPath = "/api/auth/email-bind"
    const val pairCodePath = "/api/pair-code"
    const val pairConnectPath = "/api/pair-code/connect"
    const val previewQ1Path = "/api/preview-q1"
    const val logoutPath = "/api/auth/logout"
    const val magicLinkTtlMs = 10 * 60 * 1000
    const val SESSION_FETCH_MS = 2_000
    const val AUTH_FETCH_MS = 55_000
    const val OAUTH_FETCH_MS = 5_000

    fun extractMagicLinkToken(url: String): String? {
        val uri = runCatching { URI(url) }.getOrNull() ?: return null
        if (uri.path == "/invite/accept" || uri.path == "/install" || uri.path == "/start") return null
        return uri.query
            ?.split("&")
            ?.map { it.split("=", limit = 2) }
            ?.firstOrNull { it.getOrNull(0) == "token" }
            ?.getOrNull(1)
    }
}

class LoveMeAuthClient(
    private val origin: String,
    private val cookie: MutableList<String> = mutableListOf()
) {
    fun requestMagicLink(email: String): Map<String, Any?> {
        return post(LoveMeAuthApi.magicLinkPath, """{"email":${jsonString(email)}}""")
    }

    fun consumeMagicLink(token: String): Map<String, Any?> {
        return post(LoveMeAuthApi.consumePath, """{"token":${jsonString(token)}}""")
    }

    fun currentSession(): Map<String, Any?> {
        return get(LoveMeAuthApi.sessionPath)
    }

    fun acknowledgeNotice(): Map<String, Any?> {
        return post(LoveMeAuthApi.ackNoticePath, "{}")
    }

    fun startOAuth(provider: String): Map<String, Any?> {
        return post(LoveMeAuthApi.oauthStartPath, """{"provider":${jsonString(provider)}}""")
    }

    fun requestEmailBind(email: String): Map<String, Any?> {
        return post(LoveMeAuthApi.emailBindPath, """{"email":${jsonString(email)}}""")
    }

    fun myPairCode(): Map<String, Any?> {
        return get(LoveMeAuthApi.pairCodePath)
    }

    fun connectPairCode(code: String): Map<String, Any?> {
        return post(LoveMeAuthApi.pairConnectPath, """{"code":${jsonString(code)}}""")
    }

    fun savePreviewQ1(choiceId: String): Map<String, Any?> {
        return post(LoveMeAuthApi.previewQ1Path, """{"questionId":"home-01","choiceId":${jsonString(choiceId)}}""")
    }

    fun logout(): Map<String, Any?> {
        return post(LoveMeAuthApi.logoutPath, "{}")
    }

    private fun jsonString(value: String): String {
        return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\""
    }

    private fun timeoutMs(path: String): Int = when (path) {
        LoveMeAuthApi.sessionPath -> LoveMeAuthApi.SESSION_FETCH_MS
        LoveMeAuthApi.oauthStartPath -> LoveMeAuthApi.OAUTH_FETCH_MS
        else -> LoveMeAuthApi.AUTH_FETCH_MS
    }

    private fun get(path: String): Map<String, Any?> = request("GET", path, null)

    private fun post(path: String, body: String): Map<String, Any?> = request("POST", path, body)

    private fun request(method: String, path: String, body: String?): Map<String, Any?> {
        val connection = URL(origin.trimEnd('/') + path).openConnection() as HttpURLConnection
        connection.requestMethod = method
        val timeout = timeoutMs(path)
        connection.connectTimeout = timeout
        connection.readTimeout = timeout
        connection.doInput = true
        if (cookie.isNotEmpty()) connection.setRequestProperty("Cookie", cookie.joinToString("; "))
        if (body != null) {
            connection.doOutput = true
            connection.setRequestProperty("Content-Type", "application/json")
            connection.outputStream.use { it.write(body.toByteArray()) }
        }
        connection.getHeaderField("Set-Cookie")?.let { header ->
            cookie.clear()
            cookie.add(header.split(";").first())
        }
        val text = (if (connection.responseCode in 200..299) connection.inputStream else connection.errorStream)
            ?.bufferedReader()
            ?.readText()
            ?: "{}"
        return mapOf("status" to connection.responseCode, "body" to text)
    }
}
