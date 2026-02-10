export interface ScoreWeights {
  relevance: number;
  completeness: number;
  risk: number;
  clarity: number;
  accuracy: number;
}

export interface ScoreResult {
  relevance: number;
  completeness: number;
  risk: number;
  clarity: number;
  accuracy: number;
  overall: number;
  riskLevel: "low" | "medium" | "high";
}

export interface Insight {
  category: string;
  title: string;
  description: string;
  severity?: "high" | "medium" | "low";
  confidence: number;
}

export interface Recommendation {
  category: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
}

export interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
}

export interface Question {
  question: string;
  category: string;
  priority: "high" | "medium" | "low";
}

// Default weights for scoring
export const DEFAULT_WEIGHTS: ScoreWeights = {
  relevance: 0.25,
  completeness: 0.2,
  risk: 0.25,
  clarity: 0.15,
  accuracy: 0.15,
};

/**
 * Calculate relevance score based on insights and extracted fields
 */
export function calculateRelevanceScore(
  insights: Insight[] = [],
  extractedFields: ExtractedField[] = []
): number {
  const insightScore = Math.min(100, insights.length * 10);
  const fieldScore = Math.min(50, extractedFields.length * 5);

  // Bonus for high-confidence insights
  const highConfidenceBonus =
    insights.filter((insight) => insight.confidence > 0.8).length * 2;

  return Math.min(100, insightScore + fieldScore + highConfidenceBonus);
}

/**
 * Calculate completeness score based on coverage of different aspects
 */
export function calculateCompletenessScore(
  insights: Insight[] = [],
  extractedFields: ExtractedField[] = []
): number {
  const categories = new Set([
    ...insights.map((i) => i.category),
    ...extractedFields.map((f) => f.field.split("_")[0]), // Group by field prefix
  ]);

  const categoryScore = Math.min(60, categories.size * 15);
  const coverageScore = Math.min(
    40,
    (insights.length + extractedFields.length) * 2
  );

  return Math.min(100, categoryScore + coverageScore);
}

/**
 * Calculate risk score based on risk insights
 */
export function calculateRiskScore(insights: Insight[] = []): number {
  const riskInsights = insights.filter(
    (insight) =>
      insight.category === "risk" ||
      insight.title.toLowerCase().includes("risk")
  );

  let score = 0;

  riskInsights.forEach((insight) => {
    const severityMultiplier =
      insight.severity === "high" ? 30 : insight.severity === "medium" ? 15 : 5;
    score += severityMultiplier * insight.confidence;
  });

  // Bonus for high-confidence risk findings
  const highConfidenceRisks = riskInsights.filter((i) => i.confidence > 0.8);
  score += highConfidenceRisks.length * 5;

  return Math.min(100, score);
}

/**
 * Calculate clarity score based on questions and document structure
 */
export function calculateClarityScore(
  questions: Question[] = [],
  insights: Insight[] = []
): number {
  // Start with base score
  let score = 100;

  // Deduct points for questions (more questions = less clarity)
  const questionPenalty = questions.length * 8;
  score -= questionPenalty;

  // Deduct points for low-confidence insights
  const lowConfidenceInsights = insights.filter((i) => i.confidence < 0.6);
  const confidencePenalty = lowConfidenceInsights.length * 3;
  score -= confidencePenalty;

  // Bonus for high-confidence insights
  const highConfidenceInsights = insights.filter((i) => i.confidence > 0.9);
  const confidenceBonus = highConfidenceInsights.length * 2;
  score += confidenceBonus;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate accuracy score based on confidence levels
 */
export function calculateAccuracyScore(
  insights: Insight[] = [],
  extractedFields: ExtractedField[] = []
): number {
  const allItems = [
    ...insights.map((i) => ({ confidence: i.confidence, weight: 0.6 })),
    ...extractedFields.map((f) => ({ confidence: f.confidence, weight: 0.4 })),
  ];

  if (allItems.length === 0) return 0;

  const totalWeight = allItems.reduce((sum, item) => sum + item.weight, 0);
  const weightedSum = allItems.reduce(
    (sum, item) => sum + item.confidence * item.weight,
    0
  );

  return Math.round((weightedSum / totalWeight) * 100);
}

/**
 * Calculate overall score using weighted average
 */
export function calculateOverallScore(
  scores: Omit<ScoreResult, "overall" | "riskLevel">,
  weights: ScoreWeights = DEFAULT_WEIGHTS
): number {
  const weightedSum =
    scores.relevance * weights.relevance +
    scores.completeness * weights.completeness +
    scores.risk * weights.risk +
    scores.clarity * weights.clarity +
    scores.accuracy * weights.accuracy;

  return Math.round(weightedSum);
}

/**
 * Determine risk level based on risk score
 */
export function determineRiskLevel(
  riskScore: number
): "low" | "medium" | "high" {
  if (riskScore < 30) return "low";
  if (riskScore < 70) return "medium";
  return "high";
}

/**
 * Calculate comprehensive scores for analysis results
 */
export function calculateAllScores(
  insights: Insight[] = [],
  recommendations: Recommendation[] = [],
  extractedFields: ExtractedField[] = [],
  questions: Question[] = [],
  weights: ScoreWeights = DEFAULT_WEIGHTS
): ScoreResult {
  const relevance = calculateRelevanceScore(insights, extractedFields);
  const completeness = calculateCompletenessScore(insights, extractedFields);
  const risk = calculateRiskScore(insights);
  const clarity = calculateClarityScore(questions, insights);
  const accuracy = calculateAccuracyScore(insights, extractedFields);

  const overall = calculateOverallScore(
    {
      relevance,
      completeness,
      risk,
      clarity,
      accuracy,
    },
    weights
  );

  const riskLevel = determineRiskLevel(risk);

  return {
    relevance,
    completeness,
    risk,
    clarity,
    accuracy,
    overall,
    riskLevel,
  };
}

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

/**
 * Get risk level color
 */
export function getRiskLevelColor(
  riskLevel: "low" | "medium" | "high"
): string {
  switch (riskLevel) {
    case "low":
      return "text-green-600 bg-green-100";
    case "medium":
      return "text-yellow-600 bg-yellow-100";
    case "high":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

/**
 * Get score description
 */
export function getScoreDescription(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 50) return "Poor";
  return "Very Poor";
}

/**
 * Calculate trend score (for comparing multiple analyses)
 */
export function calculateTrendScore(
  currentScores: ScoreResult,
  previousScores: ScoreResult
): {
  trend: "improving" | "declining" | "stable";
  change: number;
  significant: boolean;
} {
  const change = currentScores.overall - previousScores.overall;
  const significant = Math.abs(change) >= 10;

  let trend: "improving" | "declining" | "stable";
  if (change > 5) trend = "improving";
  else if (change < -5) trend = "declining";
  else trend = "stable";

  return { trend, change, significant };
}
