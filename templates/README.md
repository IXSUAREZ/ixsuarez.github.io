# Graphite Horizon template kit

All seven templates use the same live navigation, footer, typography, materials,
and versioned premium stylesheet. They are authoring sources, not public routes.

| Template | Use | Working example / content owner |
| --- | --- | --- |
| `home.html` | Cinematic entry, sky switch, service rows | `/index.html`, `assets/premium-home.js` |
| `service.html` | Training, discovery, ground and prep pages | `/flight-training-louisville-ky/` |
| `library.html` | Journal index, topic and learning libraries | `/blog/`, `/learn/` |
| `article.html` | General reading pages | `/blog/_template/index.html` is the richer dated blog variant |
| `workspace.html` | Search/detail, calculators and assessment panels | Simply Endorsed, Part 61, FlightRisk |
| `study.html` | Focused dark card learning | `/foi-cards/`, keep its card IDs and app engine |
| `editor.html` | Select, fill, preview, export | `/certificate-generator/`, keep its export engine |

Render a new page with `python3 scripts/render-template.py service path/index.html
--title "Title" --description "Description" --eyebrow "Flight training"
--content /path/to/content.html` (one command). Content is trusted authored HTML.
Existing destinations are never overwritten. Rendering adds the current static
chrome and the stylesheet version. Run the chrome check afterward.

For dated blog posts, keep using `scripts/new-post.py`; it now applies this theme.
For an app extension, use the corresponding working app's components/engine in
the content slot rather than duplicating calculations, saved-state logic, or
exports. Use the existing category tokens in Simply Endorsed and Part 61.

`premium-workspace` is a restrained max-width shell. Use native labelled inputs,
buttons and fieldsets inside it. Shared `.btn--primary`, `.btn--secondary`, and
`.btn--tertiary` styles provide the tactile controls. Do not use category color
for shared navigation or replace category meaning with gold.

After editing premium.css, run `scripts/apply-premium-theme.py` to refresh its
content-based cache version across the site. `scripts/build-flightrisk.py`
rebuilds all three FlightRisk routes into the static site. Neither command
publishes anything.
