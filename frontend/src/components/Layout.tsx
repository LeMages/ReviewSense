import type { ReactNode } from 'react'
import Navbar from './Navbar'
import BackgroundMesh from './BackgroundMesh'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <BackgroundMesh />
      <Navbar />
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  )
}
