import Foundation

struct PackSession: Equatable {
    var userId: String?
    var email: String?
    var acceptedPartner: Bool
    var role: String

    var canStartPack: Bool { userId != nil && acceptedPartner }
}

struct PackChoice: Equatable, Identifiable {
    var id: String
    var label: String
}

struct PackQuestion: Equatable, Identifiable {
    var id: String
    var number: Int
    var chapter: String
    var title: String
    var intent: String
    var example: String
    var choices: [PackChoice]
}

struct PackLock: Equatable {
    var id: String
    var roundNumber: Int
    var submittedChoices: [String: String]
    var comparisonKey: String?
}

struct PackRoleState: Equatable {
    var draftChoice: String?
    var privateNote: String
    var submittedChoice: String?
    var completed: Bool
}

struct PackShared: Equatable {
    var proposal: String
    var proposedBy: String?
    var approvedBy: String?
    var status: String
}

struct PackQuestionState: Equatable {
    var round: Int
    var roles: [String: PackRoleState]
    var shared: PackShared
    var lock: PackLock?
}

struct PackState: Equatable {
    var index: Int
    var activeRole: String
    var questions: [String: PackQuestionState]
}

enum PackScreen: Equatable {
    case signedOut
    case locked
    case ready
    case question
    case reveal
}
