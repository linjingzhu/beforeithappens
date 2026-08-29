package app.loveme.pack

import org.json.JSONObject

class PackViewModel(
    val session: PackSession,
    val questions: List<PackQuestion>,
    private val client: PackClient
) {
    var screen: PackScreen = PackGate.screen(session)
        private set
    var saveStatus: String = "saved"
        private set
    var error: String = ""
        private set
    var proposal: String = ""
    var reanswering: Boolean = false
        private set
    var current: PackQuestion? = questions.firstOrNull()
        private set
    var mine: PackRoleState = PackRoleState()
        private set
    var lock: PackLock? = null
        private set
    var shared: PackShared = PackShared()
        private set
    var privacyBadge: String = PackCopy.DRAFT_BADGE
        private set
    var partnerStatus: String = PackCopy.WAITING_PARTNER
        private set
    var canEdit: Boolean = true
        private set
    var canSubmitAnswer: Boolean = false
        private set

    private var state: PackState? = null
    private var index: Int = 0

    val startCta: String get() = if (showsStartCta) PackCopy.START_PACK else ""
    val startBody: String get() = if (screen == PackScreen.LOCKED || !session.acceptedPartner) PackCopy.LOCKED_BODY else PackCopy.START_BODY
    val showsStartCta: Boolean get() = screen == PackScreen.READY && PackGate.canStartPack(session)
    val agreeLabel: String get() = PackCopy.AGREE
    val holdLabel: String get() = PackCopy.HOLD
    val comparisonLabel: String
        get() {
            val raw = lock?.comparisonKey?.lowercase().orEmpty()
            if (raw == "aligned") return PackCopy.ALIGNED
            if (raw == "close") return PackCopy.CLOSE
            if (raw == "discuss") return PackCopy.DISCUSS
            val left = lock?.submittedChoices?.get("a")
            val right = lock?.submittedChoices?.get("b")
            return if (left != null && right != null) {
                if (left == right) PackCopy.ALIGNED else PackCopy.DISCUSS
            } else ""
        }

    fun startPack() {
        if (!PackGate.canStartPack(session)) {
            screen = PackGate.screen(session)
            error = ""
            return
        }
        val payload = client.getState()
        if (payload.optBoolean("ok") && payload.has("state")) {
            apply(payload.getJSONObject("state"))
            error = ""
        } else {
            applyGate(payload.optString("error", "failed"), payload.optInt("status", 0))
        }
    }

    fun selectChoice(id: String) {
        if (!canEdit) return
        mine = mine.copy(draftChoice = id)
        persistDraft()
    }

    fun persistDraft() {
        val question = current ?: return
        saveStatus = "saving"
        val payload = client.saveDraft(question.id, mine.draftChoice, mine.privateNote, index)
        if (payload.has("state")) apply(payload.getJSONObject("state"))
        saveStatus = if (payload.optBoolean("ok")) "saved" else "failed"
    }

    fun updateNote(text: String) {
        if (!canEdit) return
        mine = mine.copy(privateNote = text)
        persistDraft()
    }

    fun submit() {
        val question = current
        if (question == null || !canSubmitAnswer) {
            error = PackCopy.EMPTY_SUBMIT
            return
        }
        saveStatus = "saving"
        val payload = client.submit(question.id, index)
        if (payload.has("state")) apply(payload.getJSONObject("state"))
        reanswering = false
        saveStatus = if (payload.optBoolean("ok")) "saved" else "failed"
    }

    fun agree() {
        val question = current ?: return
        val action = if (shared.status == "pending" && shared.proposedBy != session.roleKey) "approve" else "propose"
        saveStatus = "saving"
        val payload = client.saveAgreement(question.id, action, proposal, index)
        if (payload.has("state")) apply(payload.getJSONObject("state"))
        saveStatus = if (payload.optBoolean("ok")) "saved" else "failed"
    }

    fun hold() {
        val question = current ?: return
        saveStatus = "saving"
        val payload = client.saveAgreement(question.id, "deferred", proposal, index)
        if (payload.has("state")) apply(payload.getJSONObject("state"))
        saveStatus = if (payload.optBoolean("ok")) "saved" else "failed"
    }

    fun beginReanswer() {
        if (lock == null) return
        reanswering = true
        canEdit = true
        privacyBadge = PackCopy.DRAFT_BADGE
        screen = PackScreen.QUESTION
    }

    fun go(delta: Int) {
        index = (index + delta).coerceIn(0, (questions.size - 1).coerceAtLeast(0))
        refreshFromState()
    }

    private fun apply(raw: JSONObject) {
        index = raw.optInt("index", index)
        val mapped = mutableMapOf<String, PackQuestionState>()
        val questionsRaw = raw.optJSONObject("questions")
        questionsRaw?.keys()?.forEach { id ->
            mapped[id] = decodeQuestion(questionsRaw.getJSONObject(id))
        }
        state = PackState(index, raw.optString("activeRole", session.roleKey), mapped)
        refreshFromState()
    }

    private fun decodeQuestion(value: JSONObject): PackQuestionState {
        val rolesRaw = value.optJSONObject("roles")
        val roles = mutableMapOf<String, PackRoleState>()
        rolesRaw?.keys()?.forEach { key ->
            val role = rolesRaw.getJSONObject(key)
            roles[key] = PackRoleState(
                draftChoice = role.optString("draftChoice").ifBlank { null },
                privateNote = role.optString("privateNote"),
                submittedChoice = role.optString("submittedChoice").ifBlank { null },
                completed = role.optBoolean("completed")
            )
        }
        val sharedRaw = value.optJSONObject("shared") ?: JSONObject()
        val lockRaw = value.optJSONObject("lock")
        val lockChoices = mutableMapOf<String, String>()
        lockRaw?.optJSONObject("submittedChoices")?.let { choices ->
            choices.keys().forEach { lockChoices[it] = choices.getString(it) }
        }
        return PackQuestionState(
            round = value.optInt("round", 1),
            roles = roles,
            shared = PackShared(
                proposal = sharedRaw.optString("proposal"),
                proposedBy = sharedRaw.optString("proposedBy").ifBlank { null },
                approvedBy = sharedRaw.optString("approvedBy").ifBlank { null },
                status = sharedRaw.optString("status", "none")
            ),
            lock = lockRaw?.let {
                PackLock(
                    id = it.optString("id"),
                    roundNumber = it.optInt("roundNumber", 1),
                    submittedChoices = lockChoices,
                    comparisonKey = it.optJSONObject("comparison")?.optString("key")
                        ?.ifBlank { it.optString("comparison") }
                )
            }
        )
    }

    private fun refreshFromState() {
        current = questions.getOrNull(index) ?: questions.firstOrNull()
        val question = current ?: return
        val questionState = state?.questions?.get(question.id) ?: return
        mine = questionState.roles[session.roleKey] ?: mine
        lock = questionState.lock
        shared = questionState.shared
        proposal = shared.proposal
        val submitted = mine.submittedChoice != null || mine.completed
        canEdit = reanswering || (lock == null && !submitted)
        canSubmitAnswer = mine.draftChoice != null && canEdit && saveStatus != "failed"
        privacyBadge = when {
            reanswering -> PackCopy.DRAFT_BADGE
            lock != null -> PackCopy.LOCK_BADGE
            submitted -> PackCopy.SUBMIT_BADGE
            else -> PackCopy.DRAFT_BADGE
        }
        val other = if (session.roleKey == "a") "b" else "a"
        val theySubmitted = questionState.roles[other]?.submittedChoice != null || questionState.roles[other]?.completed == true
        partnerStatus = if (theySubmitted) PackCopy.BOTH_SUBMITTED else PackCopy.WAITING_PARTNER
        screen = if (lock != null && !reanswering) PackScreen.REVEAL else PackScreen.QUESTION
    }

    private fun applyGate(code: String, status: Int) {
        if (code == "unauthenticated" || status == 401) {
            error = ""
            screen = PackScreen.SIGNED_OUT
        } else if (code == "locked" || code == "forbidden" || status == 403) {
            error = ""
            screen = PackScreen.LOCKED
        } else {
            error = code.ifBlank { "failed" }
            screen = PackScreen.READY
        }
    }
}
