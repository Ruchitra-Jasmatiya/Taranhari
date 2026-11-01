// =========================================================
// Contact.jsx - location, owner, big contact buttons, hours and
// a small message form (validated, no sending yet).
//
// ★ EDIT THE CONTACT OBJECT BELOW - every value on this page and
//   in the footer comes from it. ★
// =========================================================

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock, Instagram, Mail, MapPin, MessageCircle, Navigation, Phone, User } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import Img from '../components/Img.jsx';
import './Contact.css';

export const CONTACT = {
  // REPLACE: every value below with your real details
  ownerName: 'Owner Name', // REPLACE: owner's name
  ownerRole: 'Founder, Taran Hari', // REPLACE: role
  ownerPhoto: '/images/team/owner.jpg', // REPLACE: put owner photo here
  address: 'Taran Hari Foods, Plot 00, Industrial Area, Your City, State - 000000', // REPLACE: factory address
  addressShort: 'Your City, India', // REPLACE: short address used in footer
  // REPLACE: in Google Maps choose Share > Embed a map > copy the src="..." link and paste it here.
  // Leave empty to show a placeholder box instead of the map.
  mapEmbedUrl: '',
  phoneDisplay: '+91 00000 00000', // REPLACE
  phoneTel: '+910000000000', // REPLACE: digits only with country code, used for the Call button
  whatsapp: '910000000000', // REPLACE: digits only, country code first, no + sign
  whatsappMessage: 'Namaste Taran Hari! I would like to order some namkeen.',
  email: 'hello@taranhari.example', // REPLACE
  instagram: 'https://www.instagram.com/', // REPLACE: your Instagram page
  facebook: 'https://www.facebook.com/', // REPLACE
  youtube: 'https://www.youtube.com/', // REPLACE
  hours: [
    // REPLACE: your real timings
    { days: 'Monday - Saturday', time: '9:00 AM - 8:00 PM' },
    { days: 'Sunday', time: '10:00 AM - 4:00 PM' },
    { days: 'Festival days', time: 'Open late - follow us on Instagram' },
  ],
};

// ---------- form helpers ----------
const emptyForm = { name: '', phone: '', message: '' };

function validate(v) {
  const errors = {};
  if (v.name.trim().length < 2) errors.name = 'Please tell us your name.';
  // accepts 10-digit Indian mobile numbers, optional +91 / spaces / dashes
  const digits = v.phone.replace(/[\s-]/g, '');
  if (!/^(\+?91)?[6-9]\d{9}$/.test(digits)) errors.phone = 'Enter a valid 10-digit mobile number.';
  if (v.message.trim().length < 10) errors.message = 'Write at least 10 characters so we can help.';
  return errors;
}

export default function Contact() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [sent, setSent] = useState(false);

  const waLink = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(CONTACT.whatsappMessage)}`;
  const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CONTACT.address)}`;

  const change = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    if (touched[name]) setErrors(validate(next));
  };

  const blur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
    setErrors(validate(form));
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    setTouched({ name: true, phone: true, message: true });
    if (Object.keys(found).length) {
      // jump to the first problem
      const first = ['name', 'phone', 'message'].find((k) => found[k]);
      document.getElementById(`cf-${first}`)?.focus();
      return;
    }
    // TODO (backend later): send `form` to your server / email service here.
    setSent(true);
  };

  const again = () => {
    setForm(emptyForm);
    setErrors({});
    setTouched({});
    setSent(false);
  };

  const err = (k) => touched[k] && errors[k];

  return (
    <div className="contact">
      {/* ---------- Header ---------- */}
      <section className="contact__hero band-paper">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Baat karte hain</span>
            <h1>Say hello. We love a good chat.</h1>
            <p className="contact__lead">Orders, bulk enquiries, feedback or just a craving. Tap a button or visit the factory.</p>
          </Reveal>
        </div>
      </section>

      {/* ---------- Big tap buttons ---------- */}
      <section className="contact__actions band-accent" aria-label="Contact options">
        <div className="container contact__grid4">
          <Reveal delay={0}>
            <a className="cbtn" href={`tel:${CONTACT.phoneTel}`}>
              <span className="cbtn__icon"><Phone size={26} strokeWidth={2.6} /></span>
              <span className="cbtn__text">
                <strong>Call us</strong>
                <small>{CONTACT.phoneDisplay}</small>
              </span>
            </a>
          </Reveal>
          <Reveal delay={0.07}>
            <a className="cbtn" href={waLink} target="_blank" rel="noopener noreferrer">
              <span className="cbtn__icon"><MessageCircle size={26} strokeWidth={2.6} /></span>
              <span className="cbtn__text">
                <strong>WhatsApp</strong>
                <small>Chat and order</small>
              </span>
            </a>
          </Reveal>
          <Reveal delay={0.14}>
            <a className="cbtn" href={`mailto:${CONTACT.email}`}>
              <span className="cbtn__icon"><Mail size={26} strokeWidth={2.6} /></span>
              <span className="cbtn__text">
                <strong>Email</strong>
                <small>{CONTACT.email}</small>
              </span>
            </a>
          </Reveal>
          <Reveal delay={0.21}>
            <a className="cbtn" href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">
              <span className="cbtn__icon"><Instagram size={26} strokeWidth={2.6} /></span>
              <span className="cbtn__text">
                <strong>Instagram</strong>
                <small>Follow the crunch</small>
              </span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ---------- Location + owner + hours ---------- */}
      <section className="section band-paper">
        <div className="container contact__cols">
          <Reveal className="contact__loc">
            <h2>Visit our factory</h2>
            <p className="contact__address">
              <MapPin size={22} aria-hidden="true" />
              <span>{CONTACT.address}</span>
            </p>

            <div className="map sticker">
              {CONTACT.mapEmbedUrl ? (
                <iframe
                  title="Map showing the Taran Hari factory location"
                  src={CONTACT.mapEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <div className="map__ph">
                  <MapPin size={40} strokeWidth={2.5} aria-hidden="true" />
                  <strong>Map goes here</strong>
                  {/* REPLACE: paste your Google Maps embed link into CONTACT.mapEmbedUrl */}
                  <span>REPLACE: set mapEmbedUrl at the top of Contact.jsx</span>
                </div>
              )}
            </div>

            <a className="btn btn--lg" href={directionsLink} target="_blank" rel="noopener noreferrer">
              <Navigation size={20} strokeWidth={3} aria-hidden="true" /> Get Directions
            </a>
          </Reveal>

          <div className="contact__side">
            <Reveal className="owner sticker" delay={0.1}>
              <div className="owner__photo">
                {/* REPLACE: put owner photo at public/images/team/owner.jpg */}
                <Img src={CONTACT.ownerPhoto} alt={`Photo of ${CONTACT.ownerName}`} compact />
              </div>
              <div>
                <span className="owner__label"><User size={14} aria-hidden="true" /> Meet the owner</span>
                <h3>{CONTACT.ownerName}</h3>
                <p>{CONTACT.ownerRole}</p>
              </div>
            </Reveal>

            <Reveal className="hours sticker" delay={0.2}>
              <h3><Clock size={22} aria-hidden="true" /> Business hours</h3>
              <dl>
                {CONTACT.hours.map((h) => (
                  <div key={h.days} className="hours__row">
                    <dt>{h.days}</dt>
                    <dd>{h.time}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Message form ---------- */}
      <section className="section band-ink">
        <div className="container contact__formwrap">
          <Reveal className="section-head">
            <span className="eyebrow">Drop us a line</span>
            <h2>Send a message</h2>
            <p>Bulk orders, wedding hampers, feedback. We reply fast.</p>
          </Reveal>

          <Reveal className="formcard sticker" delay={0.1}>
            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div
                  key="thanks"
                  className="thanks"
                  role="status"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CheckCircle2 size={56} strokeWidth={2.4} aria-hidden="true" />
                  <h3>Shukriya, {form.name.trim().split(' ')[0]}!</h3>
                  <p>
                    Your message is noted. Sending is not connected yet, so for a quick reply please
                    WhatsApp or call us.
                  </p>
                  <div className="thanks__btns">
                    <a className="btn btn--accent" href={waLink} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
                    <button type="button" className="btn btn--paper" onClick={again}>Send another</button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  noValidate
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`field ${err('name') ? 'has-error' : ''}`}>
                    <label htmlFor="cf-name">Your name</label>
                    <input
                      id="cf-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={form.name}
                      onChange={change}
                      onBlur={blur}
                      aria-invalid={!!err('name')}
                      aria-describedby={err('name') ? 'cf-name-err' : undefined}
                    />
                    {err('name') && <p className="field__err" id="cf-name-err">{errors.name}</p>}
                  </div>

                  <div className={`field ${err('phone') ? 'has-error' : ''}`}>
                    <label htmlFor="cf-phone">Phone number</label>
                    <input
                      id="cf-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="98765 43210"
                      value={form.phone}
                      onChange={change}
                      onBlur={blur}
                      aria-invalid={!!err('phone')}
                      aria-describedby={err('phone') ? 'cf-phone-err' : undefined}
                    />
                    {err('phone') && <p className="field__err" id="cf-phone-err">{errors.phone}</p>}
                  </div>

                  <div className={`field ${err('message') ? 'has-error' : ''}`}>
                    <label htmlFor="cf-message">Message</label>
                    <textarea
                      id="cf-message"
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={change}
                      onBlur={blur}
                      aria-invalid={!!err('message')}
                      aria-describedby={err('message') ? 'cf-message-err' : undefined}
                    />
                    {err('message') && <p className="field__err" id="cf-message-err">{errors.message}</p>}
                  </div>

                  <button type="submit" className="btn btn--lg btn--block">Send message</button>
                </motion.form>
              )}
            </AnimatePresence>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
