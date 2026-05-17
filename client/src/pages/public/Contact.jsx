import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Clock, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { inquiryService } from '@/services/inquiry.service';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(8, 'Phone is required'),
  inquiryType: z.enum(['general', 'buying', 'selling', 'renting', 'investment', 'legal']),
  message: z.string().min(10, 'Please share a few details'),
});

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { inquiryType: 'general' },
  });

  const onSubmit = async (data) => {
    try {
      await inquiryService.submit(data);
      toast.success('Thank you! We will reach out shortly.');
      reset({ inquiryType: 'general' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    }
  };

  return (
    <div>
      <section className="container-x py-16 md:py-24 text-center">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300">
          Contact
        </span>
        <h1 className="font-display font-extrabold text-4xl md:text-6xl mt-5">
          Let's <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">talk</span> property.
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-6 text-lg">
          Whether you're buying, selling, renting or investing — our team is here to help.
        </p>
      </section>

      <section className="container-x grid lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit(onSubmit)}
          className="glass-card p-6 md:p-8 space-y-4"
        >
          <h2 className="font-display font-bold text-2xl">Send us a message</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Full name" {...register('name')} error={errors.name?.message} placeholder="John Doe" />
            <Input label="Email" type="email" {...register('email')} error={errors.email?.message} placeholder="you@example.com" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Phone" {...register('phone')} error={errors.phone?.message} placeholder="+91 98765 43210" />
            <Select label="Inquiry type" {...register('inquiryType')}>
              <option value="general">General Inquiry</option>
              <option value="buying">Buying</option>
              <option value="selling">Selling</option>
              <option value="renting">Renting</option>
              <option value="investment">Investment</option>
              <option value="legal">Legal Assistance</option>
            </Select>
          </div>
          <Textarea
            label="Message"
            rows={5}
            placeholder="Tell us what you're looking for..."
            {...register('message')}
            error={errors.message?.message}
          />
          <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">
            Send Message <Send size={16} />
          </Button>
        </motion.form>

        <aside className="space-y-5">
          {[
            { i: MapPin, t: 'Visit Us', v: 'Mumbai, Maharashtra, India' },
            { i: Phone, t: 'Call Us', v: '+91 98765 43210' },
            { i: Mail, t: 'Email', v: 'contact@telvine.com' },
            { i: Clock, t: 'Working Hours', v: 'Mon – Sat, 9:00 AM – 7:00 PM' },
          ].map((s) => (
            <div key={s.t} className="glass-card p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-brand-gradient grid place-items-center text-white">
                <s.i size={18} />
              </div>
              <div>
                <div className="font-semibold">{s.t}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{s.v}</div>
              </div>
            </div>
          ))}

          <div className="glass-card p-5">
            <div className="font-semibold mb-3">Follow us</div>
            <div className="flex gap-2">
              {[Facebook, Instagram, Twitter, Linkedin].map((I, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 grid place-items-center hover:bg-brand-50 dark:hover:bg-brand-500/10 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-300 transition">
                  <I size={16} />
                </a>
              ))}
            </div>
          </div>
        </aside>
      </section>

      {/* MAP */}
      <section className="container-x mt-16">
        <div className="rounded-3xl overflow-hidden glass-card">
          <iframe
            title="Office map"
            width="100%"
            height="420"
            loading="lazy"
            src="https://www.google.com/maps?q=Mumbai,Maharashtra,India&z=11&output=embed"
          />
        </div>
      </section>
    </div>
  );
}
