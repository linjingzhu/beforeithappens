package app.loveme.pack

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp

@Composable
fun PackRootScreen(model: PackViewModel) {
    when (model.screen) {
        PackScreen.READY, PackScreen.LOCKED, PackScreen.SIGNED_OUT -> PackReadyScreen(model)
        PackScreen.QUESTION -> PackQuestionScreen(model)
        PackScreen.REVEAL -> PackRevealScreen(model)
    }
}

@Composable
fun PackReadyScreen(model: PackViewModel) {
    Column(Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text(PackCopy.TITLE)
        Text(model.startBody)
        if (model.showsStartCta) {
            Button(
                onClick = { model.startPack() },
                modifier = Modifier.heightIn(min = 44.dp).semantics { contentDescription = PackCopy.START_PACK }
            ) {
                Text(PackCopy.START_PACK)
            }
        }
        if (model.error.isNotEmpty() && model.screen != PackScreen.LOCKED) {
            Text(model.error)
        }
    }
}

@Composable
fun PackQuestionScreen(model: PackViewModel) {
    val question = model.current ?: return
    Column(
        Modifier
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(Modifier.fillMaxWidth()) {
            Text(question.chapter)
            Text(
                model.privacyBadge,
                modifier = Modifier.semantics { contentDescription = "privacy-badge" }
            )
        }
        Text(question.title)
        Text(PackCopy.PRIVACY_RULE)
        Text(model.partnerStatus)
        question.choices.forEach { choice ->
            Row(
                Modifier
                    .fillMaxWidth()
                    .heightIn(min = 44.dp)
                    .selectable(
                        selected = model.mine.draftChoice == choice.id,
                        enabled = model.canEdit
                    ) { model.selectChoice(choice.id) }
                    .padding(12.dp)
            ) {
                Text(choice.label)
            }
        }
        Text(PackCopy.NOTE_LABEL)
        Text(PackCopy.NOTE_HINT)
        OutlinedTextField(
            value = model.mine.privateNote,
            onValueChange = { if (model.canEdit) model.updateNote(it) },
            enabled = model.canEdit,
            modifier = Modifier.fillMaxWidth()
        )
        if (model.saveStatus == "failed") {
            Text(PackCopy.SAVE_FAILED)
            OutlinedButton(onClick = { model.persistDraft() }) { Text(PackCopy.RETRY) }
        } else {
            Text(PackCopy.SAVED)
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedButton(onClick = { model.go(-1) }, enabled = (model.current?.number ?: 1) > 1) {
                Text(PackCopy.PREVIOUS)
            }
            Button(onClick = { model.submit() }, enabled = model.canSubmitAnswer) {
                Text(PackCopy.SUBMIT)
            }
            OutlinedButton(
                onClick = { model.go(1) },
                enabled = model.canGoNext
            ) { Text(PackCopy.NEXT) }
        }
    }
}

@Composable
fun PackRevealScreen(model: PackViewModel) {
    val question = model.current ?: return
    Column(
        Modifier
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(question.title)
        Text(PackCopy.LOCK_BADGE)
        Text(PackCopy.LOCK_HINT)
        if (model.comparisonLabel.isNotEmpty()) {
            Text(model.comparisonLabel)
        }
        model.lock?.let { lock ->
            val mineKey = model.session.roleKey
            val theirKey = if (mineKey == "a") "b" else "a"
            Text("나")
            Text(question.choices.firstOrNull { it.id == lock.submittedChoices[mineKey] }?.label ?: "")
            Text("상대")
            Text(question.choices.firstOrNull { it.id == lock.submittedChoices[theirKey] }?.label ?: "")
        }
        Text(model.partnerStatus)
        OutlinedTextField(
            value = model.proposal,
            onValueChange = { model.proposal = it },
            placeholder = { Text(PackCopy.AGREEMENT_PLACEHOLDER) },
            modifier = Modifier.fillMaxWidth()
        )
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedButton(
                onClick = { model.hold() },
                modifier = Modifier.heightIn(min = 44.dp).semantics { contentDescription = PackCopy.HOLD }
            ) { Text(PackCopy.HOLD) }
            Button(
                onClick = { model.agree() },
                modifier = Modifier.heightIn(min = 44.dp).semantics { contentDescription = PackCopy.AGREE }
            ) { Text(PackCopy.AGREE) }
        }
        OutlinedButton(
            onClick = { model.beginReanswer() },
            modifier = Modifier.heightIn(min = 44.dp).semantics { contentDescription = PackCopy.REANSWER }
        ) { Text(PackCopy.REANSWER) }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedButton(onClick = { model.go(-1) }, enabled = (model.current?.number ?: 1) > 1) {
                Text(PackCopy.PREVIOUS)
            }
            OutlinedButton(
                onClick = { model.go(1) },
                enabled = model.canGoNext
            ) { Text(PackCopy.NEXT) }
        }
    }
}
