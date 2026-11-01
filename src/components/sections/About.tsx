import { Sparkles, Award, Users, Heart } from 'lucide-react';

export function About() {
  return (
    <section id="about" className="section-padding relative overflow-hidden transition-colors duration-300 border-t border-border/40"
      style={{ background: 'var(--background)' }}>

      {/* Subtle orbs */}
      <div className="absolute top-20 right-[10%] w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(201,149,108,0.04)' }} />
      <div className="absolute bottom-10 left-[5%] w-60 h-60 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(190,24,93,0.03)' }} />

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative animate-fade-in">
            <div className="relative overflow-hidden"
              style={{ borderRadius: '28px', boxShadow: '0 24px 64px rgba(0,0,0,0.12), 0 0 0 1px rgba(201,149,108,0.08)' }}>
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=1000&fit=crop"
                alt="Makeup artist at work"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-full opacity-30 blur-3xl"
              style={{ background: 'linear-gradient(135deg, rgba(190,24,93,0.3), rgba(201,149,108,0.3))' }} />
          </div>

          {/* Content */}
          <div className="animate-slide-up">
            <div className="section-pill">
              <Sparkles className="w-4 h-4" />
              About Us
            </div>

            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Meet the Artist Behind the <span className="gradient-text italic">Magic</span>
            </h2>

            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              Welcome to BlindGlow By Satguru, where beauty meets doorstep luxury. Founded by passionate beauty specialists with over 15 years of industry excellence, we specialize in delivering salon-grade treatments directly to your doorstep.
            </p>

            <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
              Our mission is to provide hygienic, certified, and personalized beauty care in the comfort of your home. We believe every person deserves to look and feel radiant without salon wait times.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[
                { icon: Award, value: '15+', label: 'Years Experience', gradient: 'linear-gradient(135deg, #C83E68, #A82E52)' },
                { icon: Users, value: '1.2M+', label: 'Happy Clients', gradient: 'linear-gradient(135deg, #c9956c, #d4a574)' },
                { icon: Heart, value: '100%', label: 'Satisfaction', gradient: 'linear-gradient(135deg, #C83E68, #8E2345)' },
              ].map(({ icon: Icon, value, label, gradient }) => (
                <div key={label} className="text-center p-5 transition-all duration-500 hover:-translate-y-2"
                  style={{
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(201,149,108,0.08)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  }}>
                  <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                    style={{ background: gradient }}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-bold text-xl font-display gradient-text">{value}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
