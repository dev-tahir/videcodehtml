import Link from 'next/link'
import { Check } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Page Creator
          </Link>
          <Link href="/" className="text-gray-700 hover:text-purple-600">
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Start free, upgrade when you need more
        </p>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
            <h2 className="text-2xl font-bold mb-2">Free Tier</h2>
            <div className="text-4xl font-bold mb-6">
              $0<span className="text-lg text-gray-600">/month</span>
            </div>
            
            <ul className="space-y-3 mb-8 text-left">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>10 pages per month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>100 history entries per month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>All AI models available</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Line-stitching technology</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Pages shared by default</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Community voting</span>
              </li>
            </ul>

            <Link
              href="/auth/signup"
              className="block w-full px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl shadow-xl p-8 border-2 border-purple-600 relative">
            <div className="absolute -top-4 right-4 bg-yellow-400 text-purple-900 px-4 py-1 rounded-full text-sm font-semibold">
              Popular
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Pro Plan</h2>
            <div className="text-4xl font-bold mb-6">
              $5<span className="text-lg opacity-90">/month</span>
            </div>
            
            <ul className="space-y-3 mb-8 text-left">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span><strong>Unlimited</strong> pages</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span><strong>Unlimited</strong> history entries</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span>Private pages option</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span>Manual code editing</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span>Duplicate community pages</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span>Use your own API keys</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                <span>Cancel anytime</span>
              </li>
            </ul>

            <Link
              href="/auth/signup"
              className="block w-full px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto text-left">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-2">What happens to my pages if I downgrade?</h3>
              <p className="text-gray-600">
                All your existing pages remain accessible. You just won't be able to create new pages beyond the free tier limit or edit existing ones until the next month.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">
                We offer a 7-day money-back guarantee. If you're not satisfied, contact us within 7 days of your purchase for a full refund.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="font-semibold text-lg mb-2">What AI models are available?</h3>
              <p className="text-gray-600">
                We support multiple AI models including GPT-4o, Claude 3.5 Sonnet, Gemini 2.0 Flash, and more. You can choose your preferred model for each project.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
