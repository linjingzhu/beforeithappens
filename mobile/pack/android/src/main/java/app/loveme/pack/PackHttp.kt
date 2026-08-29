package app.loveme.pack

import org.json.JSONObject
import java.io.BufferedInputStream
import java.io.ByteArrayOutputStream
import java.net.InetSocketAddress
import java.net.Socket
import java.net.URL
import javax.net.ssl.SSLSocket
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
        if (socket is SSLSocket) socket.startHandshake()
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
            parseResponse(connected.getInputStream())
        }
    }

    internal fun parseResponse(input: java.io.InputStream): JSONObject {
        return parseResponseBytes(BufferedInputStream(input).readBytes())
    }

    internal fun parseResponseBytes(raw: ByteArray): JSONObject {
        val split = indexOf(raw, CRLFCRLF, 0)
        val headerBytes = if (split >= 0) raw.copyOfRange(0, split) else raw
        var body = if (split >= 0) raw.copyOfRange(split + 4, raw.size) else ByteArray(0)
        val headerBlock = String(headerBytes, Charsets.US_ASCII)
        val status = headerBlock.lineSequence().firstOrNull()
            ?.split(" ")
            ?.getOrNull(1)
            ?.toIntOrNull() ?: 0
        val headers = headerBlock.split("\r\n").drop(1).associate { line ->
            val index = line.indexOf(":")
            if (index < 0) "" to ""
            else line.substring(0, index).trim().lowercase() to line.substring(index + 1).trim()
        }
        if (headers["transfer-encoding"]?.contains("chunked") == true) {
            body = decodeChunked(body)
        }
        val json = JSONObject(String(body, Charsets.UTF_8).trim().ifBlank { "{}" })
        if (status != 0) json.put("status", status)
        if (!json.has("ok")) json.put("ok", status in 200..299)
        if (json.optString("error").isBlank()) {
            if (status == 403) json.put("error", "locked")
            if (status == 401) json.put("error", "unauthenticated")
        }
        return json
    }

    internal fun decodeChunked(body: ByteArray): ByteArray {
        val out = ByteArrayOutputStream()
        var index = 0
        while (index < body.size) {
            val lineEnd = indexOf(body, CRLF, index)
            if (lineEnd < 0) break
            val sizeLine = String(body, index, lineEnd - index, Charsets.US_ASCII).trim()
            val size = sizeLine.substringBefore(';').toIntOrNull(16) ?: break
            if (size == 0) break
            val start = lineEnd + 2
            val end = (start + size).coerceAtMost(body.size)
            out.write(body, start, end - start)
            index = end + 2
        }
        return out.toByteArray()
    }

    private val CRLF = byteArrayOf('\r'.code.toByte(), '\n'.code.toByte())
    private val CRLFCRLF = byteArrayOf('\r'.code.toByte(), '\n'.code.toByte(), '\r'.code.toByte(), '\n'.code.toByte())

    private fun indexOf(haystack: ByteArray, needle: ByteArray, start: Int): Int {
        if (start < 0 || start > haystack.size - needle.size) return -1
        outer@ for (index in start..haystack.size - needle.size) {
            for (offset in needle.indices) {
                if (haystack[index + offset] != needle[offset]) continue@outer
            }
            return index
        }
        return -1
    }
}
