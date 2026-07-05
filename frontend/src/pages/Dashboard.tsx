import { useMemo } from 'react'
import { useQuery } from '@apollo/client/react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { GET_REVIEW_STATS, GET_SENTIMENT_DISTRIBUTION } from '../services/graphql'
import type { ReviewOverTime, SentimentStats } from '../types'

const SENTIMENT_COLORS = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#94a3b8',
} as const

interface ReviewStatsData {
  reviewStats: SentimentStats
}

interface SentimentDistributionData {
  sentimentDistribution: ReviewOverTime[]
}

interface DailyVolume {
  date: string
  positive: number
  negative: number
  neutral: number
}

function StatCard({
  label,
  count,
  color,
}: {
  label: string
  count: number
  color: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{count}</p>
    </div>
  )
}

export default function Dashboard() {
  const { data: statsData, loading: statsLoading, error: statsError } =
    useQuery<ReviewStatsData>(GET_REVIEW_STATS)
  const {
    data: distributionData,
    loading: distributionLoading,
    error: distributionError,
  } = useQuery<SentimentDistributionData>(GET_SENTIMENT_DISTRIBUTION, {
    variables: { days: 30 },
  })

  const stats = statsData?.reviewStats

  const distributionChartData = useMemo(() => {
    if (!stats) return []
    return [
      { name: 'Positive', count: stats.positive, fill: SENTIMENT_COLORS.positive },
      { name: 'Negative', count: stats.negative, fill: SENTIMENT_COLORS.negative },
      { name: 'Neutral', count: stats.neutral, fill: SENTIMENT_COLORS.neutral },
    ]
  }, [stats])

  const dailyVolume = useMemo<DailyVolume[]>(() => {
    const rows = distributionData?.sentimentDistribution ?? []
    const byDate = new Map<string, DailyVolume>()
    for (const row of rows) {
      const entry = byDate.get(row.date) ?? {
        date: row.date,
        positive: 0,
        negative: 0,
        neutral: 0,
      }
      entry[row.sentiment] += row.count
      byDate.set(row.date, entry)
    }
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [distributionData])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-2 text-slate-500">
        An overview of sentiment across all submitted reviews.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-medium text-slate-800">Sentiment Overview</h2>
        {statsError && (
          <p className="mt-3 text-sm text-red-600">
            Failed to load sentiment overview: {statsError.message}
          </p>
        )}
        {statsLoading && !stats ? (
          <p className="mt-3 text-sm text-slate-500">Loading stats...</p>
        ) : (
          stats && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard label="Positive" count={stats.positive} color={SENTIMENT_COLORS.positive} />
              <StatCard label="Negative" count={stats.negative} color={SENTIMENT_COLORS.negative} />
              <StatCard label="Neutral" count={stats.neutral} color={SENTIMENT_COLORS.neutral} />
            </div>
          )
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-slate-800">Sentiment Distribution</h2>
        <div className="mt-4 h-72 rounded-xl border border-slate-200 p-4">
          {distributionChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {distributionChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              {statsLoading ? 'Loading chart...' : 'No data yet'}
            </div>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-slate-800">Reviews Over Time</h2>
        {distributionError && (
          <p className="mt-3 text-sm text-red-600">
            Failed to load review volume: {distributionError.message}
          </p>
        )}
        <div className="mt-4 h-72 rounded-xl border border-slate-200 p-4">
          {dailyVolume.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="positive"
                  name="Positive"
                  stroke={SENTIMENT_COLORS.positive}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="negative"
                  name="Negative"
                  stroke={SENTIMENT_COLORS.negative}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="neutral"
                  name="Neutral"
                  stroke={SENTIMENT_COLORS.neutral}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              {distributionLoading ? 'Loading chart...' : 'No data yet'}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
