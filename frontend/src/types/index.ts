export interface User {
  id: string
  email: string
  name: string
  role: string
}

export type SentimentLabel = 'positive' | 'neutral' | 'negative'

export interface Review {
  id: string
  userId: string
  text: string
  predictedSentiment: SentimentLabel | null
  confidence: number | null
  language: string
  createdAt: string
}

export interface SentimentStats {
  positive: number
  negative: number
  neutral: number
  total: number
}

export interface ReviewOverTime {
  date: string
  count: number
  sentiment: SentimentLabel
}

export interface PredictionResult {
  sentiment: SentimentLabel
  confidence: number
}
