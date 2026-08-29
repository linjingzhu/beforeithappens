package app.loveme.pack

import org.json.JSONObject
import java.io.BufferedInputStream
import java.net.InetSocketAddress
import java.net.Socket
import java.net.URL
import javax.net.ssl.SSLSocketFactory

/** Sends the real HTTP method, including PATCH, without HttpURLConnection. */
object PackHttp {
    fun request(
        baseUrl: String,
        method: String,
        path: String,
        sessionCookieName: String,
        sessionId: String,
        body: JSONObject? = null
    ): JSONObject {
        val url = URL(baseUrl.trimEnd('/') + path)
        val payload = body?.toString()?.toByteArray(Charsets.UTF_8) ?: ByteArray(0)
        val port = if (url.port != -1) url.port else if (url.protocol == "https") 443 else 80
        val socket = if (url.protocol == "https") {
            SSLSocketFactory.getDefault().createSocket()
        } else {
            Socket()
        }
        socket.soTimeout = 15_000
        socket.connect(InetSocketAddress(url.host, port), 15_000)
        return socket.use { connected ->
            val target = buildString {
                append(if (url.path.isNullOrEmpty()) "/" else url.path)
                if (!url.query.isNullOrEmpty()) append("?").append(url.query)
            }
            val header = StringBuilder()
            header.append(method).append(" ").append(target).append(" HTTP/1.1\r\n")
            header.append("Host: ").append(url.host).append(if (url.port != -1) ":${url.port}" else "").append("\r\n")
            header.append("Accept: application/json\r\n")
            if (sessionId.isNotEmpty()) {
                header.append("Cookie: ").append(sessionCookieName).append("=").append(sessionId).append("\r\n")
            }
            if (payload.isNotEmpty()) {
                header.append("Content-Type: application/json\r\n")
                header.append("Content-Length: ").append(payload.size).append("\r\n")
            }
            header.append("Connection: close\r\n\r\n")
            val output = connected.getOutputStream()
            output.write(header.toString().toByteArray(Charsets.US_ASCII))
            if (payload.isNotEmpty()) output.write(payload)
            output.flush()
            parseJsonBody(connected.getInputStream())
        }
    }

    private fun parseJsonBody(input: java.io.InputStream): JSONObject {
        val raw = BufferedInputStream(input).readBytes()
        val text = String(raw, Charsets.UTF_8)
        val split = text.indexOf("\r\n\r\n")
        val body = if (split >= 0) text.substring(split + 4) else text
        return JSONObject(body.trim().ifBlank { "{}" })
    }
}
