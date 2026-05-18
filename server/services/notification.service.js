// Notification orchestration — turns business events ("a new property was listed")
// into outbound emails.  Runs entirely in the background; controllers never
// have to `await` this service, so a slow SMTP server cannot block the
// property-creation API response.

const User = require('../models/User');
const { sendMail } = require('./email.service');

const formatPrice = (price, period) => {
  if (price == null) return '—';
  const n = Number(price);
  let s;
  if (n >= 10_000_000) s = `₹${(n / 10_000_000).toFixed(2)} Cr`;
  else if (n >= 100_000) s = `₹${(n / 100_000).toFixed(2)} L`;
  else s = `₹${n.toLocaleString('en-IN')}`;
  if (period === 'monthly') s += ' / mo';
  if (period === 'yearly') s += ' / yr';
  return s;
};

const buildHtml = (property, clientUrl) => {
  const img = property.images?.[0]?.url;
  const link = `${clientUrl}/properties/${property.slug || property._id}`;
  const price = formatPrice(property.price, property.pricePeriod);
  const location = [property.city, property.state].filter(Boolean).join(', ');

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 0">
      <tr><td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 8px 24px rgba(15,23,42,.08)">
          <tr><td style="background:linear-gradient(135deg,#f97316,#ea580c);padding:28px 32px;color:#fff">
            <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.85">New listing</div>
            <div style="font-size:22px;font-weight:800;margin-top:4px">Telvine Realty</div>
          </td></tr>
          ${img ? `<tr><td><img src="${img}" alt="" style="display:block;width:100%;max-height:320px;object-fit:cover"></td></tr>` : ''}
          <tr><td style="padding:28px 32px">
            <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#64748b">${(property.propertyType || '').toUpperCase()} · For ${property.listingType || 'sale'}</div>
            <h1 style="font-size:22px;line-height:1.3;margin:8px 0 12px;color:#0f172a">${escapeHtml(property.title)}</h1>
            <div style="font-size:24px;font-weight:800;color:#f97316;margin-bottom:14px">${price}</div>
            <div style="font-size:14px;color:#475569;margin-bottom:14px">📍 ${escapeHtml(location || '—')}</div>
            ${property.description ? `<p style="font-size:14px;color:#475569;line-height:1.6;margin:0 0 22px">${escapeHtml(truncate(property.description, 240))}</p>` : ''}
            <table cellspacing="0" cellpadding="0"><tr><td>
              <a href="${link}" style="display:inline-block;padding:14px 26px;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px">View Property →</a>
            </td></tr></table>
          </td></tr>
          <tr><td style="padding:18px 32px;background:#f8fafc;color:#64748b;font-size:12px;border-top:1px solid #e2e8f0">
            You're receiving this because you opted in to property notifications. Reply to this email to talk to an agent.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
};

const buildText = (property, clientUrl) => {
  const price = formatPrice(property.price, property.pricePeriod);
  const link = `${clientUrl}/properties/${property.slug || property._id}`;
  const location = [property.city, property.state].filter(Boolean).join(', ');
  return [
    `New listing on Telvine Realty`,
    ``,
    `${property.title}`,
    `${price} · ${location}`,
    ``,
    property.description ? truncate(property.description, 240) : '',
    ``,
    `View it here: ${link}`,
  ].join('\n');
};

const escapeHtml = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const truncate = (s = '', n = 240) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

/**
 * Email every opted-in user that a new property is on the market.
 * Fires-and-forgets — never throws and never blocks the caller.
 */
function notifyNewProperty(property) {
  const clientUrl = process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173';

  // Run asynchronously so the API response isn't blocked by SMTP latency.
  setImmediate(async () => {
    try {
      const users = await User.find({
        isActive: true,
        notificationsEnabled: true,
        // Email everyone who has opted in. To restrict, change to: role: 'user'
      }).select('email name');

      if (!users.length) return;

      const subject = `New listing: ${property.title}`;
      const html = buildHtml(property, clientUrl);
      const text = buildText(property, clientUrl);

      // Send in parallel batches of 20 to avoid hammering SMTP.
      const batchSize = 20;
      for (let i = 0; i < users.length; i += batchSize) {
        const slice = users.slice(i, i + batchSize);
        await Promise.allSettled(
          slice.map((u) => sendMail({ to: u.email, subject, html, text }))
        );
      }
    } catch (err) {
      console.error('[notify] notifyNewProperty failed:', err.message);
    }
  });
}

module.exports = { notifyNewProperty };
