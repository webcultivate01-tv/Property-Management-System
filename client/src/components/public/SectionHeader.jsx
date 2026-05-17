import { motion } from 'framer-motion';

export function SectionHeader({ eyebrow, title, description, align = 'center' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={align === 'center' ? 'text-center max-w-2xl mx-auto' : 'max-w-2xl'}
    >
      {eyebrow && (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 mb-4">
          {eyebrow}
        </span>
      )}
      <h2 className="section-title mb-3">{title}</h2>
      {description && (
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
      )}
    </motion.div>
  );
}
