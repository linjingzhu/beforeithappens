import SwiftUI

enum LoveMeS3Copy {
    static let created = "워크스페이스가 만들어졌어요."
    static let inviteCta = "파트너 초대하기"
}

struct S3WorkspaceCreatedScreen: View {
    var email: String = ""
    var onInvitePartner: () -> Void = {}

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("AB · WORKSPACE")
                .font(.caption.weight(.heavy))
                .foregroundStyle(Color(red: 0.93, green: 0.47, blue: 0.37))
            Text(LoveMeS3Copy.created)
                .font(.largeTitle.weight(.medium))
            if !email.isEmpty { Text(email) }
            Button(LoveMeS3Copy.inviteCta, action: onInvitePartner)
                .buttonStyle(LoveMePrimaryButtonStyle())
        }
        .padding(22)
    }
}
