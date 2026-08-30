import Foundation

enum LoveMeAuthApi {
    static let magicLinkPath = "/api/auth/magic-link"
    static let consumePath = "/api/auth/consume"
    static let sessionPath = "/api/auth/session"
    static let ackNoticePath = "/api/auth/ack-notice"
    static let magicLinkTtlSeconds = 10 * 60

    static func extractMagicLinkToken(from url: URL) -> String? {
        let blocked = ["/invite/accept", "/install", "/start"]
        if blocked.contains(url.path) { return nil }
        return URLComponents(url: url, resolvingAgainstBaseURL: false)?
            .queryItems?
            .first(where: { $0.name == "token" })?
            .value
    }
}

enum LoveMeAuthError: Error {
    case invalidEmail
    case expired
    case used
    case invalid
    case unauthenticated
    case failed
}

struct LoveMeAuthClient {
    var origin: URL
    var session: URLSession = .shared

    func requestMagicLink(email: String) async throws {
        let payload = try await post(path: LoveMeAuthApi.magicLinkPath, body: ["email": email])
        if payload["ok"] as? Bool == true { return }
        throw mapError(payload["error"] as? String)
    }

    func consumeMagicLink(token: String) async throws -> [String: Any] {
        let payload = try await post(path: LoveMeAuthApi.consumePath, body: ["token": token])
        if let session = payload["session"] as? [String: Any], payload["ok"] as? Bool == true {
            return session
        }
        throw mapError(payload["error"] as? String)
    }

    func currentSession() async throws -> [String: Any] {
        try await get(path: LoveMeAuthApi.sessionPath)
    }

    func acknowledgeNotice() async throws -> [String: Any] {
        let payload = try await post(path: LoveMeAuthApi.ackNoticePath, body: [:])
        if payload["error"] as? String == "unauthenticated" {
            throw LoveMeAuthError.unauthenticated
        }
        return payload
    }

    private func mapError(_ code: String?) -> LoveMeAuthError {
        switch code {
        case "invalid-email": return .invalidEmail
        case "expired": return .expired
        case "used": return .used
        case "unauthenticated": return .unauthenticated
        case "invalid": return .invalid
        default: return .failed
        }
    }

    private func get(path: String) async throws -> [String: Any] {
        let request = URLRequest(url: origin.appending(path: path))
        return try await send(request)
    }

    private func post(path: String, body: [String: Any]) async throws -> [String: Any] {
        var request = URLRequest(url: origin.appending(path: path))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        return try await send(request)
    }

    private func send(_ request: URLRequest) async throws -> [String: Any] {
        let (data, response) = try await session.data(for: request)
        guard response is HTTPURLResponse else { throw LoveMeAuthError.failed }
        return (try JSONSerialization.jsonObject(with: data) as? [String: Any]) ?? [:]
    }
}
