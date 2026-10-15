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


class ThemeSyncTests(unittest.TestCase):
    """Exercise the real sync CLI without authoring or rewriting the site."""

    def make_fixture(self, root, extra_assets):
        for folder in ('scripts', 'config', 'assets'):
            (root / folder).mkdir(parents=True)
        for script in ('sync-avionics.py', 'theme_assets.py'):
            shutil.copy2(Path(__file__).parents[1] / script, root / 'scripts' / script)
        # Journal generation is a separate authoring job. An unexpected call to
        # enhance would expose accidental parsing of Rotax's embedded payload.
        (root / 'scripts/journal.py').write_text(
            'def enhance(source):\n'
            '    raise AssertionError("fixture has no journal document")\n'
            'def apply():\n'
            '    pass\n')
        assets = {'assets/appearance.js': '/* appearance */',
                  'assets/avionics.css': '/* shared material */',
                  'assets/tactile.js': '/* tactile behavior */', **extra_assets}
        for name, content in assets.items():
            path = root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
        (root / 'config/theme-assets.json').write_text(json.dumps(
            {'managed': list(assets), 'retired': []}))

    def sync(self, root, check=False, expected=0):
        command = [sys.executable, '-B', str(root / 'scripts/sync-avionics.py')]
        if check:
            command.append('--check')
        result = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(result.returncode, expected, result.stdout + result.stderr)
        return result.stdout

    def test_sync_versions_relative_managed_urls_and_preserves_unmanaged_urls(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_fixture(root, {'apps/theme.css': '/* app surface */',
                                     'apps/deep/entry.js': '/* app runtime */',
                                     'assets/site-footer.css': '/* footer */'})
            document = root / 'apps/deep/index.html'
            untouched = (
                '<link rel="stylesheet" href="./unmanaged.css?mode=night#local">\n'
                '<link rel="stylesheet" href="https://cdn.example.test/apps/theme.css?v=old">\n'
                '<script src="//cdn.example.test/apps/deep/entry.js?v=old"></script>\n'
                '<a href="aviation+app://cdn.example.test/apps/theme.css?v=old">Open native app</a>\n'
                '<div data-src="./entry.js?v=original" data-href="../theme.css?v=original"></div>\n'
                '<a href="#app-settings">Settings</a>')
            document.write_text(
                '<!doctype html><html><head>\n'
                "<link rel='stylesheet' href='.././theme.css?mode=night&amp;v=old#surface'>\n"
                "<link rel='stylesheet' HREF = '/apps/theme.css?v=old#absolute'>\n"
                '<link rel="stylesheet" href="../../assets/site-footer.css#footer">\n'
                '</head><body>\n'
                '<script type="module" src="./entry.js?v=old#boot"></script>\n'
                "<script SRC = './entry.js?v=old#alternate'></script>\n"
                + untouched + '\n</body></html>')
            original = document.read_bytes()
            self.assertIn('apps/deep/index.html', self.sync(root, check=True, expected=1))
            self.assertEqual(document.read_bytes(), original)
            self.sync(root)
            versions, _ = theme.load_asset_versions(root)
            source = document.read_text()
            self.assertIn("href='.././theme.css?v=" + versions['apps/theme.css'] + "#surface'", source)
            self.assertIn("HREF = '/apps/theme.css?v=" + versions['apps/theme.css'] + "#absolute'", source)
            self.assertIn('href="../../assets/site-footer.css?v=' + versions['assets/site-footer.css'] + '#footer"', source)
            self.assertIn('src="./entry.js?v=' + versions['apps/deep/entry.js'] + '#boot"', source)
            self.assertIn("SRC = './entry.js?v=" + versions['apps/deep/entry.js'] + "#alternate'", source)
            self.assertIn(untouched, source)
            self.assertEqual(theme.theme_asset_errors('apps/deep/index.html', source, versions, set()), [])
            settled = document.read_bytes()
            self.assertIn('Stale 0 HTML sources', self.sync(root, check=True))
            self.assertIn('Updated 0 HTML sources', self.sync(root))
            self.assertEqual(document.read_bytes(), settled)

            (root / 'apps/theme.css').write_text('/* changed app surface */')
            self.sync(root, check=True, expected=1)
            self.assertEqual(document.read_bytes(), settled)
            self.sync(root)
            changed_versions, _ = theme.load_asset_versions(root)
            self.assertNotEqual(versions['apps/theme.css'], changed_versions['apps/theme.css'])
            self.assertEqual(document.read_text(), source.replace(
                versions['apps/theme.css'], changed_versions['apps/theme.css']))
            self.sync(root, check=True)

    def test_rotax_sync_updates_only_head_and_preserves_opaque_viewer_tail(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.make_fixture(root, {
                'engine-explorer/rotax-component-studies.css': '/* viewer material */'})
            document = root / 'engine-explorer/rotax-component-studies.html'
            tail = (
                '\n<body><h1>Rotax component studies — teaching viewer</h1>\n'
                '<script id="study-data" type="application/json">' +
                json.dumps({'asset': './rotax-component-studies.css?v=original#model',
                            'markup': '<head></head><meta name="theme-color" content="#123456">',
                            'class': 'journal-article'}) + '</script>\n'
                '<script src="/assets/tactile.js?v=opaque-runtime"></script>\n'
                '<script>const saved = \'<link href="./rotax-component-studies.css?v=opaque">\';\n'
                'const unicode = "crankshaft ⚙ — original model data";</script>\n'
                '</body></html>\n')
            document.write_text(
                '<!doctype html><html><head><title>Original viewer</title>\n'
                '<meta name="theme-color" content="#171b21">\n'
                '<link rel="stylesheet" href="./rotax-component-studies.css?v=stale#viewer">\n'
                '</head>' + tail)
            original = document.read_bytes()
            self.sync(root, check=True, expected=1)
            self.assertEqual(document.read_bytes(), original)
            self.sync(root)
            head, current_tail = document.read_text().split('</head>', 1)
            self.assertEqual(current_tail.encode(), tail.encode())
            versions, _ = theme.load_asset_versions(root)
            self.assertIn('<title>Original viewer</title>', head)
            self.assertIn('content="#E3E3E3"', head)
            self.assertIn('./rotax-component-studies.css?v=' +
                          versions['engine-explorer/rotax-component-studies.css'] + '#viewer', head)
            self.assertLess(head.index('/assets/appearance.js'), head.index('./rotax-component-studies.css'))
            self.assertGreater(head.index('/assets/avionics.css'), head.index('./rotax-component-studies.css'))
            settled = document.read_bytes()
            self.sync(root, check=True)
            self.assertIn('Updated 0 HTML sources', self.sync(root))
            self.assertEqual(document.read_bytes(), settled)

            (root / 'engine-explorer/rotax-component-studies.css').write_text('/* changed viewer material */')
            self.sync(root, check=True, expected=1)
            self.assertEqual(document.read_bytes(), settled)
            self.sync(root)
            changed_head, changed_tail = document.read_text().split('</head>', 1)
            changed_versions, _ = theme.load_asset_versions(root)
            self.assertIn('./rotax-component-studies.css?v=' +
                          changed_versions['engine-explorer/rotax-component-studies.css'] + '#viewer', changed_head)
            self.assertEqual(changed_tail.encode(), tail.encode())
            self.sync(root, check=True)


if __name__ == '__main__':
    unittest.main()
