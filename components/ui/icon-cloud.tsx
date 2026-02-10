"use client"

import React, { useCallback, useEffect, useMemo, useRef } from "react"
import { renderToString } from "react-dom/server"

interface Icon {
  x: number
  y: number
  z: number
  scale: number
  opacity: number
  id: number
}

interface IconCloudProps {
  icons?: React.ReactNode[]
  images?: string[]
  iconSize?: number
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

const CANVAS_SIZE = 350
const FRICTION = 0.96
const MIN_VELOCITY = 0.00005
const AUTO_SPIN_SPEED = 0.002
const DRAG_SENSITIVITY = 0.004

export function IconCloud({ icons, images, iconSize = 40 }: IconCloudProps) {
  const halfSize = iconSize / 2
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dprRef = useRef(1)

  const iconPositions = useMemo(() => {
    const items = icons || images || []
    const numIcons = items.length || 20
    const newIcons: Icon[] = []

    const offset = 2 / numIcons
    const increment = Math.PI * (3 - Math.sqrt(5))

    for (let i = 0; i < numIcons; i++) {
      const y = i * offset - 1 + offset / 2
      const r = Math.sqrt(1 - y * y)
      const phi = i * increment

      const x = Math.cos(phi) * r
      const z = Math.sin(phi) * r

      newIcons.push({
        x: x * 100,
        y: y * 100,
        z: z * 100,
        scale: 1,
        opacity: 1,
        id: i,
      })
    }
    return newIcons
  }, [icons, images])

  // All interaction state as refs for a stable animation loop
  const rotationRef = useRef({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const lastPointerRef = useRef({ x: 0, y: 0, time: 0 })
  const velocityRef = useRef({ x: 0, y: 0 })
  const mousePosRef = useRef({ x: 0, y: 0 })
  const hasMouseRef = useRef(false)
  const targetRotationRef = useRef<{
    x: number
    y: number
    startX: number
    startY: number
    distance: number
    startTime: number
    duration: number
  } | null>(null)
  const animationFrameRef = useRef<number>(0)
  const iconCanvasesRef = useRef<HTMLCanvasElement[]>([])
  const imagesLoadedRef = useRef<boolean[]>([])

  // Set up canvas for high-DPI displays
  useEffect(() => {
    const dpr = window.devicePixelRatio || 1
    dprRef.current = dpr
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = CANVAS_SIZE * dpr
    canvas.height = CANVAS_SIZE * dpr
    canvas.style.width = `${CANVAS_SIZE}px`
    canvas.style.height = `${CANVAS_SIZE}px`
  }, [])

  // Create icon canvases once when icons/images change
  useEffect(() => {
    if (!icons && !images) return

    const items = icons || images || []
    imagesLoadedRef.current = new Array(items.length).fill(false)

    const dpr = dprRef.current
    const newIconCanvases = items.map((item, index) => {
      const offscreen = document.createElement("canvas")
      offscreen.width = iconSize * dpr
      offscreen.height = iconSize * dpr
      const offCtx = offscreen.getContext("2d")

      if (offCtx) {
        if (images) {
          // Handle image URLs directly
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.src = items[index] as string
          img.onload = () => {
            offCtx.clearRect(0, 0, offscreen.width, offscreen.height)
            offCtx.save()
            offCtx.scale(dpr, dpr)

            // Create circular clipping path
            offCtx.beginPath()
            offCtx.arc(halfSize, halfSize, halfSize, 0, Math.PI * 2)
            offCtx.closePath()
            offCtx.clip()

            // Draw the image
            offCtx.drawImage(img, 0, 0, iconSize, iconSize)
            offCtx.restore()

            imagesLoadedRef.current[index] = true
          }
        } else {
          // Handle SVG icons
          offCtx.scale(dpr * 0.4, dpr * 0.4)
          const svgString = renderToString(item as React.ReactElement)
          const img = new Image()
          img.src = "data:image/svg+xml;base64," + btoa(svgString)
          img.onload = () => {
            offCtx.clearRect(0, 0, offscreen.width, offscreen.height)
            offCtx.drawImage(img, 0, 0)
            imagesLoadedRef.current[index] = true
          }
        }
      }
      return offscreen
    })

    iconCanvasesRef.current = newIconCanvases
  }, [icons, images, iconSize, halfSize])

  // Check if an icon was tapped/clicked and animate to it
  const tryIconClick = useCallback((canvasX: number, canvasY: number) => {
    iconPositions.forEach((icon) => {
      const cosX = Math.cos(rotationRef.current.x)
      const sinX = Math.sin(rotationRef.current.x)
      const cosY = Math.cos(rotationRef.current.y)
      const sinY = Math.sin(rotationRef.current.y)

      const rotatedX = icon.x * cosY - icon.z * sinY
      const rotatedZ = icon.x * sinY + icon.z * cosY
      const rotatedY = icon.y * cosX + rotatedZ * sinX

      const screenX = CANVAS_SIZE / 2 + rotatedX
      const screenY = CANVAS_SIZE / 2 + rotatedY

      const scale = (rotatedZ + 200) / 300
      const radius = halfSize * scale
      const dx = canvasX - screenX
      const dy = canvasY - screenY

      if (dx * dx + dy * dy < radius * radius) {
        const targetX = -Math.atan2(
          icon.y,
          Math.sqrt(icon.x * icon.x + icon.z * icon.z)
        )
        const targetY = Math.atan2(icon.x, icon.z)

        const currentX = rotationRef.current.x
        const currentY = rotationRef.current.y
        const distance = Math.sqrt(
          Math.pow(targetX - currentX, 2) + Math.pow(targetY - currentY, 2)
        )

        const duration = Math.min(2000, Math.max(800, distance * 1000))

        targetRotationRef.current = {
          x: targetX,
          y: targetY,
          startX: currentX,
          startY: currentY,
          distance,
          startTime: performance.now(),
          duration,
        }
      }
    })
  }, [iconPositions, halfSize])

  // Unified pointer handlers
  const handlePointerStart = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const canvasX = clientX - rect.left
    const canvasY = clientY - rect.top

    tryIconClick(canvasX, canvasY)

    isDraggingRef.current = true
    velocityRef.current = { x: 0, y: 0 }
    lastPointerRef.current = { x: clientX, y: clientY, time: performance.now() }
  }, [tryIconClick])

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return

    const now = performance.now()
    const dt = now - lastPointerRef.current.time
    const deltaX = clientX - lastPointerRef.current.x
    const deltaY = clientY - lastPointerRef.current.y

    rotationRef.current = {
      x: rotationRef.current.x + deltaY * DRAG_SENSITIVITY,
      y: rotationRef.current.y - deltaX * DRAG_SENSITIVITY,
    }

    // Track velocity (normalize to per-frame ~16ms)
    if (dt > 0) {
      velocityRef.current = {
        x: (deltaY * DRAG_SENSITIVITY) / dt * 16,
        y: (-deltaX * DRAG_SENSITIVITY) / dt * 16,
      }
    }

    lastPointerRef.current = { x: clientX, y: clientY, time: now }
  }, [])

  const handlePointerEnd = useCallback(() => {
    isDraggingRef.current = false
  }, [])

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    hasMouseRef.current = true
    handlePointerStart(e.clientX, e.clientY)
  }, [handlePointerStart])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    hasMouseRef.current = true
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
    handlePointerMove(e.clientX, e.clientY)
  }, [handlePointerMove])

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0]
    handlePointerStart(touch.clientX, touch.clientY)
  }, [handlePointerStart])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0]
    handlePointerMove(touch.clientX, touch.clientY)
  }, [handlePointerMove])

  // Animation and rendering
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const animate = () => {
      ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0)
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

      if (targetRotationRef.current) {
        // Animated rotation to a clicked icon
        const target = targetRotationRef.current
        const elapsed = performance.now() - target.startTime
        const progress = Math.min(1, elapsed / target.duration)
        const easedProgress = easeOutCubic(progress)

        rotationRef.current = {
          x: target.startX + (target.x - target.startX) * easedProgress,
          y: target.startY + (target.y - target.startY) * easedProgress,
        }

        if (progress >= 1) {
          targetRotationRef.current = null
        }
      } else if (isDraggingRef.current) {
        // Rotation handled in pointer move handlers
      } else if (
        Math.abs(velocityRef.current.x) > MIN_VELOCITY ||
        Math.abs(velocityRef.current.y) > MIN_VELOCITY
      ) {
        // Momentum: apply velocity and decay with friction
        rotationRef.current = {
          x: rotationRef.current.x + velocityRef.current.x,
          y: rotationRef.current.y + velocityRef.current.y,
        }
        velocityRef.current = {
          x: velocityRef.current.x * FRICTION,
          y: velocityRef.current.y * FRICTION,
        }
      } else if (hasMouseRef.current) {
        // Desktop: mouse-position-driven auto-rotation
        const centerX = CANVAS_SIZE / 2
        const centerY = CANVAS_SIZE / 2
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)
        const dx = mousePosRef.current.x - centerX
        const dy = mousePosRef.current.y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const speed = 0.003 + (distance / maxDistance) * 0.01

        rotationRef.current = {
          x: rotationRef.current.x + (dy / CANVAS_SIZE) * speed,
          y: rotationRef.current.y + (dx / CANVAS_SIZE) * speed,
        }
      } else {
        // Touch/no-mouse: gentle auto-spin
        rotationRef.current = {
          y: rotationRef.current.y + AUTO_SPIN_SPEED,
          x: rotationRef.current.x,
        }
      }

      iconPositions.forEach((icon, index) => {
        const cosX = Math.cos(rotationRef.current.x)
        const sinX = Math.sin(rotationRef.current.x)
        const cosY = Math.cos(rotationRef.current.y)
        const sinY = Math.sin(rotationRef.current.y)

        const rotatedX = icon.x * cosY - icon.z * sinY
        const rotatedZ = icon.x * sinY + icon.z * cosY
        const rotatedY = icon.y * cosX + rotatedZ * sinX

        const scale = (rotatedZ + 200) / 300
        const opacity = Math.max(0.2, Math.min(1, (rotatedZ + 150) / 200))

        ctx.save()
        ctx.translate(CANVAS_SIZE / 2 + rotatedX, CANVAS_SIZE / 2 + rotatedY)
        ctx.scale(scale, scale)
        ctx.globalAlpha = opacity

        if (icons || images) {
          // Only try to render icons/images if they exist
          if (
            iconCanvasesRef.current[index] &&
            imagesLoadedRef.current[index]
          ) {
            ctx.drawImage(iconCanvasesRef.current[index], -halfSize, -halfSize, iconSize, iconSize)
          }
        } else {
          // Show numbered circles if no icons/images are provided
          ctx.beginPath()
          ctx.arc(0, 0, halfSize, 0, Math.PI * 2)
          ctx.fillStyle = "#4444ff"
          ctx.fill()
          ctx.fillStyle = "white"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.font = "16px Arial"
          ctx.fillText(`${icon.id + 1}`, 0, 0)
        }

        ctx.restore()
      })
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [icons, images, iconPositions, iconSize, halfSize])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handlePointerEnd}
      onMouseLeave={handlePointerEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handlePointerEnd}
      onTouchCancel={handlePointerEnd}
      className="rounded-lg touch-none"
      aria-label="Interactive 3D Icon Cloud"
      role="img"
    />
  )
}
