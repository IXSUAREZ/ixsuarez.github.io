"""Generator persistence and catalog-safety checks without modifying generated pages."""
import importlib.util
import json
from pathlib import Path
from types import SimpleNamespace
import unittest

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location('tool_catalog', ROOT / 'scripts/render-tool-catalog.py')
RENDERER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(RENDERER)


class Source:
    name = 'index.html'

    def __init__(self, text, parent='site'):
        self.text = text
        self.parent = SimpleNamespace(name=parent)

    def read_text(self):
        return self.text


class ToolCatalogGeneratorTests(unittest.TestCase):
    def test_tools_regeneration_retires_carousel_and_keeps_document_shell(self):
        source = '<html><head></head><body><nav>Current navigation</nav><main class="old"><div class="orbit-rail">Old launcher</div></main><footer>Footer</footer></body></html>'
        first = RENDERER.transform(Source(source, 'tools'))
        self.assertNotIn('orbit-rail', first)
        self.assertIn('<nav>Current navigation</nav>', first)
        self.assertIn('<footer>Footer</footer>', first)
        self.assertEqual(first.count('class="tool-app"'), len(RENDERER.data()['tools']))
        self.assertEqual(first, RENDERER.transform(Source(first, 'tools')))
        self.assertEqual(first.count('/assets/tool-catalog.js'), 1)
        self.assertEqual(first.count('/assets/tool-catalog.css'), 1)

    def test_home_regeneration_adds_every_app_and_keeps_later_sections(self):
        source = (ROOT / 'index.html').read_text()
        first = RENDERER.transform(Source(source))
        self.assertEqual(first.count('data-cta-id="home-tools-'), len(RENDERER.data()['tools']))
        self.assertIn('<section id="faq"', first)
        self.assertEqual(first, RENDERER.transform(Source(first)))
        self.assertEqual(first.count('/assets/tool-catalog.js'), 1)
        self.assertEqual(first.count('/assets/tool-catalog.css'), 1)

    def test_catalog_order_and_destinations_are_identical_on_home_and_tools(self):
        tools = RENDERER.tools_main()
        home = RENDERER.home_cards()
        expected = [tool['path'] for tool in RENDERER.data()['tools']]
        import re
        pattern = r'<a class="tool-app" href="([^"]+)"'
        self.assertEqual(re.findall(pattern, tools), expected)
        self.assertEqual(re.findall(pattern, home), expected)
        self.assertNotIn('application/json', tools)
        self.assertNotIn('<details', tools)

    def test_all_configured_tools_have_a_group_destination_and_existing_artwork(self):
        catalog = json.loads((ROOT / 'config/tool-catalog.json').read_text())
        groups = {group['id'] for group in catalog['groups']}
        ids = [tool['id'] for tool in catalog['tools']]
        self.assertEqual(len(ids), len(set(ids)))
        for tool in catalog['tools']:
            self.assertIn(tool['group'], groups)
            self.assertTrue((ROOT / tool['path'].lstrip('/') / 'index.html').is_file())
            self.assertTrue((ROOT / 'assets/identities' / tool['id'] / 'logo.png').is_file())

    def test_catalog_strings_are_escaped_in_links_labels_and_descriptions(self):
        real_data = RENDERER.data
        RENDERER.data = lambda: {
            'groups': [{'id': 'group', 'name': '<Planning>'}],
            'tools': [{'id': 'app', 'path': '/app/?q="value"', 'name': '<App>', 'group': 'group',
                       'description': '<script>alert(1)</script>', 'compatibility': 'Phone & desktop'}],
        }
        try:
            result = RENDERER.app_grid('directory')
            self.assertNotIn('<script>', result)
            self.assertIn('&lt;App&gt;', result)
            self.assertIn('&lt;Planning&gt;', result)
            self.assertIn('/app/?q=&quot;value&quot;', result)
            self.assertIn('Phone &amp; desktop', result)
        finally:
            RENDERER.data = real_data


if __name__ == '__main__':
    unittest.main()
