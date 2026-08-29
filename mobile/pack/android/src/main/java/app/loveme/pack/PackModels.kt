package app.loveme.pack

data class PackSession(
    val userId: String? = null,
    val email: String? = null,
    val acceptedPartner: Boolean = false,
    val role: String = "buyer"
) {
    val canStartPack: Boolean get() = userId != null && acceptedPartner
    val roleKey: String get() = if (role == "partner") "b" else "a"
}

data class PackChoice(val id: String, val label: String)

data class PackQuestion(
    val id: String,
    val number: Int,
    val chapter: String,
    val title: String,
    val intent: String,
    val example: String,
    val choices: List<PackChoice>
)

data class PackLock(
    val id: String,
    val roundNumber: Int,
    val submittedChoices: Map<String, String>
)

data class PackRoleState(
    val draftChoice: String? = null,
    val privateNote: String = "",
    val submittedChoice: String? = null,
    val completed: Boolean = false
)

data class PackShared(
    val proposal: String = "",
    val proposedBy: String? = null,
    val approvedBy: String? = null,
    val status: String = "none"
)

data class PackQuestionState(
    val round: Int = 1,
    val roles: Map<String, PackRoleState> = emptyMap(),
    val shared: PackShared = PackShared(),
    val lock: PackLock? = null
)

data class PackState(
    val index: Int = 0,
    val activeRole: String = "a",
    val questions: Map<String, PackQuestionState> = emptyMap()
)

enum class PackScreen { SIGNED_OUT, LOCKED, READY, QUESTION, REVEAL }
