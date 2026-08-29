package app.loveme.pack

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

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
            .put("draftChoice", draftChoice)
            .put("privateNote", privateNote)
            .put("index", index)
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
        val connection = URL("$baseUrl$path").openConnection() as HttpURLConnection
        // The web pack API only matches the real HTTP method. Do not rewrite PATCH to POST.
        connection.requestMethod = method
        connection.setRequestProperty("Accept", "application/json")
        if (sessionId.isNotEmpty()) {
            connection.setRequestProperty("Cookie", "$sessionCookieName=$sessionId")
        }
        if (body != null) {
            connection.doOutput = true
            connection.setRequestProperty("Content-Type", "application/json")
            connection.outputStream.use { it.write(body.toString().toByteArray()) }
        }
        val text = (if (connection.responseCode in 200..299) connection.inputStream else connection.errorStream)
            .bufferedReader().readText()
        return JSONObject(text.ifBlank { "{}" })
    }
}
