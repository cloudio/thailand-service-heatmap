import { cookies } from 'next/headers'

const HARDCODED_USERNAME = 'tester'
const HARDCODED_PASSWORD = 'abc123'
const AUTH_COOKIE_NAME = 'thailand-map-auth'

export function validateCredentials(username: string, password: string): boolean {
  return username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD
}

export async function setAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.set(AUTH_COOKIE_NAME, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(AUTH_COOKIE_NAME)?.value
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_COOKIE_NAME)
}

export async function isAuthenticated(): Promise<boolean> {
  const authCookie = await getAuthCookie()
  return authCookie === 'authenticated'
}