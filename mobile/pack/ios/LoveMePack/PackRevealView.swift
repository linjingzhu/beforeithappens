import SwiftUI

struct PackRevealView: View {
    @ObservedObject var model: PackViewModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                if let question = model.current {
                    HStack {
                        Text(question.title)
                            .font(.title3.weight(.semibold))
                        Spacer()
                        Text(PackCopy.lockBadge)
                            .font(.caption.weight(.bold))
                    }
                    Text(PackCopy.lockHint)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                    if let lock = model.lock {
                        lockRow(label: "나", choiceId: lock.submittedChoices[model.session.role == "partner" ? "b" : "a"], question: question)
                        lockRow(label: "상대", choiceId: lock.submittedChoices[model.session.role == "partner" ? "a" : "b"], question: question)
                    }
                    TextField(PackCopy.agreementPlaceholder, text: $model.proposal, axis: .vertical)
                        .lineLimit(3...6)
                    HStack {
                        Button(PackCopy.hold) {
                            Task { await model.hold() }
                        }
                        .frame(minHeight: 44)
                        .accessibilityIdentifier("hold")
                        Button(PackCopy.agree) {
                            Task { await model.agree() }
                        }
                        .buttonStyle(.borderedProminent)
                        .frame(minHeight: 44)
                        .accessibilityIdentifier("agree")
                    }
                    Button(PackCopy.reanswer) {
                        model.beginReanswer()
                    }
                    .frame(minHeight: 44)
                    .accessibilityIdentifier("reanswer")
                    HStack {
                        Button(PackCopy.previous) { model.go(-1) }
                            .disabled(!model.canGoPrevious)
                            .frame(minHeight: 44)
                        Button(PackCopy.next) { model.go(1) }
                            .disabled(!model.canGoNext)
                            .frame(minHeight: 44)
                    }
                }
            }
            .padding(20)
        }
    }

    private func lockRow(label: String, choiceId: String?, question: PackQuestion) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label).font(.caption)
            Text(question.choices.first(where: { $0.id == choiceId })?.label ?? "")
                .font(.body.weight(.semibold))
        }
    }
}

struct PackRootView: View {
    @ObservedObject var model: PackViewModel

    var body: some View {
        switch model.screen {
        case .ready, .locked, .signedOut:
            PackReadyView(model: model)
        case .question:
            PackQuestionView(model: model)
        case .reveal:
            PackRevealView(model: model)
        }
    }
}
