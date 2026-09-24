"""Preservation and authoring regression tests, independent of browser tooling."""
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('journal', Path(__file__).parents[1] / 'journal.py')
journal = importlib.util.module_from_spec(spec)
spec.loader.exec_module(journal)


def document(content):
    return '<html><head><title>Test</title></head><body><main><article><header class="article-header"><h1>Test</h1></header>' + content + '</article></main></body></html>'


class JournalTest(unittest.TestCase):
    def test_idempotent_and_updates_new_sections(self):
        source = document('<h2>First</h2><p>Unchanged words.</p>')
        first = journal.enhance(source)
        self.assertEqual(first, journal.enhance(first))
        updated = journal.enhance(first.replace('</article>', '<h2>Second</h2></article>'))
        self.assertIn('href="#journal-second"', updated)
        self.assertEqual(updated.count('class="journal-layout"'), 1)

    def test_existing_duplicate_and_non_ascii_headings(self):
        result = journal.enhance(document('<h2 id="kept">First</h2><h2>First</h2><h2>First</h2><h2>雲</h2>'))
        self.assertIn('href="#kept"', result)
        self.assertIn('id="journal-first-2"', result)
        self.assertIn('id="journal-section"', result)

    def test_nested_cards_are_not_outer_readers(self):
        result = journal.enhance(document('<h2>Endorsements</h2><article><h2>A.3</h2><p>Exact reference.</p></article>'))
        self.assertEqual(result.count('class="journal-layout"'), 1)
        self.assertIn('href="#journal-a-3"', result)

    def test_complete_subsection_navigation(self):
        result = journal.enhance(document('<h2>Chapter</h2><h3>Example</h3><h4>Detail</h4>'))
        self.assertIn('href="#journal-example"', result)
        self.assertIn('href="#journal-detail"', result)
        self.assertIn('<li data-level="3">', result)
        self.assertEqual(result, journal.enhance(result))

    def test_indices_and_redirects(self):
        source = '<html><head></head><body><main><article class="post-card"><h2>A card</h2></article></main></body></html>'
        self.assertEqual(journal.kind(source), 'library')
        result = journal.enhance(source)
        self.assertIn('journal-library', result)
        self.assertNotIn('journal-layout', result)
        redirect = '<html><head><meta http-equiv="refresh" content="0;url=/learn/"></head></html>'
        self.assertEqual(journal.enhance(redirect), redirect)

    def test_escape_navigation_titles(self):
        result = journal.enhance(document('<h2>Rain &amp; &lt;clouds&gt;</h2>'))
        self.assertIn('Rain &amp; &lt;clouds&gt;</span>', result)

    def test_preserves_blocks_links_and_tables(self):
        source = document('<h2 id="facts">Facts</h2><p>Original <a href="https://www.faa.gov/">FAA source</a>.</p><table><tr><td>123</td></tr></table>')
        before, after = journal.signature(source), journal.signature(journal.enhance(source))
        self.assertEqual(journal.digest(before), journal.digest(after))

    def test_chrome_sync_preserves_heading_anchors(self):
        chrome_spec = importlib.util.spec_from_file_location('chrome', Path(__file__).parents[1] / 'sync-chrome.py')
        chrome = importlib.util.module_from_spec(chrome_spec)
        chrome_spec.loader.exec_module(chrome)
        source = chrome.load_partial('post-cta.html').replace('<h2>', '<h2 id="journal-next-step">', 1)
        result = chrome.render_post_cta(source, 'fixture.html')
        self.assertIn('id="journal-next-step"', result)
        self.assertEqual(result, chrome.render_post_cta(result, 'fixture.html'))


if __name__ == '__main__':
    unittest.main()
