import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Animorphia - Story into Anime Studio",
  description: "AI Anime Story Synthesis Studio with strict anti-nudity, safe creative storytelling, and anti-AI bot defense.",
  other: {
    "robots": "noai, noimageai, noindex, nofollow",
    "x-anti-bot": "active-v2.5"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="robots" content="noai, noimageai, noindex, nofollow" />
      </head>
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}
