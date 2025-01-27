import { CheckCircle } from "lucide-react"

const features = [
  "Convert any website to a PWA",
  "Customizable theme color",
  "Automatic GitHub Pages deployment",
  "Optimized for performance",
]

export default function FeatureList() {
  return (
    <ul className="space-y-2 mt-4">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center space-x-2 text-sm">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span className="text-gray-300">{feature}</span>
        </li>
      ))}
    </ul>
  )
}

