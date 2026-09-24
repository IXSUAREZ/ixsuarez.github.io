import importlib.util
from pathlib import Path
import re
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('chrome', ROOT/'scripts/sync-chrome.py')
chrome = importlib.util.module_from_spec(spec); spec.loader.exec_module(chrome)

class FooterSyncTests(unittest.TestCase):
    def test_empty_template_has_all_static_links_and_expanded_groups(self):
        result=chrome.render_footer('', 'template')
        self.assertEqual(result.count('class="site-footer-group" open'), 2)
        self.assertEqual(len(re.findall(r'<a ',result)),20)
        self.assertIn('footer-notes',result)

    def test_migration_preserves_notice_and_hook_but_removes_credit(self):
        legacy='''<footer>
<div class="social-links footer-social">
</div>
<p id="footerMeta">Source &amp; date</p>
<p><button id="footerGuidanceBtn">Guidance</button></p>
<p class="fine footer-designer">Designed by Diego Suarez</p>
<p class="fine">FAA Certificated Flight Instructor</p>
</footer>'''
        result=chrome.render_footer(legacy,'test')
        self.assertIn('<p id="footerMeta">Source &amp; date</p>',result)
        self.assertIn('id="footerGuidanceBtn"',result)
        self.assertNotIn('Designed by',result)
        self.assertEqual(result,chrome.render_footer(result,'test'))

    def test_unknown_legacy_structure_fails_closed(self):
        with self.assertRaises(ValueError):chrome.render_footer('<footer>Important custom text</footer>','test')

    def test_footer_only_does_not_sync_navigation_or_surrounding_content(self):
        original_root=chrome.ROOT
        with tempfile.TemporaryDirectory() as tmp:
            chrome.ROOT=Path(tmp)
            p=Path(tmp)/'index.html'
            outside='<!-- site-nav -->\n<header class="nav-wrap">CUSTOM NAV</header>\n<!-- /site-nav -->\n<main>Untouched</main>\n'
            p.write_text(outside+'<!-- site-footer -->\n<!-- /site-footer -->\nTAIL')
            try:
                self.assertTrue(chrome.sync_file(p,True,footer_only=True)[0])
                self.assertTrue(p.read_text().startswith(outside))
                self.assertTrue(p.read_text().endswith('TAIL'))
                self.assertFalse(chrome.sync_file(p,False,footer_only=True)[0])
            finally:chrome.ROOT=original_root

    def test_explicit_slot_is_preserved(self):
        current='<footer><!-- footer-notes -->\n<aside class="site-footer-notes"><p>Keep <a href="/source/">source</a></p></aside>\n<!-- /footer-notes --></footer>'
        result=chrome.render_footer(current,'test')
        self.assertIn('<aside class="site-footer-notes"><p>Keep <a href="/source/">source</a></p></aside>',result)

    def test_footers_include_flightrisk_only_in_targeted_mode(self):
        targeted={p.relative_to(ROOT).as_posix() for p in chrome.iter_pages(footer_only=True)}
        normal={p.relative_to(ROOT).as_posix() for p in chrome.iter_pages()}
        expected={'flight-risk-assessment/index.html','flight-risk-assessment/guide/index.html','flight-risk-assessment/methodology/index.html'}
        self.assertEqual(targeted-normal,expected)

if __name__=='__main__':unittest.main()
