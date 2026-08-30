import SwiftUI

enum LoveMeS0Copy {
    static let brand = "LoveMe"
    static let title = "두 사람의 결혼 준비, 한곳에"
    static let holdSeconds = 1.2
}

struct S0SplashScreen: View {
    var onFinished: () -> Void = {}

    var body: some View {
        VStack(spacing: 16) {
            Text(LoveMeS0Copy.brand)
                .font(.largeTitle.weight(.medium))
            Text(LoveMeS0Copy.title)
                .font(.body)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(28)
        .background(Color(red: 0.97, green: 0.95, blue: 0.93))
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + LoveMeS0Copy.holdSeconds) {
                onFinished()
            }
        }
    }
}
