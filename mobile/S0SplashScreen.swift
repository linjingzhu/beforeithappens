import SwiftUI

enum LoveMeS0Copy {
    static let brand = "AB"
    static let title = "두 사람의 결혼 준비, 한곳에"
    static let tagline = "다가올 삶을, 함께 준비하다."
    static let english = "Before life changes, talk."
}

struct S0SplashScreen: View {
    var onFinished: () -> Void = {}

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(LoveMeS0Copy.brand)
                .font(.title.weight(.semibold))
                .frame(width: 72, height: 72)
                .background(Color(red: 0.17, green: 0.15, blue: 0.13))
                .foregroundStyle(.white)
                .clipShape(Circle())
                .accessibilityLabel(LoveMeS0Copy.brand)
            Text(LoveMeS0Copy.title)
                .font(.largeTitle.weight(.medium))
            Text(LoveMeS0Copy.tagline)
                .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
            Text(LoveMeS0Copy.english)
                .font(.footnote)
                .foregroundStyle(Color(red: 0.51, green: 0.46, blue: 0.43))
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(28)
        .background(Color(red: 0.97, green: 0.95, blue: 0.93))
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                onFinished()
            }
        }
    }
}
