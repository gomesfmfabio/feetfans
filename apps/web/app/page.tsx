export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-primary mb-6">
            FeetFans
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            Anonymous Marketplace for Foot Content Creators
          </p>
          <div className="inline-block bg-secondary/10 border-2 border-secondary rounded-lg px-8 py-4">
            <p className="text-2xl md:text-3xl font-semibold text-secondary">
              Coming Soon
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">100% Anonymous</h3>
            <p className="text-gray-600">
              No face exposure. Complete privacy for creators.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Easy Monetization</h3>
            <p className="text-gray-600">
              Set your prices. Direct sales. Simple income.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">Mobile-First PWA</h3>
            <p className="text-gray-600">
              Install on your phone. Works offline. Fast & reliable.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16">
          <p className="text-lg text-gray-600 mb-4">
            Launching soon. Be the first to know!
          </p>
          <button className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg">
            Notify Me
          </button>
        </div>
      </div>
    </div>
  );
}
