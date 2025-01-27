"use client"

import { useState, useCallback, memo } from "react"
import { useDropzone } from "react-dropzone"
import { motion } from "framer-motion"
import { X, Upload } from "lucide-react"

interface IconUploadProps {
  onIconChange: (file: File | null) => void
  defaultIcon?: string
}

const IconUpload = memo(function IconUpload({ onIconChange, defaultIcon }: IconUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(defaultIcon)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        if (file.type === "image/png") {
          onIconChange(file)
          setPreview(URL.createObjectURL(file))
        } else {
          alert("Please upload a PNG file only.")
        }
      }
    },
    [onIconChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
    },
    maxFiles: 1,
    multiple: false,
  })

  const removeIcon = useCallback(() => {
    setPreview(undefined)
    onIconChange(null)
  }, [onIconChange])

  return (
    <div className="w-full">
      <motion.div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-700"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative inline-block">
            <motion.img
              src={preview}
              alt="Icon preview"
              className="w-32 h-32 object-cover rounded-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                removeIcon()
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Upload className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {isDragActive ? "Drop the icon here" : "Drag & drop an icon, or click to select"}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
})

export default IconUpload

