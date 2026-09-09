#!/usr/bin/env python3
"""
generate_core_covers.py
Generates 1200x1200px Open Graph cover images matching the Simply Endorsed CFI aesthetic
for SuarezCFI homepage, core services, and content hubs.
"""

import os
import sys
import base64
from generate_cover import render_cover

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def get_b64_image(rel_path):
    abs_path = os.path.join(BASE_DIR, rel_path)
    with open(abs_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

# Common plane path from brand favicon.svg
PLANE_PATH = "M32 7c1.7 0 3 1.2 3.4 2.9l4.2 19.8 16.8 8.2c1 .5 1.6 1.5 1.6 2.6v3.9c0 1.1-1 1.9-2.1 1.6l-15.5-3.8-3 12.2 5 4.1c.4.4.7.9.7 1.5V63H20.9v-2.3c0-.6.3-1.1.7-1.5l5-4.1-3-12.2L8.1 46.7c-1.1.3-2.1-.5-2.1-1.6v-3.9c0-1.1.6-2.1 1.6-2.6l16.8-8.2 4.2-19.8C29 8.2 30.3 7 32 7z"

def generate_homepage_variants():
    print("\n--- 1. Generating Homepage Variants ---")
    sky_b64 = get_b64_image("assets/premium/sky-day.jpg")

    # Variant A: Daylight Sky with glowing golden yellow airplane badge
    plane_svg_sky = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
      <circle cx="256" cy="256" r="200" fill="#FFD000"/>
      <circle cx="256" cy="256" r="200" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="6"/>
      <g transform="translate(76 76) scale(5.6)">
        <path d="{PLANE_PATH}" fill="#08090B"/>
      </g>
    </svg>'''

    badge_style_sky = '''
      background: rgba(255, 255, 255, 0.55);
      border: 3px solid rgba(255, 255, 255, 0.75);
      box-shadow: 0 28px 70px rgba(13, 19, 48, 0.28), 0 0 50px rgba(255, 208, 0, 0.45), inset 0 2px 6px rgba(255, 255, 255, 0.8);
    '''

    bg_sky = f'''
      url('data:image/jpeg;base64,{sky_b64}') center / cover no-repeat,
      linear-gradient(180deg, #60A5FA 0%, #93C5FD 50%, #BFDBFE 100%)
    '''

    render_cover(
        output_path=os.path.join(BASE_DIR, "assets/og-home-sky.png"),
        title="SuarezCFI.com",
        subtitle="Louisville Flight &amp; Ground Instruction · Bowman Field (KLOU)",
        bg_gradient=bg_sky,
        icon_content=plane_svg_sky,
        badge_style=badge_style_sky,
        badge_size=420,
        inner_size=320,
        title_color="#0D1330",
        subtitle_color="rgba(13, 19, 48, 0.88)",
        title_shadow="0 2px 18px rgba(255, 255, 255, 0.85)",
        subtitle_shadow="none"
    )

    # Variant B: Rich warm yellow aviation background with solid navy airplane badge
    plane_svg_yellow = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
      <circle cx="256" cy="256" r="200" fill="#0D1330"/>
      <circle cx="256" cy="256" r="200" stroke="#FFD000" stroke-opacity="0.35" stroke-width="6"/>
      <g transform="translate(76 76) scale(5.6)">
        <path d="{PLANE_PATH}" fill="#FFD000"/>
      </g>
    </svg>'''

    badge_style_yellow = '''
      background: #090E24;
      border: 3px solid rgba(255, 208, 0, 0.35);
      box-shadow: 0 32px 80px rgba(13, 19, 48, 0.42), inset 0 2px 6px rgba(255, 255, 255, 0.15);
    '''

    bg_yellow = "radial-gradient(circle at 50% 36%, #FFDB26 0%, #FFD000 40%, #F5B800 75%, #E5A800 100%)"

    render_cover(
        output_path=os.path.join(BASE_DIR, "assets/og-home-yellow.png"),
        title="SuarezCFI.com",
        subtitle="Louisville Flight &amp; Ground Instruction · Bowman Field (KLOU)",
        bg_gradient=bg_yellow,
        icon_content=plane_svg_yellow,
        badge_style=badge_style_yellow,
        badge_size=420,
        inner_size=320,
        title_color="#0D1330",
        subtitle_color="rgba(13, 19, 48, 0.88)",
        title_shadow="none",
        subtitle_shadow="none"
    )

    # Save chosen primary to assets/og-home-cover.png
    render_cover(
        output_path=os.path.join(BASE_DIR, "assets/og-home-cover.png"),
        title="SuarezCFI.com",
        subtitle="Louisville Flight &amp; Ground Instruction · Bowman Field (KLOU)",
        bg_gradient=bg_yellow,
        icon_content=plane_svg_yellow,
        badge_style=badge_style_yellow,
        badge_size=420,
        inner_size=320,
        title_color="#0D1330",
        subtitle_color="rgba(13, 19, 48, 0.88)",
        title_shadow="none",
        subtitle_shadow="none"
    )

    # Overwrite assets/og-image.jpg with 1200x1200px version
    render_cover(
        output_path=os.path.join(BASE_DIR, "assets/og-image.jpg"),
        title="SuarezCFI.com",
        subtitle="Louisville Flight &amp; Ground Instruction · Bowman Field (KLOU)",
        bg_gradient=bg_yellow,
        icon_content=plane_svg_yellow,
        badge_style=badge_style_yellow,
        badge_size=420,
        inner_size=320,
        title_color="#0D1330",
        subtitle_color="rgba(13, 19, 48, 0.88)",
        title_shadow="none",
        subtitle_shadow="none"
    )

def generate_discovery_flight():
    print("\n--- 2. Generating Discovery Flight Cover ---")
    # Climbing trainer aircraft silhouette banked over a golden sunrise horizon arc
    discovery_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
      <defs>
        <linearGradient id="sunGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#F59E0B"/>
          <stop offset="60%" stop-color="#FBBF24"/>
          <stop offset="100%" stop-color="#FEF08A"/>
        </linearGradient>
        <linearGradient id="skyDisk" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0284C7"/>
          <stop offset="100%" stop-color="#0369A1"/>
        </linearGradient>
      </defs>
      <!-- Base disk -->
      <circle cx="256" cy="256" r="200" fill="url(#skyDisk)"/>
      <circle cx="256" cy="256" r="200" stroke="#7DD3FC" stroke-opacity="0.4" stroke-width="6"/>
      
      <!-- Golden rising sun disk in background -->
      <circle cx="256" cy="256" r="148" fill="url(#sunGrad)"/>
      
      <!-- Atmospheric horizon rings -->
      <path d="M66 270 Q 256 210 446 270" stroke="#FFFFFF" stroke-opacity="0.45" stroke-width="5" fill="none"/>
      <path d="M86 312 Q 256 260 426 312" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="4" fill="none"/>
      
      <!-- Climbing Trainer Aircraft silhouette (angled 28 deg upward, bold & prominent) -->
      <g transform="translate(256 244) rotate(-26) scale(1.18) translate(-256 -244)">
        <path d="M256 120 C262 120 268 126 270 134 L282 210 L370 248 C378 252 382 258 382 266 L382 280 C382 286 376 290 370 288 L278 266 L268 334 L294 360 C298 364 300 370 300 376 L300 390 L212 390 L212 376 C212 370 214 364 218 360 L244 334 L234 266 L142 288 C136 290 130 286 130 280 L130 266 C130 258 134 252 142 248 L230 210 L242 134 C244 126 250 120 256 120 Z" fill="#FFFFFF"/>
      </g>
    </svg>'''

    badge_style = '''
      background: radial-gradient(circle, rgba(2, 132, 199, 0.45) 0%, rgba(3, 105, 161, 0.20) 70%, rgba(255, 255, 255, 0.08) 100%);
      border: 3px solid rgba(125, 211, 252, 0.35);
      box-shadow: 0 28px 70px rgba(0, 0, 0, 0.42), 0 0 45px rgba(2, 132, 199, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.25);
    '''

    bg_gradient = "radial-gradient(circle at 50% 36%, #0284C7 0%, #0369A1 38%, #075985 70%, #082F49 90%, #051A29 100%)"

    render_cover(
        output_path=os.path.join(BASE_DIR, "discovery-flight-louisville-ky/og-discovery-flight.png"),
        title="Discovery Flight",
        subtitle="Your First Flight Lesson at Bowman Field · Louisville, KY",
        bg_gradient=bg_gradient,
        icon_content=discovery_svg,
        badge_style=badge_style,
        badge_size=420,
        inner_size=320,
        title_font_size=78,
        subtitle_font_size=34
    )

def generate_ground_school():
    print("\n--- 3. Generating Ground School Cover ---")
    ground_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
      <defs>
        <linearGradient id="slateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1E293B"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
      </defs>
      <circle cx="256" cy="256" r="200" fill="url(#slateGrad)"/>
      <circle cx="256" cy="256" r="200" stroke="#38BDF8" stroke-opacity="0.35" stroke-width="6"/>
      
      <!-- Outer Compass / Flight Computer Ring -->
      <circle cx="256" cy="256" r="176" stroke="#64748B" stroke-width="4" stroke-dasharray="8 8" opacity="0.65"/>
      <circle cx="256" cy="256" r="148" stroke="#38BDF8" stroke-width="3" opacity="0.45"/>
      
      <!-- Cardinal marks N, E, S, W ticks -->
      <g stroke="#38BDF8" stroke-width="6" stroke-linecap="round">
        <line x1="256" y1="88" x2="256" y2="112"/>
        <line x1="424" y1="256" x2="400" y2="256"/>
        <line x1="256" y1="424" x2="256" y2="400"/>
        <line x1="88" y1="256" x2="112" y2="256"/>
      </g>
      
      <!-- Intermediate ticks -->
      <g stroke="#94A3B8" stroke-width="4" stroke-linecap="round" opacity="0.75">
        <line x1="376" y1="136" x2="360" y2="152"/>
        <line x1="376" y1="376" x2="360" y2="360"/>
        <line x1="136" y1="376" x2="152" y2="360"/>
        <line x1="136" y1="136" x2="152" y2="152"/>
      </g>
      
      <!-- Open Ground School Handbook symbol (scaled up) -->
      <g transform="translate(256 268) scale(1.15) translate(-256 -268)">
        <path d="M256 210 C216 170 144 170 120 180 L120 330 C144 320 216 320 256 350 C296 320 368 320 392 330 L392 180 C368 170 296 170 256 210 Z" fill="#0F172A" stroke="#FFFFFF" stroke-width="12" stroke-linejoin="round"/>
        <line x1="256" y1="210" x2="256" y2="350" stroke="#FFFFFF" stroke-width="10"/>
        <path d="M150 230 Q 195 224 232 242" stroke="#38BDF8" stroke-width="6" stroke-linecap="round"/>
        <path d="M150 262 Q 195 256 232 274" stroke="#94A3B8" stroke-width="6" stroke-linecap="round"/>
        <path d="M280 242 Q 317 224 362 230" stroke="#38BDF8" stroke-width="6" stroke-linecap="round"/>
        <path d="M280 274 Q 317 256 362 262" stroke="#94A3B8" stroke-width="6" stroke-linecap="round"/>
      </g>
      
      <!-- Aeronautical Compass Course Arrow / Star at top of book -->
      <polygon points="256,126 268,156 256,150 244,156" fill="#FFD000"/>
    </svg>'''

    badge_style = '''
      background: radial-gradient(circle, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.25) 70%, rgba(255, 255, 255, 0.08) 100%);
      border: 3px solid rgba(56, 189, 248, 0.25);
      box-shadow: 0 28px 70px rgba(0, 0, 0, 0.45), inset 0 2px 6px rgba(255, 255, 255, 0.2);
    '''

    bg_gradient = "radial-gradient(circle at 50% 36%, #1E293B 0%, #0F172A 45%, #0A101D 80%, #05080E 100%)"

    render_cover(
        output_path=os.path.join(BASE_DIR, "ground-school-louisville-ky/og-ground-school.png"),
        title="Ground Instruction",
        subtitle="One-on-One FAA Ground School · Louisville &amp; Remote",
        bg_gradient=bg_gradient,
        icon_content=ground_svg,
        badge_style=badge_style,
        badge_size=420,
        inner_size=320,
        title_font_size=78,
        subtitle_font_size=34
    )

def generate_faa_written_prep():
    print("\n--- 4. Generating FAA Written Test Prep Cover ---")
    # FAA Knowledge Test badge with prominent wings and bold white verification checkmark
    written_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
      <defs>
        <linearGradient id="cyanDisk" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0E3A5A"/>
          <stop offset="100%" stop-color="#071E30"/>
        </linearGradient>
        <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38BDF8"/>
          <stop offset="100%" stop-color="#0284C7"/>
        </linearGradient>
      </defs>
      <circle cx="256" cy="256" r="200" fill="url(#cyanDisk)"/>
      <circle cx="256" cy="256" r="200" stroke="#06B6D4" stroke-opacity="0.35" stroke-width="6"/>
      
      <!-- Radiating knowledge test circle -->
      <circle cx="256" cy="256" r="172" stroke="#0891B2" stroke-width="3" stroke-dasharray="6 6" opacity="0.6"/>
      
      <!-- Scaled up Aviator wings -->
      <g fill="url(#wingGrad)" opacity="0.95" transform="translate(256 256) scale(1.22) translate(-256 -256)">
        <path d="M220 256 L70 200 C85 226 112 250 148 262 L206 276 Z"/>
        <path d="M220 272 L96 248 C114 272 144 290 180 296 L212 292 Z"/>
        <path d="M220 288 L122 288 C140 306 170 318 202 320 L214 306 Z"/>
        
        <path d="M292 256 L442 200 C427 226 400 250 364 262 L306 276 Z"/>
        <path d="M292 272 L416 248 C398 272 368 290 332 296 L300 292 Z"/>
        <path d="M292 288 L390 288 C372 306 342 318 310 320 L298 306 Z"/>
      </g>
      
      <!-- Central Checkmark Badge / Shield (Bold & large) -->
      <circle cx="256" cy="256" r="98" fill="#0A2540" stroke="#FFFFFF" stroke-width="10"/>
      
      <!-- Prominent White Verification Checkmark -->
      <path d="M202 256 L242 296 L316 216" stroke="#FFFFFF" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
      
      <!-- Knowledge test star at top -->
      <polygon points="256,104 266,130 294,130 272,146 280,172 256,156 232,172 240,146 218,130 246,130" fill="#38BDF8"/>
    </svg>'''

    badge_style = '''
      background: radial-gradient(circle, rgba(14, 58, 90, 0.5) 0%, rgba(7, 30, 48, 0.25) 70%, rgba(255, 255, 255, 0.08) 100%);
      border: 3px solid rgba(6, 182, 212, 0.35);
      box-shadow: 0 28px 70px rgba(0, 0, 0, 0.45), 0 0 45px rgba(6, 182, 212, 0.25), inset 0 2px 6px rgba(255, 255, 255, 0.2);
    '''

    bg_gradient = "radial-gradient(circle at 50% 36%, #0E3A5A 0%, #0A2540 45%, #061729 80%, #030C16 100%)"

    render_cover(
        output_path=os.path.join(BASE_DIR, "faa-written-test-prep/og-written-prep.png"),
        title="FAA Written Test Prep",
        subtitle="Structured Study &amp; Endorsement Prep for FAA Knowledge Tests",
        bg_gradient=bg_gradient,
        icon_content=written_svg,
        badge_style=badge_style,
        badge_size=420,
        inner_size=320,
        title_font_size=78,
        subtitle_font_size=34
    )

def generate_checkride_oral_prep():
    print("\n--- 5. Generating Checkride Oral Prep Cover ---")
    # FAA ACS Practical Test Gold Seal with prominent gold seal and checklist shield
    oral_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
      <defs>
        <linearGradient id="navySeal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#111E38"/>
          <stop offset="100%" stop-color="#080F1E"/>
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDE68A"/>
          <stop offset="50%" stop-color="#F59E0B"/>
          <stop offset="100%" stop-color="#D97706"/>
        </linearGradient>
      </defs>
      <circle cx="256" cy="256" r="200" fill="url(#navySeal)"/>
      <circle cx="256" cy="256" r="200" stroke="#F59E0B" stroke-opacity="0.4" stroke-width="6"/>
      
      <!-- Outer Notched Practical Test Gold Seal rim (Large & Prominent) -->
      <circle cx="256" cy="256" r="182" stroke="url(#goldGrad)" stroke-width="8"/>
      <circle cx="256" cy="256" r="166" stroke="#FBBF24" stroke-width="3" stroke-dasharray="8 8" opacity="0.8"/>
      
      <!-- Laurel Wreath Leaves (Scaled up) -->
      <g fill="url(#goldGrad)" opacity="0.9">
        <ellipse cx="120" cy="216" rx="18" ry="9" transform="rotate(-30 120 216)"/>
        <ellipse cx="112" cy="256" rx="18" ry="9" transform="rotate(-10 112 256)"/>
        <ellipse cx="120" cy="296" rx="18" ry="9" transform="rotate(15 120 296)"/>
        <ellipse cx="144" cy="336" rx="18" ry="9" transform="rotate(40 144 336)"/>
        <ellipse cx="180" cy="368" rx="18" ry="9" transform="rotate(60 180 368)"/>
        
        <ellipse cx="392" cy="216" rx="18" ry="9" transform="rotate(30 392 216)"/>
        <ellipse cx="400" cy="256" rx="18" ry="9" transform="rotate(10 400 256)"/>
        <ellipse cx="392" cy="296" rx="18" ry="9" transform="rotate(-15 392 296)"/>
        <ellipse cx="368" cy="336" rx="18" ry="9" transform="rotate(-40 368 336)"/>
        <ellipse cx="332" cy="368" rx="18" ry="9" transform="rotate(-60 332 368)"/>
      </g>
      
      <!-- Central ACS Checklist Shield (Scaled up) -->
      <g transform="translate(256 256) scale(1.22) translate(-256 -256)">
        <path d="M256 160 C290 160 318 174 322 216 C322 280 274 324 256 342 C238 324 190 280 190 216 C194 174 222 160 256 160 Z" fill="#0A1324" stroke="url(#goldGrad)" stroke-width="8"/>
        <path d="M222 246 L248 272 L294 218" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      
      <!-- Gold star at crown -->
      <polygon points="256,108 264,124 282,124 268,136 274,152 256,140 238,152 244,136 230,124 248,124" fill="url(#goldGrad)"/>
    </svg>'''

    badge_style = '''
      background: radial-gradient(circle, rgba(17, 30, 56, 0.5) 0%, rgba(10, 19, 36, 0.25) 70%, rgba(255, 255, 255, 0.08) 100%);
      border: 3px solid rgba(245, 158, 11, 0.35);
      box-shadow: 0 28px 70px rgba(0, 0, 0, 0.45), 0 0 45px rgba(245, 158, 11, 0.25), inset 0 2px 6px rgba(255, 255, 255, 0.2);
    '''

    bg_gradient = "radial-gradient(circle at 50% 36%, #111E38 0%, #0A1324 45%, #070D18 80%, #03060C 100%)"

    render_cover(
        output_path=os.path.join(BASE_DIR, "checkride-oral-prep/og-oral-prep.png"),
        title="Checkride Oral Prep",
        subtitle="Pass Your FAA Practical Test Oral Exam With Confidence",
        bg_gradient=bg_gradient,
        icon_content=oral_svg,
        badge_style=badge_style,
        badge_size=420,
        inner_size=320,
        title_font_size=78,
        subtitle_font_size=34
    )

def generate_flight_training():
    print("\n--- 6. Generating Flight Training Louisville Cover ---")
    # Dual pilot aviator wings with climbing aircraft and runway perspective
    training_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
      <defs>
        <linearGradient id="blueBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1D4ED8"/>
          <stop offset="100%" stop-color="#1E3A8A"/>
        </linearGradient>
      </defs>
      <circle cx="256" cy="256" r="200" fill="url(#blueBase)"/>
      <circle cx="256" cy="256" r="200" stroke="#93C5FD" stroke-opacity="0.35" stroke-width="6"/>
      
      <!-- Runway Perspective lines -->
      <polygon points="228,424 284,424 266,280 246,280" fill="#0A101D" stroke="#60A5FA" stroke-width="4"/>
      <!-- Runway centerline dashes -->
      <line x1="256" y1="416" x2="256" y2="390" stroke="#FFD000" stroke-width="8"/>
      <line x1="256" y1="372" x2="256" y2="350" stroke="#FFD000" stroke-width="7"/>
      <line x1="256" y1="334" x2="256" y2="316" stroke="#FFD000" stroke-width="6"/>
      <line x1="256" y1="304" x2="256" y2="290" stroke="#FFD000" stroke-width="5"/>
      
      <!-- Aviator Gold Wings (Scaled up & bold) -->
      <g fill="#FFD000" opacity="0.95" transform="translate(256 240) scale(1.28) translate(-256 -240)">
        <path d="M214 240 L90 206 C102 224 126 240 160 252 L208 258 Z"/>
        <path d="M214 256 L110 240 C126 258 152 272 180 276 L210 270 Z"/>
        <path d="M214 270 L132 270 C148 284 174 292 200 292 L212 282 Z"/>
        
        <path d="M298 240 L422 206 C410 224 386 240 352 252 L304 258 Z"/>
        <path d="M298 256 L402 240 C386 258 360 272 332 276 L302 270 Z"/>
        <path d="M298 270 L380 270 C364 284 338 292 312 292 L300 282 Z"/>
      </g>
      
      <!-- Climbing Trainer Aircraft silhouette in center (Scaled up & bold) -->
      <g transform="translate(181 128) scale(2.35)">
        <path d="M32 7c1.7 0 3 1.2 3.4 2.9l4.2 19.8 16.8 8.2c1 .5 1.6 1.5 1.6 2.6v3.9c0 1.1-1 1.9-2.1 1.6l-15.5-3.8-3 12.2 5 4.1c.4.4.7.9.7 1.5V63H20.9v-2.3c0-.6.3-1.1.7-1.5l5-4.1-3-12.2L8.1 46.7c-1.1.3-2.1-.5-2.1-1.6v-3.9c0-1.1.6-2.1 1.6-2.6l16.8-8.2 4.2-19.8C29 8.2 30.3 7 32 7z" fill="#FFFFFF"/>
      </g>
    </svg>'''

    badge_style = '''
      background: radial-gradient(circle, rgba(29, 78, 216, 0.45) 0%, rgba(30, 58, 138, 0.25) 70%, rgba(255, 255, 255, 0.1) 100%);
      border: 3px solid rgba(147, 197, 253, 0.35);
      box-shadow: 0 28px 70px rgba(0, 0, 0, 0.4), 0 0 50px rgba(29, 78, 216, 0.35), inset 0 2px 6px rgba(255, 255, 255, 0.3);
    '''

    bg_gradient = "radial-gradient(circle at 50% 36%, #1D4ED8 0%, #1E3A8A 45%, #0F172A 80%, #030712 100%)"

    render_cover(
        output_path=os.path.join(BASE_DIR, "flight-training-louisville-ky/og-flight-training.png"),
        title="Flight Training Louisville",
        subtitle="Private, Instrument &amp; Commercial Pilot Training · Bowman Field",
        bg_gradient=bg_gradient,
        icon_content=training_svg,
        badge_style=badge_style,
        badge_size=420,
        inner_size=320,
        title_font_size=76,
        subtitle_font_size=33
    )

def generate_learn_hub():
    print("\n--- 7. Generating Learn Hub Cover ---")
    # Aviation Knowledge Hub: Open book with soaring flight wings and navigational beacon star
    learn_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
      <defs>
        <linearGradient id="learnBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0F2942"/>
          <stop offset="100%" stop-color="#071827"/>
        </linearGradient>
        <linearGradient id="cyanWings" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#38BDF8"/>
          <stop offset="100%" stop-color="#0284C7"/>
        </linearGradient>
      </defs>
      <circle cx="256" cy="256" r="200" fill="url(#learnBase)"/>
      <circle cx="256" cy="256" r="200" stroke="#38BDF8" stroke-opacity="0.35" stroke-width="6"/>
      
      <!-- Outer knowledge ring -->
      <circle cx="256" cy="256" r="172" stroke="#0284C7" stroke-width="3" stroke-dasharray="6 6" opacity="0.6"/>
      
      <!-- Soaring wings taking off from book (Scaled up) -->
      <g fill="url(#cyanWings)" opacity="0.95" transform="translate(256 220) scale(1.25) translate(-256 -220)">
        <path d="M226 210 L100 130 C118 164 146 192 186 208 L220 216 Z"/>
        <path d="M226 226 L120 176 C138 204 168 224 204 232 L224 228 Z"/>
        <path d="M286 210 L412 130 C394 164 366 192 326 208 L292 216 Z"/>
        <path d="M286 226 L392 176 C374 204 344 224 308 232 L288 228 Z"/>
      </g>
      
      <!-- Open Manual / Book (Scaled up) -->
      <g transform="translate(256 280) scale(1.18) translate(-256 -280)">
        <path d="M256 230 C216 190 140 190 116 200 L116 344 C140 334 216 334 256 364 C296 334 372 334 396 344 L396 200 C372 190 296 190 256 230 Z" fill="#071827" stroke="#FFFFFF" stroke-width="12" stroke-linejoin="round"/>
        <line x1="256" y1="230" x2="256" y2="364" stroke="#FFFFFF" stroke-width="10"/>
        
        <line x1="150" y1="256" x2="224" y2="272" stroke="#38BDF8" stroke-width="6" stroke-linecap="round"/>
        <line x1="150" y1="288" x2="224" y2="304" stroke="#94A3B8" stroke-width="6" stroke-linecap="round"/>
        <line x1="288" y1="272" x2="362" y2="256" stroke="#38BDF8" stroke-width="6" stroke-linecap="round"/>
        <line x1="288" y1="304" x2="362" y2="288" stroke="#94A3B8" stroke-width="6" stroke-linecap="round"/>
      </g>
      
      <!-- 8-point Navigational Compass Star Beacon -->
      <g transform="translate(256 142)">
        <polygon points="0,-42 9,-14 42,0 9,14 0,42 -9,14 -42,0 -9,-14" fill="#FFD000"/>
        <circle cx="0" cy="0" r="7" fill="#FFFFFF"/>
      </g>
    </svg>'''

    badge_style = '''
      background: radial-gradient(circle, rgba(15, 41, 66, 0.5) 0%, rgba(7, 24, 39, 0.25) 70%, rgba(255, 255, 255, 0.08) 100%);
      border: 3px solid rgba(56, 189, 248, 0.35);
      box-shadow: 0 28px 70px rgba(0, 0, 0, 0.45), 0 0 45px rgba(56, 189, 248, 0.25), inset 0 2px 6px rgba(255, 255, 255, 0.2);
    '''

    bg_gradient = "radial-gradient(circle at 50% 36%, #0F2942 0%, #091A2B 45%, #050E17 80%, #02070D 100%)"

    render_cover(
        output_path=os.path.join(BASE_DIR, "learn/og-learn.png"),
        title="Aviation Knowledge Hub",
        subtitle="Free FAA Regulations, Guides &amp; Flight Training Resources",
        bg_gradient=bg_gradient,
        icon_content=learn_svg,
        badge_style=badge_style,
        badge_size=420,
        inner_size=320,
        title_font_size=78,
        subtitle_font_size=34
    )

def generate_blog_hub():
    print("\n--- 8. Generating Blog Hub Cover ---")
    # SuarezCFI Journal: Graphite Horizon palette with gold aviator logbook and quill
    blog_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
      <defs>
        <linearGradient id="graphiteBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2D3330"/>
          <stop offset="100%" stop-color="#191D1B"/>
        </linearGradient>
        <linearGradient id="champagneGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#D6C49A"/>
          <stop offset="50%" stop-color="#BBA16A"/>
          <stop offset="100%" stop-color="#99804A"/>
        </linearGradient>
      </defs>
      <circle cx="256" cy="256" r="200" fill="url(#graphiteBase)"/>
      <circle cx="256" cy="256" r="200" stroke="#BBA16A" stroke-opacity="0.35" stroke-width="6"/>
      
      <!-- Concentric ruled ring -->
      <circle cx="256" cy="256" r="172" stroke="#BBA16A" stroke-width="3" stroke-dasharray="6 6" opacity="0.65"/>
      
      <!-- Pilot Logbook / Journal binder (Scaled up) -->
      <g transform="translate(256 270) scale(1.22) translate(-256 -270)">
        <rect x="146" y="150" width="220" height="250" rx="18" fill="#141715" stroke="url(#champagneGold)" stroke-width="8"/>
        <line x1="190" y1="150" x2="190" y2="400" stroke="url(#champagneGold)" stroke-width="5"/>
        <circle cx="168" cy="190" r="7" fill="url(#champagneGold)"/>
        <circle cx="168" cy="275" r="7" fill="url(#champagneGold)"/>
        <circle cx="168" cy="360" r="7" fill="url(#champagneGold)"/>
        
        <!-- Embossed aviator wings on logbook cover -->
        <g transform="translate(276 240) scale(0.75)" fill="url(#champagneGold)">
          <polygon points="0,-16 20,4 0,0 -20,4"/>
          <path d="M0 -4 L64 -24 C58 -10 42 4 20 8 L0 2 Z"/>
          <path d="M0 -4 L-64 -24 C-58 -10 -42 4 -20 8 L0 2 Z"/>
        </g>
        
        <!-- Journal Entry rules -->
        <line x1="220" y1="285" x2="336" y2="285" stroke="#E9E7E1" stroke-opacity="0.45" stroke-width="5" stroke-linecap="round"/>
        <line x1="220" y1="315" x2="336" y2="315" stroke="#E9E7E1" stroke-opacity="0.45" stroke-width="5" stroke-linecap="round"/>
        <line x1="220" y1="345" x2="306" y2="345" stroke="#E9E7E1" stroke-opacity="0.45" stroke-width="5" stroke-linecap="round"/>
      </g>
      
      <!-- Quill / Pen drafting flight path -->
      <g transform="translate(336 126) rotate(42) scale(1.2)" fill="url(#champagneGold)">
        <path d="M0 0 L15 65 L0 110 L-15 65 Z"/>
        <polygon points="0,110 -5,140 0,152 5,140" fill="#FFFFFF"/>
      </g>
    </svg>'''

    badge_style = '''
      background: radial-gradient(circle, rgba(45, 51, 48, 0.5) 0%, rgba(25, 29, 27, 0.25) 70%, rgba(255, 255, 255, 0.08) 100%);
      border: 3px solid rgba(187, 161, 106, 0.35);
      box-shadow: 0 28px 70px rgba(0, 0, 0, 0.45), 0 0 45px rgba(187, 161, 106, 0.2), inset 0 2px 6px rgba(255, 255, 255, 0.15);
    '''

    bg_gradient = "radial-gradient(circle at 50% 36%, #2D3330 0%, #1E2320 45%, #141715 80%, #0A0D0C 100%)"

    render_cover(
        output_path=os.path.join(BASE_DIR, "blog/og-blog.png"),
        title="SuarezCFI Journal",
        subtitle="Flight Training Notes, Checkride Tips &amp; Aviation Articles",
        bg_gradient=bg_gradient,
        icon_content=blog_svg,
        badge_style=badge_style,
        badge_size=420,
        inner_size=320,
        title_font_size=78,
        subtitle_font_size=34
    )

def generate_bowman_field():
    print("\n--- 9. Generating Bowman Field (KLOU) Cover ---")
    # Iconic Bowman Field (KLOU) airport runways 6-24 & 15-33 intersecting with bold runway numbers & airfield beacon
    bowman_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
      <defs>
        <linearGradient id="klouBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#13253B"/>
          <stop offset="100%" stop-color="#08101B"/>
        </linearGradient>
      </defs>
      <circle cx="256" cy="256" r="200" fill="url(#klouBase)"/>
      <circle cx="256" cy="256" r="200" stroke="#38BDF8" stroke-opacity="0.35" stroke-width="6"/>
      
      <!-- Outer Airfield Compass Rose -->
      <circle cx="256" cy="256" r="176" stroke="#10B981" stroke-width="4" opacity="0.45"/>
      <circle cx="256" cy="256" r="156" stroke="#64748B" stroke-width="3" stroke-dasharray="8 8" opacity="0.65"/>
      
      <!-- Runway 6-24 at Bowman Field (~060 deg, bolder width) -->
      <g transform="rotate(30 256 256)">
        <rect x="230" y="74" width="52" height="364" rx="6" fill="#0A101D" stroke="#64748B" stroke-width="4"/>
        <line x1="256" y1="110" x2="256" y2="402" stroke="#FFFFFF" stroke-width="6" stroke-dasharray="24 16"/>
        <!-- Threshold stripes -->
        <g stroke="#FFFFFF" stroke-width="5">
          <line x1="238" y1="90" x2="238" y2="106"/>
          <line x1="247" y1="90" x2="247" y2="106"/>
          <line x1="256" y1="90" x2="256" y2="106"/>
          <line x1="265" y1="90" x2="265" y2="106"/>
          <line x1="274" y1="90" x2="274" y2="106"/>
        </g>
      </g>
      
      <!-- Runway 15-33 at Bowman Field (~150 deg, bolder width) -->
      <g transform="rotate(120 256 256)">
        <rect x="232" y="86" width="48" height="340" rx="6" fill="#070D18" stroke="#64748B" stroke-width="4"/>
        <line x1="256" y1="120" x2="256" y2="392" stroke="#FFFFFF" stroke-width="5" stroke-dasharray="20 16"/>
      </g>
      
      <!-- Airport Rotating Beacon Star (Alternating White & Green) -->
      <g transform="translate(256 256)">
        <circle cx="0" cy="0" r="38" fill="#08101D" stroke="#10B981" stroke-width="5"/>
        <polygon points="0,-26 6,-8 26,0 6,8 0,26 -6,8 -26,0 -6,-8" fill="#10B981"/>
        <circle cx="0" cy="0" r="8" fill="#FFFFFF"/>
      </g>
      
      <!-- Airport Identifier KLOU Badge -->
      <g transform="translate(256 386)">
        <rect x="-64" y="-20" width="128" height="40" rx="20" fill="#0A101D" stroke="#10B981" stroke-width="4"/>
        <text x="0" y="8" font-family="'Inter', system-ui, sans-serif" font-size="22" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="2">KLOU</text>
      </g>
    </svg>'''

    badge_style = '''
      background: radial-gradient(circle, rgba(19, 37, 59, 0.5) 0%, rgba(8, 16, 27, 0.25) 70%, rgba(255, 255, 255, 0.08) 100%);
      border: 3px solid rgba(16, 185, 129, 0.35);
      box-shadow: 0 28px 70px rgba(0, 0, 0, 0.45), 0 0 45px rgba(16, 185, 129, 0.25), inset 0 2px 6px rgba(255, 255, 255, 0.2);
    '''

    bg_gradient = "radial-gradient(circle at 50% 36%, #13253B 0%, #0B1726 45%, #060D17 80%, #02050A 100%)"

    render_cover(
        output_path=os.path.join(BASE_DIR, "bowman-field-klou/og-bowman-field.png"),
        title="Bowman Field (KLOU)",
        subtitle="Louisville Airport Guide, Runways &amp; Flight Training Operations",
        bg_gradient=bg_gradient,
        icon_content=bowman_svg,
        badge_style=badge_style,
        badge_size=420,
        inner_size=320,
        title_font_size=78,
        subtitle_font_size=34
    )

if __name__ == "__main__":
    generate_homepage_variants()
    generate_discovery_flight()
    generate_ground_school()
    generate_faa_written_prep()
    generate_checkride_oral_prep()
    generate_flight_training()
    generate_learn_hub()
    generate_blog_hub()
    generate_bowman_field()
    print("\nAll cover generation complete!")
