import React, { useState, useEffect } from 'react';
import { 
  X, Lock, CreditCard, Shield, Truck, ChevronRight, CheckCircle2, 
  ArrowLeft, ShoppingBag, Sparkles, AlertCircle, HelpCircle, FileText, Calendar, User
} from 'lucide-react';

interface CheckoutItem {
  id: string;
  name: string;
  mode: string;
  frequency: string;
  qty: number;
  price: number;
}

interface ShopifyCheckoutPageProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CheckoutItem[];
  cartSubtotal: number;
  discountAmount: number;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  shippingThreshold: number;
  triggerNotification: (msg: string) => void;
  clearCart: () => void;
}

export default function ShopifyCheckoutPage({
  isOpen,
  onClose,
  cartItems,
  cartSubtotal,
  discountAmount,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  shippingThreshold,
  triggerNotification,
  clearCart
}: ShopifyCheckoutPageProps) {
  
  // Checkout Multi-Step Flow Status: 'information' | 'payment' | 'processing' | 'confirmed'
  const [step, setStep] = useState<'information' | 'payment' | 'processing' | 'confirmed'>('information');
  
  // Contact & Shipping Form Fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [stateProv, setStateProv] = useState('');
  const [country, setCountry] = useState('United States');
  const [shippingMethod, setShippingMethod] = useState<'express' | 'overnight'>('express');

  // Interactive Coupon Box
  const [couponInput, setCouponInput] = useState('');

  // Payment Form Fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Processing Animation Steps
  const [processingStatus, setProcessingStatus] = useState('Securing payment terminal...');

  // Errors / validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form Reset and Sync Hooks
  useEffect(() => {
    if (isOpen) {
      // Keep state persistent when opening
    } else {
      // Clear sensitive info on close unless confirmed
      if (step !== 'confirmed') {
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
        setErrors({});
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Validation routines
  const validateInformation = () => {
    const newErrors: Record<string, string> = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid clinical contact email';
    if (!phone) newErrors.phone = 'Contact number is required for dispatch updates';
    if (!firstName) newErrors.firstName = 'First name is required';
    if (!lastName) newErrors.lastName = 'Last name is required';
    if (!address) newErrors.address = 'Primary shipping address is required';
    if (!city) newErrors.city = 'Postal municipality index required';
    if (!zip) newErrors.zip = 'ZIP / Postal code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCard = () => {
    const newErrors: Record<string, string> = {};
    const sanitizedCard = cardNumber.replace(/\s+/g, '');
    if (sanitizedCard.length < 15 || sanitizedCard.length > 16) {
      newErrors.cardNumber = 'Provide a valid credit/debit card index (15-16 digits)';
    }
    if (!cardName) newErrors.cardName = 'Name on card is required';
    if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      newErrors.cardExpiry = 'Expiry date must match MM/YY format';
    }
    if (cardCvv.length < 3 || cardCvv.length > 4) {
      newErrors.cardCvv = 'Secure CVV/CVC identifier is required (3-4 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateInformation()) {
      setStep('payment');
    } else {
      triggerNotification('Please correct shipping details errors before proceeding.');
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCard()) {
      setStep('processing');
      simulatePaymentGate();
    } else {
      triggerNotification('Check validation fields back to double-check card inputs.');
    }
  };

  const simulatePaymentGate = () => {
    const statuses = [
      'Establishing SSL context (AES-256 GCM)...',
      'Allocating clinical batch priority tokens...',
      'Authorizing payment gateway with cardholder bank...',
      'Vaulting certified credentials securely...',
      'DTC Order #SOMNUS-' + Math.floor(100000 + Math.random() * 900000) + ' Created...'
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < statuses.length) {
        setProcessingStatus(statuses[current]);
        current++;
      } else {
        clearInterval(interval);
        setStep('confirmed');
        triggerNotification('ORDER CONFIRMED! Welcome to your sleeping renaissance.');
      }
    }, 1200);
  };

  // calculations
  const localCouponDiscount = discountAmount;
  const discountedSubtotal = Math.max(0, cartSubtotal - localCouponDiscount);
  
  const isFreeShipping = discountedSubtotal >= shippingThreshold || appliedCoupon === 'SHRINE';
  const localShippingCost = cartSubtotal === 0 ? 0 : (isFreeShipping ? 0 : (shippingMethod === 'overnight' ? 24.50 : 9.50));
  const finalCalculatedTotal = discountedSubtotal + localShippingCost;

  const orderNum = 'SOMNUS-793' + Math.floor(10 + Math.random() * 89);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-midnight/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 text-xs select-text animate-fade-in" id="shopify-checkout-root-window">
      <div className="bg-[#FAF7F2] text-midnight w-full max-w-5xl rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 md:p-10 shadow-2xl relative flex flex-col md:flex-row gap-6 md:gap-10 border border-sand/40 max-h-[92vh] overflow-y-auto" id="shopify-checkout-panel-card">
        
        {/* Top Close Button */}
        {step !== 'processing' && step !== 'confirmed' && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full hover:bg-midnight/5 flex items-center justify-center transition border border-[#11141a]/10"
            aria-label="Return to cart"
            id="checkout-panel-close"
          >
            <X size={18} />
          </button>
        )}

        {/* STEP: PROCESSING */}
        {step === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6" id="checkpoint-processing-view">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-sand/35 animate-ping"></div>
              <div className="absolute inset-x-0 w-16 h-16 rounded-full border-4 border-t-midnight border-sand animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock size={18} className="text-sand animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-serif font-bold tracking-widest uppercase text-midnight">TRANSACTION SECURING PHASE</h3>
              <p className="text-[11px] font-mono text-sand-700 animate-pulse">{processingStatus}</p>
            </div>
            
            <div className="max-w-xs text-[10px] text-midnight/40 leading-relaxed font-sans">
              🔒 PCI-DSS Compliant Encryption Layer active. Do not refresh or exit the browser window while circadian rest tokens are dispatched.
            </div>
          </div>
        )}

        {/* STEP: ORDER CONFIRMED! */}
        {step === 'confirmed' && (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-center space-y-6 max-w-2xl mx-auto" id="checkpoint-confirmed-view">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-500/30 flex items-center justify-center animate-bounce">
              <CheckCircle2 size={32} className="text-emerald-600 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <span className="text-[9px] font-bold tracking-[3px] bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 py-1 px-3 rounded-full uppercase">ORDER STATUS: Dispatched & Confirmed</span>
              <h2 className="text-2xl font-serif font-black tracking-tight text-midnight">Thank you for opting into deep circadian rest!</h2>
              <p className="text-xs text-midnight/60 max-w-md mx-auto">Your order is logged securely inside the SOMNUS network. We have sent a copy of your triple-certified clinical assays and tracking payload coordinates to <strong className="text-midnight">{email || 'your inbox'}</strong>.</p>
            </div>

            {/* Simulated Receipt Slip */}
            <div className="w-full bg-white border border-midnight/10 rounded-2xl p-6 text-left space-y-4 max-w-md shadow-sm" id="confirmed-receipt-slip">
              <div className="flex justify-between items-center pb-3 border-b border-dashed border-midnight/10 text-[10px] tracking-wider text-midnight/50 uppercase font-mono">
                <span>Receipt Ref: #{orderNum}</span>
                <span>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>

              {/* Items List */}
              <div className="space-y-2.5 pb-3 border-b border-midnight/5 text-[11px]">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <div>
                      <span className="font-bold text-midnight uppercase">{item.name}</span>
                      <p className="text-[9px] text-midnight/50 mt-0.5 uppercase tracking-wide">{item.mode} ({item.frequency})</p>
                    </div>
                    <span className="font-mono font-medium">Qty: {item.qty} × ${(item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Breakdowns */}
              <div className="space-y-1.5 pb-3 border-b border-midnight/5 font-sans text-[11px]">
                <div className="flex justify-between text-midnight/60">
                  <span>Subtotal</span>
                  <span className="font-mono">${cartSubtotal.toFixed(2)}</span>
                </div>
                {localCouponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount Applied ({appliedCoupon})</span>
                    <span className="font-mono">-${localCouponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-midnight/60">
                  <span>Shipping ({shippingMethod === 'overnight' ? 'Overnight' : 'Regular Express'})</span>
                  <span className="font-mono">{localShippingCost === 0 ? 'FREE' : `$${localShippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-midnight text-xs pt-1.5 border-t border-midnight/5">
                  <span>Amount Charged</span>
                  <span className="font-mono text-sand-700">${finalCalculatedTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping Address Confirmation Summary */}
              <div className="text-[11px] space-y-1">
                <span className="font-bold uppercase text-[9px] text-midnight/50 tracking-wider">DISPATCH GEOGRAPHY COORDINATES:</span>
                <p className="text-midnight/80 leading-relaxed font-sans font-medium">
                  {firstName} {lastName}<br />
                  {address} {apartment && `, Apt ${apartment}`}<br />
                  {city}, {stateProv} {zip}, {country}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full max-w-md">
              <button
                onClick={() => {
                  clearCart();
                  setStep('information');
                  onClose();
                }}
                className="flex-1 bg-[#11141a] hover:bg-midnight/90 text-sand py-3 px-6 rounded-xl font-bold uppercase tracking-wider text-[11px]"
              >
                Continue Browsing Science
              </button>
              <button
                onClick={() => window.print()}
                className="bg-white border border-[#11141a]/15 text-midnight hover:bg-midnight/5 py-3 px-6 rounded-xl font-bold uppercase tracking-wider text-[11px]"
              >
                Print Receipt
              </button>
            </div>
          </div>
        )}

        {/* DETAILS ENTRY COMPONENT FOR INFORMATION AND PAYMENT STEPS */}
        {(step === 'information' || step === 'payment') && (
          <>
            {/* Left Column: Secure Checkout Form */}
            <div className="flex-[1.4] flex flex-col justify-between" id="checkout-form-column">
              <div>
                
                {/* Header Information Indicator */}
                <div className="flex items-center space-x-2 text-[10px] tracking-widest text-[#11141a]/50 uppercase font-bold mb-4">
                  <span className={step === 'information' ? 'text-sand font-extrabold underline underline-offset-4' : ''}>1. Informational Logistics</span>
                  <ChevronRight size={10} />
                  <span className={step === 'payment' ? 'text-sand font-extrabold underline underline-offset-4' : ''}>2. Secure Treasury Block</span>
                </div>

                {/* Secure Gateway Heading banner */}
                <div className="mb-6 flex items-center space-x-3 py-3 border-b border-midnight/10">
                  <div className="w-8 h-8 rounded-full bg-midnight text-sand flex items-center justify-center border border-sand/40">
                    <Lock size={14} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#11141a] tracking-tight leading-none">SOMNUS Secure Node Checkout</h2>
                    <p className="text-[10px] text-[#11141a]/50 mt-1 uppercase tracking-wider">SECURED VIA AES-256 SSL COMPLIANT LAYERS</p>
                  </div>
                </div>

                {/* FORM PANEL - STEP 1: LOGISTICS & ADDRESS */}
                {step === 'information' && (
                  <form onSubmit={handleInfoSubmit} className="space-y-4 font-sans text-xs" id="logistics-shipping-form">
                    
                    {/* Contact details */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-midnight uppercase tracking-wider text-[9px]">Contact Information</label>
                        <span className="text-[10px] text-midnight/40 leading-none">Checkout secure logging</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <input
                            type="email"
                            placeholder="Clinical Contact Email *"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (errors.email) setErrors(p => ({ ...p, email: '' }));
                            }}
                            className={`w-full bg-white border ${errors.email ? 'border-red-500' : 'border-[#11141a]/15'} rounded-xl px-4 py-3 leading-tight focus:outline-none focus:border-sand`}
                          />
                          {errors.email && <p className="text-[9px] text-red-600 font-semibold mt-1">{errors.email}</p>}
                        </div>
                        <div>
                          <input
                            type="tel"
                            placeholder="Mobile Phone * (Courier Sync)"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (errors.phone) setErrors(p => ({ ...p, phone: '' }));
                            }}
                            className={`w-full bg-white border ${errors.phone ? 'border-red-500' : 'border-[#11141a]/15'} rounded-xl px-4 py-3 leading-tight focus:outline-none focus:border-sand`}
                          />
                          {errors.phone && <p className="text-[9px] text-red-600 font-semibold mt-1">{errors.phone}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Shipping info */}
                    <div className="space-y-2 pt-2">
                      <label className="font-bold text-midnight uppercase tracking-wider text-[9px] block">Shipping Address</label>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            placeholder="First Name *"
                            value={firstName}
                            onChange={(e) => {
                              setFirstName(e.target.value);
                              if (errors.firstName) setErrors(p => ({ ...p, firstName: '' }));
                            }}
                            className={`w-full bg-white border ${errors.firstName ? 'border-red-500' : 'border-[#11141a]/15'} rounded-xl px-4 py-3 leading-tight focus:outline-none focus:border-sand`}
                          />
                          {errors.firstName && <p className="text-[9px] text-red-600 font-semibold mt-1">{errors.firstName}</p>}
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Last Name *"
                            value={lastName}
                            onChange={(e) => {
                              setLastName(e.target.value);
                              if (errors.lastName) setErrors(p => ({ ...p, lastName: '' }));
                            }}
                            className={`w-full bg-white border ${errors.lastName ? 'border-red-500' : 'border-[#11141a]/15'} rounded-xl px-4 py-3 leading-tight focus:outline-none focus:border-sand`}
                          />
                          {errors.lastName && <p className="text-[9px] text-red-600 font-semibold mt-1">{errors.lastName}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Street Address *"
                            value={address}
                            onChange={(e) => {
                              setAddress(e.target.value);
                              if (errors.address) setErrors(p => ({ ...p, address: '' }));
                            }}
                            className={`w-full bg-white border ${errors.address ? 'border-red-500' : 'border-[#11141a]/15'} rounded-xl px-4 py-3 leading-tight focus:outline-none focus:border-sand`}
                          />
                          {errors.address && <p className="text-[9px] text-red-600 font-semibold mt-1">{errors.address}</p>}
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Apt, Suite, Unit"
                            value={apartment}
                            onChange={(e) => setApartment(e.target.value)}
                            className="w-full bg-white border border-[#11141a]/15 rounded-xl px-4 py-3 leading-tight focus:outline-none focus:border-sand"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <input
                            type="text"
                            placeholder="Municipality / City *"
                            value={city}
                            onChange={(e) => {
                              setCity(e.target.value);
                              if (errors.city) setErrors(p => ({ ...p, city: '' }));
                            }}
                            className={`w-full bg-white border ${errors.city ? 'border-red-500' : 'border-[#11141a]/15'} rounded-xl px-4 py-3 leading-tight focus:outline-none focus:border-sand`}
                          />
                          {errors.city && <p className="text-[9px] text-red-600 font-semibold mt-1">{errors.city}</p>}
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="State / Province *"
                            value={stateProv}
                            onChange={(e) => setStateProv(e.target.value)}
                            className="w-full bg-white border border-[#11141a]/15 rounded-xl px-4 py-3 leading-tight focus:outline-none focus:border-sand"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="ZIP / Postal Code *"
                            value={zip}
                            onChange={(e) => {
                              setZip(e.target.value);
                              if (errors.zip) setErrors(p => ({ ...p, zip: '' }));
                            }}
                            className={`w-full bg-white border ${errors.zip ? 'border-red-500' : 'border-[#11141a]/15'} rounded-xl px-4 py-3 leading-tight focus:outline-none focus:border-sand`}
                          />
                          {errors.zip && <p className="text-[9px] text-red-600 font-semibold mt-1">{errors.zip}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1">
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full bg-white border border-[#11141a]/15 rounded-xl px-4 py-3 leading-tight focus:outline-none focus:border-sand h-11"
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Austria">Austria</option>
                          <option value="Germany">Germany</option>
                          <option value="Switzerland">Switzerland</option>
                        </select>
                      </div>
                    </div>

                    {/* Shipping Speed preference Selection */}
                    <div className="space-y-2 pt-2">
                      <label className="font-bold text-midnight uppercase tracking-wider text-[9px] block">System Transport Service speed</label>
                      <div className="space-y-2">
                        <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${shippingMethod === 'express' ? 'border-midnight bg-white shadow-sm' : 'border-midnight/10 bg-[#FAF7F2]'}`}>
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="shipping_option"
                              checked={shippingMethod === 'express'}
                              onChange={() => setShippingMethod('express')}
                              className="text-midnight focus:ring-sand"
                            />
                            <div>
                              <span className="font-bold text-neutral-900 block">Temperature-Regulated Express Cold Transport</span>
                              <span className="text-[10px] text-midnight/50">Dispatched in nitrogen ambient containers // Deliver within 2-4 business days.</span>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-emerald-600 uppercase text-[10px]">
                            {isFreeShipping ? 'FREE' : '$9.50'}
                          </span>
                        </label>

                        <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${shippingMethod === 'overnight' ? 'border-midnight bg-white shadow-sm' : 'border-midnight/10 bg-[#FAF7F2]'}`}>
                          <div className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name="shipping_option"
                              checked={shippingMethod === 'overnight'}
                              onChange={() => setShippingMethod('overnight')}
                              className="text-midnight focus:ring-sand"
                            />
                            <div>
                              <span className="font-bold text-neutral-900 block">Overnight Cryo-Fresh Delivery</span>
                              <span className="text-[10px] text-midnight/50">Instant Priority clinical dispatch // Guaranteed overnight doorstep arrival.</span>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-midnight hover:text-sand text-[10px]">$24.50</span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={onClose}
                        className="text-midnight/60 hover:text-midnight font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1"
                      >
                        <ArrowLeft size={12} />
                        <span>Return to shopping bag</span>
                      </button>
                      <button
                        type="submit"
                        className="bg-midnight hover:bg-midnight/90 text-sand px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-[11px]"
                      >
                        Continue to secure Treasury Form
                      </button>
                    </div>

                  </form>
                )}

                {/* FORM PANEL - STEP 2: CREDIT CARD & PAYMENT */}
                {step === 'payment' && (
                  <form onSubmit={handlePaymentSubmit} className="space-y-4 font-sans text-xs" id="credit-treasury-form">
                    
                    <div className="bg-sand/15 p-4 rounded-xl border border-sand/20 space-y-2 uppercase tracking-wide text-[10px]">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-midnight">🚚 SHIPPING DISPATCH CONFIG</span>
                        <button 
                          type="button" 
                          onClick={() => setStep('information')} 
                          className="font-extrabold text-[#11141a] hover:underline"
                        >
                          Modify
                        </button>
                      </div>
                      <p className="text-midnight/70 font-medium">
                        Deliver to: {firstName} {lastName}, {address}, {city}, {stateProv} {zip} via {shippingMethod === 'express' ? 'Express Cold Transport' : 'Overnight Cryo-Fresh Service'}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="font-bold text-midnight uppercase tracking-wider text-[9px]">Credit / Debit card payment gateway</label>
                        <div className="flex space-x-1">
                          <span className="bg-midnight/5 px-1 py-0.5 rounded border border-midnight/10 text-[8px] font-mono leading-none tracking-normal">VIS</span>
                          <span className="bg-midnight/5 px-1 py-0.5 rounded border border-midnight/10 text-[8px] font-mono leading-none tracking-normal">MAS</span>
                          <span className="bg-midnight/5 px-1 py-0.5 rounded border border-midnight/10 text-[8px] font-mono leading-none tracking-normal">AMX</span>
                          <span className="bg-midnight/5 px-1 py-0.5 rounded border border-midnight/10 text-[8px] font-mono leading-none tracking-normal">DIS</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Card Number *"
                            value={cardNumber}
                            onChange={(e) => {
                              // Auto format space
                              const input = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                              const matches = input.match(/\d{4,16}/g);
                              const match = (matches && matches[0]) || '';
                              const parts = [];
                              for (let i = 0, len = match.length; i < len; i += 4) {
                                parts.push(match.substring(i, i + 4));
                              }
                              setCardNumber(parts.length > 0 ? parts.join(' ') : input);
                              if (errors.cardNumber) setErrors(p => ({ ...p, cardNumber: '' }));
                            }}
                            maxLength={19}
                            className={`w-full bg-white border ${errors.cardNumber ? 'border-red-500' : 'border-[#11141a]/15'} rounded-xl px-4 py-3 pl-10 select-text leading-tight focus:outline-none focus:border-sand font-mono`}
                          />
                          <div className="absolute left-3.5 top-3.5 text-[#11141a]/40">
                            <CreditCard size={15} />
                          </div>
                        </div>
                        {errors.cardNumber && <p className="text-[9px] text-red-600 font-semibold mt-1">{errors.cardNumber}</p>}
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Name on Card *"
                              value={cardName}
                              onChange={(e) => {
                                setCardName(e.target.value);
                                if (errors.cardName) setErrors(p => ({ ...p, cardName: '' }));
                              }}
                              className={`w-full bg-white border ${errors.cardName ? 'border-red-500' : 'border-[#11141a]/15'} rounded-xl px-4 py-3 pl-10 select-text leading-tight focus:outline-none focus:border-sand`}
                            />
                            <div className="absolute left-3.5 top-3.5 text-[#11141a]/40">
                              <User size={15} />
                            </div>
                          </div>
                          {errors.cardName && <p className="text-[9px] text-red-600 font-semibold mt-1">{errors.cardName}</p>}
                        </div>
                        <div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="MM/YY *"
                              value={cardExpiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/[^0-9]/gi, '');
                                if (val.length >= 2) {
                                  val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                }
                                setCardExpiry(val);
                                if (errors.cardExpiry) setErrors(p => ({ ...p, cardExpiry: '' }));
                              }}
                              maxLength={5}
                              className={`w-full bg-white border ${errors.cardExpiry ? 'border-red-500' : 'border-[#11141a]/15'} rounded-xl px-3 py-3 select-text text-center focus:outline-none focus:border-sand font-mono`}
                            />
                          </div>
                          {errors.cardExpiry && <p className="text-[9px] text-red-600 font-semibold mt-1">{errors.cardExpiry}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <input
                            type="password"
                            placeholder="CVV/CVC *"
                            value={cardCvv}
                            onChange={(e) => {
                              setCardCvv(e.target.value.replace(/[^0-9]/gi, ''));
                              if (errors.cardCvv) setErrors(p => ({ ...p, cardCvv: '' }));
                            }}
                            maxLength={4}
                            className={`w-full bg-white border ${errors.cardCvv ? 'border-red-500' : 'border-[#11141a]/15'} rounded-xl px-4 py-3 select-text text-center focus:outline-none focus:border-sand font-mono`}
                          />
                          {errors.cardCvv && <p className="text-[9px] text-red-600 font-semibold mt-1">{errors.cardCvv}</p>}
                        </div>
                        <div className="col-span-2 flex items-center text-midnight/50 text-[10px] space-x-1.5 pl-1.5">
                          <Shield size={14} className="text-sand shrink-0" />
                          <span>CVV verification protects against fraud and unauthorized transactions.</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep('information')}
                        className="text-midnight/60 hover:text-midnight font-bold uppercase tracking-wider text-[10px] flex items-center space-x-1"
                      >
                        <ArrowLeft size={12} />
                        <span>Back to shipping logs</span>
                      </button>
                      <button
                        type="submit"
                        className="bg-[#11141a] hover:bg-midnight/90 text-sand px-8 py-3.5 rounded-xl font-bold uppercase tracking-wider text-[11px] flex items-center space-x-2 border border-sand/40 hover:scale-102 transition"
                      >
                        <Lock size={12} />
                        <span>SECURE PAY NOW (${finalCalculatedTotal.toFixed(2)})</span>
                      </button>
                    </div>

                  </form>
                )}

              </div>

              {/* Secure badges underlay form */}
              <div className="mt-8 border-t border-midnight/5 pt-4 flex flex-wrap gap-4 items-center justify-between text-[10px] text-midnight/40 text-sans font-medium">
                <div className="flex items-center space-x-1.5">
                  <Shield size={12} className="text-emerald-600" />
                  <span>AES-256 SSL Decrypted Network Endpoint</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 size={12} className="text-sand" />
                  <span>PCI-DSS Master Certified Merchant Node</span>
                </div>
              </div>

            </div>

            {/* Right Column: Order Cart Summary Review Panel */}
            <div className="flex-1 bg-white border border-midnight/10 rounded-[2rem] p-6 flex flex-col justify-between" id="right-column-cart-summary">
              <div className="space-y-4">
                
                {/* Header title */}
                <div className="pb-3 border-b border-midnight/10 flex justify-between items-center">
                  <span className="font-extrabold text-midnight uppercase tracking-wider text-[10px]">Review Order Payload</span>
                  <span className="text-[10px] bg-midnight/5 font-mono text-sand-800 font-bold px-2 py-0.5 rounded-full">{cartItems.length} Products</span>
                </div>

                {/* Items loop */}
                <div className="space-y-4 max-h-60 overflow-y-auto pr-1" id="checkout-cart-items-loop">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex space-x-3 text-[11px]">
                      <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-midnight/5 flex items-center justify-center shrink-0">
                        <ShoppingBag size={18} className="text-sand" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start font-sans">
                          <span className="font-black text-midnight uppercase leading-none">{item.name}</span>
                          <span className="font-mono font-bold">${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                        <p className="text-[9px] text-[#11141a]/60 mt-1 uppercase tracking-wider leading-none">
                          {item.mode} // {item.frequency}
                        </p>
                        <div className="flex justify-between items-center mt-1.5 font-sans">
                          <span className="text-[9px] text-midnight/45 uppercase tracking-wide">Allocated clinical units</span>
                          <span className="font-mono text-[10px] bg-[#FAF7F2] border border-midnight/5 px-1.5 py-0.5 rounded font-bold">Qty {item.qty}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code block inside right review panel */}
                <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-midnight/5 space-y-2">
                  <span className="text-[9px] uppercase tracking-wider font-black text-midnight block">🎟️ Promotion Override Codes</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SOMNUS20"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 bg-white border border-[#11141a]/15 rounded-lg px-2 py-1.5 font-mono uppercase text-[11px] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const code = couponInput.trim().toUpperCase();
                        if (code) {
                          onApplyCoupon(code);
                          setCouponInput('');
                        }
                      }}
                      className="bg-[#1114a] hover:bg-midnight px-3 py-1.5 rounded-lg text-[9px] font-bold text-sand uppercase tracking-wider transition"
                    >
                      Apply
                    </button>
                  </div>

                  {appliedCoupon && (
                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-1.5 text-[9px] text-emerald-800 font-bold font-sans">
                      <span>🎟️ CODE: {appliedCoupon}</span>
                      <button 
                        type="button" 
                        onClick={onRemoveCoupon} 
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Dynamic Free Shipping Level bar inside Right summary info */}
                {cartSubtotal > 0 && (
                  <div className="text-[10px] p-2.5 rounded-lg bg-sand/10 border border-sand/30 font-sans italic text-midnight/80">
                    {discountedSubtotal >= shippingThreshold 
                      ? "💡 Congratulations! Certified express cryo-shipment threshold qualified."
                      : `💡 Complete another $${(shippingThreshold - discountedSubtotal).toFixed(2)} to unlock Free Express Worldwide dispatch.`
                    }
                  </div>
                )}

              </div>

              {/* Financial calculations list bottom right */}
              <div className="space-y-2 pt-4 border-t border-midnight/15 text-[11px] font-sans">
                <div className="flex justify-between text-midnight/60 font-medium">
                  <span>Cart Subtotal</span>
                  <span className="font-mono">${cartSubtotal.toFixed(2)}</span>
                </div>

                {localCouponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Reward Applied</span>
                    <span className="font-mono">-${localCouponDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-midnight/60 font-medium">
                  <span>Standard Logistics Fee</span>
                  <span className="font-mono">
                    {localShippingCost === 0 ? 'FREE' : `$${localShippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between font-black text-[#11141a] text-xs pt-2 border-t border-midnight/5 uppercase tracking-wider">
                  <span>Total Payable</span>
                  <span className="font-mono text-sand-800">${finalCalculatedTotal.toFixed(2)}</span>
                </div>
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}
