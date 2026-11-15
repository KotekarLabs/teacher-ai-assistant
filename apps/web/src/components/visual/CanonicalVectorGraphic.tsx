import React from "react";
import type { CanonicalObjectId } from "@teacher-ai/contracts";

export interface CanonicalVectorGraphicProps {
  id: CanonicalObjectId;
  size?: number;
  className?: string;
  title?: string;
}

/**
 * Pure SVG vector illustration component for the 8 canonical curriculum objects.
 * Vector paths correspond exactly to the accepted Stage 2 PDF vector renderer.
 */
export const CanonicalVectorGraphic: React.FC<CanonicalVectorGraphicProps> = ({
  id,
  size = 48,
  className = "",
  title,
}) => {
  const accessibleTitle = title || id.replace("_", " ");

  const renderShape = () => {
    switch (id) {
      case "bat":
        return (
          <g data-testid="vector-bat">
            {/* Handle */}
            <rect
              x="44"
              y="6"
              width="12"
              height="30"
              rx="2"
              fill="#475569"
              stroke="#1E293B"
              strokeWidth="2"
            />
            {/* Grip Wraps */}
            <line x1="44" y1="13" x2="56" y2="13" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="44" y1="20" x2="56" y2="20" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="44" y1="27" x2="56" y2="27" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Blade */}
            <rect
              x="36"
              y="36"
              width="28"
              height="58"
              rx="4"
              fill="#FDE68A"
              stroke="#D97706"
              strokeWidth="2.5"
            />
            {/* Spine Contour */}
            <line
              x1="50"
              y1="38"
              x2="50"
              y2="88"
              stroke="#B45309"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Wood Grain Accent */}
            <line
              x1="43"
              y1="44"
              x2="43"
              y2="80"
              stroke="#FBBF24"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <line
              x1="57"
              y1="44"
              x2="57"
              y2="80"
              stroke="#FBBF24"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </g>
        );

      case "ball":
        return (
          <g data-testid="vector-ball">
            {/* Main Sphere */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="#EF4444"
              stroke="#DC2626"
              strokeWidth="2.5"
            />
            {/* Gloss Highlight */}
            <ellipse
              cx="38"
              cy="34"
              rx="12"
              ry="7"
              transform="rotate(-25 38 34)"
              fill="#F87171"
              opacity="0.6"
            />
            {/* Tennis/Cricket Seam Curves */}
            <path
              d="M 22 22 C 38 38, 38 62, 22 78"
              fill="none"
              stroke="#F8FAFC"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 78 22 C 62 38, 62 62, 78 78"
              fill="none"
              stroke="#F8FAFC"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        );

      case "pencil":
        return (
          <g data-testid="vector-pencil">
            {/* Hexagonal Shaft */}
            <rect
              x="38"
              y="22"
              width="24"
              height="50"
              rx="2"
              fill="#F59E0B"
              stroke="#D97706"
              strokeWidth="2"
            />
            {/* Facet Shading Lines */}
            <line x1="46" y1="22" x2="46" y2="72" stroke="#D97706" strokeWidth="1.5" />
            <line x1="54" y1="22" x2="54" y2="72" stroke="#B45309" strokeWidth="1.5" />
            {/* Ferrule (Metal Band) */}
            <rect
              x="38"
              y="14"
              width="24"
              height="8"
              fill="#94A3B8"
              stroke="#64748B"
              strokeWidth="1.5"
            />
            <line x1="38" y1="18" x2="62" y2="18" stroke="#CBD5E1" strokeWidth="1" />
            {/* Eraser */}
            <path
              d="M 38 14 C 38 7, 62 7, 62 14 Z"
              fill="#FB7185"
              stroke="#E11D48"
              strokeWidth="1.5"
            />
            {/* Sharpened Wood Cone */}
            <polygon
              points="38,72 62,72 50,92"
              fill="#FEF3C7"
              stroke="#D97706"
              strokeWidth="1.5"
            />
            {/* Graphite Lead Tip */}
            <polygon points="46,85 54,85 50,92" fill="#1E293B" />
          </g>
        );

      case "orange":
        return (
          <g data-testid="vector-orange">
            {/* Citrus Body */}
            <circle
              cx="50"
              cy="54"
              r="40"
              fill="#F97316"
              stroke="#EA580C"
              strokeWidth="2.5"
            />
            {/* Rind Texture Stipple Dots */}
            <circle cx="36" cy="46" r="1.5" fill="#C2410C" opacity="0.7" />
            <circle cx="44" cy="58" r="1.5" fill="#C2410C" opacity="0.7" />
            <circle cx="62" cy="48" r="1.5" fill="#C2410C" opacity="0.7" />
            <circle cx="56" cy="66" r="1.5" fill="#C2410C" opacity="0.7" />
            <circle cx="38" cy="68" r="1.5" fill="#C2410C" opacity="0.7" />
            {/* Gloss Highlight */}
            <ellipse
              cx="40"
              cy="40"
              rx="10"
              ry="6"
              transform="rotate(-20 40 40)"
              fill="#FB923C"
              opacity="0.5"
            />
            {/* Stem */}
            <path
              d="M 50 14 C 48 10, 48 7, 52 5"
              fill="none"
              stroke="#15803D"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Leaf */}
            <path
              d="M 50 14 C 62 8, 70 12, 68 20 C 60 22, 54 18, 50 14 Z"
              fill="#22C55E"
              stroke="#16A34A"
              strokeWidth="1.5"
            />
          </g>
        );

      case "ruler":
        return (
          <g data-testid="vector-ruler">
            {/* Ruler Body */}
            <rect
              x="10"
              y="32"
              width="80"
              height="36"
              rx="3"
              fill="#E0F2FE"
              stroke="#0284C7"
              strokeWidth="2"
            />
            {/* Metric Graduation Ticks (Top Edge) */}
            <line x1="16" y1="32" x2="16" y2="44" stroke="#0369A1" strokeWidth="2" />
            <line x1="24" y1="32" x2="24" y2="38" stroke="#38BDF8" strokeWidth="1.2" />
            <line x1="32" y1="32" x2="32" y2="44" stroke="#0369A1" strokeWidth="2" />
            <line x1="40" y1="32" x2="40" y2="38" stroke="#38BDF8" strokeWidth="1.2" />
            <line x1="48" y1="32" x2="48" y2="44" stroke="#0369A1" strokeWidth="2" />
            <line x1="56" y1="32" x2="56" y2="38" stroke="#38BDF8" strokeWidth="1.2" />
            <line x1="64" y1="32" x2="64" y2="44" stroke="#0369A1" strokeWidth="2" />
            <line x1="72" y1="32" x2="72" y2="38" stroke="#38BDF8" strokeWidth="1.2" />
            <line x1="80" y1="32" x2="80" y2="44" stroke="#0369A1" strokeWidth="2" />
            {/* Metric Numbers */}
            <text x="16" y="56" fontSize="8" fontWeight="bold" fill="#0369A1" textAnchor="middle">
              0
            </text>
            <text x="32" y="56" fontSize="8" fontWeight="bold" fill="#0369A1" textAnchor="middle">
              5
            </text>
            <text x="48" y="56" fontSize="8" fontWeight="bold" fill="#0369A1" textAnchor="middle">
              10
            </text>
            <text x="64" y="56" fontSize="8" fontWeight="bold" fill="#0369A1" textAnchor="middle">
              15
            </text>
            <text x="80" y="56" fontSize="8" fontWeight="bold" fill="#0369A1" textAnchor="middle">
              20
            </text>
          </g>
        );

      case "bangle":
        return (
          <g data-testid="vector-bangle">
            {/* Outer Ring */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="#0D9488"
              stroke="#115E59"
              strokeWidth="2.5"
            />
            {/* Inner Cutout Hole */}
            <circle
              cx="50"
              cy="50"
              r="26"
              fill="#FFFFFF"
              stroke="#042F2E"
              strokeWidth="2"
            />
            {/* Specular Teal Luster Arc */}
            <path
              d="M 22 34 C 34 22, 58 22, 74 34"
              fill="none"
              stroke="#5EEAD4"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Decorative Gold Facet Highlight Dots */}
            <circle cx="50" cy="17" r="2.2" fill="#FDE047" />
            <circle cx="73" cy="27" r="2.2" fill="#FDE047" />
            <circle cx="83" cy="50" r="2.2" fill="#FDE047" />
            <circle cx="73" cy="73" r="2.2" fill="#FDE047" />
            <circle cx="50" cy="83" r="2.2" fill="#FDE047" />
            <circle cx="27" cy="73" r="2.2" fill="#FDE047" />
            <circle cx="17" cy="50" r="2.2" fill="#FDE047" />
            <circle cx="27" cy="27" r="2.2" fill="#FDE047" />
          </g>
        );

      case "bottle":
        return (
          <g data-testid="vector-bottle">
            {/* Screw Cap */}
            <rect
              x="42"
              y="8"
              width="16"
              height="10"
              rx="2"
              fill="#1E40AF"
              stroke="#1E3A8A"
              strokeWidth="1.5"
            />
            {/* Neck */}
            <rect
              x="45"
              y="18"
              width="10"
              height="8"
              fill="#60A5FA"
              stroke="#2563EB"
              strokeWidth="1.5"
            />
            {/* Cylindrical Main Body */}
            <rect
              x="36"
              y="26"
              width="28"
              height="64"
              rx="4"
              fill="#3B82F6"
              stroke="#1D4ED8"
              strokeWidth="2"
            />
            {/* 3 Grip Ridges matching Stage 2 PDFKit */}
            <line
              x1="38"
              y1="46"
              x2="62"
              y2="46"
              stroke="#93C5FD"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="38"
              y1="56"
              x2="62"
              y2="56"
              stroke="#93C5FD"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="38"
              y1="66"
              x2="62"
              y2="66"
              stroke="#93C5FD"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Vertical Gloss Line */}
            <line
              x1="40"
              y1="30"
              x2="40"
              y2="84"
              stroke="#DBEAFE"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.8"
            />
          </g>
        );

      case "pencil_box":
        return (
          <g data-testid="vector-pencil_box">
            {/* Main Cuboid Box */}
            <rect
              x="14"
              y="28"
              width="72"
              height="44"
              rx="4"
              fill="#8B5CF6"
              stroke="#6D28D9"
              strokeWidth="2.5"
            />
            {/* Lid Split Line */}
            <line
              x1="14"
              y1="46"
              x2="86"
              y2="46"
              stroke="#DDD6FE"
              strokeWidth="1.5"
            />
            {/* Top Bevel Highlight */}
            <rect
              x="18"
              y="32"
              width="64"
              height="10"
              rx="2"
              fill="#C4B5FD"
              opacity="0.4"
            />
            {/* Center Clasp / Latch */}
            <rect
              x="44"
              y="40"
              width="12"
              height="12"
              rx="2"
              fill="#FCD34D"
              stroke="#D97706"
              strokeWidth="1.5"
            />
            <circle cx="50" cy="46" r="1.5" fill="#B45309" />
          </g>
        );


      default:
        return null;
    }
  };

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`inline-block flex-shrink-0 transition-transform hover:scale-105 ${className}`}
      role="img"
      aria-label={accessibleTitle}
    >
      <title>{accessibleTitle}</title>
      {renderShape()}
    </svg>
  );
};
export default CanonicalVectorGraphic;
