# 📄 **RiskRead AI – Product Overview**

## 1. **Product Summary**

**RiskRead AI** is an **AI-powered document analysis platform** that allows users to upload any file and receive **instant risk scoring, key insights, and actionable recommendations**.
It’s designed for professionals dealing with **contracts, compliance documents, reports, or any risk-sensitive content**, enabling **one-click clarity** with a focus on accuracy, transparency, and speed.

---

## 2. **Core Value Proposition**

- **One-Click Risk Analysis** – Upload a document and instantly get a **risk score**, breakdown of issues, and AI-generated clarifying questions.
- **Structured Insights** – Clear, JSON-based AI outputs that can be consumed in UI, APIs, or exported.
- **Transparency First** – Every insight is traceable to the original text.
- **Continuous Access** – All analyses stored in a **History library**, accessible anytime.

---

## 3. **Target Users**

- **Legal Teams** – Review contracts, NDAs, and agreements for hidden risks.
- **Compliance Officers** – Verify regulatory adherence in corporate policies.
- **Financial Analysts** – Identify inconsistencies in financial reports.
- **Procurement Managers** – Assess vendor contracts for pitfalls.
- **Business Owners** – Quickly understand complex proposals before signing.

---

## 4. **Key Features**

### 4.1 **Document Upload & Instant Analysis**

- **Supported Formats:** `.pdf`, `.docx`, `.xlsx`
- **Single CTA:** _"Analyze Now"_ → redirects to results page
- **Auto-Save to History** with `/analysis/:id` deep links

---

### 4.2 **Analysis Dashboard (`/analysis/:id`)**

#### **1. Summary Header**

- Document name, upload date
- Overall **Risk Score Badge** (color-coded:
  - **0–40** → Low Risk (Green)
  - **41–70** → Medium Risk (Yellow)
  - **71–100** → High Risk (Red)

- Key risk highlight chips (e.g., _“3 Critical Risks”_, _“2 Missing Clauses”_)
- Reanalyze button

#### **2. Tabs**

1. **Overview**
   - **Quick Insights** – 5 key takeaways (collapsible)
   - **Score Breakdown Chart** – Relevance, Completeness, Risk, Clarity, Accuracy
   - **Top 3 Recommendations**

2. **Detailed Insights**
   - **Extracted Key Fields Table** – Field | Value | Confidence | Ambiguity Notes
   - **Categorized Findings** – Risks, Missing Info, Strengths, Weaknesses (collapsible)
   - **Clickable AI-highlighted text snippets**

3. **Document Viewer**
   - Inline file preview
   - AI-highlighted risky and important segments

4. **Questions**
   - Clarification questions grouped by urgency: Critical, Important, Optional

---

### 4.3 **History Page (`/history`)**

- Displays **all past analyses** with:
  - File Name
  - Date
  - Score
  - **View Analysis** button → `/analysis/:id`

- Sort & filter by date, score, or name

---

## 5. **Scoring Methodology**

RiskRead AI uses a **weighted scoring model**:

| Factor           | Formula                                                                                                   | Weight |
| ---------------- | --------------------------------------------------------------------------------------------------------- | ------ |
| **Relevance**    | `(matched_keywords / total_expected_keywords) * 100`                                                      | 25%    |
| **Completeness** | `(filled_required_fields / total_required_fields) * 100`                                                  | 25%    |
| **Risk**         | `100 - ((high_risk_items * risk_weight + medium_risk_items * (risk_weight/2)) / max_possible_risk) * 100` | 20%    |
| **Clarity**      | `(clear_statements / total_statements) * 100`                                                             | 15%    |
| **Accuracy**     | `avg(confidence_scores_of_extractions)`                                                                   | 15%    |

**Overall Score:**

```
(Relevance * 0.25) + (Completeness * 0.25) + (Risk * 0.20) + (Clarity * 0.15) + (Accuracy * 0.15)
```

---

## 6. **Gemini-Powered JSON Outputs**

Every AI insight is **strictly JSON**, making results predictable and easily parsed.

**Example – Quick Insights Prompt Output**

```json
{
  "insights": [
    { "id": 1, "text": "The contract lacks a dispute resolution clause." },
    { "id": 2, "text": "Payment terms are vague and not time-bound." },
    { "id": 3, "text": "Confidentiality obligations are clearly defined." },
    { "id": 4, "text": "Termination conditions are one-sided." },
    { "id": 5, "text": "Key deliverables are listed but lack timelines." }
  ]
}
```

---

## 7. **Competitive Advantage**

- **JSON-first AI output** → Easy to integrate into internal systems or dashboards
- **Scoring transparency** → Users see exactly how scores are calculated
- **Tab-based navigation** → Clean UX for deep or quick analysis
- **Persistent History** → Every past analysis instantly retrievable

---

## 8. **Future Expansion Ideas**

- Multi-document comparison
- Risk trend analytics over time
- Custom scoring criteria per user/org
- Automated report generation (PDF/Excel export)
