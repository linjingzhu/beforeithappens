import Foundation

enum PaywallGate {
    static let sampleLockCount = 3

    static func isBuyer(_ session: PackSession) -> Bool {
        session.role != "partner"
    }

    static func canOpenQuestion(_ index: Int, entitled: Bool) -> Bool {
        if index < sampleLockCount { return true }
        return entitled
    }

    static func shouldShow(
        session: PackSession,
        sampleLocks: Int,
        entitled: Bool,
        dismissed: Bool,
        index: Int
    ) -> Bool {
        if session.userId == nil || !session.acceptedPartner { return false }
        if entitled || dismissed { return false }
        if sampleLocks < sampleLockCount { return false }
        if index < sampleLockCount - 1 { return false }
        return true
    }
}
