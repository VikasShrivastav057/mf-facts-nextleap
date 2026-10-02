import unittest

from class_style_rag import build_prompt, embedding_text, load_chunks


class ClassStyleRagTests(unittest.TestCase):
    def test_every_chunk_has_an_official_citation(self):
        chunks = load_chunks()
        self.assertEqual(41, len(chunks))
        for chunk in chunks:
            self.assertRegex(
                chunk["url"], r"^https://([a-z0-9-]+\.)*(hdfcfund|amfiindia)\.com/"
            )
            self.assertTrue(chunk["source_id"])
            self.assertTrue(chunk["updated"])

    def test_embedding_text_contains_fact_and_locator(self):
        chunk = load_chunks()[0]
        text = embedding_text(chunk)
        self.assertIn(chunk["answer"], text)
        self.assertIn(chunk["evidence_note"], text)

    def test_augmented_prompt_names_only_retrieved_context(self):
        record = {
            "id": "flexi-exit",
            "document": "Verified fact: Exit load is 1% within one year.",
            "metadata": {
                "source_title": "Official AMC page",
                "updated": "2026-09-30",
            },
        }
        system, user = build_prompt("What is the exit load?", [record])
        self.assertIn("only from the supplied context", system)
        self.assertIn("[flexi-exit]", user)
        self.assertIn("ABSTAIN", system)


if __name__ == "__main__":
    unittest.main()
