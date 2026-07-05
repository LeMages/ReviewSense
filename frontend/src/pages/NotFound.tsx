import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-bold text-indigo-600">404</h1>
      <p className="mt-3 text-slate-500">This page does not exist.</p>
      <Link
        to="/"
        className="mt-6 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
      >
        Back to home
      </Link>
    </div>
  )
}
