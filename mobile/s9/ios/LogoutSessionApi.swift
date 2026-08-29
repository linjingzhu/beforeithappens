import Foundation

/// Reuses the web session and logout APIs. Does not invent a native auth screen.
enum LoveMeS9SessionApi {
    static let sessionPath = "/api/auth/session"
    static let logoutPath = "/api/auth/logout"
    static let forceLogoutPath = "/api/auth/force-logout"

    static func requestDeviceHandoffLogout(
        origin: URL,
        sessionCookie: String?,
        send: (URLRequest) async throws -> (Data, URLResponse)
    ) async throws {
        if try await post(path: forceLogoutPath, origin: origin, sessionCookie: sessionCookie, send: send) {
            return
        }
        _ = try await post(path: logoutPath, origin: origin, sessionCookie: sessionCookie, send: send)
    }

    private static func post(
        path: String,
        origin: URL,
        sessionCookie: String?,
        send: (URLRequest) async throws -> (Data, URLResponse)
    ) async throws -> Bool {
        guard let url = URL(string: path, relativeTo: origin)?.absoluteURL else { return false }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        if let sessionCookie, !sessionCookie.isEmpty {
            request.setValue("ab_session=\(sessionCookie)", forHTTPHeaderField: "Cookie")
        }
        let (_, response) = try await send(request)
        return (response as? HTTPURLResponse)?.statusCode == 200
    }
}
