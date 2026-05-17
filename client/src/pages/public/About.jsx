import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Target, Eye, Award, Users, Building2, TrendingUp,
  Heart, Leaf, Shield, Lightbulb, Sparkles, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { SectionHeader } from '@/components/public/SectionHeader';

const team = [
  { name: 'Aarav Kapoor', role: 'Founder & CEO', img: 'https://i.pravatar.cc/300?img=12' },
  { name: 'Isha Verma', role: 'Head of Sales', img: 'https://i.pravatar.cc/300?img=47' },
  { name: 'Rohit Singh', role: 'Senior Advisor', img: 'https://i.pravatar.cc/300?img=33' },
  { name: 'Priya Iyer', role: 'Legal Lead', img: 'https://i.pravatar.cc/300?img=45' },
];

const values = [
  { icon: Heart, t: 'People over paperwork', d: 'Behind every transaction is a family. We never lose sight of that.' },
  { icon: Shield, t: 'Radical transparency', d: 'Real prices, real timelines, real risks — disclosed upfront, always.' },
  { icon: Lightbulb, t: 'Curious by default', d: 'We obsess over markets, data and design so you don\'t have to.' },
  { icon: Leaf, t: 'Long-term thinking', d: 'A trusted brand is built one good decision at a time. We choose patience.' },
];

const milestones = [
  { year: '2016', t: 'Founded in Mumbai', d: 'Three friends, a shared apartment, and a vision to bring honesty back to real estate.' },
  { year: '2018', t: 'First 100 closures', d: 'Hit the milestone in under 18 months — driven entirely by word-of-mouth referrals.' },
  { year: '2020', t: 'Expanded to 10 cities', d: 'Bengaluru, Delhi NCR, Pune, Hyderabad joined the network. Remote site visits launched.' },
  { year: '2022', t: 'Launched legal & loan vertical', d: 'In-house lawyers and a panel of 18+ lender tie-ups — one window for the whole journey.' },
  { year: '2024', t: '₹2,000 Cr in closed value', d: 'Crossed the milestone with 8,000+ happy families across 25+ cities.' },
  { year: '2026', t: 'AI-curated discovery', d: 'Personalised property feeds, locality scores and predictive pricing for every customer.' },
];

const recognitions = [
  'ET Real Estate Brand of the Year 2024',
  'Economic Times Best PropTech Startup',
  'CRISIL A+ Verified Listings Partner',
  'Forbes Asia 30 Under 30 — Founders',
  'Google Cloud Customer Award 2023',
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

      {/* HERO BANNER */}
      <section className="container-x">
        <div className="rounded-3xl overflow-hidden relative shadow-glow">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80"
            alt="Modern home exterior"
            className="w-full h-[260px] md:h-[420px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex items-center px-8 md:px-16">
            <div className="max-w-xl text-white">
              <div className="text-xs uppercase tracking-widest opacity-80 mb-2">Since 2016</div>
              <h2 className="font-display font-extrabold text-2xl md:text-4xl leading-tight">
                A decade of helping families find the right address.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="container-x mt-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-3xl overflow-hidden shadow-glow">
          <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80" alt="Team at work" className="w-full h-full object-cover" />
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
            Backed by data, driven by people, and powered by technology — every shortlist we send is
            handpicked by a real human who knows your story.
          </p>
          <div className="mt-6 space-y-2.5">
            {[
              'In-house legal team — no outsourcing',
              'Owner-direct listings — no hidden brokerage',
              '24/7 advisor access, 7 days a week',
            ].map((p) => (
              <div key={p} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>{p}</span>
              </div>
            ))}
          </div>
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

      {/* VALUES */}
      <section className="container-x mt-24">
        <SectionHeader
          eyebrow="What we stand for"
          title="The values behind every decision"
          description="Hires, deals, refunds, refusals — these are the principles we test every choice against."
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v, i) => (
            <motion.div
              key={v.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300 grid place-items-center mb-4">
                <v.icon size={20} />
              </div>
              <h3 className="font-display font-bold text-base mb-1.5">{v.t}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{v.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TIMELINE */}
      <section className="container-x mt-24">
        <SectionHeader
          eyebrow="Our journey"
          title="Ten years, marked by moments"
          description="A timeline of the milestones — and the lessons — that shaped Telvine."
        />
        <div className="mt-12 relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-brand-300 dark:via-brand-500/30 to-transparent -translate-x-1/2" />
          <div className="space-y-8">
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.04 }}
                className={`relative flex items-start gap-4 md:grid md:grid-cols-2 md:gap-12 ${
                  i % 2 === 0 ? '' : 'md:flex-row-reverse'
                }`}
              >
                <div className={`hidden md:block ${i % 2 === 1 ? 'order-2' : ''}`} />
                <div className={`absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-white dark:ring-surface-darker -translate-x-1/2 mt-2 md:mt-3`} />
                <div className={`pl-10 md:pl-0 ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:pl-12'}`}>
                  <div className="font-display font-extrabold text-2xl text-brand-600 dark:text-brand-300">{m.year}</div>
                  <h3 className="font-display font-bold text-lg mt-1">{m.t}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{m.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
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

      {/* RECOGNITION */}
      <section className="container-x mt-24">
        <div className="glass-card p-8 md:p-10">
          <div className="text-center">
            <Sparkles size={20} className="mx-auto text-brand-500 mb-2" />
            <div className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Recognition & awards
            </div>
            <h3 className="font-display font-bold text-2xl md:text-3xl mt-2">
              Honored by people we admire
            </h3>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {recognitions.map((r) => (
              <div
                key={r}
                className="px-4 py-2 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/10 text-sm font-medium text-slate-700 dark:text-slate-200 inline-flex items-center gap-2"
              >
                <Award size={14} className="text-amber-500" /> {r}
              </div>
            ))}
          </div>
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

      {/* CTA */}
      <section className="container-x mt-24">
        <div className="rounded-3xl bg-brand-gradient text-white p-10 md:p-14 grid lg:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="font-display font-extrabold text-2xl md:text-4xl leading-tight">
              Want to work with us?
            </h2>
            <p className="opacity-90 mt-3 max-w-lg">
              Whether you're a homebuyer, a developer or a future colleague — we'd love to hear from you.
            </p>
          </div>
          <div className="lg:text-right">
            <Link to="/contact" className="btn-accent">
              Start a conversation <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
