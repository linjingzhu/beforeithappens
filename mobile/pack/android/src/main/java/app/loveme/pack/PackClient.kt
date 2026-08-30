package app.loveme.pack

import org.json.JSONObject

class PackClient(
    private val baseUrl: String,
    private val sessionId: String,
    private val sessionCookieName: String = "ab_session",
    private val send: ((method: String, path: String, body: JSONObject?) -> JSONObject)? = null
) {
    fun getState(): JSONObject = request("GET", "/api/pack/state")

    fun saveDraft(questionId: String, draftChoice: String?, privateNote: String, index: Int): JSONObject {
        val body = JSONObject()
            .put("questionId", questionId)
            .put("privateNote", privateNote)
            .put("index", index)
        if (draftChoice != null) body.put("draftChoice", draftChoice)
        return request("PATCH", "/api/pack/draft", body)
    }

    fun submit(questionId: String, index: Int): JSONObject {
        val body = JSONObject().put("questionId", questionId).put("index", index)
        return request("POST", "/api/pack/submit", body)
    }

    fun saveAgreement(questionId: String, action: String, proposal: String?, index: Int): JSONObject {
        val body = JSONObject()
            .put("questionId", questionId)
            .put("action", action)
            .put("index", index)
        if (proposal != null) body.put("proposal", proposal)
        return request("POST", "/api/pack/agreement", body)
    }

    private fun request(method: String, path: String, body: JSONObject? = null): JSONObject {
        send?.let { return it(method, path, body) }
        // Default java.net cannot send a reliable PATCH. Write the method on the wire.
        return PackHttp.request(
            baseUrl = baseUrl,
            method = method,
            path = path,
            sessionCookieName = sessionCookieName,
            sessionId = sessionId,
            body = body
        )
    }
}
