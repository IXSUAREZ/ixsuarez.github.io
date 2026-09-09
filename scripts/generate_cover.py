#!/usr/bin/env python3
"""
generate_cover.py
Renders pixel-perfect 1200x1200px Open Graph cover cards matching the Simply Endorsed CFI aesthetic.
Uses Google Chrome in headless mode.
"""

import os
import sys
import argparse
import subprocess
import tempfile

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}

  body, html {{
    width: 1200px;
    height: 1200px;
    overflow: hidden;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }}

  .canvas {{
    width: 1200px;
    height: 1200px;
    position: relative;
    background: {bg_gradient};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100px 80px;
    text-align: center;
    overflow: hidden;
  }}

  {extra_css}

  .badge-container {{
    margin-bottom: {badge_margin_bottom};
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
  }}

  .badge-outer {{
    width: {badge_size}px;
    height: {badge_size}px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: {badge_shadow};
    position: relative;
    {badge_style}
  }}

  .badge-inner {{
    width: {inner_size}px;
    height: {inner_size}px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }}

  .badge-inner svg, .badge-inner img {{
    width: 100%;
    height: 100%;
    display: block;
  }}

  .text-container {{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    max-width: 1040px;
    position: relative;
    z-index: 2;
  }}

  .title {{
    font-size: {title_font_size}px;
    font-weight: 800;
    line-height: 1.12;
    letter-spacing: -0.035em;
    color: {title_color};
    text-shadow: {title_shadow};
  }}

  .subtitle {{
    font-size: {subtitle_font_size}px;
    font-weight: 500;
    line-height: 1.35;
    letter-spacing: -0.015em;
    color: {subtitle_color};
    text-shadow: {subtitle_shadow};
    max-width: 900px;
  }}
</style>
</head>
<body>
  <div class="canvas">
    {bg_decorations}
    <div class="badge-container">
      <div class="badge-outer">
        <div class="badge-inner">
          {icon_content}
        </div>
      </div>
    </div>
    <div class="text-container">
      <h1 class="title">{title}</h1>
      <p class="subtitle">{subtitle}</p>
    </div>
  </div>
</body>
</html>
"""

def render_cover(
    output_path: str,
    title: str,
    subtitle: str,
    bg_gradient: str,
    icon_content: str,
    badge_style: str = "",
    badge_shadow: str = "0 24px 64px rgba(0, 0, 0, 0.40), 0 0 0 1px rgba(255, 255, 255, 0.16)",
    badge_size: int = 420,
    inner_size: int = 420,
    badge_margin_bottom: str = "80px",
    title_font_size: int = 76,
    subtitle_font_size: int = 34,
    title_color: str = "#FFFFFF",
    subtitle_color: str = "rgba(255, 255, 255, 0.92)",
    title_shadow: str = "0 4px 24px rgba(0,0,0,0.25)",
    subtitle_shadow: str = "0 2px 12px rgba(0,0,0,0.20)",
    bg_decorations: str = "",
    extra_css: str = ""
):
    html = HTML_TEMPLATE.format(
        bg_gradient=bg_gradient,
        icon_content=icon_content,
        badge_style=badge_style,
        badge_shadow=badge_shadow,
        badge_size=badge_size,
        inner_size=inner_size,
        badge_margin_bottom=badge_margin_bottom,
        title=title,
        subtitle=subtitle,
        title_font_size=title_font_size,
        subtitle_font_size=subtitle_font_size,
        title_color=title_color,
        subtitle_color=subtitle_color,
        title_shadow=title_shadow,
        subtitle_shadow=subtitle_shadow,
        bg_decorations=bg_decorations,
        extra_css=extra_css
    )

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False) as f:
        f.write(html)
        tmp_html_path = f.name

    try:
        cmd = [
            CHROME_BIN,
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            f"--screenshot={output_path}",
            "--window-size=1200,1200",
            "--default-background-color=00000000",
            f"file://{tmp_html_path}"
        ]
        subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"Rendered {output_path} successfully ({os.path.getsize(output_path)} bytes)")
    finally:
        if os.path.exists(tmp_html_path):
            os.remove(tmp_html_path)

PART_61_SVG = """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="p61-disc" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FB923C"/>
      <stop offset="40%" stop-color="#EA580C"/>
      <stop offset="100%" stop-color="#C2410C"/>
    </linearGradient>
    <radialGradient id="p61-glow" cx="35%" cy="25%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Main outer disc -->
  <circle cx="256" cy="256" r="256" fill="url(#p61-disc)"/>
  <circle cx="256" cy="256" r="256" fill="url(#p61-glow)"/>
  <!-- Layered depth rings -->
  <circle cx="256" cy="256" r="248" fill="none" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="6"/>
  <circle cx="256" cy="256" r="214" fill="none" stroke="#7C2D12" stroke-opacity="0.28" stroke-width="10"/>
  <!-- Cardinal tick marks -->
  <g stroke="#FFFFFF" stroke-width="22" stroke-linecap="round" opacity="0.95">
    <line x1="256" y1="76" x2="256" y2="124"/>
    <line x1="436" y1="256" x2="388" y2="256"/>
    <line x1="256" y1="436" x2="256" y2="388"/>
    <line x1="76" y1="256" x2="124" y2="256"/>
  </g>
  <!-- 5-minute minor ticks -->
  <g stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" opacity="0.5">
    <line x1="383" y1="129" x2="353" y2="159"/>
    <line x1="383" y1="383" x2="353" y2="353"/>
    <line x1="129" y1="383" x2="159" y2="353"/>
    <line x1="129" y1="129" x2="159" y2="159"/>
  </g>
  <!-- Dial hands (10:10 / 1:50) -->
  <g stroke="#FFFFFF" stroke-linecap="round">
    <line x1="256" y1="256" x2="356" y2="146" stroke-width="30"/>
    <line x1="256" y1="256" x2="176" y2="196" stroke-width="26"/>
  </g>
  <!-- Center hub -->
  <circle cx="256" cy="256" r="26" fill="#7C2D12"/>
  <circle cx="256" cy="256" r="12" fill="#EA580C"/>
</svg>
"""

FLIGHTRISK_SVG = """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <clipPath id="disc-clip">
      <circle cx="256" cy="256" r="256"/>
    </clipPath>
    <linearGradient id="sky-teal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0D9488"/>
      <stop offset="60%" stop-color="#0F766E"/>
      <stop offset="100%" stop-color="#115E59"/>
    </linearGradient>
    <linearGradient id="ground-slate" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="50%" stop-color="#17262C"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <radialGradient id="glass-reflect" cx="35%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <g clip-path="url(#disc-clip)">
    <!-- Sky Half -->
    <rect x="0" y="0" width="512" height="256" fill="url(#sky-teal)"/>
    <!-- Ground Half -->
    <rect x="0" y="256" width="512" height="256" fill="url(#ground-slate)"/>
    <!-- Glass sheen -->
    <circle cx="256" cy="256" r="256" fill="url(#glass-reflect)"/>

    <!-- Pitch ladder lines -->
    <g stroke="#FFFFFF" stroke-linecap="round" opacity="0.65">
      <line x1="236" y1="160" x2="276" y2="160" stroke-width="7"/>
      <line x1="214" y1="208" x2="298" y2="208" stroke-width="8"/>
      <line x1="214" y1="304" x2="298" y2="304" stroke-width="8"/>
      <line x1="236" y1="352" x2="276" y2="352" stroke-width="7"/>
    </g>

    <!-- White Horizon line -->
    <line x1="0" y1="256" x2="512" y2="256" stroke="#FFFFFF" stroke-width="5" stroke-opacity="0.45"/>

    <!-- Roll pointer / bank index at top -->
    <polygon points="256,48 244,72 268,72" fill="#F59E0B"/>
    <!-- Roll index ticks along top rim -->
    <g stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.6">
      <line x1="166" y1="100" x2="178" y2="120"/>
      <line x1="194" y1="78" x2="202" y2="98"/>
      <line x1="224" y1="64" x2="228" y2="84"/>
      <line x1="288" y1="64" x2="284" y2="84"/>
      <line x1="318" y1="78" x2="310" y2="98"/>
      <line x1="346" y1="100" x2="334" y2="120"/>
    </g>

    <!-- Miniature aircraft symbol -->
    <line x1="106" y1="256" x2="208" y2="256" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round"/>
    <line x1="208" y1="256" x2="208" y2="278" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round"/>
    <line x1="304" y1="256" x2="406" y2="256" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round"/>
    <line x1="304" y1="256" x2="304" y2="278" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round"/>
    <circle cx="256" cy="256" r="22" fill="#FFFFFF"/>
    <circle cx="256" cy="256" r="10" fill="#F59E0B"/>
  </g>

  <!-- Instrument Bezel Ring -->
  <circle cx="256" cy="256" r="250" fill="none" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="6"/>
  <circle cx="256" cy="256" r="216" fill="none" stroke="#042F2E" stroke-opacity="0.32" stroke-width="10"/>
</svg>
"""

FOI_SVG = """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="foi-disc" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4F46E5"/>
      <stop offset="45%" stop-color="#4338CA"/>
      <stop offset="100%" stop-color="#312E81"/>
    </linearGradient>
    <radialGradient id="foi-glow" cx="30%" cy="20%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <filter id="card-depth" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#0F0D2E" flood-opacity="0.55"/>
    </filter>
  </defs>

  <!-- Base deep indigo circular disc -->
  <circle cx="256" cy="256" r="256" fill="url(#foi-disc)"/>
  <circle cx="256" cy="256" r="256" fill="url(#foi-glow)"/>
  <!-- Bezel depth rings -->
  <circle cx="256" cy="256" r="248" fill="none" stroke="#FFFFFF" stroke-opacity="0.22" stroke-width="6"/>
  <circle cx="256" cy="256" r="214" fill="none" stroke="#1E1B4B" stroke-opacity="0.38" stroke-width="10"/>

  <!-- Tilted Back Card -->
  <g transform="rotate(-9 256 256)">
    <rect x="116" y="131" width="280" height="250" rx="30" fill="#818CF8" fill-opacity="0.4" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="5"/>
  </g>

  <!-- Front Flashcard -->
  <rect x="116" y="131" width="280" height="250" rx="30" fill="#FFFFFF" filter="url(#card-depth)"/>
  <!-- Subtle inner border on card -->
  <rect x="116" y="131" width="280" height="250" rx="30" fill="none" stroke="#E0E7FF" stroke-width="4"/>

  <!-- CFI Winged Teaching Crest on the card -->
  <g transform="translate(256, 198)">
    <path d="M -20 -4 C -45 -18, -78 -20, -104 -6 C -86 11, -56 14, -28 8 Z" fill="#4338CA"/>
    <path d="M -20 8 C -40 1, -66 -1, -88 12 C -70 24, -45 24, -22 18 Z" fill="#6366F1" opacity="0.9"/>
    <path d="M 20 -4 C 45 -18, 78 -20, 104 -6 C 86 11, 56 14, 28 8 Z" fill="#4338CA"/>
    <path d="M 20 8 C 40 1, 66 -1, 88 12 C 70 24, 45 24, 22 18 Z" fill="#6366F1" opacity="0.9"/>
    <path d="M 0 -20 L 5.8 -6 L 20 -5 L 10 5 L 12.5 20 L 0 11.5 L -12.5 20 L -10 5 L -20 -5 L -5.8 -6 Z" fill="#F59E0B"/>
  </g>

  <!-- Flashcard content lines -->
  <rect x="156" y="248" width="200" height="18" rx="9" fill="#4338CA" fill-opacity="0.95"/>
  <rect x="156" y="280" width="164" height="13" rx="6.5" fill="#818CF8" fill-opacity="0.65"/>
  <rect x="156" y="304" width="184" height="13" rx="6.5" fill="#818CF8" fill-opacity="0.65"/>
  <rect x="156" y="328" width="128" height="13" rx="6.5" fill="#818CF8" fill-opacity="0.65"/>

  <!-- Success check pip -->
  <circle cx="356" cy="342" r="16" fill="#10B981"/>
  <path d="M 349 342 L 354 347 L 364 337" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>
"""

COVERS = {
    "part-61-calculator": {
        "output_path": "part-61-calculator/icons/og-part-61-calculator.png",
        "title": "Part 61 Calculator",
        "subtitle": "Free FAA Training Time & Cost Wizard",
        "bg_gradient": "linear-gradient(140deg, #7C2D12 0%, #9A3412 28%, #C2410C 65%, #EA580C 100%)",
        "icon_content": PART_61_SVG,
        "title_font_size": 76,
        "subtitle_font_size": 34,
        "badge_shadow": "0 24px 64px rgba(0, 0, 0, 0.40), 0 0 0 1px rgba(255, 255, 255, 0.16)"
    },
    "flight-risk": {
        "output_path": "flight-risk-assessment/og-flight-risk.png",
        "title": "FlightRisk",
        "subtitle": "Free FAA PAVE Flight Risk Assessment Tool",
        "bg_gradient": "linear-gradient(140deg, #051A18 0%, #064E3B 32%, #0A3C38 65%, #0F766E 100%)",
        "icon_content": FLIGHTRISK_SVG,
        "title_font_size": 78,
        "subtitle_font_size": 34,
        "badge_shadow": "0 24px 64px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.16)"
    },
    "foi-cards": {
        "output_path": "foi-cards/og-foi-cards.png",
        "title": "FOI Cards",
        "subtitle": "FAA Fundamentals of Instructing Flashcards",
        "bg_gradient": "linear-gradient(140deg, #181438 0%, #1E1B4B 32%, #312E81 68%, #4338CA 100%)",
        "icon_content": FOI_SVG,
        "title_font_size": 78,
        "subtitle_font_size": 34,
        "badge_shadow": "0 24px 64px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.16)"
    }
}

def main():
    parser = argparse.ArgumentParser(description="Generate 1200x1200px OG covers")
    parser.add_argument("--tool", choices=list(COVERS.keys()) + ["all"], default="all", help="Tool to generate cover for")
    parser.add_argument("--all", action="store_true", help="Generate covers for all tools")
    args = parser.parse_args()

    targets = list(COVERS.keys()) if (args.all or args.tool == "all") else [args.tool]
    for key in targets:
        cfg = COVERS[key]
        print(f"Generating cover for {key} -> {cfg['output_path']}...")
        render_cover(**cfg)

if __name__ == "__main__":
    main()
