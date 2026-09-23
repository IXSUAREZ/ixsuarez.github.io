(function () {
  'use strict';
  const stories = [...document.querySelectorAll('.blog-stories .blog-story')];
  const buttons = [...document.querySelectorAll('[data-blog-category]')];
  const status = document.getElementById('blog-status');
  const more = document.getElementById('blog-show-more');
  if (!stories.length || !status || !more) return;
  let category = '', shown = 6;
  function render() {
    const matched = stories.filter(story => !category || story.dataset.category === category);
    stories.forEach(story => { story.hidden = !matched.includes(story) || matched.indexOf(story) >= shown; });
    status.textContent = matched.length + ' article' + (matched.length === 1 ? '' : 's') + (category ? ' in ' + category : '') + '.';
    more.hidden = matched.length <= shown;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.blogCategory === category)));
  }
  buttons.forEach(button => button.addEventListener('click', () => { category = button.dataset.blogCategory; shown = 6; render(); }));
  more.addEventListener('click', () => { shown += 6; render(); });
  render();
})();
