import React from 'react'
import Header from './header'

type Props = {
  children: React.ReactNode
}

const Layout = ({ children }: Props) => {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden tracking-wide">
      <Header />
      <main className="grow">
        {children}
      </main>
      {/* <Footer /> */}
    </div>
  )
}

export default Layout
