"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play } from "lucide-react"

export default function VideoDemonstration() {
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = () => {
    setIsPlaying(true)
  }

  return (
    <motion.div
      className="mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="region"
      aria-label="Video demonstration"
    >
      <h2 className="text-3xl font-semibold mb-6 text-center bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
        See How It Works
      </h2>
      <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
        {!isPlaying ? (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-gray-800/50 backdrop-blur-sm"
            whileHover={{ backgroundColor: "rgba(31, 41, 55, 0.7)" }}
            role="presentation"
          >
            <motion.button
              onClick={handlePlay}
              className="bg-white/10 hover:bg-white/20 transition-colors rounded-full p-4"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Play video demonstration"
            >
              <Play className="w-16 h-16 text-white" aria-hidden="true" />
            </motion.button>
          </motion.div>
        ) : (
          <video 
            autoPlay 
            controls 
            className="w-full h-full"
            aria-label="PWA conversion demonstration video"
            title="How to convert a website to PWA"
          >
            <source src="/pwaify.mp4" type="video/mp4" />
            <track 
              kind="captions" 
              src="/captions.vtt" 
              srcLang="en" 
              label="English captions"
            />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      <p className="mt-6 text-center text-gray-400 text-lg" aria-live="polite">
        Watch our step-by-step guide on converting a website to a PWA
      </p>
    </motion.div>
  )
}
