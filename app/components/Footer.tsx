import Link from "next/link"
import { Github, Twitter, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full bg-gray-800/30 border-t border-gray-700 backdrop-blur-sm py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-base text-gray-400">© {new Date().getFullYear()} PWA Forge. All rights reserved.</p>
            <p className="text-base text-gray-500 mt-2">
              Developed by <span className="text-blue-400">Abdo Emad</span>
            </p>
          </div>
          <div className="flex space-x-4">
            <Link href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">
              <Github className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
            </Link>
            <Link href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer">
              <Twitter className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
            </Link>
            <Link href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer">
              <Linkedin className="w-6 h-6 text-gray-400 hover:text-white transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

