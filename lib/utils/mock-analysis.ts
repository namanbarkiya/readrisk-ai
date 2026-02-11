import type { Analysis, AnalysisResult } from "@/lib/types/analysis";

export function createMockAnalysisWithResults(
  analysisId: string
): { analysis: Analysis; result: AnalysisResult } {
  const now = new Date().toISOString();

  const analysis: Analysis = {
    id: analysisId,
    user_id: "demo-user",
    file_name: "Employment Agreement (Demo) — Senior Engineer.pdf",
    file_type: "pdf",
    file_size: 842_112,
    file_url: "mock://riskread/demo/employment-agreement",
    status: "completed",
    overall_score: 72,
    risk_level: "medium",
    processing_started_at: now,
    processing_completed_at: now,
    created_at: now,
    updated_at: now,
  };

  const result: AnalysisResult = {
    id: `demo-result-${analysisId}`,
    analysis_id: analysisId,
    relevance_score: 86,
    completeness_score: 72,
    risk_score: 66,
    clarity_score: 60,
    accuracy_score: 80,
    insights: [
      {
        id: 1,
        category: "risk",
        confidence: 92,
        text: "Termination language is one-sided (broad 'for cause' triggers, vague performance standards, no cure period). This increases risk of a wrongful termination allegation and makes outcomes harder to defend consistently.",
      },
      {
        id: 2,
        category: "risk",
        confidence: 88,
        text: "The agreement allows immediate termination for 'policy violations' without defining the policies or providing notice. This creates ambiguity and inconsistent enforcement risk.",
      },
      {
        id: 3,
        category: "risk",
        confidence: 84,
        text: "Non-disparagement + confidentiality provisions are broad and could be read to restrict lawful whistleblowing or protected activity unless a clear carve-out is included.",
      },
      {
        id: 4,
        category: "risk",
        confidence: 82,
        text: "The restrictive covenants section (non-solicit / non-compete style language) is drafted as if universally enforceable. If the employee’s work location limits non-competes, the clause may be unenforceable and create reputational + hiring friction.",
      },
      {
        id: 5,
        category: "risk",
        confidence: 79,
        text: "Arbitration language is present but does not describe cost allocation, venue, or an opt-out process. This can raise fairness challenges and reduce enforceability depending on jurisdiction.",
      },
      {
        id: 6,
        category: "weakness",
        confidence: 78,
        text: "No explicit severance/transition framework (notice, payout timing, final wages, PTO treatment). This can create operational friction and employee relations issues at exit.",
      },
      {
        id: 7,
        category: "weakness",
        confidence: 74,
        text: "IP assignment is present but 'work product' scope is overly broad (could unintentionally capture open-source contributions and side projects). This can reduce candidate acceptance and increase disputes.",
      },
      {
        id: 8,
        category: "weakness",
        confidence: 73,
        text: "No clear statement on equipment return, data deletion, and access revocation timing. This is a common operational-control gap during offboarding.",
      },
      {
        id: 9,
        category: "opportunity",
        confidence: 81,
        text: "Add a short 'termination process' section (documented performance plan, cure window for minor breaches, consistent notice language). This improves defensibility and reduces litigation risk without weakening employer protections.",
      },
      {
        id: 10,
        category: "opportunity",
        confidence: 77,
        text: "Add a one-paragraph 'policy incorporation' section with a stable reference (employee handbook URL/version + acknowledgment). This reduces ambiguity when referencing policies in termination decisions.",
      },
      {
        id: 11,
        category: "strength",
        confidence: 86,
        text: "Role, compensation, and equity references are clearly stated with a good high-level offer structure, reducing basic disputes around pay and title.",
      },
      {
        id: 12,
        category: "strength",
        confidence: 83,
        text: "Confidentiality obligations are clearly labeled and separated from IP assignment, which helps readability and reduces inadvertent scope creep (once carve-outs are added).",
      },
    ],
    recommendations: [
      {
        id: 1,
        priority: "high",
        category: "legal",
        text: "Rewrite the 'for cause' definition: narrow triggers, define 'material breach', add a cure period for non-egregious breaches (e.g., 10 business days), and require written notice that states the specific basis for termination.",
      },
      {
        id: 2,
        priority: "high",
        category: "compliance",
        text: "Add protected activity carve-outs to confidentiality and non-disparagement (e.g., nothing restricts reporting to regulators, discussing wages/working conditions, or participating in investigations) and align with applicable whistleblower laws.",
      },
      {
        id: 3,
        priority: "high",
        category: "operational",
        text: "Add an exit checklist section: final pay timing, return of property, systems access, offboarding timeline, and who to contact. This reduces operational risk and improves consistency across departures.",
      },
      {
        id: 4,
        priority: "high",
        category: "legal",
        text: "If you include arbitration: specify cost allocation, venue, discoverability limits, and an opt-out window (e.g., 30 days). Ensure the clause is presented clearly and separately acknowledged where required.",
      },
      {
        id: 5,
        priority: "medium",
        category: "legal",
        text: "Clarify the at-will statement and make it consistent across the document (avoid conflicting phrases like 'term of employment' or implied guarantees).",
      },
      {
        id: 6,
        priority: "medium",
        category: "legal",
        text: "Tighten IP assignment scope: exclude pre-existing inventions and personal side projects not using company resources; add an open-source contribution policy reference.",
      },
      {
        id: 7,
        priority: "medium",
        category: "compliance",
        text: "Constrain restrictive covenants to what’s actually enforceable in the employee’s jurisdiction (or include a jurisdiction-specific addendum). Avoid broad non-compete language if the role/work location makes it non-viable.",
      },
      {
        id: 8,
        priority: "medium",
        category: "operational",
        text: "Add a security/offboarding clause: device return timing, access revocation within 24 hours, and confirmation of data deletion/transfer for company systems.",
      },
      {
        id: 9,
        priority: "low",
        category: "financial",
        text: "Add a short severance matrix (optional) or clearly state when severance applies. Even a simple policy-level reference reduces negotiation churn at exit.",
      },
      {
        id: 10,
        priority: "low",
        category: "operational",
        text: "Add a 'document hierarchy' statement: if offer letter conflicts with handbook/policies/plan documents, specify which controls (equity plan, benefits plan, etc.). This reduces internal inconsistency over time.",
      },
    ],
    extracted_fields: [
      {
        name: "Employment status",
        value: "At-will (stated), but references to a 'term' appear elsewhere",
        confidence: 86,
        ambiguity_notes:
          "Mixed language may be interpreted as a guaranteed term depending on jurisdiction and context.",
        page_number: 1,
      },
      {
        name: "Termination (for cause)",
        value:
          "Broad triggers including 'policy violations' and 'unsatisfactory performance' without cure period",
        confidence: 90,
        page_number: 2,
      },
      {
        name: "Termination (without cause)",
        value: "Employer may terminate without cause; employee notice period is unclear",
        confidence: 77,
        ambiguity_notes:
          "Consider mutual notice requirements or clarify that notice is optional vs required.",
        page_number: 2,
      },
      {
        name: "Confidentiality / non-disclosure",
        value: "Broad, no explicit regulatory / protected activity carve-out",
        confidence: 84,
        page_number: 3,
      },
      {
        name: "Intellectual property assignment",
        value:
          "All work product 'related to company business' with limited pre-existing invention carve-out",
        confidence: 79,
        page_number: 4,
      },
      {
        name: "Dispute resolution",
        value: "Arbitration clause present; opt-out process not described",
        confidence: 73,
        ambiguity_notes:
          "If arbitration is used, define scope, costs, venue, and opt-out window if applicable.",
        page_number: 5,
      },
      {
        name: "Restrictive covenants",
        value:
          "Non-solicit / non-compete style restrictions appear broad and not jurisdiction-scoped",
        confidence: 76,
        ambiguity_notes:
          "Enforceability varies widely. Consider jurisdiction-specific language or removing non-compete where prohibited.",
        page_number: 6,
      },
      {
        name: "Final pay / PTO treatment",
        value:
          "Final wages timing and PTO payout treatment not clearly described in the agreement",
        confidence: 71,
        ambiguity_notes:
          "These requirements may be statutory and vary by jurisdiction; clarify policy reference and timing.",
        page_number: 2,
      },
      {
        name: "Offboarding / return of property",
        value:
          "Return-of-property obligation exists but no timeline for device return / access revocation",
        confidence: 74,
        page_number: 7,
      },
    ],
    highlights: [
      {
        category: "risky",
        page_number: 2,
        text: "Company may terminate for cause for any violation of Company policy, as determined in Company’s sole discretion.",
        reason:
          "High discretion + undefined policies can be challenged as arbitrary; increases wrongful termination and inconsistent enforcement risk.",
      },
      {
        category: "unclear",
        page_number: 2,
        text: "Employee will perform duties during the term of employment as assigned by Company from time to time.",
        reason:
          "References to a 'term' can conflict with at-will language. Clarify that employment remains at-will unless explicitly stated otherwise.",
      },
      {
        category: "important",
        page_number: 3,
        text: "Employee agrees to keep all Company information confidential and not disclose it to any third party.",
        reason:
          "Should include carve-outs for legal rights (regulators, protected activity, subpoenas) and define confidential information boundaries.",
      },
      {
        category: "risky",
        page_number: 4,
        text: "All inventions conceived or reduced to practice during employment are assigned to the Company.",
        reason:
          "Overbreadth can capture side projects and open-source contributions. Add pre-existing inventions schedule and OSS policy alignment.",
      },
      {
        category: "risky",
        page_number: 5,
        text: "Any dispute arising out of or relating to this Agreement shall be resolved by binding arbitration.",
        reason:
          "Arbitration clauses should specify venue, cost allocation, scope, and any opt-out rights to improve enforceability and reduce fairness challenges.",
      },
      {
        category: "unclear",
        page_number: 6,
        text: "Employee agrees not to engage in any business that competes with the Company during employment and for a period thereafter.",
        reason:
          "Broad non-compete style language may be unenforceable depending on jurisdiction. Consider narrowing to non-solicit/confidentiality or using a jurisdiction-specific addendum.",
      },
      {
        category: "important",
        page_number: 7,
        text: "Upon termination, Employee shall return all Company property and information.",
        reason:
          "Add timelines and security steps (device return deadline, access revocation, data deletion attestation) to reduce operational and security risk.",
      },
    ],
    questions: [
      {
        priority: "critical",
        category: "compliance",
        text: "Which jurisdictions apply (employee work location + governing law)? Employment termination standards and protected activity carve-outs vary significantly.",
        suggested_action:
          "Add governing law + venue consistent with the employee’s primary work location; review local requirements for final pay, notice, and arbitration.",
      },
      {
        priority: "critical",
        category: "compliance",
        text: "Is this role in a jurisdiction where non-competes are restricted or prohibited (or where notice requirements apply)?",
        suggested_action:
          "Replace broad non-compete language with enforceable alternatives (confidentiality, non-solicit, IP) or attach a jurisdiction-specific addendum.",
      },
      {
        priority: "important",
        category: "clarity",
        text: "Should termination 'for cause' include a cure period for non-egregious breaches (e.g., policy training issues, performance gaps)?",
        suggested_action:
          "Define a cure window and an internal documentation step (written notice + documented performance plan).",
      },
      {
        priority: "important",
        category: "completeness",
        text: "Is there an equity plan / option agreement that controls vesting and termination outcomes?",
        suggested_action:
          "Reference the governing plan documents explicitly and avoid duplicating vesting rules in the offer letter.",
      },
      {
        priority: "important",
        category: "completeness",
        text: "Do you have an employee handbook or policy repository referenced by version/date (so 'policy violations' is objectively identifiable)?",
        suggested_action:
          "Add a handbook reference (link + version) and require acknowledgment; define which policies qualify as 'material' for termination decisions.",
      },
      {
        priority: "optional",
        category: "accuracy",
        text: "Do you have an open-source contribution policy that should be referenced alongside IP assignment?",
        suggested_action:
          "Add a policy link and specify approvals needed for external contributions.",
      },
    ],
    raw_ai_response: {
      demo: true,
      doc_type: "employment_agreement",
      top_risks: [
        "Broad termination discretion without defined standards",
        "Missing protected activity carve-outs (confidentiality / non-disparagement)",
        "Overbroad IP assignment impacting side projects / OSS",
        "Restrictive covenant language not scoped to jurisdiction enforceability",
        "Arbitration clause missing cost/venue/opt-out details",
      ],
      suggested_sections: [
        "Termination process + documentation",
        "Protected activity carve-outs",
        "IP assignment clarifications + OSS policy reference",
        "Restrictive covenants addendum / enforceability alignment",
        "Arbitration details (costs, venue, opt-out)",
        "Security offboarding checklist",
      ],
    },
    created_at: now,
  };

  return { analysis, result };
}

