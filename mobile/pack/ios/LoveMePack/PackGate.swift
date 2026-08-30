import Foundation

enum PackGate {
    static func canStartPack(_ session: PackSession) -> Bool {
        session.canStartPack
    }

    static func screen(for session: PackSession) -> PackScreen {
        if session.userId == nil { return .signedOut }
        if !session.acceptedPartner { return .locked }
        return .ready
    }

    static func startCTA(for session: PackSession) -> String {
        canStartPack(session) ? PackCopy.startPack : ""
    }

    static func requiresPaywall(_ lockCount: Int = 0) -> Bool { false }

    static func canContinuePack(_ session: PackSession, lockCount: Int = 0) -> Bool {
        canStartPack(session) && !requiresPaywall(lockCount)
    }
}
