"""Exercise offline revision invalidation in an isolated filesystem fixture."""
import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]


class CacheRefreshTests(unittest.TestCase):
    def test_endorsement_style_data_and_policy_changes_invalidate_only_its_cache(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'scripts').mkdir()
            shutil.copyfile(ROOT / 'scripts/refresh-tactile-caches.py', root / 'scripts/refresh-tactile-caches.py')
            worker = (ROOT / 'simply-endorsed/sw.js').read_text()
            core = re.search(r'const CORE_ASSETS = \[(.*?)\];', worker, re.S).group(1)
            for url in re.findall(r'"([^"]+)"', core):
                rel = url.split('?', 1)[0]
                path = root / rel.lstrip('/') if rel.startswith('/') else root / 'simply-endorsed' / rel
                if rel.endswith('/'):
                    path = path / 'index.html'
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text('fixture for ' + url)
            (root / 'simply-endorsed/sw.js').write_text(worker)
            (root / 'pilotsolve').mkdir()
            (root / 'pilotsolve/index.html').write_text('pilot fixture')
            (root / 'pilotsolve/BUILD.json').write_text(json.dumps({'files': ['index.html']}))
            (root / 'pilotsolve/sw.js').write_text('const CACHE = "pilotsolve-site-abcdef";')

            def refresh():
                subprocess.run(['python3', str(root / 'scripts/refresh-tactile-caches.py')], check=True, capture_output=True)
                return ((root / 'simply-endorsed/sw.js').read_text(), (root / 'pilotsolve/sw.js').read_text())

            previous, pilot = refresh()
            self.assertEqual((previous, pilot), refresh(), 'unchanged input must produce identical workers')
            for rel in ['assets/tool-system/tool-core.css', 'assets/tool-system/simply-endorsed.css',
                        'assets/tool-system/part61.css', 'simply-endorsed/js/app.js']:
                path = root / rel
                path.write_text(path.read_text() + '\nchanged bytes')
                current, same_pilot = refresh()
                self.assertNotEqual(current.splitlines()[0], previous.splitlines()[0], rel)
                self.assertEqual(pilot, same_pilot, 'unrelated PilotSolve cache must remain stable')
                self.assertEqual((current, pilot), refresh())
                previous = current
            path = root / 'simply-endorsed/sw.js'
            path.write_text(previous + '\n// changed worker policy\n')
            current, same_pilot = refresh()
            self.assertNotEqual(current.splitlines()[0], previous.splitlines()[0])
            self.assertEqual(pilot, same_pilot)


if __name__ == '__main__':
    unittest.main()
