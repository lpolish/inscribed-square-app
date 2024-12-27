import 'next-intl/dist/types/app-router'

declare module 'next-intl/dist/types/app-router' {
  export interface LayoutProps {
    children: React.ReactNode
    params: {
      locale: string
    }
  }
}

