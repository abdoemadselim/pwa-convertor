"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
  isLoading: boolean
}

export default function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center"
      >
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-white text-lg font-semibold">Forging your PWA...</p>
        <p className="text-gray-400 mt-2">This may take a few moments</p>
      </motion.div>
    </motion.div>
  )
}

