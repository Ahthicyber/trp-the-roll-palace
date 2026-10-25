import React from 'react';
import { Phone, Clock, MapPin, Award, CheckCircle } from 'lucide-react';

export default function AboutContact() {
  return (
    <section id="about" className="py-16 bg-[#080b0e] border-t border-[#1f2228]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* About Text */}
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs uppercase font-extrabold text-[#ffc52f] tracking-widest block">
              About TRP – The Roll Palace
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Crafting Karachi&apos;s Most Crave-Worthy{' '}
              <span className="text-[#ffc52f]">Rolls & Fast Food</span>
            </h2>
            <p className="text-sm sm:text-base text-[#a8a8a8] leading-relaxed">
              At <strong className="text-white font-semibold">TRP (The Roll Palace)</strong>, we live by one simple promise: <strong className="text-white">&quot;ONE BITE – FULL FLAVOUR&quot;</strong>. From our authentic charcoal BBQ to our legendary crispy zinger fillets, every recipe is honed to deliver an explosion of taste.
            </p>
            <p className="text-sm sm:text-base text-[#a8a8a8] leading-relaxed">
              Whether you are craving our signature <strong className="text-white">Cheese Lava Burgers</strong>, the oversized <strong className="text-white">Jumbo Jet Roll</strong>, or late-night loaded fries, our kitchen works round the clock to ensure you get piping hot food delivered straight to your door.
            </p>

            {/* Quality Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 text-sm text-white">
                <CheckCircle className="w-4 h-4 text-[#ffc52f]" />
                <span>100% Fresh & Halal Poultry</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-white">
                <CheckCircle className="w-4 h-4 text-[#ffc52f]" />
                <span>Handmade Parathas & Puri Rolls</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-white">
                <CheckCircle className="w-4 h-4 text-[#ffc52f]" />
                <span>Secret House Sauces & Dips</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-white">
                <CheckCircle className="w-4 h-4 text-[#ffc52f]" />
                <span>Late Night City Delivery</span>
              </div>
            </div>
          </div>

          {/* Contact & Hours Card */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#121519] border border-[#262b33] shadow-2xl space-y-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-[#ffc52f]" />
                <span>Restaurant Information</span>
              </h3>

              <div className="space-y-4 text-sm">
                {/* Phone */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#1c2027] flex items-center justify-center text-[#ffc52f] flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-[#8e8e8e] block">WhatsApp & Order Helpline</span>
                    <a
                      href="https://wa.me/923243235253"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-extrabold text-white hover:text-[#ffc52f] transition-colors"
                    >
                      0324-3235253
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#1c2027] flex items-center justify-center text-[#ffc52f] flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-[#8e8e8e] block">Operating Hours</span>
                    <span className="text-sm font-bold text-white">
                      4:00 PM – 3:00 AM (Monday to Sunday)
                    </span>
                    <span className="text-xs text-[#ffc52f] block mt-0.5">
                      Hot food delivered late night!
                    </span>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#1c2027] flex items-center justify-center text-[#ffc52f] flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-[#8e8e8e] block">Service Location</span>
                    <span className="text-sm font-bold text-white">
                      Karachi, Pakistan
                    </span>
                    <p className="text-xs text-[#8e8e8e] mt-0.5">
                      Delivery charges vary by zone / distance.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fast WhatsApp CTA */}
              <div className="pt-2">
                <a
                  href="https://wa.me/923243235253"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20ba59] text-white shadow-lg transition-all"
                >
                  <Phone className="w-4 h-4" /> Message on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
