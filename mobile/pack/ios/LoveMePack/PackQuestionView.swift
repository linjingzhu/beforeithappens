import SwiftUI

struct PackQuestionView: View {
    @ObservedObject var model: PackViewModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                if let question = model.current {
                    HStack {
                        Text(question.chapter)
                            .font(.caption.weight(.bold))
                        Spacer()
                        Text(model.privacyBadge)
                            .font(.caption.weight(.bold))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 5)
                            .background(Color.green.opacity(0.12))
                            .clipShape(Capsule())
                            .accessibilityIdentifier("privacy-badge")
                    }
                    Text(question.title)
                        .font(.title2.weight(.semibold))
                    Text(PackCopy.privacyRule)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                    Text(model.partnerStatus)
                        .font(.footnote)
                    Text(question.intent)
                        .font(.subheadline)
                    ForEach(question.choices) { choice in
                        Button {
                            Task { await model.selectChoice(choice.id) }
                        } label: {
                            HStack {
                                Text(choice.label)
                                    .multilineTextAlignment(.leading)
                                Spacer()
                                if model.mine.draftChoice == choice.id {
                                    Image(systemName: "checkmark")
                                }
                            }
                            .padding(12)
                            .frame(minHeight: 44)
                            .background(model.mine.draftChoice == choice.id ? Color.orange.opacity(0.12) : Color.white)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(model.mine.draftChoice == choice.id ? Color.orange : Color.gray.opacity(0.3))
                            )
                        }
                        .disabled(!model.canEdit)
                    }
                    VStack(alignment: .leading, spacing: 6) {
                        Text(PackCopy.noteLabel)
                            .font(.caption.weight(.bold))
                        Text(PackCopy.noteHint)
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                        TextField("", text: Binding(
                            get: { model.mine.privateNote },
                            set: { model.mine.privateNote = $0 }
                        ), axis: .vertical)
                        .lineLimit(3...6)
                        .disabled(!model.canEdit)
                        .onChange(of: model.mine.privateNote) {
                            Task { await model.persistDraft() }
                        }
                    }
                    if model.saveStatus == "failed" {
                        Text(PackCopy.saveFailed)
                            .font(.caption2)
                        Button(PackCopy.retry) {
                            Task { await model.persistDraft() }
                        }
                        .frame(minHeight: 44)
                    } else {
                        Text(PackCopy.saved)
                            .font(.caption2)
                    }
                    HStack {
                        Button(PackCopy.previous) { model.go(-1) }
                            .disabled(!model.canGoPrevious)
                            .frame(minHeight: 44)
                        Button(PackCopy.next) { model.go(1) }
                            .disabled(!model.canGoNext)
                            .frame(minHeight: 44)
                        Button(PackCopy.submit) {
                            Task { await model.submit() }
                        }
                        .disabled(!model.canSubmitAnswer)
                        .buttonStyle(.borderedProminent)
                        .frame(minHeight: 44)
                    }
                }
            }
            .padding(20)
        }
    }
}
