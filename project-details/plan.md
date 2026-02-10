# 📄 MVP Product Plan – Single-Click Analysis Tool

**(with JSON-only Gemini prompts & Scoring Formulas)**

---

## 1. 🎯 Goal

Let users **upload → analyze → view structured insights & scores** in a clean UI, with **JSON-based Gemini outputs** for easy parsing.

---

## 2. 🗂 Page Structure

### **1. Landing / Upload Page**

**Purpose:** Quick start for new analysis.

**Sections:**

- **Hero Header:** Short tagline + benefit.
- **File Upload Card:**
  - Drag & drop + "Select File" button.
  - Supported: `.pdf, .docx, .xlsx`.
  - CTA: **"Analyze Now"** → sends file to backend → redirects to `/analysis/:id`.

- **History Sidebar (collapsible)**
  - Lists **all past analyses**:
    - File Name
    - Date
    - Score (color badge)

  - Clicking item → `/analysis/:id`.

---

### **2. Analysis / Results Page** (`/analysis/:id`)

**Purpose:** Show AI analysis results, scores, and insights in tabs.

**Top Summary:**

- Document Name & Date
- Overall Score Badge (color-coded)
- Key Highlight Chips
- Reanalyze Button

---

#### **Tab 1 – Overview**

- **Quick Insights (Collapsible)**
  **Gemini Prompt:**

  ```json
  {
    "role": "system",
    "content": "You are an AI document analysis assistant. Always output JSON only."
  },
  {
    "role": "user",
    "content": "Analyze the document text below and return exactly 5 key insights in JSON format.
    Output format: {\"insights\": [{\"id\": 1, \"text\": \"string\"}]}
    Document: {document_text}"
  }
  ```

- **Score Breakdown Chart**
  **Formulas:**

  ```text
  Relevance = (matched_keywords / total_expected_keywords) * 100
  Completeness = (filled_required_fields / total_required_fields) * 100
  Risk = 100 - ((high_risk_items * risk_weight + medium_risk_items * (risk_weight/2)) / max_possible_risk) * 100
  Clarity = (clear_statements / total_statements) * 100
  Accuracy = avg(confidence_scores_of_extractions)

  Overall Score = (Relevance * 0.25) + (Completeness * 0.25) + (Risk * 0.20) + (Clarity * 0.15) + (Accuracy * 0.15)
  ```

- **Top Recommendations**
  **Gemini Prompt:**

  ```json
  {
    "role": "user",
    "content": "From the document, return the top 3 recommendations for improvement in JSON format.
    Output: {\"recommendations\": [{\"id\": 1, \"text\": \"string\"}]}
    Document: {document_text}"
  }
  ```

---

#### **Tab 2 – Detailed Insights**

- **Extracted Key Information Table**
  **Gemini Prompt:**

  ```json
  {
    "role": "user",
    "content": "Extract the following fields: [field_list]. For each, return value, confidence (0-100), and ambiguity_notes.
    Output: {\"fields\": [{\"name\": \"string\", \"value\": \"string\", \"confidence\": number, \"ambiguity_notes\": \"string\"}]}
    Document: {document_text}"
  }
  ```

- **Category Sections (Collapsible)** – Risk, Missing Info, Strengths, Weaknesses.
  **Gemini Prompt:**

  ```json
  {
    "role": "user",
    "content": "Identify risks, missing info, strengths, and weaknesses from the document.
    Output: {\"risks\": [\"string\"], \"missing_info\": [\"string\"], \"strengths\": [\"string\"], \"weaknesses\": [\"string\"]}
    Document: {document_text}"
  }
  ```

---

#### **Tab 3 – Document Viewer**

- Inline PDF/Doc preview + AI-highlighted key sections.
  **Gemini Prompt:**

  ```json
  {
    "role": "user",
    "content": "Highlight important and risky parts.
    Output: {\"highlights\": [{\"text\": \"string\", \"reason\": \"string\", \"category\": \"important|risky\"}]}
    Document: {document_text}"
  }
  ```

---

#### **Tab 4 – Questions**

- Clarification questions grouped by urgency.
  **Gemini Prompt:**

  ```json
  {
    "role": "user",
    "content": "Generate clarification questions for unclear, misleading, or incomplete statements.
    Output: {\"critical\": [\"string\"], \"important\": [\"string\"], \"optional\": [\"string\"]}
    Document: {document_text}"
  }
  ```

---

### **3. History Page** (`/history`)

**Purpose:** View **all past analyses** and open `/analysis/:id`.

**List View:**

- File Name | Date | Score | “View Analysis” button
- Sort by date, score, name.
- Clicking → `/analysis/:id`.

---

## 3. 📊 Scoring Recap

| Factor        | Formula                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| Relevance     | `(matched_keywords / total_expected_keywords) * 100`                                                      |
| Completeness  | `(filled_required_fields / total_required_fields) * 100`                                                  |
| Risk          | `100 - ((high_risk_items * risk_weight + medium_risk_items * (risk_weight/2)) / max_possible_risk) * 100` |
| Clarity       | `(clear_statements / total_statements) * 100`                                                             |
| Accuracy      | `avg(confidence_scores_of_extractions)`                                                                   |
| Overall Score | `(Relevance*0.25)+(Completeness*0.25)+(Risk*0.20)+(Clarity*0.15)+(Accuracy*0.15)`                         |

---

## 4. 📌 UI Notes

- Every major block collapsible for clean look.
- Scores color-coded.
- Tabs collapse into dropdown on mobile.
- History always accessible in sidebar.

---

## 5. ❓ Question Categories

- **Critical** – Must resolve before acceptance.
- **Important** – Improves clarity.
- **Optional** – Nice-to-have context.

---

If we implement this, Cursor AI will have **zero ambiguity**:

- **JSON-only prompts** → predictable parsing.
- **Fixed scoring formulas** → consistent metrics.
- **Direct `/analysis/:id` from history** → smooth UX.
