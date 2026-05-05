import type { AppProps } from "next/app"
import { ThemeProvider } from "next-themes"
import { Toaster } from "react-hot-toast"
import "@/styles/globals.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </ThemeProvider>
  )
}
