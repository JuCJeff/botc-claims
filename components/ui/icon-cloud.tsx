"use client"

import React, { useCallback, useEffect, useMemo, useRef } from "react"
import { renderToString } from "react-dom/server"

interface Icon {
  x: number
  y: number
  z: number
  id: number
}

interface IconCloudProps {
  icons?: React.ReactNode[]
  images?: string[]
  iconSize?: number
}

// 3x3 rotation matrix helpers (stored as flat 9-element array, row-major)
type Mat3 = number[]

function identityMat3(): Mat3 {
  return [1, 0, 0, 0, 1, 0, 0, 0, 1]
}

function multiplyMat3(a: Mat3, b: Mat3): Mat3 {
  return [
    a[0]*b[0] + a[1]*b[3] + a[2]*b[6],
    a[0]*b[1] + a[1]*b[4] + a[2]*b[7],
    a[0]*b[2] + a[1]*b[5] + a[2]*b[8],
    a[3]*b[0] + a[4]*b[3] + a[5]*b[6],
    a[3]*b[1] + a[4]*b[4] + a[5]*b[7],
    a[3]*b[2] + a[4]*b[5] + a[5]*b[8],
    a[6]*b[0] + a[7]*b[3] + a[8]*b[6],
    a[6]*b[1] + a[7]*b[4] + a[8]*b[7],
    a[6]*b[2] + a[7]*b[5] + a[8]*b[8],
  ]
}

function rotateAroundX(angle: number): Mat3 {
  const c = Math.cos(angle), s = Math.sin(angle)
  return [1, 0, 0, 0, c, -s, 0, s, c]
}

function rotateAroundY(angle: number): Mat3 {
  const c = Math.cos(angle), s = Math.sin(angle)
  return [c, 0, s, 0, 1, 0, -s, 0, c]
}

function applyMat3(m: Mat3, x: number, y: number, z: number): [number, number, number] {
  return [
    m[0]*x + m[1]*y + m[2]*z,
    m[3]*x + m[4]*y + m[5]*z,
    m[6]*x + m[7]*y + m[8]*z,
  ]
}

// Physics & interaction tuning
const CANVAS_SIZE = 350
const FRICTION = 0.96           // velocity decay per frame after releasing drag
const MIN_VELOCITY = 0.00005    // threshold below which momentum stops
const AUTO_SPIN_SPEED = 0.002   // gentle Y-axis rotation when idle
const DRAG_SENSITIVITY = 0.007  // pointer movement to rotation scaling
const DRAG_THRESHOLD = 5        // min px movement to distinguish drag from tap

export function IconCloud({ icons, images, iconSize = 40 }: IconCloudProps) {
  const halfSize = iconSize / 2
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dprRef = useRef(1)

  // Distribute icons evenly on a sphere using Fibonacci sphere algorithm
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
        id: i,
      })
    }
    return newIcons
  }, [icons, images])

  const rotationMatRef = useRef<Mat3>(identityMat3())
  const isDraggingRef = useRef(false)
  const lastPointerRef = useRef({ x: 0, y: 0, time: 0 })
  const velocityRef = useRef({ x: 0, y: 0 })
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

  // Unified pointer handlers
  const pointerStartRef = useRef({ x: 0, y: 0 })
  const isPendingDragRef = useRef(false)

  const handlePointerStart = useCallback((clientX: number, clientY: number) => {
    pointerStartRef.current = { x: clientX, y: clientY }
    isPendingDragRef.current = true
    isDraggingRef.current = false
    velocityRef.current = { x: 0, y: 0 }
    lastPointerRef.current = { x: clientX, y: clientY, time: performance.now() }
  }, [])

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!isPendingDragRef.current && !isDraggingRef.current) return

    if (isPendingDragRef.current && !isDraggingRef.current) {
      const dx = clientX - pointerStartRef.current.x
      const dy = clientY - pointerStartRef.current.y
      if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return
      isDraggingRef.current = true
      isPendingDragRef.current = false
    }

    const now = performance.now()
    const dt = now - lastPointerRef.current.time
    const deltaX = clientX - lastPointerRef.current.x
    const deltaY = clientY - lastPointerRef.current.y

    // Apply incremental rotation in screen space
    const rx = rotateAroundX(-deltaY * DRAG_SENSITIVITY)
    const ry = rotateAroundY(deltaX * DRAG_SENSITIVITY)
    rotationMatRef.current = multiplyMat3(multiplyMat3(rx, ry), rotationMatRef.current)

    // Track velocity (normalize to per-frame ~16ms)
    if (dt > 0) {
      velocityRef.current = {
        x: (-deltaY * DRAG_SENSITIVITY) / dt * 16,
        y: (deltaX * DRAG_SENSITIVITY) / dt * 16,
      }
    }

    lastPointerRef.current = { x: clientX, y: clientY, time: now }
  }, [])

  const handlePointerEnd = useCallback(() => {
    isDraggingRef.current = false
    isPendingDragRef.current = false
  }, [])

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    handlePointerStart(e.clientX, e.clientY)
  }, [handlePointerStart])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
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

      // Skip auto-rotation while dragging (handlePointerMove applies rotation directly)
      if (!isDraggingRef.current) {
        if (
          Math.abs(velocityRef.current.x) > MIN_VELOCITY ||
          Math.abs(velocityRef.current.y) > MIN_VELOCITY
        ) {
          // Momentum: apply velocity and decay with friction
          const rx = rotateAroundX(velocityRef.current.x)
          const ry = rotateAroundY(velocityRef.current.y)
          rotationMatRef.current = multiplyMat3(multiplyMat3(rx, ry), rotationMatRef.current)
          velocityRef.current = {
            x: velocityRef.current.x * FRICTION,
            y: velocityRef.current.y * FRICTION,
          }
        } else {
          // Gentle auto-spin when idle
          const ry = rotateAroundY(AUTO_SPIN_SPEED)
          rotationMatRef.current = multiplyMat3(ry, rotationMatRef.current)
        }
      }

      const mat = rotationMatRef.current

      iconPositions.forEach((icon, index) => {
        const [rotatedX, rotatedY, rotatedZ] = applyMat3(mat, icon.x, icon.y, icon.z)

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
