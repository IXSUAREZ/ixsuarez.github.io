"""Archiving generated assets must register their retirement automatically."""
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tarfile
import tempfile
import unittest


class ArchiveRetirementTests(unittest.TestCase):
    def test_archive_registers_only_verified_unused_assets(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            root = base / 'site'
            for folder in ['scripts', 'config', 'docs/design', 'pilotsolve/assets',
                           'aero-lab/assets', 'flight-risk-assessment/assets',
                           'engine-explorer/app/assets']:
                (root / folder).mkdir(parents=True)
            script = root / 'scripts/archive-stale-app-styles.py'
            shutil.copy2(Path(__file__).parents[1] / script.name, script)
            registry = root / 'config/theme-assets.json'
            initial = {'managed': [], 'retired': ['older.css']}
            registry.write_text(json.dumps(initial))
            active = 'pilotsolve/assets/current-12345678.js'
            retired = 'pilotsolve/assets/obsolete-12345678.css'
            (root / active).write_text('/* active runtime */')
            (root / retired).write_text('/* obsolete theme */')
            (root / 'pilotsolve/index.html').write_text(
                '<script src="./assets/current-12345678.js"></script>')
            dry = subprocess.run([sys.executable, str(script)], capture_output=True, text=True)
            self.assertEqual(dry.returncode, 0, dry.stderr)
            self.assertEqual(json.loads(dry.stdout)['archive_count'], 1)
            self.assertEqual(json.loads(registry.read_text()), initial)
            self.assertTrue((root / retired).exists())
            archive = base / 'archive'
            result = subprocess.run([sys.executable, str(script), '--archive', str(archive)],
                                    capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertTrue((root / active).exists())
            self.assertFalse((root / retired).exists())
            self.assertEqual(json.loads(registry.read_text())['retired'],
                             sorted(['older.css', retired]))
            with tarfile.open(archive / 'superseded-app-assets.tar.gz') as saved:
                self.assertEqual(saved.extractfile(retired).read(), b'/* obsolete theme */')
            report = json.loads((root / 'docs/design/archived-app-assets.json').read_text())
            self.assertEqual(set(report['files']), {retired})


if __name__ == '__main__':
    unittest.main()
