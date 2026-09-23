const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const manifest = JSON.parse(read('config/site-pages.json'));
const index = JSON.parse(read('assets/library-index.json'));

test('Learn search contains all 459 current lessons and endorsement references, without Blog posts', () => {
  const expected = manifest.pages.filter(page => page.kind === 'article' && page.indexable && !page.path.startsWith('/blog/'));
  assert.equal(index.length, 459);
  assert.equal(index.length, expected.length);
  assert.deepEqual(new Set(index.map(row => row.path)), new Set(expected.map(page => page.path)));
  for (const row of index) {
    assert.match(row.path, /^\/(?!\/)/);
    assert.ok(fs.existsSync(path.join(root, row.path.slice(1), 'index.html')), row.path);
    assert.ok(Array.isArray(row.stages) && row.stages.length > 0, row.path);
  }
});

test('every preserved Learn collection is reachable from exactly one browse view', () => {
  const html = read('learn/index.html');
  assert.equal(manifest.learnCollections.length, 24);
  assert.equal(manifest.learnCollections.filter(c => c.view === 'paths').length, 5);
  assert.equal(manifest.learnCollections.filter(c => c.view === 'topics').length, 19);
  for (const collection of manifest.learnCollections) {
    assert.ok(html.includes(`href="${collection.path}"`), collection.path);
    assert.ok(fs.existsSync(path.join(root, collection.path.slice(1), 'index.html')), collection.path);
  }
});

test('Blog listing is driven by complete editorial metadata and separate from endorsement references', () => {
  const posts = manifest.pages.filter(page => page.path.startsWith('/blog/') && page.kind === 'article');
  assert.equal(posts.length, 14);
  assert.equal(posts.filter(page => page.editorial?.featured).length, 1);
  for (const post of posts) {
    assert.match(post.editorial.published, /^\d{4}-\d\d-\d\d$/);
    assert.ok(post.editorial.category && post.editorial.heading && post.editorial.readingMinutes > 0);
  }
  const html = read('blog/index.html');
  assert.equal((html.match(/class="blog-story(?: blog-story--featured)?"/g) || []).length, posts.length);
  assert.equal((html.match(/href="\/simply-endorsed\/blog\/"/g) || []).length, 1);
});
