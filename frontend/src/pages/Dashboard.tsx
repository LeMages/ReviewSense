import { useMemo } from 'react'
import { useQuery } from '@apollo/client/react'
import { motion } from 'framer-motion'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import { GET_REVIEW_STATS, GET_SENTIMENT_DISTRIBUTION } from '../services/graphql'
import StatCard from '../components/StatCard'
import ActivityFeed from '../components/ActivityFeed'
import EmptyState from '../components/EmptyState'
import { Skeleton } from '../components/ui/skeleton'
import type { ReviewOverTime, SentimentStats } from '../types'

const SENTIMENT_COLORS = {
  positive: '#22d3ee',
  negative: '#fb7185',
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

const sectionVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
  } = useQuery<ReviewStatsData>(GET_REVIEW_STATS, { fetchPolicy: 'network-only' })

  const {
    data: distributionData,
    loading: distributionLoading,
    error: distributionError,
  } = useQuery<SentimentDistributionData>(GET_SENTIMENT_DISTRIBUTION, {
    variables: { days: 30 },
    fetchPolicy: 'network-only',
  })

  const isLoading = statsLoading || distributionLoading
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
      const entry = byDate.get(row.date) ?? { date: row.date, positive: 0, negative: 0, neutral: 0 }
      entry[row.sentiment] += row.count
      byDate.set(row.date, entry)
    }
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
  }, [distributionData])

  const hasData = stats && stats.total > 0
  const total = stats?.total ?? 0

  if (isLoading && !stats) {
    return <DashboardSkeleton />
  }

  if (!hasData && !isLoading) {
    return (
      <EmptyState
        icon={<BarChart3 className="h-12 w-12" />}
        title="No reviews analyzed yet"
        description="Submit your first review to see sentiment insights and trends."
        action={{ label: 'Analyze a Review', onClick: () => window.location.href = '/submit' }}
      />
    )
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        An overview of sentiment across all submitted reviews.
      </p>

      <motion.section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3" variants={sectionVariant} initial="hidden" animate="visible">
        <StatCard
          label="Total Reviews"
          value={total}
          color={SENTIMENT_COLORS.positive}
        />
        <StatCard
          label="Positive"
          value={stats?.positive ?? 0}
          color={SENTIMENT_COLORS.positive}
          suffix={total > 0 ? ` (${Math.round(((stats?.positive ?? 0) / total) * 100)}%)` : ''}
        />
        <StatCard
          label="Negative"
          value={stats?.negative ?? 0}
          color={SENTIMENT_COLORS.negative}
        />
      </motion.section>

      <motion.section className="mt-10" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <h2 className="font-display text-lg font-medium text-foreground">Sentiment Distribution</h2>
        {statsError && (
          <p className="mt-3 text-sm text-negative">Failed to load: {statsError.message}</p>
        )}
        <div className="mt-4 h-72 rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm">
          {distributionChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    color: 'hsl(var(--card-foreground))',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {distributionChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No data yet
            </div>
          )}
        </div>
      </motion.section>

      <motion.section className="mt-10" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <h2 className="font-display text-lg font-medium text-foreground">Reviews Over Time</h2>
        {distributionError && (
          <p className="mt-3 text-sm text-negative">Failed to load: {distributionError.message}</p>
        )}
        <div className="mt-4 h-72 rounded-xl border border-border bg-card/60 p-4 backdrop-blur-sm">
          {dailyVolume.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    color: 'hsl(var(--card-foreground))',
                  }}
                />
                <Line type="monotone" dataKey="positive" name="Positive" stroke={SENTIMENT_COLORS.positive} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="negative" name="Negative" stroke={SENTIMENT_COLORS.negative} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="neutral" name="Neutral" stroke={SENTIMENT_COLORS.neutral} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No data yet
            </div>
          )}
        </div>
      </motion.section>

      <motion.section className="mt-10" variants={sectionVariant} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <h2 className="font-display text-lg font-medium text-foreground">Recent Activity</h2>
        <div className="mt-4">
          {dailyVolume.length > 0 ? (
            <ActivityFeed
              items={dailyVolume.slice(-5).reverse().map((d) => ({
                label: d.positive > d.negative ? 'positive' : d.negative > d.neutral ? 'negative' : 'neutral',
                text: `${d.positive + d.negative + d.neutral} reviews on ${d.date}`,
                time: d.date,
              }))}
            />
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          )}
        </div>
      </motion.section>
    </div>
  )
}
