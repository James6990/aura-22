'use client'

import { useCallback, useState } from 'react'

type Status = 'idle' | 'connecting' | 'connected' | 'unsupported' | 'error'

function parseHeartRate(value: DataView): number {
  // Per Bluetooth GATT Heart Rate Measurement spec:
  // bit 0 of the flags byte indicates 8-bit vs 16-bit HR value.
  const flags = value.getUint8(0)
  const is16bit = (flags & 0x01) === 1
  return is16bit ? value.getUint16(1, true) : value.getUint8(1)
}

export function useHeartRate() {
  const [bpm, setBpm] = useState<number | null>(null)
  const [status, setStatus] = useState<Status>('idle')

  const connect = useCallback(async () => {
    const nav = navigator as Navigator & { bluetooth?: any }
    if (!nav.bluetooth) {
      setStatus('unsupported')
      return
    }
    try {
      setStatus('connecting')
      const device = await nav.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
      })
      const server = await device.gatt.connect()
      const service = await server.getPrimaryService('heart_rate')
      const characteristic = await service.getCharacteristic('heart_rate_measurement')
      await characteristic.startNotifications()
      characteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
        const target = event.target as unknown as { value: DataView }
        setBpm(parseHeartRate(target.value))
      })
      device.addEventListener('gattserverdisconnected', () => {
        setStatus('idle')
        setBpm(null)
      })
      setStatus('connected')
    } catch (err) {
      console.log('[v0] Bluetooth connection failed:', (err as Error)?.message)
      setStatus('error')
    }
  }, [])

  return { bpm, status, connect }
}
