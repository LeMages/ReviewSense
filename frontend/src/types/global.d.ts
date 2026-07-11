export {}

declare global {
  interface Window {
    __CONFIG__?: {
      API_URL: string;
      GRAPHQL_URL: string;
    };
  }
}
