import { useEffect } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'
import { useThemeStore } from '../../store/themeStore'

const CursorGlow = () => {
  const { theme } = useThemeStore()
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  // Smooth spring animation
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  useEffect(() => {
    const moveCursor = (e) => {
      mouseX.set(e.clientX - 200) // Center the 400px circle
      mouseY.set(e.clientY - 200)
    }
    window.addEventListener('mousemove', moveCursor)
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [])

  if (window.innerWidth < 768) return null // Disable on mobile

  return (
    <motion.div
      className="cursor-glow"
      style={{
        translateX: x,
        translateY: y,
        opacity: theme === 'dark' ? 1 : 0.8
      }}
    />
  )
}

export default CursorGlow
