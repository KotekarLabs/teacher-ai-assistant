import React from "react";
import type { LessonProvenance } from "@teacher-ai/contracts";

export interface CurriculumProvenanceCardProps {
  provenance?: LessonProvenance;
  className?: string;
}

export const CurriculumProvenanceCard: React.FC<CurriculumProvenanceCardProps> = ({
  provenance,
  className = "",
}) => {
  const isVerified = provenance?.verificationStatus === "VERIFIED";

  return (
    <section
      data-testid="curriculum-provenance-card"
      aria-label="Curriculum Provenance and Textbook Citation"
      className={`bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-subtle space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Curriculum Provenance & Alignment
          </span>
          <h4 className="text-base font-bold text-slate-900 mt-0.5">
            Karnataka State Board — Class 1 Mathematics
          </h4>
        </div>
        <div>
          {isVerified ? (
            <span
              data-testid="provenance-verified-badge"
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs"
            >
              <span>✓</span>
              <span>Curriculum-aligned resource</span>
            </span>
          ) : (
            <span
              data-testid="provenance-unverified-badge"
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200"
            >
              Unverified Source
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            Textbook Reference
          </span>
          <p className="text-slate-900 font-medium leading-relaxed">
            {provenance?.textbook ||
              "Joyful Mathematics, Class 1, Part 1, English and Kannada Bilingual"}
          </p>
          <p className="text-slate-500">
            {provenance?.edition || "Revised 2026–27 Edition"}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
            Chapter & Printed Pages
          </span>
          <p className="text-slate-900 font-medium">
            {provenance?.chapter ||
              "Chapter 2: What is Long? What is Round? (ಯಾವುದು ಉದ್ದ? ಯಾವುದು ದುಂಡು?)"}
          </p>
          <p className="text-slate-500">
            Printed Pages: {provenance?.printedPages || "13–14"} • Publisher: Karnataka Textbook Society (KTBS)
          </p>
        </div>
      </div>

      {provenance?.sourceEvidence && (
        <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-0.5">
          <span className="font-semibold text-slate-700 block text-[10px] uppercase tracking-wider">
            Curriculum Alignment Audit
          </span>
          <p className="leading-relaxed text-slate-600">{provenance.sourceEvidence}</p>
        </div>
      )}

      {/* Official Legal Disclaimer Box */}
      <div
        data-testid="provenance-disclaimer-notice"
        className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-600 leading-relaxed"
      >
        <span className="font-semibold text-slate-700 mr-1.5">Legal Disclaimer:</span>
        Independent teacher-support resource aligned to the Karnataka State Board syllabus; not officially published, endorsed, or approved by KTBS, DSERT, or the Government of Karnataka.
      </div>
    </section>
  );
};
export default CurriculumProvenanceCard;
