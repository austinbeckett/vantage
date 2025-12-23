import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Pipeline() {
  return (
    <div>
      <div className="mb-6">
        <Link
          to="/competitive-intelligence"
          className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Competitive Intelligence</span>
        </Link>
      </div>
      <h1 className="text-3xl font-bold font-serif text-neutral-900 dark:text-neutral-100">
        Pipeline Tracker
      </h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Track drug products through the regulatory pipeline.
      </p>
    </div>
  )
}
