import { ApolloClient, InMemoryCache, HttpLink, from, gql } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { getToken } from './tokenStore'

const uri = import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:3000/graphql'

const httpLink = new HttpLink({ uri })

const authLink = setContext((_, { headers }) => {
  const token = getToken()
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
})

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
})

export default apolloClient

export const GET_REVIEW_STATS = gql`
  query ReviewStats {
    reviewStats {
      positive
      negative
      neutral
      total
    }
  }
`

export const GET_SENTIMENT_DISTRIBUTION = gql`
  query SentimentDistribution($days: Int) {
    sentimentDistribution(days: $days) {
      date
      count
      sentiment
    }
  }
`
