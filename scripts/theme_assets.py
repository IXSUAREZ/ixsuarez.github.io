"""Byte-bound theme assets shared by synchronization and structural auditing."""
from hashlib import sha256
from html.parser import HTMLParser
from urllib.parse import urlsplit, parse_qs, unquote
import json
import posixpath


def load_asset_versions(root):
    config = json.loads((root / 'config/theme-assets.json').read_text())
    versions = {name: sha256((root / name).read_bytes()).hexdigest()[:10]
                for name in config['managed']}
    return versions, set(config['retired'])


def retired_asset_files(root, retired):
    """Reject restored retired artifacts even when no page references them."""
    return sorted(name for name in retired
                  if (root / name).exists() or (root / name).is_symlink())


class AssetReferences(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'script' and attrs.get('src'):
            self.urls.append(attrs['src'])
        if tag == 'link' and 'stylesheet' in attrs.get('rel', '').split():
            if attrs.get('href'):
                self.urls.append(attrs['href'])


def theme_asset_errors(file, source, versions, retired):
    parser = AssetReferences()
    parser.feed(source)
    errors = []
    for url in parser.urls:
        parts = urlsplit(url)
        if parts.scheme or parts.netloc:
            continue
        path = unquote(parts.path)
        asset = posixpath.normpath(path.lstrip('/') if path.startswith('/') else
                                  posixpath.join(posixpath.dirname(file), path))
        if asset in retired:
            errors.append('retired theme asset: ' + asset)
        if asset in versions and parse_qs(parts.query).get('v') != [versions[asset]]:
            errors.append('stale/missing theme asset version: ' + asset)
    return sorted(set(errors))
