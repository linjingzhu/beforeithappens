#!/usr/bin/env python3
"""Prove each guard fails on the defect it exists to catch.

LESSONS_FROM_PRACTICE.md entry 15: a guard is code, and a guard that has never
failed on purpose has not been tested. Every test here copies the tree, breaks
exactly one thing, and asserts that the matching check reports it — plus one
test that the untouched tree is clean, so a guard cannot pass by failing on
everything.

Standard library only:

    python3 .ai/tools/test_check_policy_set.py
"""

from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CHECKER = Path(__file__).resolve().parent / "check_policy_set.py"


def first_denylisted_term(root: Path) -> str:
    """The first term the repository's own denylist declares — the tests do
    not assume the set's seed names, so they also run where the set was adopted
    and the denylist holds that project's names."""
    for line in (root / ".ai" / "tools" / "portability-denylist.txt").read_text(encoding="utf-8").splitlines():
        if line.strip() and not line.lstrip().startswith("#"):
            return line.strip()
    raise AssertionError("the denylist declares no term")


def run_checker(root: Path) -> tuple[int, str]:
    result = subprocess.run(
        [sys.executable, str(CHECKER), str(root)],
        capture_output=True,
        text=True,
        check=False,
    )
    return result.returncode, result.stdout + result.stderr


class GuardTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = Path(tempfile.mkdtemp(prefix="policy-set-"))
        self.addCleanup(shutil.rmtree, self.tmp, True)
        self.copy = self.tmp / "repo"
        shutil.copytree(
            ROOT,
            self.copy,
            ignore=shutil.ignore_patterns(".git", "__pycache__"),
        )

    def edit(self, relative: str, transform) -> None:
        path = self.copy / relative
        path.write_text(transform(path.read_text(encoding="utf-8")), encoding="utf-8")

    def assert_fails_with(self, fragment: str) -> None:
        code, out = run_checker(self.copy)
        self.assertEqual(code, 1, f"expected a failure, got a clean run:\n{out}")
        self.assertIn(fragment, out, f"expected {fragment!r} in:\n{out}")

    # -- the control: an untouched copy must be clean ----------------------
    def test_unmodified_tree_passes(self) -> None:
        code, out = run_checker(self.copy)
        self.assertEqual(code, 0, f"the tree itself does not pass:\n{out}")

    # -- check 1: front matter --------------------------------------------
    def test_missing_front_matter_field(self) -> None:
        self.edit(".ai/UX.md", lambda t: t.replace("version: ", "revision: ", 1))
        self.assert_fails_with("missing `version`")

    def test_duplicate_doc_id(self) -> None:
        self.edit(".ai/UX.md", lambda t: t.replace("doc_id: ai-ux", "doc_id: ai-core", 1))
        self.assert_fails_with("also claimed by")

    def test_canonical_path_not_matching_location(self) -> None:
        self.edit(
            ".ai/UX.md",
            lambda t: t.replace("canonical_path: .ai/UX.md", "canonical_path: .ai/UI.md", 1),
        )
        self.assert_fails_with("canonical_path is")

    def test_version_not_semver(self) -> None:
        self.edit(".ai/UX.md", lambda t: t.replace("version: 1.1.0", "version: 1.0", 1))
        self.assert_fails_with("is not MAJOR.MINOR.PATCH")

    # -- check 2: cross-references ----------------------------------------
    def test_reference_to_missing_section(self) -> None:
        self.edit(
            ".ai/MANAGER.md",
            lambda t: t.replace("§ *Conflict prevention*", "§ *Conflict Maps*", 1),
        )
        self.assert_fails_with("has no section")

    def test_reference_to_missing_file(self) -> None:
        self.edit(
            ".ai/MANAGER.md",
            lambda t: t.replace("`.ai/EXECUTION.md`", "`.ai/EXECUTION_PLAN.md`", 1),
        )
        self.assert_fails_with("which does not exist")

    # -- check 3: one owner per heading ------------------------------------
    def test_rule_reduplicated_into_a_second_file(self) -> None:
        self.edit(
            ".ai/MANAGER.md",
            lambda t: t + "\n## Compile and build ladder\n\nEdit → check → compile.\n",
        )
        self.assert_fails_with("is claimed by")

    # -- check 4: portability ---------------------------------------------
    def test_denylisted_name_in_a_portable_file(self) -> None:
        term = first_denylisted_term(self.copy)
        self.edit(".ai/CORE.md", lambda t: t + f"\nBuilt for {term} by default.\n")
        self.assert_fails_with(f"`{term}`")

    def test_denylisted_name_is_allowed_in_the_instance_files(self) -> None:
        term = first_denylisted_term(self.copy)
        instance = self.copy / ".ai" / "PROJECT_CONTEXT.md"
        instance.write_text(
            "---\ndoc_id: ai-project-context\nversion: 1.0.0\n"
            "canonical_path: .ai/PROJECT_CONTEXT.md\nupdated: 2026-09-03\n---\n\n"
            f"# {term} Project Context\n\n{term} is the product.\n\n"
            "## Facts the checks read\n\n```text\nrepository_mode: personal\nbase_branch: main\n"
            "merge_deploys: no\nruntime_gate: none\ntest_command: npm test\nlint_command: none\n"
            "build_command: none\ngenerated: none\nexternal_scripts: none\npublic_ids: none\n"
            "owner_ledger: docs/OWNER_ACTIONS.md\n```\n",
            encoding="utf-8",
        )
        code, out = run_checker(self.copy)
        self.assertEqual(code, 0, f"instance files must be allowed to name the project:\n{out}")

    def test_missing_denylist_is_reported_not_ignored(self) -> None:
        (self.copy / ".ai" / "tools" / "portability-denylist.txt").unlink()
        self.assert_fails_with("is missing")

    # -- check 5: changelog -----------------------------------------------
    def test_release_without_improvements(self) -> None:
        self.edit(
            ".ai/CHANGELOG.md",
            lambda t: t.replace("## 2.1.0 — 2026-09-03", "## 2.2.0 — 2026-09-04\n\n## 2.1.0 — 2026-09-03", 1),
        )
        self.assert_fails_with("no improvements listed")

    def test_release_with_a_malformed_version(self) -> None:
        self.edit(".ai/CHANGELOG.md", lambda t: t.replace("## 2.1.0 —", "## 2.1 —", 1))
        self.assert_fails_with("version is not MAJOR.MINOR.PATCH")

    def test_release_with_a_malformed_date(self) -> None:
        self.edit(".ai/CHANGELOG.md", lambda t: t.replace("— 2026-09-03", "— Sept 2026", 1))
        self.assert_fails_with("is not YYYY-MM-DD")

    def test_releases_out_of_order(self) -> None:
        self.edit(
            ".ai/CHANGELOG.md",
            lambda t: t.replace("## 2.1.0 — 2026-09-03", "## 1.9.0 — 2026-09-03", 1),
        )
        self.assert_fails_with("newest goes first")

    def test_version_recorded_twice(self) -> None:
        self.edit(
            ".ai/CHANGELOG.md",
            lambda t: t.replace(
                "## 2.0.1 — 2026-09-03",
                "## 2.1.0 — 2026-09-03\n\n- a second entry claiming a version already used\n\n## 2.0.1 — 2026-09-03",
                1,
            ),
        )
        self.assert_fails_with("recorded more than once")

    def test_missing_changelog(self) -> None:
        (self.copy / ".ai" / "CHANGELOG.md").unlink()
        self.assert_fails_with("is missing")

    def test_format_example_in_a_code_fence_is_not_a_release(self) -> None:
        # The changelog documents its own format inside a fence. Reading that
        # as a real entry was the guard's own first false positive here.
        code, out = run_checker(self.copy)
        self.assertEqual(code, 0, out)
        self.assertIn("7 release entries", out)

    # -- check 6: project context -----------------------------------------
    FILLED_CONTEXT = (
        "---\ndoc_id: ai-project-context\nversion: 1.0.0\n"
        "canonical_path: .ai/PROJECT_CONTEXT.md\nupdated: 2026-09-03\n---\n\n"
        "# Example Context\n\n## Facts the checks read\n\n```text\nrepository_mode: personal\nbase_branch: main\n"
        "merge_deploys: no\nruntime_gate: none\ntest_command: npm test\n"
        "lint_command: none\nbuild_command: none\ngenerated: none\n"
        "external_scripts: none\npublic_ids: none\nowner_ledger: docs/OWNER_ACTIONS.md\n```\n"
    )

    def write_context(self, text: str) -> None:
        (self.copy / ".ai" / "PROJECT_CONTEXT.md").write_text(text, encoding="utf-8")

    def test_filled_context_passes(self) -> None:
        self.write_context(self.FILLED_CONTEXT)
        code, out = run_checker(self.copy)
        self.assertEqual(code, 0, f"a complete context must pass:\n{out}")

    def test_context_missing_a_key(self) -> None:
        self.write_context(self.FILLED_CONTEXT.replace("runtime_gate: none\n", ""))
        self.assert_fails_with("missing `runtime_gate`")

    def test_context_with_a_placeholder_left(self) -> None:
        self.write_context(self.FILLED_CONTEXT.replace("base_branch: main", "base_branch: <branch>"))
        self.assert_fails_with("still holds a placeholder")

    def test_context_with_a_template_line_left(self) -> None:
        self.write_context(self.FILLED_CONTEXT + "\n> **This is a template.**\n")
        self.assert_fails_with("still carries the template line")

    def test_context_with_a_value_outside_its_enum(self) -> None:
        self.write_context(self.FILLED_CONTEXT.replace("merge_deploys: no", "merge_deploys: sometimes"))
        self.assert_fails_with("expected one of")

    def test_template_that_lost_a_key(self) -> None:
        self.edit(".ai/PROJECT_CONTEXT.template.md", lambda t: t.replace("generated: ", "generated_files: ", 1))
        self.assert_fails_with("does not declare `generated`")

    # -- adopting repository -----------------------------------------------
    def test_adopting_repository_without_set_home_files_passes(self) -> None:
        # The adoption procedure copies `.ai/` and `CLAUDE.md`, nothing else.
        # The adopter's README names its product and is not the set's.
        term = first_denylisted_term(self.copy)
        (self.copy / "LESSONS_FROM_PRACTICE.md").unlink(missing_ok=True)
        (self.copy / "README.md").write_text(f"# {term}\n\n{term} is our product.\n", encoding="utf-8")
        self.write_context(self.FILLED_CONTEXT)
        code, out = run_checker(self.copy)
        self.assertEqual(code, 0, f"an adopted copy must pass without the set-home files:\n{out}")


if __name__ == "__main__":
    unittest.main(verbosity=2)
