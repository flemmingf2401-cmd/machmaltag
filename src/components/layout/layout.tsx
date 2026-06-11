import * as React from 'react'
import { Header } from './header'
import { Footer } from './footer'

interface LayoutProps {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export { Layout }
