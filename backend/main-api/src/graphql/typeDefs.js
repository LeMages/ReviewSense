const gql = require('graphql-tag');

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    role: String!
  }

  type Review {
    id: ID!
    userId: ID!
    text: String!
    predictedSentiment: String
    confidence: Float
    language: String!
    createdAt: String!
  }

  type SentimentStats {
    positive: Int!
    negative: Int!
    neutral: Int!
    total: Int!
  }

  type ReviewOverTime {
    date: String!
    count: Int!
    sentiment: String!
  }

  type Query {
    reviewStats: SentimentStats!
    sentimentDistribution(days: Int = 30): [ReviewOverTime!]!
    recentReviews(limit: Int = 10): [Review!]!
    me: User
  }
`;

module.exports = { typeDefs };
