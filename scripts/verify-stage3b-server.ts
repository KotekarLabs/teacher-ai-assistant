import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const PORT = 4173;

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Stage 3B Visual Teaching Assistant Verification</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Kannada:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --canvas: #fdfcf9;
      --midnight: #0b1120;
      --slate-800: #1e293b;
      --slate-600: #475569;
      --slate-500: #64748b;
      --slate-200: #e2e8f0;
      --slate-100: #f1f5f9;
      --violet-700: #6d28d9;
      --violet-600: #7c3aed;
      --violet-50: #f5f3ff;
      --amber-800: #92400e;
      --amber-50: #fffbeb;
      --sky-800: #075985;
      --sky-50: #f0f9ff;
      --emerald-800: #065f46;
      --emerald-50: #ecfdf5;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--canvas);
      color: var(--midnight);
      font-family: 'Inter', system-ui, sans-serif;
      line-height: 1.5;
      padding: 24px;
    }
    .kannada {
      font-family: 'Noto Sans Kannada', 'Nirmala UI', sans-serif;
      line-height: 1.625;
    }
    .container {
      max-width: 1040px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    header.hero {
      background: #ffffff;
      padding: 24px;
      border-radius: 16px;
      border: 1px solid var(--slate-200);
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-emerald { background: var(--emerald-50); color: var(--emerald-800); border: 1px solid #a7f3d0; }
    .badge-violet { background: var(--violet-50); color: var(--violet-700); border: 1px solid #ddd6fe; }
    .badge-sky { background: var(--sky-50); color: var(--sky-800); border: 1px solid #bae6fd; }
    .badge-amber { background: var(--amber-50); color: var(--amber-800); border: 1px solid #fde68a; }

    /* Section Styles */
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--midnight);
      margin-bottom: 4px;
    }
    .section-subtitle {
      font-size: 13px;
      color: var(--slate-500);
      margin-bottom: 16px;
    }

    /* 8 Vector Grid */
    .vector-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 16px;
      background: #ffffff;
      padding: 20px;
      border-radius: 16px;
      border: 1px solid var(--slate-200);
    }
    .vector-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 12px 8px;
      background: var(--slate-100);
      border-radius: 12px;
      border: 1px solid var(--slate-200);
      gap: 8px;
    }
    .vector-card:hover { transform: translateY(-2px); transition: transform 0.2s; }
    .vector-label-en { font-size: 12px; font-weight: 700; color: var(--midnight); }
    .vector-label-kn { font-size: 11px; font-weight: 600; color: var(--violet-700); }

    /* Sorting Board */
    .sorting-board {
      background: #fcfbf7;
      border: 1px solid #fde68a;
      border-radius: 20px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .board-header {
      background: #ffffff;
      padding: 20px;
      border-radius: 16px;
      border: 1px solid #fef3c7;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .binary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    @media (max-width: 768px) {
      .binary-grid { grid-template-columns: 1fr; }
    }
    .column-box {
      background: #ffffff;
      padding: 18px;
      border-radius: 16px;
      border: 1px solid var(--slate-200);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--slate-100);
      padding-bottom: 10px;
    }
    .item-card {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: #ffffff;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid var(--slate-200);
    }
    .item-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .obs-box {
      border-top: 1px solid var(--slate-100);
      padding-top: 8px;
      font-size: 11px;
      color: var(--slate-600);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    /* Multi-Perspective Section */
    .multi-section {
      background: #ffffff;
      padding: 20px;
      border-radius: 16px;
      border: 1px solid #ddd6fe;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .multi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    @media (max-width: 768px) {
      .multi-grid { grid-template-columns: 1fr; }
    }
    .multi-card {
      background: #ffffff;
      padding: 16px;
      border-radius: 14px;
      border: 1px solid #ede9fe;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .viewpoint-box {
      background: var(--slate-100);
      padding: 10px;
      border-radius: 10px;
      font-size: 11px;
      border: 1px solid var(--slate-200);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    /* Provenance Card */
    .provenance-card {
      background: #ffffff;
      padding: 20px;
      border-radius: 16px;
      border: 1px solid var(--slate-200);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .disclaimer-box {
      background: var(--slate-100);
      padding: 12px;
      border-radius: 10px;
      font-size: 11px;
      color: var(--slate-600);
      border: 1px solid var(--slate-200);
    }
    .kannada-test-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--slate-200);
    }
    .kannada-test-table th, .kannada-test-table td {
      padding: 10px 14px;
      border: 1px solid var(--slate-200);
      text-align: left;
    }
    .kannada-test-table th { background: var(--slate-100); font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="hero">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
        <div>
          <span class="badge badge-emerald" id="provenance-badge">✓ Curriculum-aligned resource</span>
          <h1 style="font-size: 24px; font-weight: 700; margin-top: 8px;">
            Stage 3B Frontend Verification Suite
          </h1>
          <p style="font-size: 14px; color: var(--slate-600); margin-top: 2px;">
            Curriculum-Aware Visual Teaching Assistant • JOYFUL_MATH_C1_CH2_V1
          </p>
        </div>
        <div style="text-align: right; font-size: 12px; color: var(--slate-500);">
          <span>Class 1 Mathematics</span><br>
          <span class="kannada" style="font-weight: 600; color: var(--violet-700);">೧ನೇ ತರಗತಿ ಗಣಿತ</span>
        </div>
      </div>
    </header>

    <!-- 1. All 8 Canonical SVG Vector Illustrations -->
    <section>
      <h2 class="section-title">1. Canonical 8-Object SVG Vector Renderers</h2>
      <p class="section-subtitle">Comparing 1:1 vector geometry against Stage 2 PDFKit graphics</p>
      <div class="vector-grid" id="vector-grid">
        <!-- Bat -->
        <div class="vector-card" id="card-bat">
          <svg viewBox="0 0 100 100" width="60" height="60" role="img" aria-label="Cricket Bat">
            <title>Cricket Bat</title>
            <rect x="44" y="6" width="12" height="30" rx="2" fill="#475569" stroke="#1E293B" stroke-width="2"/>
            <line x1="44" y1="13" x2="56" y2="13" stroke="#CBD5E1" stroke-width="1.5"/>
            <line x1="44" y1="20" x2="56" y2="20" stroke="#CBD5E1" stroke-width="1.5"/>
            <line x1="44" y1="27" x2="56" y2="27" stroke="#CBD5E1" stroke-width="1.5"/>
            <rect x="36" y="36" width="28" height="58" rx="4" fill="#FDE68A" stroke="#D97706" stroke-width="2.5"/>
            <line x1="50" y1="38" x2="50" y2="88" stroke="#B45309" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="vector-label-en">1. Cricket Bat</span>
          <span class="vector-label-kn kannada">ಕ್ರಿಕೆಟ್ ಬ್ಯಾಟ್</span>
        </div>

        <!-- Ball -->
        <div class="vector-card" id="card-ball">
          <svg viewBox="0 0 100 100" width="60" height="60" role="img" aria-label="Rubber Ball">
            <title>Rubber Ball</title>
            <circle cx="50" cy="50" r="42" fill="#EF4444" stroke="#DC2626" stroke-width="2.5"/>
            <ellipse cx="38" cy="34" rx="12" ry="7" transform="rotate(-25 38 34)" fill="#F87171" opacity="0.6"/>
            <path d="M 22 22 C 38 38, 38 62, 22 78" fill="none" stroke="#F8FAFC" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M 78 22 C 62 38, 62 62, 78 78" fill="none" stroke="#F8FAFC" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <span class="vector-label-en">2. Rubber Ball</span>
          <span class="vector-label-kn kannada">ರಬ್ಬರ್ ಚೆಂಡು</span>
        </div>

        <!-- Pencil -->
        <div class="vector-card" id="card-pencil">
          <svg viewBox="0 0 100 100" width="60" height="60" role="img" aria-label="Wooden Pencil">
            <title>Wooden Pencil</title>
            <rect x="38" y="22" width="24" height="50" rx="2" fill="#F59E0B" stroke="#D97706" stroke-width="2"/>
            <line x1="46" y1="22" x2="46" y2="72" stroke="#D97706" stroke-width="1.5"/>
            <line x1="54" y1="22" x2="54" y2="72" stroke="#B45309" stroke-width="1.5"/>
            <rect x="38" y="14" width="24" height="8" fill="#94A3B8" stroke="#64748B" stroke-width="1.5"/>
            <path d="M 38 14 C 38 7, 62 7, 62 14 Z" fill="#FB7185" stroke="#E11D48" stroke-width="1.5"/>
            <polygon points="38,72 62,72 50,92" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/>
            <polygon points="46,85 54,85 50,92" fill="#1E293B"/>
          </svg>
          <span class="vector-label-en">3. Pencil</span>
          <span class="vector-label-kn kannada">ಪೆನ್ಸಿಲ್</span>
        </div>

        <!-- Orange -->
        <div class="vector-card" id="card-orange">
          <svg viewBox="0 0 100 100" width="60" height="60" role="img" aria-label="Fresh Orange">
            <title>Fresh Orange</title>
            <circle cx="50" cy="54" r="40" fill="#F97316" stroke="#EA580C" stroke-width="2.5"/>
            <circle cx="36" cy="46" r="1.5" fill="#C2410C" opacity="0.7"/>
            <circle cx="44" cy="58" r="1.5" fill="#C2410C" opacity="0.7"/>
            <circle cx="62" cy="48" r="1.5" fill="#C2410C" opacity="0.7"/>
            <path d="M 50 14 C 48 10, 48 7, 52 5" fill="none" stroke="#15803D" stroke-width="3" stroke-linecap="round"/>
            <path d="M 50 14 C 62 8, 70 12, 68 20 C 60 22, 54 18, 50 14 Z" fill="#22C55E" stroke="#16A34A" stroke-width="1.5"/>
          </svg>
          <span class="vector-label-en">4. Fresh Orange</span>
          <span class="vector-label-kn kannada">ಕಿತ್ತಳೆ ಹಣ್ಣು</span>
        </div>

        <!-- Ruler -->
        <div class="vector-card" id="card-ruler">
          <svg viewBox="0 0 100 100" width="60" height="60" role="img" aria-label="Metric Ruler">
            <title>Metric Ruler</title>
            <rect x="10" y="32" width="80" height="36" rx="3" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
            <line x1="16" y1="32" x2="16" y2="44" stroke="#0369A1" stroke-width="2"/>
            <line x1="32" y1="32" x2="32" y2="44" stroke="#0369A1" stroke-width="2"/>
            <line x1="48" y1="32" x2="48" y2="44" stroke="#0369A1" stroke-width="2"/>
            <line x1="64" y1="32" x2="64" y2="44" stroke="#0369A1" stroke-width="2"/>
            <line x1="80" y1="32" x2="80" y2="44" stroke="#0369A1" stroke-width="2"/>
            <text x="16" y="56" font-size="8" font-weight="bold" fill="#0369A1" text-anchor="middle">0</text>
            <text x="48" y="56" font-size="8" font-weight="bold" fill="#0369A1" text-anchor="middle">10</text>
            <text x="80" y="56" font-size="8" font-weight="bold" fill="#0369A1" text-anchor="middle">20</text>
          </svg>
          <span class="vector-label-en">5. Ruler</span>
          <span class="vector-label-kn kannada">ರೂಲರ್ / ಸ್ಕೇಲ್</span>
        </div>

        <!-- Bangle -->
        <div class="vector-card" id="card-bangle">
          <svg viewBox="0 0 100 100" width="60" height="60" role="img" aria-label="Circular Bangle">
            <title>Circular Bangle</title>
            <circle cx="50" cy="50" r="40" fill="#0D9488" stroke="#115E59" stroke-width="2.5"/>
            <circle cx="50" cy="50" r="26" fill="#FFFFFF" stroke="#042F2E" stroke-width="2"/>
            <path d="M 22 34 C 34 22, 58 22, 74 34" fill="none" stroke="#5EEAD4" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="50" cy="17" r="2.2" fill="#FDE047"/>
            <circle cx="73" cy="27" r="2.2" fill="#FDE047"/>
            <circle cx="83" cy="50" r="2.2" fill="#FDE047"/>
            <circle cx="50" cy="83" r="2.2" fill="#FDE047"/>
            <circle cx="17" cy="50" r="2.2" fill="#FDE047"/>
          </svg>
          <span class="vector-label-en">6. Bangle</span>
          <span class="vector-label-kn kannada">ಬಳೆ</span>
        </div>

        <!-- Bottle -->
        <div class="vector-card" id="card-bottle">
          <svg viewBox="0 0 100 100" width="60" height="60" role="img" aria-label="Water Bottle">
            <title>Water Bottle</title>
            <rect x="42" y="8" width="16" height="10" rx="2" fill="#1E40AF" stroke="#1E3A8A" stroke-width="1.5"/>
            <rect x="45" y="18" width="10" height="8" fill="#60A5FA" stroke="#2563EB" stroke-width="1.5"/>
            <rect x="36" y="26" width="28" height="64" rx="4" fill="#3B82F6" stroke="#1D4ED8" stroke-width="2"/>
            <line x1="38" y1="46" x2="62" y2="46" stroke="#93C5FD" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="38" y1="56" x2="62" y2="56" stroke="#93C5FD" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="38" y1="66" x2="62" y2="66" stroke="#93C5FD" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="40" y1="30" x2="40" y2="84" stroke="#DBEAFE" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
          </svg>
          <span class="vector-label-en">7. Water Bottle</span>
          <span class="vector-label-kn kannada">ನೀರಿನ ಬಾಟಲಿ</span>
        </div>

        <!-- Pencil Box -->
        <div class="vector-card" id="card-pencil_box">
          <svg viewBox="0 0 100 100" width="60" height="60" role="img" aria-label="Pencil Box">
            <title>Pencil Box</title>
            <rect x="14" y="28" width="72" height="44" rx="4" fill="#8B5CF6" stroke="#6D28D9" stroke-width="2.5"/>
            <line x1="14" y1="46" x2="86" y2="46" stroke="#DDD6FE" stroke-width="1.5"/>
            <rect x="18" y="32" width="64" height="10" rx="2" fill="#C4B5FD" opacity="0.4"/>
            <rect x="44" y="40" width="12" height="12" rx="2" fill="#FCD34D" stroke="#D97706" stroke-width="1.5"/>
            <circle cx="50" cy="46" r="1.5" fill="#B45309"/>
          </svg>
          <span class="vector-label-en">8. Pencil Box</span>
          <span class="vector-label-kn kannada">ಪೆನ್ಸಿಲ್ ಬಾಕ್ಸ್</span>
        </div>
      </div>
    </section>

    <!-- 2. Bilingual Sorting Board -->
    <section>
      <h2 class="section-title">2. Bilingual Sorting Board Layout</h2>
      <p class="section-subtitle">Binary classification grid + distinct multi-perspective cards</p>

      <div class="sorting-board">
        <!-- Board Header -->
        <div class="board-header">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <div>
              <span class="badge badge-amber">Interactive Teaching Board • ದೃಶ್ಯ ಬೋಧನಾ ಬೋರ್ಡ್</span>
              <h3 style="font-size: 20px; font-weight: 700; margin-top: 6px;">Visual Sorting Board: What is Long? What is Round?</h3>
              <p class="kannada" style="font-size: 15px; font-weight: 600; color: var(--violet-700);">ದೃಶ್ಯ ವಿಂಗಡಣೆ ಬೋರ್ಡ್: ಯಾವುದು ಉದ್ದ? ಯಾವುದು ದುಂಡು?</p>
            </div>
            <span class="badge badge-violet">8 Canonical Objects</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px;">
            <div style="background: var(--slate-100); padding: 10px; border-radius: 8px;">
              <strong>English Instructions:</strong> Examine the 8 classroom items. Sort items into Long (Slides) or Round (Rolls). Discover multi-perspective items!
            </div>
            <div style="background: var(--violet-50); padding: 10px; border-radius: 8px;">
              <strong class="kannada" style="color: var(--violet-700);">ಕನ್ನಡ ಸೂಚನೆಗಳು:</strong> <span class="kannada">೮ ತರಗತಿಯ ವಸ್ತುಗಳನ್ನು ಗಮನಿಸಿ. ಉದ್ದವಾದ ಮತ್ತು ದುಂಡಗಿನ ವಸ್ತುಗಳನ್ನು ವಿಂಗಡಿಸಿ.</span>
            </div>
          </div>
        </div>

        <!-- Binary Grid -->
        <div class="binary-grid">
          <!-- Long Column -->
          <div class="column-box" style="border-color: #bae6fd;">
            <div class="column-header">
              <div>
                <h4 style="font-size: 15px; font-weight: 700; color: var(--sky-800);">📏 Long Objects (ಉದ್ದವಾದ ವಸ್ತುಗಳು)</h4>
                <p style="font-size: 11px; color: var(--sky-800);">Characteristic Movement: Slides (ಜಾರುತ್ತದೆ)</p>
              </div>
              <span class="badge badge-sky">3 Objects</span>
            </div>
            <!-- Bat -->
            <div class="item-card">
              <div class="item-row">
                <svg viewBox="0 0 100 100" width="40" height="40"><use href="#card-bat"/></svg>
                <div style="flex: 1;">
                  <div style="display: flex; justify-content: space-between;">
                    <strong>Cricket Bat</strong>
                    <span class="badge badge-sky">➡️ Slides</span>
                  </div>
                  <span class="kannada" style="font-size: 12px; color: var(--violet-700); font-weight: 600;">ಕ್ರಿಕೆಟ್ ಬ್ಯಾಟ್</span>
                </div>
              </div>
              <div class="obs-box">
                <span>Long wooden bat used in cricket. Slides along the ground.</span>
                <span class="kannada">ಉದ್ದವಾದ ಮರದ ಬ್ಯಾಟ್. ನೆಲದ ಮೇಲೆ ಜಾರುತ್ತದೆ.</span>
              </div>
            </div>
            <!-- Ruler -->
            <div class="item-card">
              <div class="item-row">
                <svg viewBox="0 0 100 100" width="40" height="40"><use href="#card-ruler"/></svg>
                <div style="flex: 1;">
                  <div style="display: flex; justify-content: space-between;">
                    <strong>Ruler / Scale</strong>
                    <span class="badge badge-sky">➡️ Slides</span>
                  </div>
                  <span class="kannada" style="font-size: 12px; color: var(--violet-700); font-weight: 600;">ರೂಲರ್ / ಸ್ಕೇಲ್</span>
                </div>
              </div>
              <div class="obs-box">
                <span>Straight flat plastic scale. Slides across desks.</span>
                <span class="kannada">ಉದ್ದವಾದ ಪ್ಲಾಸ್ಟಿಕ್ ಅಳತೆಪಟ್ಟಿ. ಬೆಂಚಿನ ಮೇಲೆ ಜಾರುತ್ತದೆ.</span>
              </div>
            </div>
            <!-- Pencil -->
            <div class="item-card">
              <div class="item-row">
                <svg viewBox="0 0 100 100" width="40" height="40"><use href="#card-pencil"/></svg>
                <div style="flex: 1;">
                  <div style="display: flex; justify-content: space-between;">
                    <strong>Wooden Pencil</strong>
                    <span class="badge badge-sky">➡️ Slides</span>
                  </div>
                  <span class="kannada" style="font-size: 12px; color: var(--violet-700); font-weight: 600;">ಪೆನ್ಸಿಲ್</span>
                </div>
              </div>
              <div class="obs-box">
                <span>Long wooden writing pencil. Slides when pushed flat.</span>
                <span class="kannada">ಉದ್ದವಾದ ಮರದ ಪೆನ್ಸಿಲ್. ಚಪ್ಪಟೆಯಾಗಿ ಇಟ್ಟಾಗ ಜಾರುತ್ತದೆ.</span>
              </div>
            </div>
          </div>

          <!-- Round Column -->
          <div class="column-box" style="border-color: #fde68a;">
            <div class="column-header">
              <div>
                <h4 style="font-size: 15px; font-weight: 700; color: var(--amber-800);">⚽ Round Objects (ದುಂಡಗಿನ ವಸ್ತುಗಳು)</h4>
                <p style="font-size: 11px; color: var(--amber-800);">Characteristic Movement: Rolls (ಉರುಳುತ್ತದೆ)</p>
              </div>
              <span class="badge badge-amber">2 Objects + 1 Inquiry</span>
            </div>
            <!-- Ball -->
            <div class="item-card">
              <div class="item-row">
                <svg viewBox="0 0 100 100" width="40" height="40"><use href="#card-ball"/></svg>
                <div style="flex: 1;">
                  <div style="display: flex; justify-content: space-between;">
                    <strong>Rubber Ball</strong>
                    <span class="badge badge-amber">🌀 Rolls</span>
                  </div>
                  <span class="kannada" style="font-size: 12px; color: var(--violet-700); font-weight: 600;">ರಬ್ಬರ್ ಚೆಂಡು</span>
                </div>
              </div>
              <div class="obs-box">
                <span>Round red ball with seam curves. Rolls smoothly in any direction.</span>
                <span class="kannada">ದುಂಡಗಿನ ಕೆಂಪು ಚೆಂಡು. ಸುಲಭವಾಗಿ ಉರುಳುತ್ತದೆ.</span>
              </div>
            </div>
            <!-- Orange -->
            <div class="item-card">
              <div class="item-row">
                <svg viewBox="0 0 100 100" width="40" height="40"><use href="#card-orange"/></svg>
                <div style="flex: 1;">
                  <div style="display: flex; justify-content: space-between;">
                    <strong>Fresh Orange</strong>
                    <span class="badge badge-amber">🌀 Rolls</span>
                  </div>
                  <span class="kannada" style="font-size: 12px; color: var(--violet-700); font-weight: 600;">ಕಿತ್ತಳೆ ಹಣ್ಣು</span>
                </div>
              </div>
              <div class="obs-box">
                <span>Round citrus fruit. Rolls across the floor.</span>
                <span class="kannada">ದುಂಡಗಿನ ಸಿಹಿ ಕಿತ್ತಳೆ ಹಣ್ಣು. ನೆಲದ ಮೇಲೆ ಉರುಳುತ್ತದೆ.</span>
              </div>
            </div>
            <!-- Inquiry Card -->
            <div style="padding: 14px; background: linear-gradient(135deg, #fffbeb, #f5f3ff); border: 1.5px dashed #f59e0b; border-radius: 12px; display: flex; flex-direction: column; gap: 6px;">
              <div style="font-size: 12px; font-weight: 700; color: var(--violet-700);">🔍 Classroom Discovery Inquiry (ಕಲಿಕಾ ಅನ್ವೇಷಣೆ)</div>
              <p style="font-size: 12px; color: var(--midnight); font-weight: 500;">Can an object both roll and slide? Look at the objects below!</p>
              <p class="kannada" style="font-size: 12px; color: var(--violet-700);">ಒಂದೇ ವಸ್ತು ಉರುಳಲು ಮತ್ತು ಜಾರಲು ಎರಡೂ ಸಾಧ್ಯವೇ? ಕೆಳಗಿನ ಬಹು-ಕೋನ ವಸ್ತುಗಳನ್ನು ನೋಡಿ!</p>
            </div>
          </div>
        </div>

        <!-- Multi-Perspective Section -->
        <div class="multi-section">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ede9fe; padding-bottom: 8px;">
            <div>
              <h4 style="font-size: 16px; font-weight: 700; color: var(--midnight);">🔄 Multi-Perspective Observation Section</h4>
              <p class="kannada" style="font-size: 12px; color: var(--violet-700); font-weight: 600;">ಬಹು-ಕೋನ ವೀಕ್ಷಣೆ: ನೋಡುವ ಕೋನದ ಆಧಾರದ ಮೇಲೆ ವಸ್ತುಗಳ ಆಕಾರ ಬದಲಾಗುತ್ತದೆ</p>
            </div>
            <span class="badge badge-violet">3 Special Objects</span>
          </div>

          <div class="multi-grid">
            <!-- Bottle -->
            <div class="multi-card">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 700; font-size: 14px;">Water Bottle</span>
                <span class="badge badge-violet" style="font-size: 10px;">Rolls & Slides</span>
              </div>
              <span class="kannada" style="font-size: 12px; color: var(--violet-700); font-weight: 600;">ನೀರಿನ ಬಾಟಲಿ</span>
              <div class="viewpoint-box">
                <strong>Viewpoint Observation:</strong>
                <span>Long cylindrical body when viewed from the side; circular shape when viewed from its base.</span>
                <span class="kannada" style="color: var(--violet-700);">ಪಕ್ಕದಿಂದ ನೋಡಿದಾಗ ಉದ್ದ ಸಿಲಿಂಡರ್ ಆಕಾರ; ಕೆಳಭಾಗದಿಂದ ನೋಡಿದಾಗ ದುಂಡಾದ ವೃತ್ತಾಕಾರ.</span>
              </div>
            </div>

            <!-- Bangle -->
            <div class="multi-card">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 700; font-size: 14px;">Bangle</span>
                <span class="badge badge-violet" style="font-size: 10px;">Rolls on Rim</span>
              </div>
              <span class="kannada" style="font-size: 12px; color: var(--violet-700); font-weight: 600;">ಬಳೆ</span>
              <div class="viewpoint-box">
                <strong>Viewpoint Observation:</strong>
                <span>Circular ring that rolls along its rim; appears like a straight line when viewed edge-on.</span>
                <span class="kannada" style="color: var(--violet-700);">ಅಂಚಿನ ಮೇಲೆ ಉರುಳುವ ದುಂಡಗಿನ ಬಳೆ; ಬದಿಯಿಂದ ನೋಡಿದಾಗ ನೇರ ರೇಖೆಯಂತೆ ಕಾಣುತ್ತದೆ.</span>
              </div>
            </div>

            <!-- Pencil Box -->
            <div class="multi-card">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 700; font-size: 14px;">Pencil Box</span>
                <span class="badge badge-violet" style="font-size: 10px;">Slides Flat</span>
              </div>
              <span class="kannada" style="font-size: 12px; color: var(--violet-700); font-weight: 600;">ಪೆನ್ಸಿಲ್ ಬಾಕ್ಸ್</span>
              <div class="viewpoint-box">
                <strong>Viewpoint Observation:</strong>
                <span>Elongated cuboid with flat faces; slides rather than rolls under the demonstrated conditions.</span>
                <span class="kannada" style="color: var(--violet-700);">ಚಪ್ಪಟೆ ಮುಖಗಳನ್ನು ಹೊಂದಿರುವ ಉದ್ದವಾದ ಆಯತಾಕಾರದ ಪೆಟ್ಟಿಗೆ; ಇದು ಜಾರುತ್ತದೆ.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Curriculum Provenance Card -->
    <section>
      <h2 class="section-title">3. Curriculum Provenance & Alignment Card</h2>
      <p class="section-subtitle">Displaying textbook citation, audit methodology, and legal non-endorsement disclaimer</p>

      <div class="provenance-card">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--slate-100); padding-bottom: 10px;">
          <div>
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--slate-500);">Curriculum Provenance & Alignment</span>
            <h4 style="font-size: 16px; font-weight: 700; color: var(--midnight);">Karnataka State Board — Class 1 Mathematics</h4>
          </div>
          <span class="badge badge-emerald">✓ Curriculum-aligned resource</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 12px;">
          <div>
            <span style="font-weight: 600; color: var(--slate-500); text-transform: uppercase; font-size: 10px; display: block;">Textbook Citation</span>
            <p style="font-weight: 600; color: var(--midnight); margin-top: 2px;">Joyful Mathematics, Class 1, Part 1, English and Kannada Bilingual</p>
            <p style="color: var(--slate-600);">Revised 2026–27 Edition</p>
          </div>
          <div>
            <span style="font-weight: 600; color: var(--slate-500); text-transform: uppercase; font-size: 10px; display: block;">Chapter & Printed Pages</span>
            <p style="font-weight: 600; color: var(--midnight); margin-top: 2px;">Chapter 2: What is Long? What is Round? (ಯಾವುದು ಉದ್ದ? ಯಾವುದು ದುಂಡು?)</p>
            <p style="color: var(--slate-600);">Printed Pages: 13–14 • Publisher: Karnataka Textbook Society (KTBS), Bengaluru</p>
          </div>
        </div>

        <div style="background: var(--slate-100); padding: 10px 14px; border-radius: 8px; font-size: 11px; color: var(--slate-600);">
          <strong>Curriculum Alignment Audit:</strong> Inspection of uploaded digital textbook PDF: Joyful Mathematics, Class 1, Part 1, English and Kannada Bilingual (Revised 2026–27), Chapter 2, printed pages 13–14, Section: Shapes (ಆಕಾರಗಳು).
        </div>

        <div class="disclaimer-box" id="legal-disclaimer">
          <strong>Legal Disclaimer:</strong> Independent teacher-support resource aligned to the Karnataka State Board syllabus; not officially published, endorsed, or approved by KTBS, DSERT, or the Government of Karnataka.
        </div>
      </div>
    </section>

    <!-- 4. Kannada Linguistic Scenarios Verification Table -->
    <section>
      <h2 class="section-title">4. Kannada Typography & Linguistic Scenarios Verification</h2>
      <p class="section-subtitle">Evaluating glyph shaping, conjunct formation, and viramas in browser</p>
      <table class="kannada-test-table">
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Sample Kannada Word</th>
            <th>English Meaning</th>
            <th>Linguistic Feature Verified</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Scenario 1</td>
            <td class="kannada" style="font-size: 16px; font-weight: 700; color: var(--violet-700);">ಆಕಾರಗಳು</td>
            <td>Shapes (Topic Concept)</td>
            <td>Base vowel &amp; consonant ligature rendering</td>
          </tr>
          <tr>
            <td>Scenario 2</td>
            <td class="kannada" style="font-size: 16px; font-weight: 700; color: var(--violet-700);">ಉದ್ದವಾದ</td>
            <td>Long objects</td>
            <td>Double consonant conjunct (ದ + ದ ಒತ್ತಕ್ಷರ)</td>
          </tr>
          <tr>
            <td>Scenario 3</td>
            <td class="kannada" style="font-size: 16px; font-weight: 700; color: var(--violet-700);">ದುಂಡಗಿನ</td>
            <td>Round objects</td>
            <td>Anusvara (ಂ) and u-matra positioning</td>
          </tr>
          <tr>
            <td>Scenario 4</td>
            <td class="kannada" style="font-size: 16px; font-weight: 700; color: var(--violet-700);">ಉರುಳುತ್ತದೆ</td>
            <td>Rolls (Movement)</td>
            <td>Retroflex ಳ and conjunct ligature (ತ + ತ ಒತ್ತಕ್ಷರ)</td>
          </tr>
          <tr>
            <td>Scenario 5</td>
            <td class="kannada" style="font-size: 16px; font-weight: 700; color: var(--violet-700);">ಜಾರುತ್ತದೆ</td>
            <td>Slides (Movement)</td>
            <td>Dīrgha (ದೀರ್ಘ) long vowel and dental conjunct</td>
          </tr>
          <tr>
            <td>Scenario 6</td>
            <td class="kannada" style="font-size: 16px; font-weight: 700; color: var(--violet-700);">ಕ್ರಿಕೆಟ್ ಬ್ಯಾಟ್</td>
            <td>Cricket Bat (Canonical ID)</td>
            <td>Ra-kāra conjunct (ಕ್ರಿ) and virama ಹಲಂತ (ಟ್)</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(htmlContent);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Stage 3B Verification Server running at http://127.0.0.1:${PORT}`);
});
