import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, Tag, Key, TrendingUp, Scale, ArrowRight, Check } from 'lucide-react';
import { SectionHeader } from '@/components/public/SectionHeader';

const services = [
  {
    icon: HomeIcon,
    title: 'Property Buying',
    description: 'Discover homes curated to match your taste, budget and lifestyle.',
    points: ['Verified listings', 'Personal advisor', 'Site visit assistance', 'Loan support'],
  },
  {
    icon: Tag,
    title: 'Property Selling',
    description: 'Sell smarter with data-backed pricing and a vast buyer network.',
    points: ['Market analysis', 'Premium marketing', 'Negotiation support', 'Faster closures'],
  },
  {
    icon: Key,
    title: 'Property Renting',
    description: 'Verified rental homes with hassle-free move-in and paperwork.',
    points: ['Verified tenants', 'Rental agreements', 'Property visits', 'Quick possession'],
  },
  {
    icon: TrendingUp,
    title: 'Investment Consulting',
    description: 'Strategic property investments tailored to your goals.',
    points: ['ROI analysis', 'Portfolio strategy', 'Market intel', 'Exit planning'],
  },
  {
    icon: Scale,
    title: 'Legal Assistance',
    description: 'End-to-end legal support from due-diligence to registration.',
    points: ['Title verification', 'Documentation', 'Registration help', 'Compliance review'],
  },
];

export default function Services() {
  return (
    <div>
      <section className="container-x py-16 md:py-24 text-center">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300">
          Services
        </span>
        <h1 className="font-display font-extrabold text-4xl md:text-6xl mt-5">
          Everything you need, <br />
          <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">all in one place.</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-6 text-lg">
          From your first visit to the final signature, our services cover every stage of your property journey.
        </p>
      </section>

      <section className="container-x grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-8 hover:shadow-glow hover:-translate-y-1 transition-all"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-gradient grid place-items-center text-white mb-5 shadow-soft">
              <s.icon size={24} />
            </div>
            <h3 className="font-display font-bold text-xl mb-2">{s.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-5">{s.description}</p>
            <ul className="space-y-2">
              {s.points.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-300 grid place-items-center">
                    <Check size={12} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </section>

      <section className="container-x mt-24">
        <div className="rounded-3xl overflow-hidden relative bg-brand-gradient text-white p-10 md:p-14 grid lg:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="section-title">Have a unique requirement?</h2>
            <p className="opacity-90 mt-3 max-w-lg">
              Tell us about your project — we'll craft a service plan tailored to your needs.
            </p>
          </div>
          <div className="lg:text-right">
            <Link to="/contact" className="btn-accent">
              Get a custom quote <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
