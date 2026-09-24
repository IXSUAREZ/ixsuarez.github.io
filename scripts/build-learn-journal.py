#!/usr/bin/env python3
"""Run the private Learn generator against this checkout, then apply the reader.

The private source corpus stays outside the public repository. Example:
python3 scripts/build-learn-journal.py --generator /path/to/build_learn_library.py
"""
import argparse
import importlib.util
from pathlib import Path
from journal import ROOT, apply


def build(generator):
    spec = importlib.util.spec_from_file_location('journal_learn_generator', generator)
    module = importlib.util.module_from_spec(spec)
    import sys
    sys.modules[spec.name] = module  # dataclass annotations need the module registry
    spec.loader.exec_module(module)
    # Preserve the generator's private input/evidence locations. Redirect only
    # its public output to this isolated checkout, never the original website.
    module.SITE_ROOT = ROOT
    module.LEARN_ROOT = ROOT / 'learn'
    module.main()
    import subprocess
    for script, arguments in [('sync-chrome.py', ['--apply']), ('apply-premium-theme.py', []), ('sync-avionics.py', [])]:
        subprocess.run([sys.executable, str(ROOT / 'scripts' / script), *arguments], check=True)
    apply()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--generator', required=True, type=Path)
    args = parser.parse_args()
    if not args.generator.is_file():
        parser.error('Provide the existing private build_learn_library.py file.')
    build(args.generator.resolve())
