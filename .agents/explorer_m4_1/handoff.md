# Milestone 4 Handoff Report: Asymmetrical About Me & Credentials Cards

## 1. Observation
We investigated the workspace `/Users/diegosuarez/Desktop/VIBE CODING PROJECTS/SUAREZ.CFI/ixsuarez.github.io/` and analyzed the homepage `index.html`.

### Key Code Locations Found
*   **About Me Section**: Lines 1914 to 1993 in `index.html`.
    ```html
    1914:     <section aria-labelledby="profile-heading" id="about">
    1915:       <div class="container">
    1916:         <div class="profile-about-wrap">
    1917:           <article class="profile">
    1918:             <img src="assets/IMG_8866.jpeg" alt="Diego Suarez, FAA Advanced Ground Instructor based in Louisville, Kentucky" class="profile-photo" width="640" height="640" />
    ...
    1950:           <div class="about-content">
    1951:             <p class="about-text">
    1952:               I fly out of Bowman Field (KLOU) in Louisville, Kentucky, and I genuinely look forward to helping each student feel more comfortable around the airplane, the checklist, and the decisions that come with flying. Whether you're just getting started or working toward commercial, my goal is to make training clear, practical, and encouraging while still keeping every lesson built around safe, standards-based habits.
    1953:             </p>
    ```
*   **Certifications List**: Located inside the `.about-content` container at lines 1964 to 1989.
    ```html
    1964:             <div class="certifications-list">
    1965:               <div class="cert-item">
    ...
    1989:             </div>
    ```
*   **Main Services Cards**: Located inside the `#services` section at lines 2012 to 2067:
    - **Flight Training Planning** (class: `service-card cat-student-pilot`)
    - **Private Pilot Ground School** (class: `service-card cat-private-pilot`)
    - **Ground Instruction** (class: `service-card cat-commercial-pilot`)
    - **FAA Written Test Prep** (class: `service-card cat-written-prep`)
    - **Checkride Oral Prep** (class: `service-card cat-cfi`)
    - **Bowman Field KLOU Help** (class: `service-card cat-airspace`)

### Existing Styles Found
All CSS styles are written inline inside a single `<style>` block from line 38 to line 1817 in `index.html`.
*   **`.profile-about-wrap` Grid definition**:
    - Lines 268-273 (base):
      ```css
      .profile-about-wrap {
        display: grid;
        grid-template-columns: 340px 1fr;
        gap: 50px;
        align-items: start;
      }
      ```
    - Lines 1067-1071 (premium pass):
      ```css
      .profile-about-wrap {
        grid-template-columns: minmax(280px, 390px) minmax(0, 1fr);
        gap: clamp(32px, 6vw, 72px);
        align-items: center;
      }
      ```
    - Lines 1355-1358 (mobile override):
      ```css
      .profile-about-wrap {
        grid-template-columns: 1fr;
        max-width: 760px;
      }
      ```
*   **Category custom properties**: Lines 1528-1587 define `--category-accent`, `--category-soft`, `--category-line`, and `--category-ink` variables dynamically overridden based on class names like `.cat-student-pilot`, `.cat-private-pilot`, `.cat-cfi`, etc.
*   **Category Badge base styles**: Lines 400-414 specify `.category-badge` which uses the category-specific custom properties.

---

## 2. Logic Chain
1. **Asymmetrical About Overlap**: 
   - By switching `.profile-about-wrap` to a 12-column grid layout on desktop, we can position `.profile` (e.g. columns 1 to 5) and `.about-content` (e.g. columns 4 to 13) on overlapping column tracks.
   - Giving `.profile` a higher `z-index` and a slight rotation, and styling `.about-content` as a card itself with solid/translucent background, strong box-shadows, and customized left-padding ensures the text remains readable while achieving an editorial asymmetrical overlap.
   - For responsiveness, the overlap must be reset to a single-column block layout on screens smaller than 980px.
2. **Handwriting Signature Quote**:
   - The fonts `Newsreader` and `Pinyon Script` are already loaded at line 36.
   - Placing a custom `<blockquote>` inside the `.about-content` card allows us to format the text in italicized serif `Newsreader` and the signature line in cursive `Pinyon Script`, adding a realistic rotated and styled signature using CSS variables.
3. **Interactive Credentials Cards**:
   - The current certifications are list items with checkmarks. Converting this list to a 2x2 CSS Grid of `.credential-card` blocks permits a card-like layout representing physical pilot certificates or logbook pages.
   - Assigning category classes (`.cat-cfi`, `.cat-commercial-pilot`, `.cat-instrument-rating`, `.cat-private-pilot`) to these cards inherits the existing variables (`--category-accent`, `--category-soft`, `--category-line`, `--category-ink`).
   - Using CSS transitions on `:hover` allows scaling up the card (`transform: scale(1.02) translateY(-4px)`) and swapping the border to `var(--category-accent)` dynamically. Adding a micro-rotation to the icon badge (`transform: rotate(8deg) scale(1.05)`) enhances tactile response.
4. **Main Services Cards**:
   - The main services cards already leverage the `.cat-*` category styles. Adding a themed badge border and a colored indicator dot (e.g. via `::before` pseudo-element on `.category-badge` utilizing `var(--category-accent)`) provides high-fidelity polish and highlights their respective training categories.
   - If a new service card for "Simply Endorsed CFI" is to be added, it should be categorized under `.cat-cfi` (red accent) to match the FAA Endorsement lookup tool.

---

## 3. Caveats
- No new external assets (images/fonts) are required as the necessary fonts (`Newsreader`, `Pinyon Script`) are already loaded in `index.html`.
- CSS is quite large and spans multiple overrides within media queries. Implementing the CSS edits requires careful location mapping to avoid breaking other breakpoint-specific designs. The new overrides should ideally be placed at the end of the style block (just before line 1816) to guarantee clean cascading.

---

## 4. Conclusion & Proposed Strategy

We propose the following HTML structure updates and CSS styles to be integrated into `index.html`.

### A. HTML Structure Updates

1.  **About Me Layout & Signature Quote** (Replace lines 1914 to 1993 in `index.html`):
    ```html
    <section aria-labelledby="profile-heading" id="about">
      <div class="container">
        <div class="profile-about-wrap">
          <article class="profile">
            <img src="assets/IMG_8866.jpeg" alt="Diego Suarez, FAA Advanced Ground Instructor based in Louisville, Kentucky" class="profile-photo" width="640" height="640" />
            <div class="profile-avail"><span class="dot" aria-hidden="true"></span> Accepting new students</div>
            <h3 id="profile-heading">Diego Suarez</h3>
            <p class="role">FAA Advanced Ground Instructor · Bowman Field (KLOU) · Louisville, KY</p>
            <a href="#contact" class="btn btn--primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg>
              Contact Me
            </a>
            <div class="social-links profile-social" aria-label="Follow Diego Suarez">
              <a class="social-link" href="https://www.instagram.com/suarez.cfi/" target="_blank" rel="me noopener" aria-label="Instagram: suarez.cfi" data-cta-id="home-social-instagram">
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.5"/><circle cx="17" cy="7" r="1"/></svg>
                <span>Instagram</span>
              </a>
              <a class="social-link" href="https://www.threads.net/@suarez.cfi" target="_blank" rel="me noopener" aria-label="Threads: suarez.cfi" data-cta-id="home-social-threads">
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.5 9.2c-.5-3-2.5-4.7-5.4-4.7-3.5 0-6.1 2.6-6.1 7.4 0 4.7 2.6 7.6 6.5 7.6 3.2 0 5.4-1.7 5.4-4.2 0-2.3-1.7-3.6-5-3.6h-1.4"/><path d="M12 11.7c2.8 0 5.4.8 6.7 2.8"/></svg>
                <span>Threads</span>
              </a>
              <a class="social-link" href="https://www.youtube.com/@SUAREZCFI" target="_blank" rel="me noopener" aria-label="YouTube: SUAREZCFI" data-cta-id="home-social-youtube">
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M21.4 7.1a3 3 0 0 0-2.1-2.1C17.5 4.5 12 4.5 12 4.5s-5.5 0-7.3.5a3 3 0 0 0-2.1 2.1A31.2 31.2 0 0 0 2.1 12c0 1.7.2 3.4.5 4.9a3 3 0 0 0 2.1 2.1c1.8.5 7.3.5 7.3.5s5.5 0 7.3-.5a3 3 0 0 0 2.1-2.1c.3-1.5.5-3.2.5-4.9s-.2-3.4-.5-4.9ZM10 15.5v-7l6 3.5-6 3.5Z"/></svg>
                <span>YouTube</span>
              </a>
              <a class="social-link" href="https://www.tiktok.com/@suarez.cfi" target="_blank" rel="me noopener" aria-label="TikTok: suarez.cfi" data-cta-id="home-social-tiktok">
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v10.2a4.2 4.2 0 1 1-4.2-4.2"/><path d="M14 4c.7 2.7 2.4 4.4 5 5"/></svg>
                <span>TikTok</span>
              </a>
              <a class="social-link" href="https://www.facebook.com/Suarez.CFI" target="_blank" rel="me noopener" aria-label="Facebook: Suarez.CFI" data-cta-id="home-social-facebook">
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M14.2 8.2V6.7c0-.7.5-1.1 1.2-1.1h1.4V3.1c-.7-.1-1.5-.1-2.3-.1-2.5 0-4.2 1.5-4.2 4.2v1H7.7V11h2.6v10h3.1V11h2.6l.4-2.8h-3.2Z"/></svg>
                <span>Facebook</span>
              </a>
            </div>
          </article>
          
          <div class="about-content">
            <p class="about-text">
              I fly out of Bowman Field (KLOU) in Louisville, Kentucky, and I genuinely look forward to helping each student feel more comfortable around the airplane, the checklist, and the decisions that come with flying. Whether you're just getting started or working toward commercial, my goal is to make training clear, practical, and encouraging while still keeping every lesson built around safe, standards-based habits.
            </p>

            <blockquote class="bio-quote">
              <p class="bio-quote-text">“Flight training isn't just about passing checkrides; it's about forming standards-based habits that keep you safe for a lifetime.”</p>
              <cite class="bio-quote-sig">Diego Suarez</cite>
            </blockquote>
            
            <hr class="dotted-divider" />
            
            <div class="badges">
              <span class="badge">FAA Advanced Ground Instructor</span>
              <span class="badge">Bowman Field (KLOU)</span>
            </div>
            
            <hr class="dotted-divider" />
            
            <!-- Credentials Grid Section -->
            <div class="credentials-grid">
              <!-- Advanced Ground Instructor -->
              <div class="credential-card cat-cfi" tabindex="0">
                <div class="credential-badge">
                  <svg class="credential-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M12 8v8M9 11h6"/>
                  </svg>
                </div>
                <div class="credential-content">
                  <span class="credential-category">FAA Certified</span>
                  <h4 class="credential-title">Advanced Ground Instructor</h4>
                  <p class="credential-meta">Gold Seal standard training habits</p>
                </div>
              </div>

              <!-- Commercial Pilot -->
              <div class="credential-card cat-commercial-pilot" tabindex="0">
                <div class="credential-badge">
                  <svg class="credential-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 12L2 12M12 2L12 22M20 6L4 18M4 6l16 12"/>
                  </svg>
                </div>
                <div class="credential-content">
                  <span class="credential-category">Commercial Privileges</span>
                  <h4 class="credential-title">Commercial Pilot</h4>
                  <p class="credential-meta">Single & Multi-Engine Land</p>
                </div>
              </div>

              <!-- Instrument Rating -->
              <div class="credential-card cat-instrument-rating" tabindex="0">
                <div class="credential-badge">
                  <svg class="credential-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 2v20M2 12h20M12 12m-6 0a6 6 0 1 0 12 0 6 6 0 1 0-12 0"/>
                  </svg>
                </div>
                <div class="credential-content">
                  <span class="credential-category">IFR Operations</span>
                  <h4 class="credential-title">Instrument Rating</h4>
                  <p class="credential-meta">Low-visibility & cloud qualified</p>
                </div>
              </div>

              <!-- Private Pilot -->
              <div class="credential-card cat-private-pilot" tabindex="0">
                <div class="credential-badge">
                  <svg class="credential-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 3v18M3 12h18"/>
                  </svg>
                </div>
                <div class="credential-content">
                  <span class="credential-category">Aviation Foundation</span>
                  <h4 class="credential-title">Private Pilot</h4>
                  <p class="credential-meta">Bowman Field (KLOU) based</p>
                </div>
              </div>
            </div>
            <!-- End Credentials Grid -->
          </div>
        </div>
      </div>
    </section>
    ```

---

### B. CSS Overrides & Styling

Add these rules to the bottom of the `<style>` block (around line 1816, just before `</style>`):

```css
    /* ==========================================================================
       Milestone 4: Asymmetrical Overlap & Credentials Card Grid
       ========================================================================== */

    /* 1. Asymmetrical Overlap (Desktop View) */
    @media (min-width: 981px) {
      .profile-about-wrap {
        display: grid;
        grid-template-columns: repeat(12, 1fr) !important;
        align-items: stretch !important;
        gap: 0 !important;
      }
      
      .profile {
        grid-column: 1 / 5 !important;
        grid-row: 1 !important;
        position: relative !important;
        z-index: 10 !important;
        transform: rotate(-1.5deg) translateY(-8px) !important;
        align-self: center;
        box-shadow: 0 32px 72px rgba(15, 23, 42, 0.12) !important;
      }
      
      .about-content {
        grid-column: 4 / 13 !important;
        grid-row: 1 !important;
        background: rgba(255, 255, 255, 0.88) !important;
        -webkit-backdrop-filter: blur(20px);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(87, 99, 118, 0.14) !important;
        border-radius: 32px !important;
        padding: 56px 56px 56px 92px !important; /* Left padding creates breathing room for the overlapping photo card */
        box-shadow: 0 28px 78px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,0.9) !important;
        position: relative !important;
        z-index: 5 !important;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    }

    /* Tablet and Mobile adjustments for overlap */
    @media (max-width: 980px) {
      .profile-about-wrap {
        display: flex;
        flex-direction: column;
        gap: 32px !important;
      }
      
      .profile {
        transform: none !important;
        max-width: 440px;
        margin: 0 auto !important;
      }
      
      .about-content {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
      }
    }

    /* 2. Handwriting Signature Quote */
    .bio-quote {
      margin: 28px 0;
      padding: 4px 0 4px 24px;
      border-left: 3px solid var(--border-strong);
      position: relative;
    }
    .bio-quote-text {
      font-family: var(--font-display);
      font-size: clamp(1.1rem, 2vw, 1.35rem);
      font-style: italic;
      line-height: 1.5;
      color: var(--ink);
      margin: 0 0 6px;
    }
    .bio-quote-sig {
      font-family: var(--font-signature);
      font-size: clamp(2.0rem, 3.5vw, 2.5rem);
      color: var(--navy);
      font-style: normal;
      display: block;
      margin-top: 4px;
      text-align: right;
      transform: rotate(-1deg) translateY(-4px);
    }

    /* 3. Credentials Card Grid */
    .credentials-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-top: 24px;
    }
    @media (max-width: 600px) {
      .credentials-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Interactive Pilot Logbook-style Card */
    .credential-card {
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid rgba(87, 99, 118, 0.12);
      border-radius: 20px;
      padding: 18px;
      display: flex;
      align-items: flex-start;
      gap: 14px;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.01);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                  box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
                  border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      cursor: pointer;
    }

    /* Credentials Card Micro-animations (Hover & Focus States) */
    .credential-card:hover,
    .credential-card:focus-visible {
      transform: translateY(-4px) scale(1.02);
      border-color: var(--category-accent) !important;
      box-shadow: 0 16px 36px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
      outline: none;
    }

    .credential-badge {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: var(--category-soft);
      color: var(--category-accent);
      border: 1px solid var(--category-line);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .credential-card:hover .credential-badge,
    .credential-card:focus-visible .credential-badge {
      transform: rotate(8deg) scale(1.08);
    }
    .credential-icon {
      width: 20px;
      height: 20px;
    }
    .credential-content {
      display: flex;
      flex-direction: column;
    }
    .credential-category {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--category-ink);
      margin-bottom: 2px;
    }
    .credential-title {
      font-family: var(--font-sans);
      font-size: 0.98rem;
      font-weight: 600;
      color: var(--ink);
      margin: 0 0 1px 0;
      line-height: 1.35;
    }
    .credential-meta {
      font-size: 0.82rem;
      color: var(--ink-muted);
      margin: 0;
      line-height: 1.4;
    }

    /* 4. Themed Badges Dot Enhancement for Services Cards */
    .category-badge::before {
      content: "";
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--category-accent);
      margin-right: 8px;
      transition: transform 0.2s ease;
    }
    .service-card:hover .category-badge::before {
      transform: scale(1.3);
    }
```

---

## 6. Verification Method

### Visual Inspection
1. Open `index.html` in a web browser using a local HTTP server:
   ```bash
   python3 -m http.server 8000
   ```
2. Navigate to `http://localhost:8000`.
3. Scroll to the **About Me** section and verify:
   - On screens wider than `980px`, the `.profile` card overlaps the `.about-content` card symmetrically/asymmetrically on the left.
   - The `.about-content` card has a clean translucent card background, border, shadow, and correct padding offsetting the text from the overlap.
   - The signature block quote renders using the elegant italicized `Newsreader` font and the cursive `Pinyon Script` signature "Diego Suarez" offset to the right.
   - The credentials list has been replaced by a 2x2 grid. Hovering over each credential card (e.g. Commercial Pilot) scales the card up and applies the category border (yellow/gold for commercial pilot, blue for private pilot, etc.), while rotating the icon badge slightly.
   - Each category badge in the services grid displays a themed, color-coded indicator dot next to the text.

### Invalidation Conditions
- The layout breaks on tablet/mobile viewport sizes between `600px` and `980px` (verify responsiveness and ensure media queries successfully clear grids and offsets).
- Custom variables `--category-accent` or `--category-soft` do not load within cards (verify category class names are correctly applied on the credential cards).
