export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
}

export type SentimentLabel = 'positive' | 'neutral' | 'negative'

export interface Review {
  id: string
  content: string
  createdAt: string
  authorId?: string
  sentiment?: SentimentLabel
}

export interface PredictionResult {
  reviewId: string
  sentiment: SentimentLabel
  confidence: number
  scores: Record<SentimentLabel, number>
}

export interface SentimentStats {
  totalReviews: number
  positiveCount: number
  neutralCount: number
  negativeCount: number
  averageConfidence: number
}
