import Foundation

struct PaywallClient {
    var baseURL: URL
    var sessionId: String
    var sessionCookieName = "ab_session"
    var send: (URLRequest) async throws -> (Data, URLResponse)

    func getEntitlement() async throws -> [String: Any] {
        try await request(path: "/api/entitlement", method: "GET")
    }

    func purchase() async throws -> [String: Any] {
        try await request(path: "/api/purchase", method: "POST", body: [:])
    }

    private func request(path: String, method: String, body: [String: Any]? = nil) async throws -> [String: Any] {
        guard let url = URL(string: path, relativeTo: baseURL)?.absoluteURL else {
            throw PackClientError.http(status: 0, error: "invalid-url")
        }
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if !sessionId.isEmpty {
            request.setValue("\(sessionCookieName)=\(sessionId)", forHTTPHeaderField: "Cookie")
        }
        if let body {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }
        let (data, response) = try await send(request)
        let json = (try JSONSerialization.jsonObject(with: data) as? [String: Any]) ?? [:]
        if let http = response as? HTTPURLResponse, !(200...299).contains(http.statusCode) {
            let code = json["error"] as? String ?? "failed"
            throw PackClientError.http(status: http.statusCode, error: code)
        }
        return json
    }
}
