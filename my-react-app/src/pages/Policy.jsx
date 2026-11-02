// =========================================================
// Policy.jsx - Privacy, Terms and Refund/Delivery pages.
// These are general templates. Have a local lawyer or CA check
// them and edit the wording below to match how you really work.
// =========================================================
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext.jsx';
import './Policy.css';

const UPDATED = 'November 2026';

function Layout({ title, children }) {
  return (
    <div className="policy">
      <div className="container policy__in">
        <h1>{title}</h1>
        <p className="policy__upd">Last updated: {UPDATED}</p>
        {children}
        <p className="policy__back"><Link to="/contact">Questions? Contact us</Link> &middot; <Link to="/">Back to home</Link></p>
      </div>
    </div>
  );
}

function useBiz() {
  const { contact, settings } = useSite();
  return { name: settings.shopName || 'Taran Hari', phone: contact.phoneDisplay, email: contact.email, address: contact.addressFull || contact.addressShort };
}

export function Privacy() {
  const b = useBiz();
  return (
    <Layout title="Privacy Policy">
      <p>{b.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your privacy. This page explains what we collect when you order from this website and how we use it.</p>
      <h2>What we collect</h2>
      <p>When you place an order we collect your name, phone number, delivery address, city, pincode, optional email and any note you add. Your cart is saved in your own browser so it is still there if you refresh.</p>
      <h2>How we use it</h2>
      <p>We use this information only to confirm, pack and deliver your order, to contact you about it, and to keep our sales records. We do not sell your information.</p>
      <h2>Who can see it</h2>
      <p>Only our team can see your order details. We may share your name, phone and address with the delivery person who brings your order. We may also share information if the law requires us to.</p>
      <h2>Payments</h2>
      <p>Orders on this website are paid in cash on delivery. We do not collect or store any card or bank details.</p>
      <h2>How long we keep it</h2>
      <p>We keep order records for as long as we need them for accounting and legal reasons.</p>
      <h2>Your choices</h2>
      <p>You can ask us to correct or delete your information by contacting us{b.phone ? ` on ${b.phone}` : ''}{b.email ? ` or at ${b.email}` : ''}.</p>
      <h2>Cookies and storage</h2>
      <p>We use your browser&rsquo;s local storage to remember your cart, wishlist and delivery details on your device. We do not use advertising trackers.</p>
    </Layout>
  );
}

export function Terms() {
  const b = useBiz();
  return (
    <Layout title="Terms & Conditions">
      <p>By ordering from {b.name} you agree to these terms.</p>
      <h2>Products and prices</h2>
      <p>Prices are in Indian rupees and include applicable taxes unless stated. We may change prices, offers and coupons at any time. The price you see in your cart when you place the order is the price you pay.</p>
      <h2>Availability</h2>
      <p>Products are available while stock lasts. If something runs out after you order, we will contact you and offer a replacement or a refund.</p>
      <h2>Orders</h2>
      <p>An order is confirmed when we call or message you to confirm it. We may cancel an order, for example for an unclear address, a number we cannot reach, or suspected misuse.</p>
      <h2>Coupons and offers</h2>
      <p>Coupons and offers have their own conditions such as minimum order value, dates and usage limits, and cannot be exchanged for cash.</p>
      <h2>Payment</h2>
      <p>Payment is cash on delivery unless we tell you otherwise.</p>
      <h2>Contact</h2>
      <p>{b.name}{b.address ? `, ${b.address}` : ''}{b.phone ? ` · ${b.phone}` : ''}{b.email ? ` · ${b.email}` : ''}</p>
    </Layout>
  );
}

export function Refund() {
  const b = useBiz();
  return (
    <Layout title="Refund, Cancellation & Delivery Policy">
      <h2>Delivery</h2>
      <p>We deliver to the areas we serve. Delivery charges, and the order value above which delivery is free, are shown in your cart before you order. We will tell you the expected delivery time when we confirm your order.</p>
      <h2>Cancelling an order</h2>
      <p>You can cancel an order before it is packed by calling us{b.phone ? ` on ${b.phone}` : ''}. Once it is packed or out for delivery, it may not be possible to cancel.</p>
      <h2>Damaged, wrong or stale items</h2>
      <p>Because our products are food, we do not accept returns of opened packs. If your order arrives damaged, stale or wrong, please tell us within 24 hours of delivery with a clear photo, and we will replace it or refund the amount.</p>
      <h2>Refunds</h2>
      <p>Approved refunds are returned in the way we agree with you, usually as a replacement, a credit against your next order, or a bank/UPI transfer.</p>
      <h2>Contact</h2>
      <p>{b.phone ? `${b.phone} ` : ''}{b.email ? `· ${b.email}` : ''}</p>
    </Layout>
  );
}

export function NotFound() {
  return (
    <div className="policy">
      <div className="container policy__in" style={{ textAlign: 'center' }}>
        <h1>Page not found</h1>
        <p>We could not find that page. It may have moved.</p>
        <p><Link to="/" className="btn">Go to home</Link> <Link to="/shop" className="btn btn--paper">Shop snacks</Link></p>
      </div>
    </div>
  );
}