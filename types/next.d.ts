import 'next'

declare module 'next' {
  export interface LayoutProps {
    children: React.ReactNode
    params: { [key: string]: string | string[] }
  }
}

