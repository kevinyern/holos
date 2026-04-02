'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [visible, setVisible] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [isTouch, setIsTouch] = useState(true)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 }
  const trailX = useSpring(cursorX, { damping: 15, stiffness: 150, mass: 0.8 })
  const trailY = useSpring(cursorY, { damping: 15, stiffness: 150, mass: 0.8 })

  useEffect(() => {
    // Detect touch device
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    if (hasTouch) {
      setIsTouch(true)
      return
    }
    setIsTouch(false)

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      if (!visible) setVisible(true)
    }

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.closest('a, button, [role="button"], input, textarea, select, [data-cursor-hover]')
      ) {
        setHovering(true)
      }
    }

    const handleOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.closest('a, button, [role="button"], input, textarea, select, [data-cursor-hover]')
      ) {
        setHovering(false)
      }
    }

    const handleLeave = () => {
      setVisible(false)
    }

    window.addEventListener('mousemove', move)
    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseout', handleOut)
    document.addEventListener('mouseleave', handleLeave)

    return () => {
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseout', handleOut)
      document.removeEventListener('mouseleave', handleLeave)
    }
  }, [cursorX, cursorY, visible])

  if (isTouch) return null

  return (
    <>
      <style jsx global>{`
        * { cursor: none !important; }
      `}</style>

      {/* Trail - larger, blurred circle with delay */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          animate={{
            width: hovering ? 48 : 32,
            height: hovering ? 48 : 32,
            opacity: visible ? (hovering ? 0.3 : 0.15) : 0,
            backgroundColor: hovering ? 'rgb(59, 130, 246)' : 'rgb(255, 255, 255)',
          }}
          transition={{ duration: 0.2 }}
          className="rounded-full blur-[6px]"
        />
      </motion.div>

      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          animate={{
            width: hovering ? 20 : 8,
            height: hovering ? 20 : 8,
            opacity: visible ? 1 : 0,
            backgroundColor: hovering ? 'rgb(59, 130, 246)' : 'rgb(255, 255, 255)',
            borderWidth: hovering ? 2 : 0,
            borderColor: 'rgba(59, 130, 246, 0.5)',
          }}
          transition={{ duration: 0.15 }}
          className="rounded-full mix-blend-difference"
          style={{ boxShadow: hovering ? '0 0 20px rgba(59,130,246,0.4)' : '0 0 6px rgba(255,255,255,0.3)' }}
        />
      </motion.div>
    </>
  )
}
