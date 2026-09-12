import importlib.util
from pathlib import Path
import struct
import unittest

HERE = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('site_audit', HERE / 'scripts' / 'audit-site.py')
audit = importlib.util.module_from_spec(spec); spec.loader.exec_module(audit)

class AuditTests(unittest.TestCase):
  def test_relative_resource_resolves_from_route_directory(self):
    source = HERE / 'blog' / 'index.html'
    self.assertEqual(audit.local_target(source, 'style.css'), HERE / 'blog' / 'style.css')

  def test_logo_and_preview_dimensions_are_distinct_contracts(self):
    self.assertEqual(audit.png_size(HERE / 'assets/identities/home/logo.png'), (512, 512))
    self.assertEqual(audit.png_size(HERE / 'assets/identities/home/preview.png'), (1200, 1200))

  def test_meta_refresh_alias_is_captured_without_primary_route_membership(self):
    parser = audit.PageParser(); parser.feed('<meta http-equiv="refresh" content="0; url=/flight-risk-assessment/">')
    self.assertEqual(parser.refresh, '0; url=/flight-risk-assessment/')
    self.assertIn('/flight-risk-assessment/', parser.refresh)
