'use client'

import dynamic from 'next/dynamic'
import LeafletWrapper from '@/components/LeafletWrapper'

// Dynamic import of the map component with no SSR
const ThailandMap = dynamic(() => import('@/components/ThailandMap'), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

export default function MapPage() {
  return (
    <LeafletWrapper>
      <ThailandMap />
    </LeafletWrapper>
  )
}