import React from "react";
import { useNavigate, Link } from "react-router-dom";
import Lottie from "lottie-react";
import PlantAnimation from "../../utils/Plant.json";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-bg-primary to-gray-900 text-white relative overflow-hidden">
      <header className="container mx-auto px-6 py-8 flex justify-between items-center z-10 relative">
        <div className="text-2xl font-extrabold tracking-wide">
          Seedlink<span className="text-gold-primary">AI</span>
        </div>
        <div className="space-x-6 hidden md:flex">
          <Link to="/about" className="hover:text-gold-primary transition">About</Link>
          <Link to="/features" className="hover:text-gold-primary transition">Features</Link>
          <Link to="/contact" className="hover:text-gold-primary transition">Contact</Link>
        </div>
      </header>

      <main>
        <section className="px-6 py-16 md:py-24">
          <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6 text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
                Grow Local Businesses with <span className="text-gold-primary">AI + AR</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl opacity-90">
                Seedlink AI transforms everyday shops into immersive digital experiences with <span className="text-gold-primary">smart AI tools</span> and <span className="text-teal">interactive AR previews</span>.
              </p>
              <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  onClick={() => navigate("/signin")}
                  className="bg-gold-primary text-black px-6 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-gold-light transition transform hover:-translate-y-1"
                >
                  Get Started
                </button>
                <button
                  onClick={() => navigate("/features")}
                  className="border border-gold-primary px-6 py-3 rounded-lg font-medium hover:bg-gold-primary/10 transition transform hover:-translate-y-1"
                >
                  Learn More
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center relative">
              <div className="w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] md:w-[400px] md:h-[400px]">
                <Lottie animationData={PlantAnimation} loop={true} />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-black/30 px-6">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-14">
              Core <span className="text-gold-primary">Features</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="bg-bg-primary p-8 rounded-2xl border border-gold-primary/30 hover:border-gold-primary/70 transition transform hover:-translate-y-2 shadow-xl text-center">
                <div className="text-gold-primary text-4xl sm:text-5xl mb-6">🌱</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4">AI Photo-to-AR Store</h3>
                <p className="opacity-80">
                  Upload a few photos, and instantly get a <span className="text-gold-primary">360° AR-like walkthrough</span> of your store.
                </p>
              </div>
              <div className="bg-bg-primary p-8 rounded-2xl border border-gold-primary/30 hover:border-gold-primary/70 transition transform hover:-translate-y-2 shadow-xl text-center">
                <div className="text-gold-primary text-4xl sm:text-5xl mb-6">📊</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4">Smart Catalog</h3>
                <p className="opacity-80">
                  AI auto-detects items from your photos to generate structured <span className="text-teal">digital catalogs</span>.
                </p>
              </div>
              <div className="bg-bg-primary p-8 rounded-2xl border border-gold-primary/30 hover:border-gold-primary/70 transition transform hover:-translate-y-2 shadow-xl text-center">
                <div className="text-gold-primary text-4xl sm:text-5xl mb-6">🤖</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4">AI Shop Assistant</h3>
                <p className="opacity-80">
                  Every shop gets its own <span className="text-gold-primary">AI agent</span> trained on your business to help customers instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 relative">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
              Ready to <span className="text-gold-primary">Grow?</span>
            </h2>
            <p className="text-base sm:text-lg opacity-90 mb-10">
              Join thousands of local businesses that are already building <span className="text-gold-primary">trust</span> and <span className="text-teal">visibility</span> with Seedlink AI.
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="bg-teal px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-lg shadow-lg hover:opacity-90 transition transform hover:-translate-y-2"
            >
              Create Your Account
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-black/40 py-10 px-6">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-2xl font-extrabold">
              Seedlink<span className="text-gold-primary">AI</span>
            </div>
            <p className="opacity-70 text-sm mt-2">Empowering local businesses with AI technology</p>
          </div>
          <div className="flex gap-8 text-sm">
            <Link to="/about" className="hover:text-gold-primary transition">About</Link>
            <Link to="/features" className="hover:text-gold-primary transition">Features</Link>
            <Link to="/contact" className="hover:text-gold-primary transition">Contact</Link>
          </div>
        </div>
        <div className="mt-6 text-center text-xs opacity-60">
          © {new Date().getFullYear()} Seedlink AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
