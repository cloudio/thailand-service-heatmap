'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import all Leaflet components with SSR disabled
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
  { ssr: false }
)

// Import Leaflet types only (not the actual library)
import type { LatLngBounds } from 'leaflet'

interface ProvinceProperties {
  name: string
  name_th: string
  population: number
  region: string
}

interface ProvinceFeature {
  type: 'Feature'
  properties: ProvinceProperties
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
}

interface ThailandGeoData {
  type: 'FeatureCollection'
  features: ProvinceFeature[]
}

// Wrap the entire map component to ensure no SSR
const ThailandMapContent = dynamic(
  () => Promise.resolve(function MapContent() {
    const [geoData, setGeoData] = useState<ThailandGeoData | null>(null)
    const [hoveredProvince, setHoveredProvince] = useState<ProvinceProperties | null>(null)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isMapReady, setIsMapReady] = useState(false)

    useEffect(() => {
      // Load the GeoJSON data
      fetch('/data/thailand-provinces.json')
        .then(response => response.json())
        .then((data: ThailandGeoData) => {
          setGeoData(data)
          setIsMapReady(true)
        })
        .catch(error => {
          console.error('Error loading Thailand provinces data:', error)
        })
    }, [])

    const onEachFeature = (feature: ProvinceFeature, layer: any) => {
      layer.on({
        mouseover: (e: any) => {
          const layer = e.target
          layer.setStyle({
            weight: 3,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
          })
          setHoveredProvince(feature.properties)
        },
        mouseout: (e: any) => {
          const layer = e.target
          layer.setStyle({
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.5
          })
          setHoveredProvince(null)
        },
        mousemove: (e: any) => {
          setMousePosition({ x: e.originalEvent.clientX, y: e.originalEvent.clientY })
        }
      })
    }

    const getColor = (population: number) => {
      return population > 8000000 ? '#800026' :
             population > 4000000 ? '#BD0026' :
             population > 2000000 ? '#E31A1C' :
             population > 1000000 ? '#FC4E2A' :
             population > 500000  ? '#FD8D3C' :
             population > 200000  ? '#FEB24C' :
             population > 100000  ? '#FED976' :
                                     '#FFEDA0'
    }

    const style = (feature: ProvinceFeature) => {
      return {
        fillColor: getColor(feature.properties.population),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.5
      }
    }

    if (!isMapReady || !geoData) {
      return (
        <div className="h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading Thailand map...</p>
          </div>
        </div>
      )
    }

    // Import Leaflet only on client side
    const L = typeof window !== 'undefined' ? require('leaflet') : null
    const thailandBounds = L ? new L.LatLngBounds(
      [5.5, 97.3], // Southwest coordinates
      [20.5, 105.6] // Northeast coordinates
    ) : undefined

    return (
      <div className="h-screen relative" data-testid="thailand-map">
        <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg">
          <h1 className="text-xl font-bold text-gray-800 mb-2">Thailand Province Population</h1>
          <p className="text-sm text-gray-600">Hover over provinces to see population data</p>
          <div className="mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-800"></div>
              <span>8M+</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600"></div>
              <span>4M-8M</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500"></div>
              <span>2M-4M</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500"></div>
              <span>1M-2M</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400"></div>
              <span>&lt;1M</span>
            </div>
          </div>
        </div>

        <MapContainer
          bounds={thailandBounds}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          attributionControl={false}
          data-testid="map-container"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <GeoJSON
            data={geoData}
            style={style}
            onEachFeature={onEachFeature}
          />
        </MapContainer>

        {hoveredProvince && (
          <div
            className="absolute pointer-events-none z-[1000] bg-black bg-opacity-75 text-white p-3 rounded-lg shadow-lg"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 60,
            }}
            data-testid={`province-tooltip-${hoveredProvince.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="font-bold text-lg">{hoveredProvince.name}</div>
            <div className="text-sm text-gray-300">{hoveredProvince.name_th}</div>
            <div className="text-sm">
              Population: <span className="font-semibold">{hoveredProvince.population.toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-400">{hoveredProvince.region} Region</div>
          </div>
        )}
      </div>
    )
  }),
  { 
    ssr: false,
    loading: () => (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Thailand map...</p>
        </div>
      </div>
    )
  }
)

export default function ThailandMap() {
  return <ThailandMapContent />
}