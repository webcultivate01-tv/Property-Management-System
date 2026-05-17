// Heuristic lead-quality score for an inquiry.
// Pure function — no network calls. Returns { score, tier, reasons }.
//
//   tier: 'hot' (>= 70) | 'warm' (40-69) | 'cold' (< 40)

export function scoreInquiry(inq) {
  if (!inq) return { score: 0, tier: 'cold', reasons: [] };

  let score = 30; // baseline
  const reasons = [];

  // Has phone number → contactable
  if (inq.phone && inq.phone.replace(/\D/g, '').length >= 7) {
    score += 18;
    reasons.push('Phone number provided');
  }

  // Linked to a specific property → focused interest
  if (inq.property?._id || inq.property) {
    score += 15;
    reasons.push('Asked about a specific property');
  }

  // Message length signals seriousness
  const msgLen = (inq.message || '').trim().length;
  if (msgLen >= 200) {
    score += 18;
    reasons.push('Detailed message (200+ chars)');
  } else if (msgLen >= 80) {
    score += 10;
    reasons.push('Medium-length message');
  } else if (msgLen < 20) {
    score -= 8;
    reasons.push('Very short message');
  }

  // Buying-intent words
  const text = `${inq.message || ''} ${inq.inquiryType || ''}`.toLowerCase();
  const intent = ['visit', 'viewing', 'budget', 'loan', 'mortgage', 'urgent', 'asap', 'today', 'tomorrow', 'this week', 'price', 'negotiat', 'tour', 'inspect', 'finalise', 'finalize'];
  const hits = intent.filter((w) => text.includes(w));
  if (hits.length) {
    score += Math.min(12, hits.length * 5);
    reasons.push(`Buying-intent words (${hits.slice(0, 2).join(', ')})`);
  }

  // Recency boost — newer = hotter
  if (inq.createdAt) {
    const ageHrs = (Date.now() - new Date(inq.createdAt).getTime()) / 36e5;
    if (ageHrs < 24) {
      score += 10;
      reasons.push('Submitted in last 24h');
    } else if (ageHrs < 72) {
      score += 4;
    } else if (ageHrs > 24 * 30) {
      score -= 8;
      reasons.push('Over a month old');
    }
  }

  // Status nudges
  if (inq.status === 'interested') {
    score += 8;
    reasons.push('Marked as interested');
  } else if (inq.status === 'spam') {
    score = 0;
    reasons.length = 0;
    reasons.push('Marked as spam');
  } else if (inq.status === 'closed') {
    score -= 20;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const tier = score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold';
  return { score, tier, reasons };
}

export const TIER_STYLE = {
  hot: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
  warm: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  cold: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

export const TIER_LABEL = {
  hot: 'Hot',
  warm: 'Warm',
  cold: 'Cold',
};
