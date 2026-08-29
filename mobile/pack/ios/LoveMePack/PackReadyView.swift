import SwiftUI

struct PackReadyView: View {
    @ObservedObject var model: PackViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text(PackCopy.title)
                .font(.title.weight(.semibold))
                .accessibilityAddTraits(.isHeader)
            Text(model.startBody)
                .foregroundStyle(.secondary)
            if PackGate.canStartPack(model.session) {
                Button(PackCopy.startPack) {
                    Task { await model.startPack() }
                }
                .buttonStyle(.borderedProminent)
                .frame(minHeight: 44)
                .accessibilityIdentifier("start-pack")
            } else {
                Text(PackCopy.lockedBody)
                    .foregroundStyle(.secondary)
            }
            if !model.error.isEmpty && model.screen != .locked {
                Text(model.error)
                    .foregroundStyle(.red)
                    .font(.footnote)
            }
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}
