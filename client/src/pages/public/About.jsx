import { motion } from 'framer-motion';
import { Target, Eye, Award, Users, Building2, TrendingUp } from 'lucide-react';
import { SectionHeader } from '@/components/public/SectionHeader';

const team = [
  { name: 'Aarav Kapoor', role: 'Founder & CEO', img: 'https://i.pravatar.cc/300?img=12' },
  { name: 'Isha Verma', role: 'Head of Sales', img: 'https://i.pravatar.cc/300?img=47' },
  { name: 'Rohit Singh', role: 'Senior Advisor', img: 'https://i.pravatar.cc/300?img=33' },
  { name: 'Priya Iyer', role: 'Legal Lead', img: 'https://i.pravatar.cc/300?img=45' },
];

export default function About() {
  return (
    <div>
      <section className="container-x py-16 md:py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300">
            About Telvine Realty
          </span>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl mt-5 leading-tight">
            Premium real estate, <br />
            crafted around <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">you.</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-6 text-lg">
            We're more than a real estate platform — we're a partner for life-changing decisions.
            From your first apartment to your dream villa, we make every step intentional.
          </p>
        </motion.div>
      </section>

      {/* STORY */}
      <section className="container-x grid lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-3xl overflow-hidden shadow-glow">
          <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200" alt="" className="w-full h-full object-cover" />
        </div>
        <div>
          <SectionHeader
            align="left"
            eyebrow="Our story"
            title="A decade of redefining real-estate"
            description="What started as a passion to bring transparency to property buying has grown into a trusted brand serving thousands of families across 25+ cities."
          />
          <p className="mt-6 text-slate-600 dark:text-slate-400 leading-relaxed">
            We believe in a real-estate experience that feels less transactional and more thoughtful.
            Backed by data, driven by people, and powered by technology.
          </p>
        </div>
      </section>

      {/* MISSION/VISION */}
      <section className="container-x mt-24 grid md:grid-cols-2 gap-6">
        {[
          { i: Target, t: 'Our Mission', d: 'To make property ownership effortless, trustworthy and delightful for every Indian family.' },
          { i: Eye, t: 'Our Vision', d: 'To be the most loved real-estate brand, known for transparency, design and care.' },
        ].map((b) => (
          <div key={b.t} className="glass-card p-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-gradient grid place-items-center text-white mb-5">
              <b.i size={24} />
            </div>
            <h3 className="font-display font-bold text-2xl mb-2">{b.t}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{b.d}</p>
          </div>
        ))}
      </section>

      {/* ACHIEVEMENTS */}
      <section className="container-x mt-24">
        <SectionHeader
          eyebrow="By the numbers"
          title="Milestones we're proud of"
          description="Numbers that reflect trust earned, one home at a time."
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { i: Building2, v: '12,000+', l: 'Properties listed' },
            { i: Users, v: '8,000+', l: 'Happy families' },
            { i: TrendingUp, v: '₹ 2,000 Cr', l: 'Transaction value' },
            { i: Award, v: '15+', l: 'Industry awards' },
          ].map((s) => (
            <div key={s.l} className="glass-card p-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 grid place-items-center mb-4">
                <s.i size={22} />
              </div>
              <div className="font-display font-extrabold text-3xl">{s.v}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM */}
      <section className="container-x mt-24">
        <SectionHeader
          eyebrow="Meet the team"
          title="The people behind Telvine"
          description="A small team of passionate experts, designers and advisors."
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass-card overflow-hidden"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5">
                <h3 className="font-display font-bold text-lg">{m.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{m.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
