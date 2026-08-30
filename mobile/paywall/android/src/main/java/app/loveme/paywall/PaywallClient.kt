package app.loveme.paywall

import org.json.JSONObject

class PaywallClient(
    private val baseUrl: String,
    private val sessionId: String,
    private val sessionCookieName: String = "ab_session",
    private val send: ((method: String, path: String, body: JSONObject?) -> JSONObject)? = null
) {
    fun getEntitlement(): JSONObject = request("GET", "/api/entitlement")

    fun purchase(): JSONObject = request("POST", "/api/purchase", JSONObject())

    private fun request(method: String, path: String, body: JSONObject? = null): JSONObject {
        send?.let { return it(method, path, body) }
        return app.loveme.pack.PackHttp.request(
            baseUrl = baseUrl,
            method = method,
            path = path,
            sessionCookieName = sessionCookieName,
            sessionId = sessionId,
            body = body
        )
    }
}
