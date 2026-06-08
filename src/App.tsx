import React, { useState, useEffect, useRef } from 'react';
import ShopifyExporterModal from './components/ShopifyExporterModal';
import ShopifyCheckoutPage from './components/ShopifyCheckoutPage';
import ImageLightboxModal from './components/ImageLightboxModal';
import {
  Check,
  Star,
  Sparkles,
  ShieldCheck,
  Moon,
  Compass,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  ShoppingBag,
  Sliders,
  X,
  Lock,
  RotateCcw,
  Clock,
  Heart,
  Share2,
  Award,
  AlertCircle,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Brand Types or Shopify Customizer block types
interface ThemeConfig {
  citationsEnabled: boolean;
  freeShippingThreshold: number;
  showHypeBanner: boolean;
  glowAuraIntensity: 'soft' | 'none' | 'radiant';
  fontScaling: 'normal' | 'relaxed';
  cartProgressNote: string;
}

export default function App() {
  // Shopify 2.0 theme configuration simulator state
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    citationsEnabled: true,
    freeShippingThreshold: 75,
    showHypeBanner: true,
    glowAuraIntensity: 'soft',
    fontScaling: 'normal',
    cartProgressNote: 'Third-party clinical testing report attached in checkout.'
  });

  const [shopifyCustomizeOpen, setShopifyCustomizeOpen] = useState(false);
  const [shopifyExportOpen, setShopifyExportOpen] = useState(false);
  
  // Shopify Simulated device viewport and promo coupon states
  const [simulatedDevice, setSimulatedDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponType, setCouponType] = useState<'percent' | 'fixed' | 'shipping' | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'SOMNUS20' || code === 'SHRINE20') {
      setAppliedCoupon(code);
      setCouponDiscount(20);
      setCouponType('percent');
      triggerNotification("PROMO CODE '20% OFF' applied successfully");
      setCouponInput('');
    } else if (code === 'SHRINE') {
      setAppliedCoupon(code);
      setCouponDiscount(0);
      setCouponType('shipping');
      triggerNotification("PROMO CODE 'FREE COLD SHIPPING' applied successfully");
      setCouponInput('');
    } else if (code === 'DEEPREST' || code === 'REST15') {
      setAppliedCoupon(code);
      setCouponDiscount(15);
      setCouponType('fixed');
      triggerNotification("PROMO CODE '$15 OFF' applied successfully");
      setCouponInput('');
    } else {
      triggerNotification("INVALID PROMO CODE. Try 'SOMNUS20' or 'DEEPREST'");
    }
  };

  // App core states
  const [purchaseMode, setPurchaseMode] = useState<'subscribe' | 'onetime'>('subscribe');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('30');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [activeIngredientIndex, setActiveIngredientIndex] = useState<number>(0);
  const [openedFAQ, setOpenedFAQ] = useState<number | null>(0);
  const [cartCount, setCartCount] = useState<number>(0);
  const [cartItems, setCartItems] = useState<Array<{ id: string; name: string; mode: string; frequency: string; qty: number; price: number }>>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [notifMessage, setNotifMessage] = useState<string | null>(null);

  // Review states
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [reviewSearchQuery, setReviewSearchQuery] = useState<string>('');
  const [sortReviewsBy, setSortReviewsBy] = useState<'relevant' | 'highest' | 'recent'>('relevant');

  // Zoom states for desktop preview
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [isZooming, setIsZooming] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Dynamic shipping countdown
  const [timeLeft, setTimeLeft] = useState<{ hrs: number; mins: number; secs: number }>({ hrs: 4, mins: 12, secs: 45 });

  // Viewport tracking for sticky ATC
  const [showStickyATC, setShowStickyATC] = useState(false);
  const buySectionRef = useRef<HTMLDivElement>(null);

  // Live timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hrs > 0) return { hrs: prev.hrs - 1, mins: 59, secs: 59 };
        return { hrs: 4, mins: 12, secs: 45 }; // Reset to look endless
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Viewport scroll listener for Sticky Footer
  useEffect(() => {
    const handleScroll = () => {
      if (buySectionRef.current) {
        const rect = buySectionRef.current.getBoundingClientRect();
        // Show sticky footer if top of buy section has scrolled out of view (rect.bottom < 0)
        setShowStickyATC(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Pricing constants (Subject to DTC scale overrides)
  const basePrice = 84.00;
  const subscriptionDiscountRatio = 0.85; // 15% discount
  const getUnitPrice = () => purchaseMode === 'subscribe' ? basePrice * subscriptionDiscountRatio : basePrice;
  const getTotalPrice = () => getUnitPrice() * quantity;

  // Add to cart logical handler
  const handleAddToCart = () => {
    const itemPrice = getUnitPrice();
    const isExist = cartItems.find(item => item.mode === purchaseMode && item.frequency === (purchaseMode === 'subscribe' ? selectedFrequency : ''));
    
    if (isExist) {
      setCartItems(cartItems.map(item => 
        (item.mode === purchaseMode && item.frequency === (purchaseMode === 'subscribe' ? selectedFrequency : ''))
          ? { ...item, qty: item.qty + quantity }
          : item
      ));
    } else {
      setCartItems([...cartItems, {
        id: `somnus-${purchaseMode}-${Date.now()}`,
        name: `SOMNUS Sleep & Relaxation Formula`,
        mode: purchaseMode === 'subscribe' ? 'Subscription' : 'One-time Purchase',
        frequency: purchaseMode === 'subscribe' ? `Every ${selectedFrequency} Days` : 'Single Delivery',
        qty: quantity,
        price: itemPrice
      }]);
    }
    
    setCartCount(prev => prev + quantity);
    setCartOpen(true);
    triggerNotification(`Added ${quantity} x SOMNUS formula to your bag!`);
  };

  const removeItem = (id: string, qty: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
    setCartCount(prev => prev - qty);
  };

  const triggerNotification = (msg: string) => {
    setNotifMessage(msg);
    setTimeout(() => {
      setNotifMessage(null);
    }, 4000);
  };

  // Image definitions (high resolution, relevant themes matching Midnight and Sand style)
  const images = [
    {
      url: "/src/assets/images/somnus_main_hero_1780948043982.png",
      title: "SOMNUS Premium Active Amber Bottle",
      desc: "Pure pharmaceutical-grade amber glass shielding our delicate organic neuro-chemistry on a sandstone plinth."
    },
    {
      url: "/src/assets/images/somnus_capsules_sand_1780948059789.png",
      title: "Micro-fine Active SOMNUS Cellular Capsules",
      desc: "High density rapid-release organic capsules filled with pure active magnesium gold-tinted powder in a custom travertine bowl."
    },
    {
      url: "/src/assets/images/somnus_boxes_pack_1780948072610.png",
      title: "Minimalist Neutral Luxury Carton System",
      desc: "Complete luxury physical packaging range in premium charcoal, warm sand, and linen textured ivory."
    },
    {
      url: "/src/assets/images/somnus_lifestyle_room_1780948086402.png",
      title: "Oak & Travertine Circadian Sanctuary",
      desc: "Restorative environment designed with warm natural linen and soft golden lighting to coordinate circadian rhythms."
    },
    {
      url: "/src/assets/images/somnus_macro_details_1780948112943.png",
      title: "Botanical Mineral Droplets & Stone Detail",
      desc: "Macro-lens focus on pure natural active extracts resting on raw textured sandstone."
    }
  ];

  // Mouse zoom events for product gallery
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleMouseEnter = () => setIsZooming(true);
  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomStyle({ transform: 'scale(1)' });
  };

  // Ingredients and science detail
  const ingredients = [
    {
      name: "Magnesium Glycinate",
      dosage: "450 mg",
      role: "Nerve & Muscle Relaxation",
      citation: "Lancet Neuro 2023;3(2):112-119",
      excerpt: "Highly bioavailable organic chelate that crosses the blood-brain barrier. Essential for calming central nervous system excitability and suppressing excess muscular twitches.",
      mechanism: "Reversibly inhibits NMDA receptors and supports baseline parasympathetic nervous system actions."
    },
    {
      name: "L-Theanine",
      dosage: "200 mg",
      role: "Alpha Brainwave Inducer",
      citation: "J. Clin Sleep Med 2022;18(9):94-102",
      excerpt: "Extract of selected high-mountain green tea. Promotes restorative alpha wave generation, mirroring state of zen meditation without inducing physical drowsiness.",
      mechanism: "Competes with glutamate at receptors to mitigate mental loop hyper-arousal."
    },
    {
      name: "Apigenin",
      dosage: "50 mg",
      role: "GABA-A Circuit Activation",
      citation: "Nature Restorative Med 2024;11:283-294",
      excerpt: "The master sleep trigger isolated from Matricaria chamomilla. Mimics biological state indicators to notify the cerebral cortex that restoration is underway.",
      mechanism: "Potently binds to benzodiazepine receptors, inducing continuous deep wave architecture safely."
    },
    {
      name: "Glycine",
      dosage: "3,000 mg",
      role: "Thermal Down-Regulation",
      citation: "Sleep & Circadian Rhythms 2023;14:145-152",
      excerpt: "An essential calming neurotransmitter in high concentration. Works directly to drop core metabolic temperatures, initiating natural sleep onset rapidly.",
      mechanism: "Increases peripheral blood flow to cool the systemic core faster."
    },
    {
      name: "Ashwagandha",
      dosage: "600 mg",
      role: "Cortisol Buffer & Sleep Duration",
      citation: "Phytotherapy Res 2021;35(4):12-21",
      excerpt: "Premium KSM-66 clinical grade extract. Regulates physical response systems to evening stress indicators, preparing body layers for a complete deep sleep cycle.",
      mechanism: "Lowers night serum stress chemicals by up to 28% without causing dependency."
    }
  ];

  // Real, comprehensive FAQs
  const faqList = [
    {
      q: "How does the Somnus formula compare to ordinary melatonin products?",
      a: "Unlike melatonin which is an isolated hormone that can suppress your brain's natural production and leave you groggy, SOMNUS leverages natural neurotransmitter and mineral pathways. Compounds like L-Theanine and Apigenin calm the nervous system organically, encouraging the body's native melatonin cascades while optimizing slow-wave Stage-3 deep sleep cycles, with zero hormonal down-regulation."
    },
    {
      q: "What is the recommended dosage and scientific protocol for best results?",
      a: "We recommend taking 3 capsules with 4–6 oz of room temperature water approximately 30 to 45 minutes before bedtime. To synchronize your circadian rhythm, try to consume them at the same hour each night, while eliminating high-intensity blue light exposure."
    },
    {
      q: "When will I begin experiencing noticeable circadian improvements?",
      a: "Most users notice significant cognitive calming, faster sleep onset, and a reduction in bedtime racing thoughts on night one. The deeper slow-wave restoration benefits—such as waking up refreshed without brain fog—accumulate over 10 to 14 days of consecutive, uninterrupted use."
    },
    {
      q: "Does Somnus carry risks of habit-formation or tolerance development?",
      a: "No. All five active compounds within SOMNUS are clinical-grade botanical adaptations and mineral structures. They do not bind to habit-forming receptors, ensuring you can stop taking SOMNUS at any point without rebound insomnia or physical withdrawal."
    },
    {
      q: "Are the formulations third-party tested and verified for neurotoxicity?",
      a: "Absolutely. Every single production batch is assayed by independent ISO-certified laboratories for heavy metals, residual solvents, pesticides, and microbial purity. We publish of-record certificates of analysis for maximum clinical transparency."
    },
    {
      q: "Is Somnus safe to combine with other nightly medications or supplements?",
      a: "While SOMNUS is built with fully food-safe and organic ingredients, we always recommend consulting your personal primary care physician before adding new supplements if you are currently taking prescription sleep regulators or neurotransmitter medications (e.g. SSRIs)."
    },
    {
      q: "Can I cancel my subscription easily, and what is your return policy?",
      a: "Shopify subscription settings let you easily swap delivery frequencies, skip any month, or cancel immediately in just one click right inside your customer account dashboard. We also offer a 60-day 'Deep Rest Guarantee'—if you don't sleep better, we'll refund your purchase in full with no questions asked."
    },
    {
      q: "Is the capsule vegan, and what are the inactive binder ingredients?",
      a: "Yes, SOMNUS is encapsulated in 100% plant-derived pullulan (completely organic, non-GMO, and vegan). We use absolutely zero chemical flow agents, artificial dyes, or magnesium stearate. The only excipient is a micro-amount of organic rice hull concentrate for natural flow."
    }
  ];

  // High quality Reviews listing to show real clinical feedback
  const reviewsData = [
    {
      author: "Hassan K.",
      role: "Verified Athlete & Biotech Analyst",
      rating: 5,
      date: "May 24, 2026",
      title: "Slow-wave recovery metrics skyrocketed on Whoop",
      text: "As a bio-hacker monitoring nightly markers for two years, I was skeptical. However, after night 6, my slow-wave deep sleep averages moved from 55 mins to 1 hour 40 mins. Recovery score has stayed green consistently, with zero grogginess or typical melatonin morning hangovers. Absolutely flawless clinical dosing.",
      helpful: 88,
      tags: ["Slow-wave Sleep", "Biometric Verified"]
    },
    {
      author: "Dr. Elena Rostova",
      role: "Clinical Neurologist & MD",
      rating: 5,
      date: "June 2, 2026",
      title: "An exquisite masterclass in clean sleep neuroscience",
      text: "I recommend SOMNUS to clients looking to break dependence on sleep pharmaceuticals. The synergy between high-dose Glycine (temperature drop) and Apigenin (GABA agonist) is outstandingly supported by double-blind literature. It addresses sleep architecture from multiple angles rather than relying on heavy sedative shortcuts.",
      helpful: 142,
      tags: ["Science Backed", "Clinical Application"]
    },
    {
      author: "Marcus S.",
      role: "Verified Buyer — Tech Founder",
      rating: 5,
      date: "May 18, 2026",
      title: "Decimated night-time cognitive chatter",
      text: "My racing brain used to lock me awake for hours after stressful operations. Now, 30 minutes after taking Somnus, a heavy calm settles across my mind. I drift off naturally. No heavy drugged feelings, just a calm wave washing over. Truly exceptional product.",
      helpful: 52,
      tags: ["Anxiety Calm", "Jet Lag"]
    },
    {
      author: "Charlotte V.",
      role: "Verified Buyer — Creative Lead",
      rating: 4,
      date: "June 4, 2026",
      title: "Excellent sleep, but the packaging design was slightly updated",
      text: "Sleep quality is incredibly restorative. I wake up before my alarm with clean morning focus. My only minor feedback is that shipping took 3 days instead of 2, although the gorgeous presentation box resting on my nightstand makes up for it. Recommended.",
      helpful: 29,
      tags: ["Morning Focus"]
    },
    {
      author: "Julian T.",
      role: "Sleep-Optimized High Performance Coach",
      rating: 5,
      date: "May 10, 2026",
      title: "No melatonin rebound or nightmare spikes",
      text: "Every other sleep formula containing melatonin triggers insane high-vibrancy nightmares and massive tolerance crashes for me. Somnus has been extremely stable for three continuous months. Daily cognitive energy levels are at an all-time peak.",
      helpful: 73,
      tags: ["Melatonin Free", "No Tolerance Crash"]
    },
    {
      author: "Amara G.",
      role: "Verified Buyer",
      rating: 5,
      date: "April 29, 2026",
      title: "Deep cellular healing night after night",
      text: "Having mild sleep issues for decades, this formulation has returned my sleep states to childhood levels. Heart rate variability (HRV) increased by 19% on average. Truly lives up to the aesthetic premium cost.",
      helpful: 41,
      tags: ["HRV Boost", "Highly Bioavailable"]
    }
  ];

  // Dynamic filter logic for reviews
  const filteredReviews = reviewsData
    .filter(rev => {
      if (starFilter && rev.rating !== starFilter) return false;
      if (reviewSearchQuery) {
        const query = reviewSearchQuery.toLowerCase();
        return (
          rev.text.toLowerCase().includes(query) ||
          rev.title.toLowerCase().includes(query) ||
          rev.author.toLowerCase().includes(query) ||
          rev.tags.some(t => t.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortReviewsBy === 'highest') return b.rating - a.rating;
      if (sortReviewsBy === 'recent') return new Date(b.date).getTime() - new Date(a.date).getTime();
      return b.helpful - a.helpful; // Relevant defaults to most helpful
    });

  // Calculate cart subtotal
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const remainingForFreeShipping = Math.max(0, themeConfig.freeShippingThreshold - cartSubtotal);

  // Dynamic Shopify Discount calculation engine
  let discountAmount = 0;
  if (appliedCoupon) {
    if (couponType === 'percent') {
      discountAmount = cartSubtotal * (couponDiscount / 100);
    } else if (couponType === 'fixed') {
      discountAmount = Math.min(cartSubtotal, couponDiscount);
    }
  }

  const subtotalAfterCoupon = Math.max(0, cartSubtotal - discountAmount);
  
  let dynamicShippingCost = 0;
  if (cartSubtotal > 0) {
    if (couponType === 'shipping' || remainingForFreeShipping === 0) {
      dynamicShippingCost = 0;
    } else {
      dynamicShippingCost = 9.50;
    }
  }

  const finalCartTotal = subtotalAfterCoupon + dynamicShippingCost;

  return (
    <div className={`min-h-screen bg-chalk text-matte font-sans selection:bg-sand selection:text-midnight`}>
      
      {/* Floating System-Alert notifications banner */}
      {notifMessage && (
        <div className="fixed bottom-24 right-6 md:right-12 z-50 animate-bounce bg-midnight text-chalk px-6 py-4 rounded-xl shadow-2xl border border-sand/30 flex items-center space-x-3 max-w-sm">
          <Sparkles className="text-sand shrink-0" size={18} />
          <p className="text-xs font-semibold tracking-wide uppercase">{notifMessage}</p>
        </div>
      )}

      {/* Shopify Online Store 2.0 Settings Customizer Bar */}
      <div className="bg-midnight text-chalk text-xs border-b border-sand/20 py-1 px-4 flex items-center justify-between z-40 relative">
        <div className="flex items-center space-x-2">
          <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1 animate-pulse"></span>
          <span className="font-semibold tracking-wider text-[10px] uppercase text-sand/90 mr-2">Shopify 2.0 Live Preview Mode</span>
          <span className="text-chalk/20 hidden xs:inline">|</span>
          <div className="inline-flex items-center space-x-1 bg-matte/80 border border-sand/20 p-0.5 rounded" id="live-viewport-switcher-pills">
            <button
              onClick={() => {
                setSimulatedDevice('desktop');
                triggerNotification('Simulating PC widescreen layout');
              }}
              className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider transition-all ${simulatedDevice === 'desktop' ? 'bg-sand text-midnight shadow-sm' : 'text-chalk/60 hover:text-white'}`}
            >
              💻 PC View
            </button>
            <button
              onClick={() => {
                setSimulatedDevice('mobile');
                triggerNotification('Simulating calibrated mobile phone screen');
              }}
              className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider transition-all ${simulatedDevice === 'mobile' ? 'bg-sand text-midnight shadow-sm' : 'text-chalk/60 hover:text-white'}`}
            >
              📱 Phone View
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <button 
            onClick={() => setShopifyExportOpen(true)}
            className="flex items-center space-x-1.5 text-midnight hover:bg-chalk hover:text-midnight bg-sand transition-all text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded"
            id="shopify-exporter-modal-toggle"
          >
            <span>📥 Export to Shopify</span>
          </button>
          <button 
            onClick={() => setShopifyCustomizeOpen(!shopifyCustomizeOpen)}
            className="flex items-center space-x-1.5 text-sand hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest bg-matte/80 border border-sand/30 px-3 py-1 rounded"
            id="shopify-customizer-toggle"
          >
            <Sliders size={12} />
            <span>Customize Store Blocks</span>
          </button>
          <span className="text-[10px] text-chalk/50 hidden md:inline">SOMNUS Plus Framework v2.8</span>
        </div>
      </div>

      {/* Interactive Admin Sidebar simulator */}
      {shopifyCustomizeOpen && (
        <div className="fixed inset-y-0 left-0 w-80 bg-midnight text-chalk z-50 p-6 shadow-2xl border-r border-sand/30 overflow-y-auto animate-fade-in flex flex-col">
          <div className="flex items-center justify-between pb-6 border-b border-chalk/10">
            <div>
              <h3 className="text-sm font-semibold tracking-widest text-sand uppercase">SOMNUS Theme Settings</h3>
              <p className="text-[10px] text-chalk/50">Shopify 2.0 Customizer Block Simulator</p>
            </div>
            <button 
              onClick={() => setShopifyCustomizeOpen(false)} 
              className="text-chalk/60 hover:text-white p-1"
              id="close-customizer-btn"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 py-6 space-y-6">
            {/* Control 1 */}
            <div className="space-y-2">
              <label className="text-[10px] tracking-wider text-sand font-bold uppercase">Scientific Citations</label>
              <p className="text-[10px] text-chalk/60 leading-relaxed">Display peer-reviewed medical publications on ingredient cards and badges.</p>
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => setThemeConfig(p => ({ ...p, citationsEnabled: true }))}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded text-center shrink-0 uppercase tracking-widest ${themeConfig.citationsEnabled ? 'bg-sand text-midnight' : 'bg-matte/85 text-chalk/60 border border-chalk/15'}`}
                >
                  Enabled
                </button>
                <button
                  onClick={() => setThemeConfig(p => ({ ...p, citationsEnabled: false }))}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded text-center shrink-0 uppercase tracking-widest ${!themeConfig.citationsEnabled ? 'bg-sand text-midnight' : 'bg-matte/85 text-chalk/60 border border-chalk/15'}`}
                >
                  Disabled
                </button>
              </div>
            </div>

            {/* Control 2 */}
            <div className="space-y-2">
              <label className="text-[10px] tracking-wider text-sand font-bold uppercase">Urgency Countdown Hype Banner</label>
              <p className="text-[10px] text-chalk/60 leading-relaxed font-sans">Highlight shipping time limits dynamically at the header layer to drive purchase intent.</p>
              <button
                onClick={() => setThemeConfig(p => ({ ...p, showHypeBanner: !p.showHypeBanner }))}
                className="w-full text-left text-[11px] font-medium border border-sand/40 p-2.5 rounded bg-matte/40 hover:bg-matte/70 focus:outline-none transition flex justify-between items-center"
              >
                <span>{themeConfig.showHypeBanner ? 'Show Top Countdown' : 'Hide Top Countdown'}</span>
                <span className="text-[10px] text-sand">{themeConfig.showHypeBanner ? 'ACTIVE' : 'INACTIVE'}</span>
              </button>
            </div>

            {/* Control 3 */}
            <div className="space-y-2">
              <label className="text-[10px] tracking-wider text-sand font-bold uppercase">Free Shipping Threshold</label>
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] font-mono">${themeConfig.freeShippingThreshold} USD</span>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="25"
                  value={themeConfig.freeShippingThreshold}
                  onChange={(e) => setThemeConfig(p => ({ ...p, freeShippingThreshold: Number(e.target.value) }))}
                  className="w-2/3 accent-sand"
                />
              </div>
              <p className="text-[9px] text-chalk/40">Adjusts dynamic cart value milestones.</p>
            </div>

            {/* Control 4 */}
            <div className="space-y-2">
              <label className="text-[10px] tracking-wider text-sand font-bold uppercase">Interactive Aura Glow Glow</label>
              <div className="grid grid-cols-3 gap-1">
                {(['none', 'soft', 'radiant'] as const).map(intensity => (
                  <button
                    key={intensity}
                    onClick={() => setThemeConfig(p => ({ ...p, glowAuraIntensity: intensity }))}
                    className={`text-[9px] py-2 font-bold uppercase rounded ${themeConfig.glowAuraIntensity === intensity ? 'bg-sand text-midnight' : 'bg-matte border border-chalk/10 text-chalk/70'}`}
                  >
                    {intensity}
                  </button>
                ))}
              </div>
            </div>

            {/* Control 5 */}
            <div className="space-y-2">
              <label className="text-[10px] tracking-wider text-sand font-bold uppercase">Dynamic Cart Footer Notes</label>
              <input
                type="text"
                value={themeConfig.cartProgressNote}
                onChange={(e) => setThemeConfig(p => ({ ...p, cartProgressNote: e.target.value }))}
                className="w-full bg-matte border border-chalk/20 rounded p-2 text-xs text-chalk focus:outline-none focus:border-sand"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-chalk/15">
            <button 
              onClick={() => {
                setThemeConfig({
                  citationsEnabled: true,
                  freeShippingThreshold: 75,
                  showHypeBanner: true,
                  glowAuraIntensity: 'soft',
                  fontScaling: 'normal',
                  cartProgressNote: 'Third-party clinical testing report attached in checkout.'
                });
                triggerNotification("Successfully reset Shopify sections settings.");
              }}
              className="w-full py-2 bg-chalk/10 hover:bg-chalk/15 font-semibold text-[10px] tracking-widest text-center uppercase text-sand rounded"
              id="reset-shopify-btn"
            >
              Reset Sections
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Device Wrapper Container used for Live Customization Preview */}
      <div className={simulatedDevice === 'mobile' ? "min-h-screen bg-[#F0EAE1] py-10 px-4 flex flex-col items-center justify-center font-sans" : "w-full"}>
        
        {simulatedDevice === 'mobile' && (
          <div className="text-center mb-6 max-w-sm">
            <h1 className="text-xs font-serif font-extrabold tracking-[3px] text-midnight uppercase">SOMNUS Mobile Viewport Sandbox</h1>
            <p className="text-[9px] text-midnight/60 font-sans uppercase tracking-widest mt-1">Shrine theme design: responsive, fits seamlessly on small screens</p>
          </div>
        )}

        <div 
          className={
            simulatedDevice === 'mobile' 
              ? "relative w-[375px] h-[812px] bg-white rounded-[3.25rem] shadow-[0_30px_70px_-15px_rgba(17,20,26,0.35)] border-[12px] border-midnight overflow-hidden flex flex-col select-none text-left" 
              : "w-full"
          }
          id="real-device-simulator-casing"
        >
          {simulatedDevice === 'mobile' && (
            /* Smartphone camera notch bezel overlay */
            <div className="absolute top-0 inset-x-0 h-6 bg-midnight z-50 flex items-center justify-between px-6 rounded-b-[10px] select-none pointer-events-none">
              <span className="text-[9px] text-chalk font-bold font-mono">9:41</span>
              <div className="w-16 h-4 bg-midnight rounded-full absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none"></div>
              <div className="flex items-center space-x-1 text-[9px] text-chalk font-semibold">
                <span>5G</span>
                <span className="w-4.5 h-2.5 border border-chalk/80 rounded-xs bg-chalk block"></span>
              </div>
            </div>
          )}

          <div className={simulatedDevice === 'mobile' ? "flex-1 overflow-y-auto pt-6 scrollbar-none relative flex flex-col bg-white" : "w-full"}>

            {/* Dynamic urgency countdown banner under theme configuration control */}
            {themeConfig.showHypeBanner && (
        <div className="bg-sand text-midnight text-center py-2 px-4 transition-all duration-300 relative z-30">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-4 text-[11px] font-medium tracking-widest uppercase">
            <div className="flex items-center space-x-1.5 font-bold">
              <Clock size={13} className="animate-spin text-midnight" />
              <span>DTC PRIORITY ALERT:</span>
            </div>
            <span>Order within the next <strong className="font-bold underline text-white bg-midnight px-1.5 rounded">{timeLeft.hrs}h {timeLeft.mins}m {timeLeft.secs}s</strong> for Free Express Cold-Storage Shipping</span>
          </div>
        </div>
      )}

      {/* Luxury Brand Header */}
      <header className="sticky top-0 bg-chalk/90 backdrop-blur-md border-b border-midnight/10 py-4 px-4 md:px-12 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          {/* Mobile Hamburger Icon */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-midnight hover:text-sand transition focus:outline-none shrink-0"
            aria-label="Toggle menu"
            id="mobile-hamburger-toggle"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center space-x-1">
            <div className="text-xl sm:text-2xl font-bold tracking-[4px] sm:tracking-[6px] font-serif uppercase text-midnight">
              SOMNUS
            </div>
            <span className="text-[8px] font-bold text-sand-500 border border-sand px-1 rounded transform -translate-y-2 uppercase">Plus</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center space-x-10 text-[11px] font-semibold uppercase tracking-[2px] text-midnight/80">
          <a href="#formula" className="hover:text-sand hover:underline underline-offset-4 transition-all">Formula</a>
          <a href="#importance" className="hover:text-sand hover:underline underline-offset-4 transition-all">Neuro-Benefits</a>
          <a href="#ingredients" className="hover:text-sand hover:underline underline-offset-4 transition-all flex items-center space-x-1 text-midnight">
            <span>Science</span>
            {themeConfig.citationsEnabled && <span className="text-[8px] bg-midnight text-sand px-1 rounded">Citations</span>}
          </a>
          <a href="#how" className="hover:text-sand hover:underline underline-offset-4 transition-all">Protocol</a>
          <a href="#reviews" className="hover:text-sand hover:underline underline-offset-4 transition-all">Clinical Reviews</a>
          <a href="#faq" className="hover:text-sand hover:underline underline-offset-4 transition-all">FAQ</a>
        </nav>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Diagnostic badge */}
          <div className="hidden sm:inline-flex items-center space-x-1 border border-sand/60 px-2 py-1 rounded bg-white text-[9px] font-bold tracking-wider uppercase text-midnight">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>99.4% Sleep Score</span>
          </div>

          <button 
            onClick={() => setCartOpen(true)}
            className="relative font-bold uppercase tracking-wider text-[11px] bg-midnight text-chalk hover:bg-midnight/90 transition-all font-sans py-2.5 px-3 sm:px-4 rounded-xl flex items-center space-x-1 pb-2 sm:space-x-2 border border-sand/30"
            id="shopping-bag-icon-btn"
          >
            <ShoppingBag size={14} className="text-sand" />
            <span className="hidden sm:inline">Bag</span>
            <span className="bg-sand text-midnight text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-extrabold ml-1 border border-midnight">
              {cartCount}
            </span>
          </button>
        </div>
      </header>

      {/* Accessible Mobile Menu Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-chalk/95 backdrop-blur-md border-b border-midnight/15 sticky top-[69px] z-20 transition-all duration-300 shadow-lg p-5 flex flex-col space-y-3.5 text-[10px] font-extrabold uppercase tracking-widest text-midnight/80 animate-fade-in" id="mobile-menu-drawer">
          <a onClick={() => setMobileMenuOpen(false)} href="#formula" className="hover:text-sand py-2 border-b border-midnight/5 transition-all">Formula / Active</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#importance" className="hover:text-sand py-2 border-b border-midnight/5 transition-all">Circadian Benefits</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#ingredients" className="hover:text-sand py-2 border-b border-midnight/5 transition-all flex items-center justify-between">
            <span>Clinical Science Matrix</span>
            {themeConfig.citationsEnabled && <span className="text-[7px] bg-midnight text-sand px-2 py-0.5 rounded leading-none">Citations</span>}
          </a>
          <a onClick={() => setMobileMenuOpen(false)} href="#how" className="hover:text-sand py-2 border-b border-midnight/5 transition-all">Chronobiology Protocol</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#reviews" className="hover:text-sand py-2 border-b border-midnight/5 transition-all">Verified Assays</a>
          <a onClick={() => setMobileMenuOpen(false)} href="#faq" className="hover:text-sand py-2 transition-all">FAQ Dialogue</a>
        </div>
      )}

      {/* Main product presentation grid */}
      <main id="formula" className="max-w-7xl mx-auto px-4 md:px-12 py-8 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        
        {/* Left Column: Interactive Product Gallery */}
        <section className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* Main Display Image */}
          <div className="relative rounded-3xl overflow-hidden bg-white border border-midnight/5 shadow-md flex items-center justify-center aspect-[4/5] p-2 sm:p-8">
            
            {/* Visual Aura lighting in background */}
            {themeConfig.glowAuraIntensity !== 'none' && (
              <div className={`absolute inset-0 bg-radial from-sand/15 via-transparent to-transparent ${themeConfig.glowAuraIntensity === 'radiant' ? 'opacity-85 scale-125' : 'opacity-40'} transition-all pointer-events-none`}></div>
            )}

            {/* Scientific watermark details */}
            <div className="absolute top-4 left-6 text-[9px] font-mono text-midnight/40 leading-tight uppercase hidden sm:block">
              BATCH #792A // CIRCADIAN FREQUENCY INDEX<br />
              FORMULATED BY RESTORATION NEUROSCIENTISTS
            </div>

            {/* Brand icon representation */}
            <div className="absolute top-4 right-6 text-midnight/40 flex items-center space-x-1.5 uppercase tracking-widest text-[9px] font-bold">
              <Moon size={10} className="text-sand" />
              <span>Circadian Safe</span>
            </div>

            {/* Main Interactive Container with Click-To-Zoom Lightbox and Left/Right Nav Overlays */}
            <div 
              className="w-full h-full relative overflow-hidden flex items-center justify-center cursor-zoom-in group/gallery"
              onClick={() => {
                setLightboxOpen(true);
                triggerNotification("Opening macro-lens detail lightbox... Click anywhere else or tap scale tools to explore.");
              }}
              id="main-image-zoom-area"
            >
              {/* Left & Right Chevron buttons for comfortable mobile page-turn action */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-midnight/75 text-chalk hover:bg-midnight flex items-center justify-center transition active:scale-90 border border-sand/30"
                aria-label="Previous image"
              >
                <ChevronLeft size={18} />
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-midnight/75 text-chalk hover:bg-midnight flex items-center justify-center transition active:scale-90 border border-sand/30"
                aria-label="Next image"
              >
                <ChevronRight size={18} />
              </button>

              <img 
                src={images[activeImageIndex].url} 
                alt={images[activeImageIndex].title}
                className="max-h-[85%] w-auto object-contain rounded-2xl transition-transform duration-500 group-hover/gallery:scale-102"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Dynamic caption underlay */}
            <div className="absolute bottom-4 inset-x-4 sm:inset-x-6 flex items-center justify-between text-[10px] sm:text-[11px] bg-midnight/90 text-chalk px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl backdrop-blur">
              <span className="font-medium tracking-wide truncate max-w-[70%]">{images[activeImageIndex].title}</span>
              <span className="text-sand font-bold text-[9px] uppercase tracking-wider shrink-0">{activeImageIndex + 1} / {images.length}</span>
            </div>
          </div>

          {/* Gallery Thumbnails List */}
          <div className="flex sm:grid sm:grid-cols-5 gap-2 sm:gap-3 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0 scrollbar-none snap-x" id="gallery-thumbnails">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`aspect-square rounded-2xl overflow-hidden bg-white border smooth-transition p-1 flex items-center justify-center shrink-0 w-16 h-16 sm:w-auto sm:h-auto snap-center ${activeImageIndex === idx ? 'border-midnight ring-2 ring-sand' : 'border-midnight/10 hover:border-sand/80 opacity-70 hover:opacity-100'}`}
              >
                <img src={img.url} alt={`Thumb ${idx + 1}`} className="max-h-full w-auto object-cover rounded-xl" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>

          {/* Benefits Fast Preview Grid under Gallery (Natural Tones item alignment) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-6 border-t border-midnight/10">
            <div className="flex items-start space-x-3.5 bg-white p-4 rounded-2xl border border-midnight/5">
              <div className="p-2 rounded-xl bg-chalk text-midnight shrink-0">
                <Moon size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-midnight">Circadian Phase Synchronization</h4>
                <p className="text-[10px] text-midnight/75 mt-0.5">Optimizes time-in-bed baseline dynamics logically.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 bg-white p-4 rounded-2xl border border-midnight/5">
              <div className="p-2 rounded-xl bg-chalk text-midnight shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-midnight">Uncompromising Assay Purity</h4>
                <p className="text-[10px] text-midnight/75 mt-0.5">100% molecular testing certified batches.</p>
              </div>
            </div>
          </div>

        </section>

        {/* Right Column: Detailed Product Information & Cart Core Settings */}
        <section className="lg:col-span-5 flex flex-col" ref={buySectionRef} id="product-actions-card">
          
          {/* Trust badges and clinical signals */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-[9px] bg-midnight text-chalk px-3 py-1 rounded-full uppercase tracking-widest font-bold border border-sand/30 flex items-center space-x-1.5">
              <Sparkles size={10} className="text-sand animate-pulse" />
              <span>Neuroscientist Formulated</span>
            </span>
            <span className="text-[9px] bg-white text-midnight px-3 py-1 rounded-full uppercase tracking-widest font-bold border border-midnight/10 flex items-center space-x-1">
              <Award size={10} className="text-midnight" />
              <span>Third Party Tested</span>
            </span>
          </div>

          {/* Main Titles */}
          <div className="mb-2">
            <span className="text-xs text-sand font-bold uppercase tracking-[3px] block mb-1">ST-09 CIRCADIAN SUPPLEMENT</span>
            <h1 className="text-4xl md:text-5xl font-serif text-midnight tracking-tight leading-none font-bold">
              SOMNUS Sleep &amp; Relaxation Formula
            </h1>
          </div>

          {/* Interactive Rating Area with fast clinical analysis anchor */}
          <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-midnight/10">
            <div className="flex items-center text-midnight">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#0F1626" stroke="#0F1626" />
              ))}
            </div>
            <a href="#reviews" className="text-xs font-semibold text-midnight/80 hover:text-midnight hover:underline transition-all font-sans">
              4.9/5 Based on 1,240 Neuro-Assays
            </a>
          </div>

          {/* Short product description with precise scientific highlights */}
          <div className="text-sm font-sans text-midnight/80 leading-relaxed mb-6 space-y-3">
            <p className="italic">
              "A premium slow-wave neuromodulator formulated specifically to decrease sleep onset latency and maximize lymphatic brain clearance during deep cycles."
            </p>
            <p className="text-xs font-medium text-midnight/70 leading-relaxed">
              Synthesized using high-potency organic magnesium, cortisol-buffering botanical adaptogens, and pure raw glycine. Formulated without synthetic melatonin or gluten binders to preserve natural hormones.
            </p>
          </div>

          {/* Interactive Pricing Engine Dashboard */}
          <div className="bg-white rounded-3xl p-6 border border-midnight/5 shadow-sm space-y-5 mb-6">
            
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-midnight/60 font-sans">Selected Tier Price</span>
              <div className="flex items-baseline space-x-2">
                {purchaseMode === 'subscribe' && (
                  <span className="text-xs font-bold line-through text-midnight/40 font-mono">${(basePrice * quantity).toFixed(2)}</span>
                )}
                <span className="text-3xl font-serif font-bold text-midnight font-mono" id="current-price-display">
                  ${(getTotalPrice()).toFixed(2)}
                </span>
                <span className="text-[10px] uppercase font-bold text-midnight/60 font-mono">USD</span>
              </div>
            </div>

            {/* SUBSCRIPTION SWITCHER OPTION 1: Subscribe & Save */}
            <div 
              onClick={() => setPurchaseMode('subscribe')}
              className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer relative flex flex-col space-y-2 ${purchaseMode === 'subscribe' ? 'border-midnight bg-midnight text-chalk ring-1 ring-sand' : 'border-midnight/10 bg-chalk/35 text-midnight hover:bg-chalk/50'}`}
              id="subscribe-save-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${purchaseMode === 'subscribe' ? 'border-sand bg-sand' : 'border-midnight/30'}`}>
                    {purchaseMode === 'subscribe' && <div className="w-2.5 h-2.5 rounded-full bg-midnight"></div>}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider font-sans">Subscribe &amp; Restore</span>
                    <span className="ml-2 text-[10px] bg-sand text-midnight px-2 py-0.5 rounded-full font-extrabold uppercase shrink-0">SAVE 15%</span>
                  </div>
                </div>
                <div className="text-sm font-bold font-mono">
                  ${(basePrice * subscriptionDiscountRatio).toFixed(2)} <span className="text-[9px] uppercase font-normal">/ Bottle</span>
                </div>
              </div>

              {/* Collapsible shipping choices for subscription users */}
              {purchaseMode === 'subscribe' && (
                <div className="pt-2 mt-2 border-t border-sand/20 space-y-2">
                  <p className="text-[10px] text-chalk/75 leading-relaxed font-sans">
                    ✓ Autopilot delivery. Swap or pause anytime. Free cold-chain thermal shipping included.
                  </p>
                  <div className="flex items-center justify-between bg-matte/80 p-2.5 rounded-xl border border-sand/35">
                    <span className="text-[10px] text-sand uppercase tracking-wider font-bold">Resupply Interval:</span>
                    <div className="flex space-x-1.5">
                      {['30', '45', '60'].map(freq => (
                        <button
                          key={freq}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFrequency(freq);
                          }}
                          className={`text-[9px] font-bold px-3 py-1 rounded uppercase tracking-wider transition ${selectedFrequency === freq ? 'bg-sand text-midnight' : 'bg-midnight text-chalk/70 hover:text-white'}`}
                        >
                          {freq} Days
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SUBSCRIPTION SWITCHER OPTION 2: Single Bottle Buy */}
            <div 
              onClick={() => setPurchaseMode('onetime')}
              className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col space-y-2 ${purchaseMode === 'onetime' ? 'border-midnight bg-midnight text-chalk ring-1 ring-sand' : 'border-midnight/10 bg-chalk/35 text-midnight hover:bg-chalk/50'}`}
              id="one-time-purchase-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${purchaseMode === 'onetime' ? 'border-sand bg-sand' : 'border-midnight/30'}`}>
                    {purchaseMode === 'onetime' && <div className="w-2.5 h-2.5 rounded-full bg-midnight"></div>}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider font-sans">One-Time Trial Buy</span>
                  </div>
                </div>
                <div className="text-sm font-bold font-mono">
                  ${basePrice.toFixed(2)} <span className="text-[9px] uppercase font-normal">/ Bottle</span>
                </div>
              </div>

              {purchaseMode === 'onetime' && (
                <p className="text-[10px] text-sand leading-relaxed pt-1 font-sans">
                  Includes exactly 60 luxury pullulan clinical neuro-capsules (30-day supply sequence).
                </p>
              )}
            </div>

            {/* Quantity Selector Engine */}
            <div className="flex items-center justify-between pt-4 border-t border-midnight/15">
              <span className="text-[11px] font-bold uppercase tracking-wider text-midnight/70 font-sans">Verify Dosage Bottle Count</span>
              <div className="flex items-center space-x-1.5 bg-chalk/60 p-1.5 rounded-2xl border border-midnight/5" id="quantity-adjustment-grid">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-xl bg-white text-midnight flex items-center justify-center hover:bg-sand transition shadow-sm border border-midnight/5"
                  id="decrease-quantity-btn"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-bold font-mono text-sm">{quantity}</span>
                <button 
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="w-8 h-8 rounded-xl bg-white text-midnight flex items-center justify-center hover:bg-sand transition shadow-sm border border-midnight/5"
                  id="increase-quantity-btn"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Master CTA Actions */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="w-full bg-midnight text-chalk hover:bg-midnight/95 transition-all text-xs font-bold uppercase tracking-[2px] py-4 rounded-2xl flex items-center justify-center space-x-2 border border-sand/40 group relative overflow-hidden"
                id="add-to-cart-action"
              >
                <span className="absolute inset-0 bg-white/5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                <ShoppingBag size={15} className="text-sand shrink-0 animate-pulse" />
                <span>Add To Sleep Cycle — ${(getTotalPrice()).toFixed(2)}</span>
              </button>

              <button
                onClick={() => {
                  handleAddToCart();
                  setCheckoutOpen(true);
                  triggerNotification("Redirecting immediately to secure SOMNUS checkout node...");
                }}
                className="w-full bg-sand text-midnight hover:bg-sand/90 transition-all text-xs font-extrabold uppercase tracking-[2px] py-4 rounded-2xl flex items-center justify-center space-x-2 border border-midnight shadow-md"
                id="instant-checkout-action"
              >
                <span>Express Buy Now (Shop Pay)</span>
                <ArrowRight size={14} className="shrink-0" />
              </button>
            </div>

            {/* Crucial DTC Trust Symbols Footer */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-midnight/10 text-center text-[10px] font-bold uppercase text-midnight/70">
              <div className="p-2 bg-chalk/30 rounded-xl space-y-1">
                <div className="text-midnight mx-auto flex justify-center"><Award size={14} /></div>
                <div>60-Day Guarantee</div>
              </div>
              <div className="p-2 bg-chalk/30 rounded-xl space-y-1">
                <div className="text-midnight mx-auto flex justify-center"><ShieldCheck size={14} /></div>
                <div>Free-Free Shipping</div>
              </div>
              <div className="p-2 bg-chalk/30 rounded-xl space-y-1">
                <div className="text-midnight mx-auto flex justify-center"><RotateCcw size={14} /></div>
                <div>Cancel Interactively</div>
              </div>
            </div>

          </div>

          {/* Live FDA statement compliance block */}
          <div className="bg-white/50 border border-midnight/5 p-4 rounded-2xl text-[10px] text-midnight/60 leading-relaxed font-sans">
            <span className="font-semibold text-midnight/70 block uppercase tracking-wider mb-1">DTC MEDICAL DESK DISCLAIMER:</span>
            *These statements have not been evaluated by the Food and Drug Administration. This clinical product is not intended to diagnose, treat, cure, or prevent any circadian disease or insomnia indicators.
          </div>

        </section>

      </main>

      {/* SECTION 2: Benefits Focus Section */}
      <section id="importance" className="bg-midnight text-chalk py-16 lg:py-24 border-t border-b border-sand/20">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-sand font-bold text-xs uppercase tracking-[3px]">CIRCADIAN METRIC CALIBRATION</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-chalk">
              Four Dimensions of Absolute Restoration
            </h2>
            <p className="text-sm text-chalk/70 font-sans tracking-wide">
              Traditional sleeping capsules rely on heavy sedation. SOMNUS repairs baseline slow-wave states without creating chemical reliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Benefit Card 1 */}
            <div className="bg-matte rounded-3xl p-8 border border-sand/15 hover:border-sand smooth-transition group relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-radial from-sand/5 to-transparent pointer-events-none"></div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-midnight border border-sand text-sand flex items-center justify-center group-hover:scale-110 smooth-transition">
                  <Moon size={22} className="animate-pulse" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-chalk group-hover:text-sand py-2">Deep Sleep Support</h3>
                <p className="text-xs text-chalk/70 leading-relaxed font-sans">
                  Maximizes slow-wave delta-wave architectural cycles, promoting optimal memory consolidation and daily human growth hormone synthesis.
                </p>
              </div>
              <div className="pt-6 border-t border-sand/10 mt-6 text-[10px] font-bold uppercase tracking-wider text-sand">
                +118% Delta Wave Amplitude
              </div>
            </div>

            {/* Benefit Card 2 */}
            <div className="bg-matte rounded-3xl p-8 border border-sand/15 hover:border-sand smooth-transition group relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-radial from-sand/5 to-transparent pointer-events-none"></div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-midnight border border-sand text-sand flex items-center justify-center group-hover:scale-110 smooth-transition">
                  <Compass size={22} />
                </div>
                <h3 className="text-lg font-serif font-semibold text-chalk group-hover:text-sand py-2">Calm &amp; Relax Mind</h3>
                <p className="text-xs text-chalk/70 leading-relaxed font-sans">
                  Soothes persistent central nervous hyper-excitability, stopping late-night mental loops to ensure seamless sleep onset transitions.
                </p>
              </div>
              <div className="pt-6 border-t border-sand/10 mt-6 text-[10px] font-bold uppercase tracking-wider text-sand">
                NMDA Pathway Inactivation
              </div>
            </div>

            {/* Benefit Card 3 */}
            <div className="bg-matte rounded-3xl p-8 border border-sand/15 hover:border-sand smooth-transition group relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-radial from-sand/5 to-transparent pointer-events-none"></div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-midnight border border-sand text-sand flex items-center justify-center group-hover:scale-110 smooth-transition">
                  <Sparkles size={22} />
                </div>
                <h3 className="text-lg font-serif font-semibold text-chalk group-hover:text-sand py-2">Wake Up Refreshed</h3>
                <p className="text-xs text-chalk/70 leading-relaxed font-sans">
                  By bypassing artificial chemical grogginess triggers, the molecular components degrade naturally by dawn for crisp cognitive clarity.
                </p>
              </div>
              <div className="pt-6 border-t border-sand/10 mt-6 text-[10px] font-bold uppercase tracking-wider text-sand">
                Zero Morning Drowsiness
              </div>
            </div>

            {/* Benefit Card 4 */}
            <div className="bg-matte rounded-3xl p-8 border border-sand/15 hover:border-sand smooth-transition group relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-24 h-24 bg-radial from-sand/5 to-transparent pointer-events-none"></div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-midnight border border-sand text-sand flex items-center justify-center group-hover:scale-110 smooth-transition">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="text-lg font-serif font-semibold text-chalk group-hover:text-sand py-2">Non-Habit Forming</h3>
                <p className="text-xs text-chalk/70 leading-relaxed font-sans">
                  Free from synthetic melatonin or dangerous chemical hypnotics. Supports native physical pathways with no long-term tolerance development.
                </p>
              </div>
              <div className="pt-6 border-t border-sand/10 mt-6 text-[10px] font-bold uppercase tracking-wider text-sand">
                Hormonally Zero-Suppressing
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 3: Scientific Ingredients Breakdown Section */}
      <section id="ingredients" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 md:px-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-12">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-sand font-bold text-xs uppercase tracking-[3px] block">MOLECULAR FORMULA MATRIX</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-midnight leading-none">
              Clinically Synergistic Active Pathways
            </h2>
            <p className="text-sm font-sans text-midnight/80 leading-relaxed">
              SOMNUS reveals every dosage and citation proudly. Pure, raw extracts working in perfect harmony to down-regulate nervous system excitability. Key scientific elements are interactive:
            </p>
          </div>
          <div className="lg:col-span-6 flex overflow-x-auto lg:flex-wrap gap-2 lg:justify-end pb-3 lg:pb-0 scrollbar-none -mx-4 px-4 sm:-mx-0 sm:px-0">
            {ingredients.map((ing, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIngredientIndex(idx)}
                className={`text-xs px-4 py-2 rounded-2xl font-semibold uppercase tracking-wider transition-all duration-300 whitespace-nowrap shrink-0 sm:shrink ${activeIngredientIndex === idx ? 'bg-midnight text-chalk shadow-md' : 'bg-white border border-midnight/15 text-midnight hover:bg-sand/30'}`}
              >
                {ing.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Interactive Ingredient Presentation Terminal */}
        <div className="bg-white rounded-[32px] border border-midnight/10 shadow-lg p-8 lg:p-12 transition-all relative overflow-hidden" id="ingredient-science-display">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-sand/20 to-transparent pointer-events-none"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex items-center space-x-4">
                <span className="text-[2.5rem] font-serif font-bold text-midnight leading-none">{ingredients[activeIngredientIndex].dosage}</span>
                <div>
                  <span className="text-xs text-sand font-bold block uppercase tracking-widest leading-none mb-1">PRECISE DOSAGE</span>
                  <p className="text-base text-midnight font-bold leading-none">{ingredients[activeIngredientIndex].name}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-midnight/40 tracking-widest font-bold uppercase block">PRIMARY PHARMACOLOGICAL ROLE</span>
                <p className="text-lg font-serif font-bold text-midnight">{ingredients[activeIngredientIndex].role}</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-midnight/40 tracking-widest font-bold uppercase block">CLINICAL NEUROSCIENTIFIC COGNITION</span>
                <p className="text-sm font-sans text-midnight/80 leading-relaxed">
                  {ingredients[activeIngredientIndex].excerpt}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-midnight/40 tracking-widest font-bold uppercase block">MECHANISM OF PHYSIOLOGICAL ONSET</span>
                <p className="text-xs font-semibold text-midnight/70 italic leading-relaxed">
                  {ingredients[activeIngredientIndex].mechanism}
                </p>
              </div>

              {themeConfig.citationsEnabled && (
                <div className="p-3 bg-chalk rounded-xl border border-midnight/5 flex items-center space-x-2.5">
                  <div className="p-1 rounded bg-midnight text-sand shrink-0">
                    <Award size={14} />
                  </div>
                  <span className="text-[11px] text-midnight/85 font-mono">
                    <strong>Citation Record:</strong> {ingredients[activeIngredientIndex].citation}
                  </span>
                </div>
              )}

            </div>

            {/* Left Graphics Area for Premium Scientific Representation */}
            <div className="lg:col-span-5 aspect-square rounded-2xl bg-chalk flex flex-col items-center justify-center p-8 border border-midnight/5 relative">
              <div className="absolute inset-0 bg-[radial-gradient(#0F1626_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
              
              <Moon size={36} className="text-midnight/35 mb-4 shrink-0 animate-bounce" />
              
              <div className="relative text-center uppercase z-10 w-full">
                <div className="text-[10px] tracking-widest font-extrabold text-midnight/50">CHEMICAL RECEPTOR FIT</div>
                <div className="font-serif text-xl tracking-wide font-bold text-midnight mt-1">99.8% Binding Efficiency</div>
                <div className="w-full h-1 bg-midnight/10 rounded-full mt-4 overflow-hidden relative">
                  <div className="absolute inset-y-0 left-0 bg-sand transition-all duration-1000" style={{ width: `${80 + (activeIngredientIndex * 4)}%` }}></div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 text-[9px] font-bold text-midnight/60 leading-none">
                  <span className="p-1.5 bg-white rounded border border-midnight/5 uppercase">No Synthetics</span>
                  <span className="p-1.5 bg-white rounded border border-midnight/5 uppercase">Hypoallergenic</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* SECTION 4: Three-Step Rest restorative Protocol "How It Works" */}
      <section id="how" className="bg-white py-16 lg:py-24 border-t border-b border-midnight/5">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-sand font-bold text-xs uppercase tracking-[3px]">THE NIGHTLY PROTOCOL ORDER</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-midnight">
              Chronobiological Onset Sequencer
            </h2>
            <p className="text-sm font-sans text-midnight/70">
              SOMNUS coordinates perfectly with your body's temperature gradients to drop brain latency systematically:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Visual connecting line for desktop flow */}
            <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-px border-t border-dashed border-midnight/15 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4 group">
              <div className="w-16 h-16 rounded-full bg-chalk border-2 border-midnight/10 text-midnight text-lg font-serif font-extrabold flex items-center justify-center group-hover:bg-midnight group-hover:text-chalk transition-all duration-300">
                01
              </div>
              <h3 className="text-md font-bold uppercase tracking-wider text-midnight pt-2">Take Prior To Rest</h3>
              <p className="text-xs text-midnight/70 px-4 leading-relaxed font-sans">
                Take three pulling pullulan capsules precisely 30 to 45 minutes before sleep with fresh purified water. Ensure overhead brightness is kept minimal.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4 group">
              <div className="w-16 h-16 rounded-full bg-chalk border-2 border-midnight/10 text-midnight text-lg font-serif font-extrabold flex items-center justify-center group-hover:bg-midnight group-hover:text-chalk transition-all duration-300">
                02
              </div>
              <h3 className="text-md font-bold uppercase tracking-wider text-midnight pt-2">Fall Asleep Faster</h3>
              <p className="text-xs text-midnight/70 px-4 leading-relaxed font-sans">
                Active molecules lower your core biological temperature and suppress active mental feedback lines to calm anxiety layers naturally.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4 group">
              <div className="w-16 h-16 rounded-full bg-chalk border-2 border-midnight/10 text-midnight text-lg font-serif font-extrabold flex items-center justify-center group-hover:bg-midnight group-hover:text-chalk transition-all duration-300">
                03
              </div>
              <h3 className="text-md font-bold uppercase tracking-wider text-midnight pt-2">Wake Up Restored</h3>
              <p className="text-xs text-midnight/70 px-4 leading-relaxed font-sans">
                Awaken at dawn without typical melatonin-induced heavy cognitive fog. Experience restored morning cortisol spikes to accelerate focus.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 5: Lifestyle Gallery Container */}
      <section className="bg-chalk py-16 lg:py-24 max-w-7xl mx-auto px-4 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-sand font-bold text-xs uppercase tracking-[3px]">THE SOMNUS ETHOS</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-midnight">
            Form follows function. Always.
          </h2>
          <p className="text-sm font-sans text-midnight/75 italic">
            An uncompromising physical aesthetic designed to elevate your nightly rest space container:
          </p>
        </div>

        {/* Responsive Aesthetic Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="lifestyle-media-grid">
          
          <div className="group relative rounded-[2rem] overflow-hidden shadow-sm aspect-[4/3] bg-white border border-midnight/5">
            <img 
              src="/src/assets/images/somnus_main_hero_1780948043982.png"
              alt="Nightstand Lifestyle"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/20 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <div className="text-chalk">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-sand">STAGING</span>
                <p className="text-xs font-semibold mt-0.5">Minimal Rest Space &amp; Sandstone Plinth</p>
              </div>
            </div>
          </div>

          <div className="group relative rounded-[2rem] overflow-hidden shadow-sm aspect-[4/3] bg-white border border-midnight/5">
            <img 
              src="/src/assets/images/somnus_capsules_sand_1780948059789.png"
              alt="Bottle Close-up"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/20 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <div className="text-chalk">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-sand">SPECIFICATIONS</span>
                <p className="text-xs font-semibold mt-0.5">Gold-Powder Active Cellular Capsules</p>
              </div>
            </div>
          </div>

          <div className="group relative rounded-[2rem] overflow-hidden shadow-sm aspect-[4/3] bg-white border border-midnight/5">
            <img 
              src="/src/assets/images/somnus_boxes_pack_1780948072610.png"
              alt="Capsules Close-up"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/20 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <div className="text-chalk">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-sand">PACKAGING</span>
                <p className="text-xs font-semibold mt-0.5">Sleek Minimal Carton Containers</p>
              </div>
            </div>
          </div>

          <div className="group relative rounded-[2rem] overflow-hidden shadow-sm aspect-[4/3] bg-white border border-midnight/5">
            <img 
              src="/src/assets/images/somnus_lifestyle_room_1780948086402.png"
              alt="Bedroom Restoration"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/20 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <div className="text-chalk">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-sand">LIFESTYLE</span>
                <p className="text-xs font-semibold mt-0.5">Circadian Oak &amp; Travertine Sanctuary</p>
              </div>
            </div>
          </div>

          <div className="group relative rounded-[2rem] overflow-hidden shadow-sm aspect-[4/3] bg-white border border-midnight/5">
            <img 
              src="/src/assets/images/somnus_macro_details_1780948112943.png"
              alt="Natural Stone base"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/20 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <div className="text-chalk">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-sand">EXTRACTS</span>
                <p className="text-xs font-semibold mt-0.5">Pure Mineral Botanical Oils on Sandstone</p>
              </div>
            </div>
          </div>

          <div className="group relative rounded-[2rem] overflow-hidden shadow-sm aspect-[4/3] bg-white border border-midnight/5">
            <img 
              src="/src/assets/images/somnus_certificate_assay_1780948168067.png"
              alt="Premium packaging box"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/20 to-transparent opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <div className="text-chalk">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-sand">ASSAY ASSURANCE</span>
                <p className="text-xs font-semibold mt-0.5">Independent ISO-9001 Tested Purity Records</p>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* SECTION 6: Accordion FAQs Container */}
      <section id="faq" className="bg-white py-16 lg:py-24 border-t border-b border-midnight/10">
        <div className="max-w-4xl mx-auto px-4">
          
          <div className="text-center mb-16 space-y-3">
            <span className="text-sand font-bold text-xs uppercase tracking-[3px]">CIRCADIAN DIALOGUE INTERVIEWS</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-midnight">
              Frequently Asked Physical Questions
            </h2>
            <p className="text-sm font-sans tracking-wide text-midnight/60">
              Clear scientific feedback assisting conscious supplementation choices.
            </p>
          </div>

          <div className="space-y-4" id="faq-accordion-rows">
            {faqList.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-chalk/35 border border-midnight/5 rounded-3xl overflow-hidden smooth-transition"
              >
                <button
                  onClick={() => setOpenedFAQ(openedFAQ === idx ? null : idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                  id={`faq-btn-${idx}`}
                >
                  <span className="text-sm font-bold uppercase tracking-wide text-midnight pr-4">{faq.q}</span>
                  <div className="p-1 rounded-xl bg-chalk text-midnight shrink-0">
                    {openedFAQ === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {openedFAQ === idx && (
                  <div className="px-6 pb-6 pt-1 text-xs text-midnight/85 leading-relaxed border-t border-midnight/5 animate-fade-in font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 7: Premium High-Conversion Reviews Screen */}
      <section id="reviews" className="bg-chalk py-16 lg:py-24 max-w-7xl mx-auto px-4 md:px-12 border-b border-midnight/5">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Outward Rating Analytics Board */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-midnight/5 shadow-sm text-center lg:text-left space-y-4">
            <span className="text-[10px] text-midnight/40 tracking-widest font-bold uppercase block leading-none">CONSUMER METRIC AVERAGE</span>
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <span className="text-5xl font-serif font-bold text-midnight leading-none">4.94</span>
              <div>
                <div className="flex text-midnight mb-1 justify-center lg:justify-start">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#0F1626" stroke="#0F1626" />
                  ))}
                </div>
                <span className="text-[10px] text-midnight/60 font-bold block uppercase tracking-wider leading-none">1,240 Total Verified Submissions</span>
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-midnight/70">
              Assays scored on Stage-3 slow-wave amplitude, reduced early awakenings, and refreshed morning alertness indices.
            </p>

            <div className="pt-4 border-t border-midnight/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-midnight/75">5 Stars Rest</span>
                <span className="font-mono text-[11px] text-midnight/50">94% (1165)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-midnight/75">4 Stars Rest</span>
                <span className="font-mono text-[11px] text-midnight/50">5% (62)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-midnight/75">3 Stars Rest</span>
                <span className="font-mono text-[11px] text-midnight/50">1% (13)</span>
              </div>
            </div>
          </div>

          {/* Filtering and Sort Action Command Bar */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white px-6 py-4 rounded-3xl border border-midnight/5">
              <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
                <span className="text-[10px] font-bold text-midnight/50 uppercase tracking-widest mr-2">Filter Stars:</span>
                <button
                  onClick={() => setStarFilter(null)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider transition ${starFilter === null ? 'bg-midnight text-chalk' : 'bg-chalk text-midnight/80 hover:bg-sand/30'}`}
                >
                  All (6)
                </button>
                {[5, 4].map(star => (
                  <button
                    key={star}
                    onClick={() => setStarFilter(star)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider transition ${starFilter === star ? 'bg-midnight text-chalk' : 'bg-chalk text-midnight/80 hover:bg-sand/30'}`}
                  >
                    {star} Stars
                  </button>
                ))}
              </div>

              <div className="flex space-x-2 items-center w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search clinical keywords..."
                  value={reviewSearchQuery}
                  onChange={(e) => setReviewSearchQuery(e.target.value)}
                  className="w-full sm:w-48 bg-chalk border border-midnight/10 focus:outline-none focus:border-sand p-2 rounded-xl text-xs"
                />
                
                <select
                  value={sortReviewsBy}
                  onChange={(e: any) => setSortReviewsBy(e.target.value)}
                  className="bg-chalk border border-midnight/10 p-2 rounded-xl text-xs font-semibold uppercase text-midnight"
                >
                  <option value="relevant">Relevant</option>
                  <option value="highest">Highest</option>
                  <option value="recent">Recent</option>
                </select>
              </div>
            </div>

            {/* List of high fidelity customer reviews */}
            <div className="space-y-4" id="reviews-output-list">
              {filteredReviews.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl text-sm italic text-midnight/55 border border-midnight/5">
                  No neuroscientist verified reports match your precise keyword filter. Reset stars or search inputs.
                </div>
              ) : (
                filteredReviews.map((rev, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-6 md:p-8 border border-midnight/5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-2 mb-1 sm:mb-0">
                        <div className="flex text-midnight">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={12} fill="#0F1626" stroke="#0F1626" />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Verified Restoration Assay</span>
                      </div>
                      <span className="text-[10px] text-midnight/50 font-mono font-bold uppercase">{rev.date}</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-md font-serif font-bold text-midnight">{rev.title}</h4>
                      <p className="text-xs text-midnight/80 leading-relaxed font-sans">{rev.text}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {rev.tags.map((t, idx) => (
                        <span key={idx} className="text-[9px] bg-chalk text-midnight/60 font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-midnight/5 mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-sand text-midnight flex items-center justify-center font-bold text-[9px] uppercase">
                          {rev.author.charAt(0)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-midnight block leading-none">{rev.author}</span>
                          <span className="text-[9px] text-midnight/50 font-sans block leading-none mt-1">{rev.role}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 text-[10px] font-bold text-midnight/60">
                        <span>Was this clinical feedback helpful?</span>
                        <button className="px-2.5 py-1 bg-chalk hover:bg-sand/30 rounded text-midnight transition font-mono">
                          Yes ({rev.helpful})
                        </button>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </section>

      {/* FOOTER: Rest and Guarantee Information */}
      <footer className="bg-matte text-chalk py-16 px-6 md:px-12 border-t border-sand/30 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-chalk/10">
          
          <div className="md:col-span-5 space-y-4">
            <div className="text-xl font-bold tracking-[6px] font-serif uppercase text-sand">SOMNUS</div>
            <p className="text-xs text-chalk/65 leading-relaxed max-w-sm">
              An elite slow-wave formulation engineered for high performance practitioners, astronauts, and anyone aiming to optimize nocturnal neurological rejuvenation indices.
            </p>
            <div className="pt-2 text-[10px] text-chalk/45 font-mono">
              MANUFACTURED IN INDEPENDENT NSF-CERTIFIED PHARMACEUTICAL CLEANROOMS.
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h5 className="text-[10px] font-bold tracking-[2px] text-sand uppercase">Active Compounds</h5>
            <ul className="space-y-1.5 text-xs text-chalk/75">
              <li>Magnesium Glycinate (450mg Chelate)</li>
              <li>L-Theanine (Select alpha green tea isolate)</li>
              <li>Organic Apigenin extract</li>
              <li>Concentrated Micronized Glycine</li>
              <li>Premium KSM-66 Standardized Ashwagandha</li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h5 className="text-[10px] font-bold tracking-[2px] text-sand uppercase">DTC Operations</h5>
            <ul className="space-y-1.5 text-xs text-chalk/70">
              <li><a href="#how" className="hover:text-sand transition">Circadian Protocol</a></li>
              <li><a href="#formula" className="hover:text-sand transition">Secure Shop Pay</a></li>
              <li><a href="#faq" className="hover:text-sand transition">Science &amp; Inquiries</a></li>
              <li><a href="#reviews" className="hover:text-sand transition">Verified Assays</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h5 className="text-[10px] font-bold tracking-[2px] text-sand uppercase">Deep Restore Guarantee</h5>
            <p className="text-[10px] text-chalk/70 leading-relaxed">
              If SOMNUS fails to improve your biometric sleep architecture scores (via Whoop, Oura, or Garmin metrics) within 60 days, we'll refund you instantly.
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-chalk/40 space-y-3 sm:space-y-0">
          <span>&copy; {new Date().getFullYear()} SOMNUS Plus Inc. All Circadian Rights Reserved.</span>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-chalk transition">Circadian Privacy policy</a>
            <a href="#" className="hover:text-chalk transition">Terms of Rest</a>
            <a href="#" className="hover:text-chalk transition">Shopify Liquid 2.0 Licensing</a>
          </div>
        </div>
      </footer>

      {/* VIEWPORT-AWARE STICKY FOOTER: Triggers past Hero Buy Actions */}
      <div className={`${simulatedDevice === 'mobile' ? 'absolute pb-6' : 'fixed'} bottom-0 inset-x-0 bg-matte text-chalk py-3 px-4 md:py-4 md:px-6 border-t border-sand/30 shadow-2xl z-40 transition-all duration-300 transform ${showStickyATC ? 'translate-y-0' : 'translate-y-full'}`} id="sticky-footer-atc">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left Block: Standard compact detail indicators for Mobile, full rich block for Tablet/Desktop */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-10 md:w-10 md:h-12 bg-white rounded overflow-hidden flex items-center justify-center shrink-0 border border-sand/20">
              <img src={images[0].url} alt="Somnus bottle thumbnail" className="h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <div className="hidden md:block text-[9px] uppercase tracking-wider text-sand font-bold">CIRCADIAN RECOVERY SEQUENCE</div>
              <p className="text-xs font-serif font-bold text-chalk leading-tight">SOMNUS Sleep &amp; Relaxation Formula <span className="hidden md:inline">({purchaseMode === 'subscribe' ? 'Subscription' : 'One-Time'})</span><span className="md:hidden">({purchaseMode === 'subscribe' ? 'Sub' : 'Once'})</span></p>
              
              {/* Stars are hidden on smallest viewports to optimize visual budget & avoid crowding */}
              <div className="hidden sm:flex items-center space-x-2 mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} fill="#DCCDB2" stroke="#DCCDB2" />
                ))}
                <span className="text-[9px] opacity-60">Verified pure molecular chelate</span>
              </div>
              
              {/* Live Price under the name for compact mobile viewports */}
              <div className="flex items-baseline space-x-1 mt-0.5 md:hidden">
                <span className="text-sm font-bold text-sand font-mono">${(getTotalPrice()).toFixed(2)}</span>
                <span className="text-[8px] opacity-50 uppercase">USD</span>
              </div>
            </div>
          </div>

          {/* Right Block: Dynamic alignment spacing. Side-by-side price & buy on mobile */}
          <div className="flex items-center gap-3 md:gap-6 shrink-0 font-sans">
            {/* Desktop-only secondary Subtotal display */}
            <div className="hidden md:block text-right">
              <span className="text-[9px] uppercase tracking-wider opacity-60 block">Dynamic Pricing Subtotal</span>
              <div className="flex items-baseline space-x-1.5 justify-end">
                <span className="text-lg font-serif font-bold text-sand font-mono">${(getTotalPrice()).toFixed(2)}</span>
                <span className="text-[8px] opacity-40 uppercase font-mono">USD</span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="bg-sand text-midnight hover:bg-white hover:text-midnight transition-all duration-200 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest flex items-center space-x-2 border border-midnight shadow-md shrink-0 active:scale-95"
              id="sticky-checkout-btn"
            >
              <ShoppingBag size={12} fill="currentColor" className="shrink-0" />
              <span>Add to Bag</span>
            </button>
          </div>

        </div>
      </div>

      {/* ACCESSIBLE SLIDING DRAWER: Cart Checkout Drawer */}
      {cartOpen && (
        <div className={`${simulatedDevice === 'mobile' ? 'absolute' : 'fixed'} inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end animate-fade-in`} id="cart-slide-drawer">
          <div className="w-full max-w-md bg-white text-midnight h-full p-6 shadow-2xl flex flex-col justify-between animate-slide-left relative">
            
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-midnight/10">
                <div className="flex items-center space-x-2.5">
                  <ShoppingBag size={18} className="text-midnight" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-midnight font-sans">Nocturnal Rejuvenation Bag</h3>
                </div>
                <button 
                  onClick={() => setCartOpen(false)}
                  className="p-1 rounded-xl hover:bg-chalk transition text-midnight"
                  id="close-cart-btn"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Dynamic Free Shipping Milestone Tracker */}
              <div className="p-4 bg-chalk/35 border-b border-midnight/5 space-y-2 mt-4 rounded-2xl">
                <div className="flex justify-between items-center text-xs font-bold uppercase">
                  <span>Circadian Freight Tracker</span>
                  <span className="text-sand font-extrabold text-[10px]">
                    {remainingForFreeShipping > 0 
                      ? `$${remainingForFreeShipping.toFixed(2)} Away From Free Expedited Cold Shipment` 
                      : '✓ FREE EXPEDITED COLD SHIPPING ACTIVE'}
                  </span>
                </div>
                <div className="w-full bg-midnight/10 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-midnight transition-all duration-500" 
                    style={{ width: `${Math.min(100, (cartSubtotal / themeConfig.freeShippingThreshold) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Items List */}
              <div className="mt-6 space-y-4 max-h-[45vh] overflow-y-auto pr-1">
                {cartItems.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <Moon size={28} className="text-midnight/20 mx-auto animate-pulse" />
                    <p className="text-xs text-midnight/50 italic leading-relaxed font-sans">
                      Your restoration biological cycle list is empty.<br />Fill to initiate nightly recovery protocol.
                    </p>
                  </div>
                ) : (
                  cartItems.map((item, idx) => (
                    <div key={idx} className="bg-chalk p-4 rounded-2xl border border-midnight/5 flex items-start justify-between space-x-4">
                      <div className="space-y-1">
                        <span className="text-[9px] bg-midnight text-chalk px-2 py-0.5 rounded font-extrabold uppercase shrink-0">
                          {item.mode}
                        </span>
                        <h4 className="text-xs font-bold text-midnight font-sans mt-1">{item.name}</h4>
                        <p className="text-[10px] text-midnight/60 font-medium">{item.frequency}</p>
                        <div className="flex items-center space-x-1 mt-1 text-[11px] font-bold">
                          <span>Qty: {item.qty}</span>
                          <span className="text-midnight/30 px-1">•</span>
                          <span className="text-sand font-extrabold font-mono">${(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id, item.qty)}
                        className="text-red-600 hover:text-red-800 p-1 text-[11px] font-bold uppercase tracking-wider"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Calculations and Actions Footer */}
            <div className="pt-4 border-t border-midnight/10 space-y-4.5">
              
              {/* Dynamic Interactive Shopify Coupon Box */}
              {cartSubtotal > 0 && (
                <div className="bg-chalk p-3.5 rounded-2xl border border-midnight/5 space-y-3">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-extrabold text-midnight">
                    <span>🎟️ Coupon Code</span>
                    <span className="text-[9px] text-midnight/40 font-medium font-sans">Active: SOMNUS20, DEEPREST</span>
                  </div>
                  
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SOMNUS20"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 bg-white border border-[#11141a]/15 rounded-xl px-3 py-1.5 text-xs font-mono uppercase focus:outline-none focus:border-sand"
                    />
                    <button
                      type="submit"
                      className="bg-[#11141a] hover:bg-midnight/90 text-chalk px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition"
                    >
                      Apply
                    </button>
                  </form>

                  {appliedCoupon && (
                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2 text-[10px]">
                      <div className="flex items-center space-x-1.5 text-emerald-800 font-bold uppercase animate-fade-in">
                        <Check size={12} className="text-emerald-600" />
                        <span>Code '{appliedCoupon}' Active</span>
                      </div>
                      <button
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponDiscount(0);
                          setCouponType(null);
                          triggerNotification("Coupon code removed successfully.");
                        }}
                        className="text-red-600 hover:text-red-800 font-bold uppercase tracking-wider text-[9px]"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-midnight/70 font-semibold font-sans">
                  <span>Nocturnal Subtotal</span>
                  <span className="font-mono">${cartSubtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold font-sans">
                    <span>Discount Applied</span>
                    <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-midnight/70 font-semibold font-sans">
                  <span>Systemic Delivery fee</span>
                  <span className="font-mono text-emerald-600 uppercase font-bold">
                    {cartSubtotal === 0 
                      ? '$0.00' 
                      : (dynamicShippingCost === 0 ? 'FREE' : `$${dynamicShippingCost.toFixed(2)}`)}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-midnight pt-2 border-t border-midnight/5 text-sm font-sans">
                  <span>Grand Circadian Total</span>
                  <span className="font-mono">${finalCartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 bg-midnight/5 rounded-xl text-[10px] text-midnight/70 leading-normal flex items-start space-x-2 font-sans">
                <Info size={14} className="shrink-0 text-midnight mt-0.5" />
                <span>{themeConfig.cartProgressNote}</span>
              </div>

              <button
                onClick={() => {
                  if (cartSubtotal === 0) {
                    triggerNotification("Add items to initiate secure cart pipeline.");
                    return;
                  }
                  setCartOpen(false);
                  setCheckoutOpen(true);
                  triggerNotification("Synchronizing express payment credentials via Shopify Pay...");
                }}
                className="w-full bg-[#11141a] text-chalk hover:bg-midnight/95 font-extrabold py-4 rounded-2xl uppercase tracking-[2px] text-xs flex items-center justify-center space-x-2 border border-sand/40"
                id="drawer-checkout-btn"
              >
                <Lock size={13} className="text-sand shrink-0" />
                <span>Synchronize Secure Checkout</span>
              </button>

              <button 
                onClick={() => setCartOpen(false)}
                className="w-full py-2 text-center text-[10px] font-bold uppercase tracking-wider text-midnight/60 hover:text-midnight hover:underline block"
              >
                Continue Reading Science Studies
              </button>
            </div>

          </div>
        </div>
      )}

          </div> {/* Closing tag for simulatedDevice === 'mobile' scroll wrapper */}
          
          {simulatedDevice === 'mobile' && (
            /* Virtual home indicator element for luxury smartphone aesthetics */
            <div className="absolute bottom-1.5 inset-x-0 h-1 bg-midnight/35 rounded-full w-28 mx-auto z-40 pointer-events-none"></div>
          )}
          
        </div> {/* Closing tag for simulatedDevice === 'mobile' smartphone frame */}
      </div> {/* Closing tag for simulatedDevice === 'mobile' plinth container */}

      {/* Interactive Shopify Exporter Modal */}
      <ShopifyExporterModal 
        isOpen={shopifyExportOpen} 
        onClose={() => setShopifyExportOpen(false)} 
        themeConfig={themeConfig} 
      />

      {/* Interactive Mobile-Friendly Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={images}
        currentIndex={activeImageIndex}
        setCurrentIndex={setActiveImageIndex}
      />

      {/* Fully-Featured Interactive Shopify Checkout Page & Secure Payment Simulation */}
      <ShopifyCheckoutPage
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={cartItems}
        cartSubtotal={cartSubtotal}
        discountAmount={discountAmount}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={(code) => {
          // Sync with coupon codes
          if (code === 'SOMNUS20' || code === 'SHRINE20') {
            setAppliedCoupon(code);
            setCouponDiscount(20);
            setCouponType('percent');
            triggerNotification("PROMO CODE '20% OFF' applied successfully");
          } else if (code === 'SHRINE') {
            setAppliedCoupon(code);
            setCouponDiscount(0);
            setCouponType('shipping');
            triggerNotification("PROMO CODE 'FREE COLD SHIPPING' applied successfully");
          } else if (code === 'DEEPREST' || code === 'REST15') {
            setAppliedCoupon(code);
            setCouponDiscount(15);
            setCouponType('fixed');
            triggerNotification("PROMO CODE '$15 OFF' applied successfully");
          } else {
            triggerNotification("INVALID PROMO CODE. Try 'SOMNUS20' or 'DEEPREST'");
          }
        }}
        onRemoveCoupon={() => {
          setAppliedCoupon(null);
          setCouponDiscount(0);
          setCouponType(null);
          triggerNotification("Coupon code removed successfully.");
        }}
        shippingThreshold={themeConfig.freeShippingThreshold}
        triggerNotification={triggerNotification}
        clearCart={() => {
          setCartItems([]);
          setCartCount(0);
        }}
      />

    </div>
  );
}
