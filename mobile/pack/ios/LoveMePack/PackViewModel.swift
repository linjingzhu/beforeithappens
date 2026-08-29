import Foundation
import SwiftUI

@MainActor
final class PackViewModel: ObservableObject {
    @Published var screen: PackScreen
    @Published var saveStatus = "saved"
    @Published var error = ""
    @Published var proposal = ""
    @Published var reanswering = false
    @Published var current: PackQuestion?
    @Published var mine = PackRoleState(draftChoice: nil, privateNote: "", submittedChoice: nil, completed: false)
    @Published var lock: PackLock?
    @Published var shared = PackShared(proposal: "", proposedBy: nil, approvedBy: nil, status: "none")
    @Published var privacyBadge = PackCopy.draftBadge
    @Published var partnerStatus = PackCopy.waitingPartner
    @Published var canEdit = true
    @Published var canSubmitAnswer = false

    let session: PackSession
    let questions: [PackQuestion]
    private let client: PackClient
    private var state: PackState?
    private var index = 0

    init(session: PackSession, questions: [PackQuestion], client: PackClient) {
        self.session = session
        self.questions = questions
        self.client = client
        self.screen = PackGate.screen(for: session)
        self.current = questions.first
    }

    var startCTA: String { PackGate.startCTA(for: session) }
    var startBody: String { session.acceptedPartner ? PackCopy.startBody : PackCopy.lockedBody }
    var canGoPrevious: Bool { index > 0 }
    var canGoNext: Bool { index + 1 < questions.count }
    var agreeLabel: String { PackCopy.agree }
    var holdLabel: String { PackCopy.hold }

    func startPack() async {
        guard PackGate.canStartPack(session) else {
            screen = PackGate.screen(for: session)
            error = screen == .signedOut ? "unauthenticated" : "locked"
            return
        }
        do {
            let payload = try await client.getState()
            guard payload["ok"] as? Bool == true, let raw = payload["state"] as? [String: Any] else {
                screen = .locked
                error = payload["error"] as? String ?? "locked"
                return
            }
            apply(raw)
            screen = lock == nil ? .question : .reveal
            error = ""
        } catch {
            self.error = "failed"
            screen = .locked
        }
    }

    func selectChoice(_ id: String) async {
        guard canEdit else { return }
        if let lock, lock.submittedChoices[session.role == "partner" ? "b" : "a"] != id {
            reanswering = true
        }
        mine.draftChoice = id
        await persistDraft()
    }

    func persistDraft() async {
        guard let question = current else { return }
        saveStatus = "saving"
        do {
            let payload = try await client.saveDraft(
                questionId: question.id,
                draftChoice: mine.draftChoice,
                privateNote: mine.privateNote,
                index: index
            )
            if let raw = payload["state"] as? [String: Any] { apply(raw) }
            saveStatus = "saved"
            error = ""
        } catch {
            saveStatus = "failed"
            self.error = "failed"
        }
    }

    func submit() async {
        guard canSubmitAnswer, let question = current else {
            error = PackCopy.emptySubmit
            return
        }
        saveStatus = "saving"
        do {
            let payload = try await client.submit(questionId: question.id, index: index)
            if let raw = payload["state"] as? [String: Any] { apply(raw) }
            reanswering = false
            saveStatus = "saved"
            error = ""
        } catch {
            saveStatus = "failed"
            self.error = "failed"
        }
    }

    func agree() async {
        guard let question = current else { return }
        let action = shared.status == "pending" && shared.proposedBy != roleKey ? "approve" : "propose"
        saveStatus = "saving"
        do {
            let payload = try await client.saveAgreement(
                questionId: question.id,
                action: action,
                proposal: proposal,
                index: index
            )
            if let raw = payload["state"] as? [String: Any] { apply(raw) }
            saveStatus = "saved"
        } catch {
            saveStatus = "failed"
        }
    }

    func hold() async {
        guard let question = current else { return }
        saveStatus = "saving"
        do {
            let payload = try await client.saveAgreement(
                questionId: question.id,
                action: "deferred",
                proposal: proposal,
                index: index
            )
            if let raw = payload["state"] as? [String: Any] { apply(raw) }
            saveStatus = "saved"
        } catch {
            saveStatus = "failed"
        }
    }

    func beginReanswer() {
        guard lock != nil else { return }
        reanswering = true
        canEdit = true
        privacyBadge = PackCopy.draftBadge
        screen = .question
    }

    func go(_ delta: Int) {
        index = min(max(0, index + delta), questions.count - 1)
        refreshFromState()
    }

    private var roleKey: String { session.role == "partner" ? "b" : "a" }

    private func apply(_ raw: [String: Any]) {
        index = raw["index"] as? Int ?? index
        let activeRole = raw["activeRole"] as? String ?? roleKey
        var mapped: [String: PackQuestionState] = [:]
        if let questionsRaw = raw["questions"] as? [String: [String: Any]] {
            for (id, value) in questionsRaw {
                mapped[id] = decodeQuestion(value)
            }
        }
        state = PackState(index: index, activeRole: activeRole, questions: mapped)
        refreshFromState()
    }

    private func decodeQuestion(_ value: [String: Any]) -> PackQuestionState {
        let rolesRaw = value["roles"] as? [String: [String: Any]] ?? [:]
        var roles: [String: PackRoleState] = [:]
        for (key, role) in rolesRaw {
            roles[key] = PackRoleState(
                draftChoice: role["draftChoice"] as? String,
                privateNote: role["privateNote"] as? String ?? "",
                submittedChoice: role["submittedChoice"] as? String,
                completed: role["completed"] as? Bool ?? false
            )
        }
        let sharedRaw = value["shared"] as? [String: Any] ?? [:]
        let lockRaw = value["lock"] as? [String: Any]
        let lockChoices = lockRaw?["submittedChoices"] as? [String: String]
        return PackQuestionState(
            round: value["round"] as? Int ?? 1,
            roles: roles,
            shared: PackShared(
                proposal: sharedRaw["proposal"] as? String ?? "",
                proposedBy: sharedRaw["proposedBy"] as? String,
                approvedBy: sharedRaw["approvedBy"] as? String,
                status: sharedRaw["status"] as? String ?? "none"
            ),
            lock: lockRaw == nil ? nil : PackLock(
                id: lockRaw?["id"] as? String ?? "",
                roundNumber: lockRaw?["roundNumber"] as? Int ?? 1,
                submittedChoices: lockChoices ?? [:]
            )
        )
    }

    private func refreshFromState() {
        current = questions.indices.contains(index) ? questions[index] : questions.first
        guard let question = current, let questionState = state?.questions[question.id] else { return }
        mine = questionState.roles[roleKey] ?? mine
        lock = questionState.lock
        shared = questionState.shared
        proposal = shared.proposal
        let submitted = mine.submittedChoice != nil || mine.completed
        canEdit = reanswering || !submitted
        canSubmitAnswer = mine.draftChoice != nil && canEdit && saveStatus != "failed"
        privacyBadge = reanswering && !submitted
            ? PackCopy.draftBadge
            : lock != nil && !reanswering
                ? PackCopy.lockBadge
                : submitted ? PackCopy.submitBadge : PackCopy.draftBadge
        let other = roleKey == "a" ? "b" : "a"
        let theySubmitted = questionState.roles[other]?.submittedChoice != nil || questionState.roles[other]?.completed == true
        partnerStatus = theySubmitted ? PackCopy.bothSubmitted : PackCopy.waitingPartner
        if lock != nil && !reanswering { screen = .reveal } else { screen = .question }
    }
}
