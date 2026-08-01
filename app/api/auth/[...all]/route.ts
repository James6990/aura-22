import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const dynamic = 'force-static'

export function generateStaticParams() {
  return []
}

export const { GET, POST } = toNextJsHandler(auth)

