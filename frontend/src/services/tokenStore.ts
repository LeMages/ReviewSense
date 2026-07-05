// In-memory token store: bridges the JWT held in AuthContext's React state to
// axios/Apollo request interceptors, which run outside the React tree.
let currentToken: string | null = null

export function getToken() {
  return currentToken
}

export function setToken(token: string | null) {
  currentToken = token
}
