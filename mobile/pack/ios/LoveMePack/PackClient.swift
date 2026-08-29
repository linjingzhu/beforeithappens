import Foundation

struct PackClient {
    var baseURL: URL
    var sessionId: String
    var sessionCookieName = "ab_session"
    var send: (URLRequest) async throws -> (Data, URLResponse)

    func getState() async throws -> [String: Any] {
        try await request(path: "/api/pack/state", method: "GET")
    }

    func saveDraft(questionId: String, draftChoice: String?, privateNote: String, index: Int) async throws -> [String: Any] {
        try await request(path: "/api/pack/draft", method: "PATCH", body: [
            "questionId": questionId,
            "draftChoice": draftChoice as Any,
            "privateNote": privateNote,
            "index": index
        ])
    }

    func submit(questionId: String, index: Int) async throws -> [String: Any] {
        try await request(path: "/api/pack/submit", method: "POST", body: [
            "questionId": questionId,
            "index": index
        ])
    }

    func saveAgreement(questionId: String, action: String, proposal: String?, index: Int) async throws -> [String: Any] {
        var body: [String: Any] = [
            "questionId": questionId,
            "action": action,
            "index": index
        ]
        if let proposal { body["proposal"] = proposal }
        return try await request(path: "/api/pack/agreement", method: "POST", body: body)
    }

    private func request(path: String, method: String, body: [String: Any]? = nil) async throws -> [String: Any] {
        var request = URLRequest(url: baseURL.appendingPathComponent(path))
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
            throw PackClientError.http(http.statusCode, json["error"] as? String ?? "failed")
        }
        return json
    }
}

enum PackClientError: Error {
    case http(Int, String)
}
