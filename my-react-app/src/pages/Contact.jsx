// =========================================================
// Contact.jsx - Clean, Professional & Royal Theme Edition
// =========================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Mail, MessageCircle, Phone, ShieldCheck, Sparkles, User } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import Img from '../components/Img.jsx';
import './Contact.css';

export const CONTACT = {
  ownerName: 'Kamlesh Verma',
  ownerRole: 'Founder & Owner, Taran Hari',
  ownerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
  phoneDisplay: '+91 98765 43210',
  phoneTel: '+919876543210',
  whatsapp: '919876543210',
  whatsappMessage: 'Namaste Taran Hari! I would like to enquire about your snacks.',
  email: 'contact@taranhari.com',
  instagram: 'https://www.instagram.com/',
  facebook: 'https://www.facebook.com/',
};

export default function Contact() {
  const waLink = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(CONTACT.whatsappMessage)}`;

  return (
    <div className="contact">
      {/* ---------- Header Section ---------- */}
      <section className="contact__hero">
        <div className="container text-center">
          <Reveal>
            <span className="eyebrow"><Sparkles size={16} /> Connect With Us</span>
            <h1>We’re Here for You</h1>
            <p className="contact__lead">
              Have questions, bulk order requests, or feedback? Reach out to us directly through any of our primary contact options below.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- Primary Contact Grid (Call, WhatsApp, Email, Instagram, Facebook) ---------- */}
      <section className="contact__actions">
        <div className="container">
          <div className="contact__grid5">
            <Reveal delay={0}>
              <a className="cbtn" href={`tel:${CONTACT.phoneTel}`}>
                <span className="cbtn__icon"><Phone size={24} strokeWidth={2.4} /></span>
                <span className="cbtn__text">
                  <strong>Call Us</strong>
                  <small>{CONTACT.phoneDisplay}</small>
                </span>
              </a>
            </Reveal>

            <Reveal delay={0.06}>
              <a className="cbtn" href={waLink} target="_blank" rel="noopener noreferrer">
                <span className="cbtn__icon cbtn__icon--wa"><MessageCircle size={24} strokeWidth={2.4} /></span>
                <span className="cbtn__text">
                  <strong>WhatsApp</strong>
                  <small>Instant Chat & Orders</small>
                </span>
              </a>
            </Reveal>

            <Reveal delay={0.12}>
              <a className="cbtn" href={`mailto:${CONTACT.email}`}>
                <span className="cbtn__icon"><Mail size={24} strokeWidth={2.4} /></span>
                <span className="cbtn__text">
                  <strong>Email Us</strong>
                  <small>{CONTACT.email}</small>
                </span>
              </a>
            </Reveal>

            <Reveal delay={0.18}>
              <a className="cbtn" href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">
                <span className="cbtn__icon"><Instagram size={24} strokeWidth={2.4} /></span>
                <span className="cbtn__text">
                  <strong>Instagram</strong>
                  <small>Follow @TaranHari</small>
                </span>
              </a>
            </Reveal>

            <Reveal delay={0.24}>
              <a className="cbtn" href={CONTACT.facebook} target="_blank" rel="noopener noreferrer">
                <span className="cbtn__icon"><Facebook size={24} strokeWidth={2.4} /></span>
                <span className="cbtn__text">
                  <strong>Facebook</strong>
                  <small>Connect on Facebook</small>
                </span>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- Owner Showcase & Brand Promise ---------- */}
      <section className="section contact__details">
        <div className="container contact__cols">
          <Reveal className="owner-card">
            <div className="owner__photo">
              <Img src={CONTACT.ownerPhoto} alt={`Photo of ${CONTACT.ownerName}`} compact />
            </div>
            <div className="owner__info">
              <span className="owner__label"><User size={14} /> Founder & Owner</span>
              <h3>{CONTACT.ownerName}</h3>
              <p>{CONTACT.ownerRole}</p>
              <p className="owner__bio">
                "Our promise is simple: pure ingredients, uncompromised kitchen hygiene, and authentic recipes that make every teatime special."
              </p>
            </div>
          </Reveal>

          <Reveal className="brand-promise-card" delay={0.15}>
            <span className="eyebrow"><ShieldCheck size={18} /> Taran Hari Quality</span>
            <h2>Handcrafted Royal Quality</h2>
            <p>
              Every packet of Taran Hari namkeen and khasta puri carries the rich legacy of traditional taste. We take pride in zero preservatives, fresh daily frying, and airtight sealing.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}