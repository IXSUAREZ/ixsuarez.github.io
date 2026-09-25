"""Catch stale styles after generation, including footer and app entry points."""
import importlib.util
from pathlib import Path
import tempfile
import json
import unittest
import shutil
import subprocess
import sys

spec = importlib.util.spec_from_file_location('theme_assets', Path(__file__).parents[1] / 'theme_assets.py')
theme = importlib.util.module_from_spec(spec)
spec.loader.exec_module(theme)


class ThemeAssetTests(unittest.TestCase):
    def setUp(self):
        self.versions = {'assets/site-footer.css': '0123456789',
                         'foi-cards/app.js': 'abcdef1234'}
        self.retired = {'engine-explorer/app/brand/copper-theme.css'}

    def errors(self, html, file='index.html'):
        return theme.theme_asset_errors(file, html, self.versions, self.retired)

    def test_body_footer_stale_version_is_rejected(self):
        html = '<head></head><body><link rel="stylesheet" href="/assets/site-footer.css?v=old"></body>'
        self.assertEqual(self.errors(html), ['stale/missing theme asset version: assets/site-footer.css'])

    def test_relative_app_script_and_single_quotes(self):
        self.assertEqual(self.errors("<script src='./app.js?v=abcdef1234'></script>", 'foi-cards/index.html'), [])
        self.assertEqual(len(self.errors("<script src='./app.js'></script>", 'foi-cards/index.html')), 1)

    def test_normalized_retired_path_is_rejected(self):
        html = '<link rel="stylesheet" href="./brand/../brand/copper-theme.css?v=anything">'
        self.assertEqual(self.errors(html, 'engine-explorer/app/index.html'),
                         ['retired theme asset: engine-explorer/app/brand/copper-theme.css'])

    def test_duplicate_version_cannot_hide_a_stale_reference(self):
        html = '<link rel="stylesheet" href="/assets/site-footer.css?v=0123456789&amp;v=old">'
        self.assertEqual(len(self.errors(html)), 1)

    def test_external_and_nonstylesheet_assets_are_ignored(self):
        html = '<link rel="preload" href="/assets/site-footer.css"><link rel="stylesheet" href="https://example.test/assets/site-footer.css">'
        self.assertEqual(self.errors(html), [])

    def test_current_footer_with_fragment_is_valid(self):
        html = '<link href="../assets/site-footer.css?v=0123456789#sheet" rel="stylesheet">'
        self.assertEqual(self.errors(html, 'blog/index.html'), [])

    def test_unlinked_retired_artifact_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            retired = {'old.css', 'server/index.js'}
            self.assertEqual(theme.retired_asset_files(root, retired), [])
            (root / 'old.css').write_text('button{color:cyan}')
            (root / 'server').mkdir()
            (root / 'server/index.js').write_text('const legacyAssets = {};')
            self.assertEqual(theme.retired_asset_files(root, retired),
                             ['old.css', 'server/index.js'])
            self.assertEqual(theme.retired_asset_files(root, {'absent.css'}), [])

    def test_broken_retired_symlink_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'old.css').symlink_to(root / 'missing.css')
            self.assertEqual(theme.retired_asset_files(root, {'old.css'}), ['old.css'])

    def test_route_audit_fails_if_unlinked_retired_file_returns(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for folder in ['scripts', 'config', 'assets', 'docs/design']:
                (root / folder).mkdir(parents=True)
            for script in ['audit-aurum.py', 'theme_assets.py']:
                shutil.copy2(Path(__file__).parents[1] / script, root / 'scripts' / script)
            managed = ['assets/appearance.js', 'assets/avionics.css']
            for name in managed:
                (root / name).write_text('/* fixture */')
            for name in ('simply-endorsed-cfi/site.webmanifest',
                         'simply-endorsed/site.webmanifest',
                         'pilotsolve/manifest.webmanifest',
                         'aero-lab/site.webmanifest'):
                manifest = root / name
                manifest.parent.mkdir(parents=True)
                manifest.write_text(json.dumps({'background_color': '#E3E3E3',
                                                'theme_color': '#E3E3E3'}))
            (root / 'config/theme-assets.json').write_text(json.dumps(
                {'managed': managed, 'retired': ['legacy.css']}))
            (root / 'config/site-pages.json').write_text(json.dumps(
                {'pages': [{'file': 'index.html', 'path': '/'}]}))
            (root / 'config/theme-supporting-documents.json').write_text(json.dumps(
                {'documents': [], 'excluded_html': {}}))
            versions, _ = theme.load_asset_versions(root)
            (root / 'index.html').write_text(
                '<head><script src="/assets/appearance.js?v=' + versions[managed[0]] +
                '"></script><link rel="stylesheet" href="/assets/avionics.css?v=' +
                versions[managed[1]] + '"></head><body></body>')
            command = [sys.executable, str(root / 'scripts/audit-aurum.py')]
            self.assertEqual(subprocess.run(command, capture_output=True).returncode, 0)
            (root / 'legacy.css').write_text('/* restored obsolete material */')
            result = subprocess.run(command, capture_output=True, text=True)
            self.assertEqual(result.returncode, 1)
            self.assertIn('Retired asset restored in active site: legacy.css', result.stdout)
            report = json.loads((root / 'docs/design/route-coverage.json').read_text())
            self.assertEqual(report['restored_retired_assets'], ['legacy.css'])
            (root / 'legacy.css').unlink()
            manifest = root / 'pilotsolve/manifest.webmanifest'
            manifest.write_text(json.dumps({'background_color': '#E3E3E3',
                                            'theme_color': '#080b10'}))
            result = subprocess.run(command, capture_output=True, text=True)
            self.assertEqual(result.returncode, 1)
            self.assertIn('pilotsolve/manifest.webmanifest', result.stdout)

    def test_asset_bytes_change_expected_version(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'config').mkdir()
            (root / 'assets').mkdir()
            (root / 'config/theme-assets.json').write_text(json.dumps({'managed': ['assets/site-footer.css'], 'retired': []}))
            css = root / 'assets/site-footer.css'
            css.write_text('footer{color:red}')
            before, _ = theme.load_asset_versions(root)
            css.write_text('footer{color:var(--g-ink)}')
            after, _ = theme.load_asset_versions(root)
            self.assertNotEqual(before, after)
            html = '<link rel="stylesheet" href="/assets/site-footer.css?v=' + before['assets/site-footer.css'] + '">'
            self.assertTrue(theme.theme_asset_errors('index.html', html, after, set()))


if __name__ == '__main__':
    unittest.main()
