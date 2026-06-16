'use client'

import { useEffect, useRef, useState } from 'react'

interface MapPickerProps {
  lat?: number
  lng?: number
  address?: string
  onChange: (lat: number, lng: number, address: string) => void
}

export function MapPicker({ lat: initialLat, lng: initialLng, address: initialAddress, onChange }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const markerRef = useRef<unknown>(null)
  const [address, setAddress] = useState(initialAddress || '')
  const [searchInput, setSearchInput] = useState('')
  const [searching, setSearching] = useState(false)

  const defaultLat = initialLat || 35.6892
  const defaultLng = initialLng || 51.3890

  useEffect(() => {
    let cleanup = () => {}

    async function init() {
      if (!mapRef.current || mapInstanceRef.current) return

      const L = (await import('leaflet')).default
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('leaflet/dist/leaflet.css')

      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 14)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map)

      const marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map)

      async function reverseGeocode(lat: number, lng: number) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fa`
          )
          const data = await res.json()
          const addr = data.display_name || ''
          setAddress(addr)
          onChange(lat, lng, addr)
        } catch {
          onChange(lat, lng, '')
        }
      }

      marker.on('dragend', () => {
        const pos = (marker as L.Marker).getLatLng()
        reverseGeocode(pos.lat, pos.lng)
      })

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng)
        reverseGeocode(e.latlng.lat, e.latlng.lng)
      })

      mapInstanceRef.current = map
      markerRef.current = marker

      if (initialLat && initialLng) {
        reverseGeocode(initialLat, initialLng)
      }

      cleanup = () => {
        map.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }

    init()
    return () => cleanup()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchInput.trim()) return
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}&accept-language=fa&limit=1&countrycodes=ir`
      )
      const data = await res.json()
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const latN = parseFloat(lat)
        const lngN = parseFloat(lon)

        if (mapInstanceRef.current && markerRef.current) {
          const L = (await import('leaflet')).default
          ;(mapInstanceRef.current as L.Map).setView([latN, lngN], 16)
          ;(markerRef.current as L.Marker).setLatLng([latN, lngN])
        }

        setAddress(display_name)
        onChange(latN, lngN, display_name)
      }
    } catch {
      /* silent */
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="جستجوی آدرس..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
        <button
          type="submit"
          disabled={searching}
          className="px-4 py-2.5 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50 flex-shrink-0"
        >
          {searching ? '...' : 'جستجو'}
        </button>
      </form>

      <div
        ref={mapRef}
        className="w-full h-64 rounded-xl border border-[var(--border)] overflow-hidden"
        style={{ direction: 'ltr' }}
      />

      {address && (
        <div className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] rounded-xl px-3 py-2">
          {address}
        </div>
      )}
      <p className="text-xs text-[var(--muted-foreground)]">
        روی نقشه کلیک کنید یا نشانگر را بکشید
      </p>
    </div>
  )
}
