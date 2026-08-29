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

struct LoveMeAuthClient {
    var origin: URL
    var session: URLSession = .shared

    func requestMagicLink(email: String) async throws {
        var request = URLRequest(url: origin.appending(path: LoveMeAuthApi.magicLinkPath))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: ["email": email])
        let (_, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
    }

    func consumeMagicLink(token: String) async throws -> [String: Any] {
        var request = URLRequest(url: origin.appending(path: LoveMeAuthApi.consumePath))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: ["token": token])
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        return (try JSONSerialization.jsonObject(with: data) as? [String: Any]) ?? [:]
    }
}
