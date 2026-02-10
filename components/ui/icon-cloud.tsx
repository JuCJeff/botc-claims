"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
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
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [targetRotation, setTargetRotation] = useState<{
    x: number
    y: number
    startX: number
    startY: number
    distance: number
    startTime: number
    duration: number
  } | null>(null)
  const animationFrameRef = useRef<number>(0)
  const rotationRef = useRef(rotation)
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



  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect || !canvasRef.current) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

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
      const dx = x - screenX
      const dy = y - screenY

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

        setTargetRotation({
          x: targetX,
          y: targetY,
          startX: currentX,
          startY: currentY,
          distance,
          startTime: performance.now(),
          duration,
        })
        return
      }
    })

    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setMousePos({ x, y })
    }

    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x
      const deltaY = e.clientY - lastMousePos.y

      rotationRef.current = {
        x: rotationRef.current.x + deltaY * 0.002,
        y: rotationRef.current.y + deltaX * 0.002,
      }

      setLastMousePos({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Animation and rendering
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const animate = () => {
      ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0)
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

      const centerX = CANVAS_SIZE / 2
      const centerY = CANVAS_SIZE / 2
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)
      const dx = mousePos.x - centerX
      const dy = mousePos.y - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const speed = 0.003 + (distance / maxDistance) * 0.01

      if (targetRotation) {
        const elapsed = performance.now() - targetRotation.startTime
        const progress = Math.min(1, elapsed / targetRotation.duration)
        const easedProgress = easeOutCubic(progress)

        rotationRef.current = {
          x:
            targetRotation.startX +
            (targetRotation.x - targetRotation.startX) * easedProgress,
          y:
            targetRotation.startY +
            (targetRotation.y - targetRotation.startY) * easedProgress,
        }

        if (progress >= 1) {
          setTargetRotation(null)
        }
      } else if (!isDragging) {
        rotationRef.current = {
          x: rotationRef.current.x + (dy / CANVAS_SIZE) * speed,
          y: rotationRef.current.y + (dx / CANVAS_SIZE) * speed,
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
  }, [icons, images, iconPositions, isDragging, mousePos, targetRotation, iconSize, halfSize])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="rounded-lg"
      aria-label="Interactive 3D Icon Cloud"
      role="img"
    />
  )
}
