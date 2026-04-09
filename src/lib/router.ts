import React, { createContext, useContext, useState } from 'react'

type Route = '/' | '/projects' | '/community' | '/templates' | '/pricing' | '/docs' | '/changelog'

interface RouterContextType {
  currentRoute: Route
  setCurrentRoute: (route: Route) => void
  navigate: (route: Route) => void
}

const RouterContext = createContext<RouterContextType | undefined>(undefined)

export function useRouter() {
  const context = useContext(RouterContext)
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider')
  }
  return context
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [currentRoute, setCurrentRoute] = useState<Route>('/')

  const navigate = (route: Route) => {
    setCurrentRoute(route)
    window.history.pushState({}, '', route)
  }

  React.useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname as Route)
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  React.useEffect(() => {
    const pathname = window.location.pathname
    if (pathname && pathname !== '/') {
      setCurrentRoute(pathname as Route)
    }
  }, [])

  return (
    <RouterContext.Provider value={{ currentRoute, setCurrentRoute, navigate }}>
      {children}
    </RouterContext.Provider>
  )
}
