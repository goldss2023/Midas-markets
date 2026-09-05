import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, ArrowRight, ChevronDown, ChevronUp, Star, ArrowUp, Mail, 
  MessageCircle, Shield, MoreVertical, Check, ExternalLink, 
  Crown, Share2
} from 'lucide-react';
import { reviewsData as staticReviewsData } from './reviewsData';

const API = '/api';

// ─── Analytics helper ───
function trackClick(target: string) {
  fetch(`${API}/analytics/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      event_type: 'click', 
      event_target: target, 
      referrer: document.referrer, 
      user_agent: navigator.userAgent 
    })
  }).catch(() => {});
}

// ─── Default Verified Proofs (Ensures proofs always display reliably) ───
const DEFAULT_PROOFS = [
  {
    filename: "proof1.png",
    title: "XAUUSD (Gold) Precision Buy",
    subtitle: "150 Pips secured cleanly during NY session open.",
    badge: "+£8,240",
    isRed: false,
    details: "Price swept Asian session liquidity and tapped directly into a 15m order block. We executed on the shift in market structure with zero float and rode it into the 4H supply zone."
  },
  {
    filename: "proof2.png",
    title: "GBPUSD Institutional Sell",
    subtitle: "Flawless Wyckoff distribution schematic continuation.",
    badge: "+£4,100",
    isRed: false,
    details: "Identified a textbook Wyckoff distribution pattern on the 1H timeframe. Entered precisely after the UTAD confirmation. Clean drop straight into the daily liquidity imbalance."
  },
  {
    filename: "proof3.png",
    title: "EURUSD Liquidity Sweep Buy",
    subtitle: "Sniper entry executed on the 5m chart with zero drawdown.",
    badge: "+£6,500",
    isRed: false,
    details: "Euro had clear macro fundamental backing. We waited patiently for the retracement into the 50% equilibrium level aligning with a fair value gap. Clean 1:4.2 risk-to-reward."
  },
  {
    filename: "proof4.png",
    title: "XAUUSD Counter-Trend Scalp",
    subtitle: "Fast NY rejection taking 50 pips in under 12 minutes.",
    badge: "+£3,200",
    isRed: false,
    details: "Gold was heavily overextended into a daily resistance ceiling. We caught the sharp 50-pip pullback with tight 8-pip risk before the broader trend resumed."
  },
  {
    filename: "proof5.png",
    title: "USDJPY Daily Break & Retest",
    subtitle: "High timeframe structural break with massive RR.",
    badge: "+£9,800",
    isRed: false,
    details: "Classic institutional break and retest. Price broke through a major daily level, retraced perfectly to test it as support, and we rode the continuation for massive RR."
  },
  {
    filename: "photo_5904347879357222486_y.jpg",
    title: "Live Telegram Execution Proof",
    subtitle: "Verified trade call shared live inside the community.",
    badge: "+112 Pips",
    isRed: false,
    details: "Entry timestamp, stop loss, and multiple take profit targets provided in real time before the session opened."
  },
  {
    filename: "photo_5904347879357222487_y.jpg",
    title: "US30 Index Momentum Push",
    subtitle: "NY open volume surge hitting TP3 flawlessly.",
    badge: "+£5,420",
    isRed: false,
    details: "Indices swept pre-market highs, formed a clear change of character, and delivered a high-momentum selloff."
  },
  {
    filename: "photo_5904347879357222490_y.jpg",
    title: "Full Pre-Trade Analysis Breakdown",
    subtitle: "Complete institutional chart markup sent to VIP members.",
    badge: "VIP Setup",
    isRed: false,
    details: "Full chart markup highlighting the order block, liquidity pools, and invalidation levels before candles formed."
  }
];

// ─── Default FAQs ───
const DEFAULT_FAQS = [
  {
    question: "Why are the main Telegram signals completely free?",
    answer: "Most groups charge £150-£200/month upfront for vague signals. We share our trades completely free so you can verify our analysis, risk management, and win rate in real time on a demo or micro account before ever spending a single penny."
  },
  {
    question: "Which markets and currency pairs do you trade?",
    answer: "We focus on 20 major forex pairs with special emphasis on Gold (XAUUSD), GBPUSD, EURUSD, and USDJPY. We prioritize high-volume London and New York sessions."
  },
  {
    question: "What is your risk management strategy?",
    answer: "Every trade is sent with an exact entry price, an explicit stop loss, and staged take-profit targets. We typically risk 1% per trade with an average risk-to-reward ratio of 1:3.4."
  },
  {
    question: "What is the difference between Free Telegram and VIP?",
    answer: "The Free Telegram gives you select live trade calls and market updates. VIP gives you all 20 pair setups, full pre-trade chart markups, earlier entry alerts, direct 1-on-1 mentorship access, and daily live analysis."
  },
  {
    question: "How does the Account Management service work?",
    answer: "For traders who cannot watch charts all day, we execute trades directly on your personal broker or prop firm funded account. We handle all risk and execution, and split the net profits fairly at the end of each cycle."
  },
  {
    question: "Can I use any broker or prop firm?",
    answer: "Yes. Our signals and setups work across all major brokers (MetaTrader 4, MetaTrader 5, cTrader, TradingView) and all major prop firms (FTMO, FundedNext, The Funded Trader, etc.)."
  }
];

// ─── Proof Card ───
function ProofCard({ filename, title, subtitle, badge, isRed, details }: any) {
  const [expanded, setExpanded] = useState(false);
  const imgSrc = filename?.startsWith('http') ? filename : `/proofs/${filename}`;

  return (
    <div className="bg-[#0c0c0c]/95 border border-white/15 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col gap-4 group hover:border-[#d4af37]/50 shadow-2xl transition-all duration-300 backdrop-blur-md">
      <div className="w-full relative overflow-hidden rounded-xl bg-black border border-white/10 flex items-center justify-center min-h-[220px] max-h-[360px] p-2">
        <img 
          src={imgSrc} 
          alt={title} 
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/midas-logo.jpg'; }}
          className="w-full h-full max-h-[340px] object-contain opacity-95 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-300" 
          loading="lazy" 
        />
        {badge && (
          <div className={`absolute top-3 right-3 text-[12px] font-bold px-3 py-1 rounded-full border backdrop-blur-md shadow-md ${isRed ? 'bg-red-500/25 text-red-400 border-red-500/40' : 'bg-[#10B981]/25 text-[#10B981] border-[#10B981]/40'}`}>
            {badge}
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1">
        <h3 className="text-white text-[17px] sm:text-[18px] font-bold leading-snug font-inter">{title}</h3>
        <p className="text-zinc-200 text-[13px] sm:text-[14px] mt-1.5 font-inter font-medium leading-relaxed">{subtitle}</p>
        <div className="mt-auto pt-4">
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="text-[#d4af37] text-[13px] sm:text-[14px] font-semibold flex items-center gap-1.5 hover:text-[#f9e7b9] transition-colors focus:outline-none"
          >
            Read setup {expanded ? <ChevronUp className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${expanded ? 'grid-rows-[1fr] mt-3 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="text-[13px] sm:text-[14px] text-zinc-100 font-inter font-medium leading-relaxed bg-black/80 p-4 rounded-xl border border-white/15">{details}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`w-3.5 h-3.5 ${star <= rating ? 'fill-[#d4af37] text-[#d4af37]' : 'fill-transparent text-white/20'}`} />
      ))}
    </div>
  );
}

// ─── FAQ Accordion Item ───
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/15 last:border-b-0">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center py-5 text-left group">
        <span className="text-white font-inter font-bold text-[15px] sm:text-[16px] md:text-[17px] pr-4 group-hover:text-[#d4af37] transition-colors leading-snug">{question}</span>
        <ChevronDown className={`w-5 h-5 text-[#d4af37] shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="text-zinc-200 font-inter font-medium text-[14px] sm:text-[15px] leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Floating Navigation Dots (Desktop) ───
function FloatingNav({ 
  sections, 
  activeSection,
  onOpenVip,
  onOpenSocials
}: { 
  sections: { id: string; label: string }[]; 
  activeSection: string;
  onOpenVip: () => void;
  onOpenSocials: () => void;
}) {
  const [open, setOpen] = useState(false);
  
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };
  
  return (
    <div className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end gap-2">
      <button 
        onClick={() => setOpen(!open)} 
        className="w-11 h-11 rounded-full bg-black/90 border border-[#d4af37]/40 backdrop-blur-md flex items-center justify-center text-[#d4af37] hover:text-white hover:border-[#d4af37] transition-all shadow-xl" 
        aria-label="Navigation menu"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      <div className={`flex flex-col gap-2 transition-all duration-300 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
        {/* VIP Action Button in Menu */}
        <button 
          onClick={() => { setOpen(false); onOpenVip(); }} 
          className="group flex items-center gap-2.5 justify-end"
          title="VIP Membership"
        >
          <span className="text-[11px] font-inter font-bold text-black bg-gradient-to-r from-[#f9e7b9] to-[#d4af37] px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
            <Crown className="w-3 h-3 fill-black text-black" /> VIP Membership
          </span>
          <div className="w-3 h-3 rounded-full bg-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
        </button>

        {/* Social Media Action Button in Menu */}
        <button 
          onClick={() => { setOpen(false); onOpenSocials(); }} 
          className="group flex items-center gap-2.5 justify-end"
          title="Social Media"
        >
          <span className="text-[11px] font-inter font-bold text-white bg-black/90 border border-white/20 px-2.5 py-1 rounded-md shadow-md flex items-center gap-1 hover:text-[#d4af37]">
            <Share2 className="w-3 h-3 text-[#d4af37]" /> Social Media
          </span>
          <div className="w-3 h-3 rounded-full border-2 border-white/50" />
        </button>

        <div className="w-full h-[1px] bg-white/10 my-1" />

        {sections.map((s) => (
          <button key={s.id} onClick={() => scrollTo(s.id)} className="group flex items-center gap-2.5 justify-end" title={s.label}>
            <span className="text-[11px] font-inter font-semibold text-zinc-300 group-hover:text-[#d4af37] transition-colors bg-black/90 px-2.5 py-1 rounded-md backdrop-blur-md border border-white/15 whitespace-nowrap shadow-sm">
              {s.label}
            </span>
            <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${activeSection === s.id ? 'bg-[#d4af37] border-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.8)]' : 'bg-transparent border-white/40 group-hover:border-[#d4af37]'}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

const navSections = [
  { id: "hero", label: "Home" },
  { id: "proof-section", label: "Proof" },
  { id: "why-free", label: "Why Free?" },
  { id: "account-mgmt", label: "Acc. Mgmt" },
  { id: "reviews", label: "Reviews" },
  { id: "faq", label: "FAQ" },
  { id: "waitlist", label: "Waitlist" },
];

type ReviewTab = 'ALL' | 'POSITIVE' | 'NEGATIVE';

function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [vipModalOpen, setVipModalOpen] = useState(false);
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [showAllProofs, setShowAllProofs] = useState(false);
  
  // Dynamic Data States initialized with reliable fallbacks
  const [reviewsData, setReviewsData] = useState<any[]>(staticReviewsData);
  const [proofsData, setProofsData] = useState<any[]>(DEFAULT_PROOFS);
  const [faqsData, setFaqsData] = useState<any[]>(DEFAULT_FAQS);
  const [settings, setSettings] = useState<{ [key: string]: string }>({});
  
  // UI States
  const [reviewTab, setReviewTab] = useState<ReviewTab>('ALL');
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [suggestionName, setSuggestionName] = useState("");
  const [suggestionText, setSuggestionText] = useState("");
  const [suggestionStatus, setSuggestionStatus] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState("");

  // Collapsible Inquiry States
  const [mgmtInquiryOpen, setMgmtInquiryOpen] = useState(false);
  const [mgmtName, setMgmtName] = useState("");
  const [mgmtContact, setMgmtContact] = useState("");
  const [mgmtSize, setMgmtSize] = useState("$25,000 - $50,000");
  const [mgmtType, setMgmtType] = useState("Personal Broker Account");
  const [mgmtNotes, setMgmtNotes] = useState("");
  const [mgmtStatus, setMgmtStatus] = useState("");

  const [vipInquiryOpen, setVipInquiryOpen] = useState(false);
  const [vipInquiryName, setVipInquiryName] = useState("");
  const [vipInquiryContact, setVipInquiryContact] = useState("");
  const [vipInquiryMessage, setVipInquiryMessage] = useState("");
  const [vipInquiryStatus, setVipInquiryStatus] = useState("");

  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [navScrolled, setNavScrolled] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fallback data in case backend hasn't initialized yet
  const activeProofs = proofsData && proofsData.length > 0 ? proofsData : DEFAULT_PROOFS;
  const top4Proofs = activeProofs.slice(0, 4);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, [isMobile]);

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= 6.2) {
      // Loop only the glowing logo section (t=2.83s onwards) so the explosion never repeats
      videoRef.current.currentTime = 2.83;
      videoRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    // Fetch all dynamic data
    Promise.all([
      fetch(`${API}/reviews`).then(r => r.json()),
      fetch(`${API}/proofs`).then(r => r.json()),
      fetch(`${API}/faqs`).then(r => r.json()),
      fetch(`${API}/settings`).then(r => r.json())
    ]).then(([revData, prfData, faqData, setData]) => {
      if (revData.reviews) setReviewsData(revData.reviews);
      if (prfData.proofs) setProofsData(prfData.proofs);
      if (faqData.faqs) setFaqsData(faqData.faqs);
      
      const stgs: any = {};
      if (setData.settings) {
        setData.settings.forEach((s: any) => stgs[s.key] = s.value);
      }
      setSettings(stgs);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
      setNavScrolled(window.scrollY > 80);
      setIsScrolled(window.scrollY > 40);
      const sectionIds = navSections.map(s => s.id);
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.getBoundingClientRect().top <= 200) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    setMenuOpen(false);
    if (targetId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (targetId === 'vip') {
      setVipModalOpen(true);
      return;
    }
    if (targetId === 'socials') {
      setSocialModalOpen(true);
      return;
    }
    if (targetId === 'proof-all' || targetId === 'proof-section') setShowAllProofs(true);
    setTimeout(() => {
      const element = document.getElementById(targetId === 'proof-all' ? 'proof-section' : targetId);
      if (element) {
        // Offset for sticky header
        const y = element.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  const navLinks = [
    { name: "Proof", href: "#proof-section", id: "proof-section" },
    { name: "Account Mgmt", href: "#account-mgmt", id: "account-mgmt" },
    { name: "Reviews", href: "#reviews", id: "reviews" },
    { name: "FAQ", href: "#faq", id: "faq" },
    { name: "Socials", href: "#socials", id: "socials" },
    { name: "VIP", href: "#vip", id: "vip" },
  ];

  const telegramLink = "https://t.me/MidasMarketsai";
  const tiktokLink = "https://www.tiktok.com/@midasmarketsai?_r=1&_t=ZG-97Wu9CP9KJl";
  const instagramLink = "https://www.instagram.com/midasmarketsai";
  const twitterLink = "https://x.com/midasmarketsai";

  const filteredReviews = useMemo(() => {
    if (reviewTab === 'POSITIVE') return reviewsData.filter(r => r.type === 'POSITIVE' || r.stars === 5);
    if (reviewTab === 'NEGATIVE') return reviewsData.filter(r => r.type === 'NEGATIVE' || r.stars <= 4);
    return reviewsData;
  }, [reviewTab, reviewsData]);

  const displayedReviews = reviewsExpanded ? filteredReviews : filteredReviews.slice(0, 12);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('reviewName') as HTMLInputElement).value;
    const text = (form.elements.namedItem('reviewText') as HTMLTextAreaElement).value;
    const stars = parseInt((form.elements.namedItem('reviewStars') as HTMLSelectElement).value);
    try {
      await fetch(`${API}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, text, stars, type: stars >= 4 ? 'POSITIVE' : 'NEGATIVE' }) });
      alert('Review submitted! It is now pending admin approval.');
      setShowReviewForm(false);
    } catch { alert('Failed to submit. Please try again.'); }
  };

  const submitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestionStatus("Sending...");
    try {
      await fetch(`${API}/suggestions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: suggestionName, text: suggestionText }) });
      setSuggestionStatus("Sent! Thank you."); setSuggestionName(""); setSuggestionText("");
      setTimeout(() => setSuggestionStatus(""), 3000);
    } catch { setSuggestionStatus("Error sending."); }
  };

  const submitWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaitlistStatus("Joining...");
    try {
      const res = await fetch(`${API}/emails`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: waitlistEmail, name: waitlistName }) });
      const data = await res.json();
      if (res.ok) { setWaitlistStatus("You're in! Check your email."); setWaitlistEmail(""); setWaitlistName(""); }
      else { setWaitlistStatus(data.error || "Something went wrong."); }
      setTimeout(() => setWaitlistStatus(""), 4000);
    } catch { setWaitlistStatus("Network error. Try again."); }
  };

  const submitMgmtInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setMgmtStatus("Submitting application...");
    try {
      const summaryText = `[Account Mgmt Inquiry]\nName: ${mgmtName}\nContact: ${mgmtContact}\nAccount Size: ${mgmtSize}\nAccount Type: ${mgmtType}\nNotes: ${mgmtNotes}`;
      await fetch(`${API}/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `[MGMT] ${mgmtName}`, text: summaryText })
      });
      setMgmtStatus("Application received! We will reach out promptly.");
      setTimeout(() => {
        setMgmtStatus("");
        setMgmtInquiryOpen(false);
      }, 3500);
    } catch {
      setMgmtStatus("Failed to submit. Please contact us directly on Telegram.");
    }
  };

  const submitVipInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setVipInquiryStatus("Sending inquiry...");
    try {
      const summaryText = `[VIP Inquiry]\nName: ${vipInquiryName}\nContact: ${vipInquiryContact}\nQuestion: ${vipInquiryMessage}`;
      await fetch(`${API}/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `[VIP] ${vipInquiryName}`, text: summaryText })
      });
      setVipInquiryStatus("Inquiry sent! We will reply promptly.");
      setTimeout(() => {
        setVipInquiryStatus("");
        setVipInquiryOpen(false);
      }, 3500);
    } catch {
      setVipInquiryStatus("Error submitting. Please message us on Telegram.");
    }
  };

  const handleTrackedLink = useCallback((target: string, url: string) => {
    trackClick(target);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-[#050505] text-white selection:bg-[#d4af37]/30 pb-20 md:pb-0">
      
      {/* ─── Background Video ─── */}
      {/* Drastically reduced scroll opacity to ~15% on mobile and ~10% on desktop so text is 100% readable */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <video 
          ref={videoRef}
          src={isMobile ? "/bg-video-mobile.mp4" : "/bg-video.mp4"}
          poster="/bg-poster.webp"
          preload="auto"
          autoPlay 
          muted 
          playsInline 
          onTimeUpdate={handleVideoTimeUpdate}
          onEnded={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = 2.83;
              videoRef.current.play().catch(() => {});
            }
          }}
          className={`w-full h-full object-cover md:scale-115 mix-blend-screen pointer-events-none transition-opacity duration-700 ease-in-out ${isScrolled ? 'opacity-15 md:opacity-10' : 'opacity-100 md:opacity-35'}`} 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] bg-[#d4af37]/10 rounded-full blur-[160px] pointer-events-none"></div>
      </div>

      {/* Floating Section Navigation (Desktop only) */}
      <div className="hidden md:block">
        <FloatingNav 
          sections={navSections} 
          activeSection={activeSection}
          onOpenVip={() => setVipModalOpen(true)}
          onOpenSocials={() => setSocialModalOpen(true)}
        />
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-40 w-12 h-12 rounded-full bg-[#d4af37] text-black flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-110 transition-transform"
          style={{ animation: 'slideUp 0.3s ease-out' }}
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Sticky Mobile CTA */}
      <div className={`fixed bottom-0 left-0 w-full z-40 bg-[#050505]/95 backdrop-blur-md border-t border-white/10 p-4 md:hidden transition-all duration-300 ${isScrolled ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
         <button onClick={() => handleTrackedLink('telegram_mobile_sticky', telegramLink)} className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-[#f9e7b9] to-[#d4af37] text-black text-[15px] font-bold rounded-full py-3.5 shadow-[0_0_20px_rgba(212,175,55,0.3)] btn-sheen">
            Join Telegram Free <ArrowRight className="w-4 h-4" />
         </button>
      </div>

      {/* Scarcity Banner */}
      {settings.scarcity_banner_active === 'true' && (
        <div className="w-full bg-[#d4af37] text-black text-center py-2 px-4 text-[12px] sm:text-[13px] font-bold font-inter z-50 relative tracking-wide uppercase shadow-[0_0_15px_rgba(212,175,55,0.3)]">
          {settings.scarcity_banner_text}
        </div>
      )}

      {/* ─── NAVBAR ─── */}
      <nav className={`fixed w-full z-30 transition-all duration-300 ${navScrolled ? 'bg-[#050505]/90 backdrop-blur-lg border-b border-white/5 py-2' : 'py-4'} ${settings.scarcity_banner_active === 'true' ? 'top-8' : 'top-0'}`}>
        <div className="flex justify-between items-center px-4 sm:px-6 md:px-12 max-w-[1400px] mx-auto">
          {/* Logo — clicks to home */}
          <button onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center group cursor-pointer relative" aria-label="Go to homepage">
            <div className="absolute inset-[-8px] w-[56px] h-[56px] md:w-[64px] md:h-[64px] rounded-full overflow-visible pointer-events-none" style={{ animation: 'pulseGlow 3s ease-in-out infinite' }}>
              <svg viewBox="0 0 100 100" className="w-full h-full" style={{ animation: 'spin 6s linear infinite' }}>
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="2" />
                <circle cx="50" cy="50" r="46" fill="none" stroke="url(#goldGrad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="290" strokeDashoffset="200" style={{ animation: 'liquidLoad 3s ease-in-out infinite alternate' }} />
                <defs><linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#f9e7b9" /><stop offset="100%" stopColor="#d4af37" /></linearGradient></defs>
              </svg>
            </div>
            <div className="relative z-10 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black border border-[#d4af37]/40 overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.5)]">
              <img src="/midas-logo.jpg" alt="Midas Markets" className="w-6 h-6 md:w-8 md:h-8 object-contain" />
            </div>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-7">
              {navLinks.map((link) => (
                <button 
                  key={link.name} 
                  onClick={(e) => handleNavClick(e, link.id)} 
                  className={`font-inter text-[13px] font-semibold transition-colors ${link.id === 'vip' ? 'text-[#d4af37] hover:text-[#f9e7b9] flex items-center gap-1 border border-[#d4af37]/40 bg-[#d4af37]/10 px-3 py-1 rounded-full' : 'text-zinc-200 hover:text-[#f9e7b9]'}`}
                >
                  {link.id === 'vip' && <Crown className="w-3.5 h-3.5 fill-[#d4af37]" />}
                  {link.name}
                </button>
              ))}
            </div>
            <button onClick={() => handleTrackedLink('telegram_nav', telegramLink)} className="flex items-center justify-center bg-gradient-to-r from-[#f9e7b9] to-[#d4af37] text-black font-bold rounded-full px-6 py-2 text-[13px] transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] btn-sheen">
              Join Telegram
            </button>
          </div>

          {/* Mobile Three Dots Menu Trigger */}
          <button 
            className="flex md:hidden items-center justify-center w-10 h-10 rounded-full bg-black/80 border border-[#d4af37]/40 text-[#d4af37] hover:text-white hover:border-[#d4af37] transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)]" 
            onClick={() => setMenuOpen(true)} 
            aria-label="Open menu"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* ─── MOBILE MENU DRAWER (Accessed via the Three Dots) ─── */}
      <div className={`fixed inset-0 z-50 bg-[#050505]/98 backdrop-blur-xl transition-all duration-500 flex flex-col ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="flex justify-between items-center px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black border border-[#d4af37]/40 overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <img src="/midas-logo.jpg" alt="Midas Markets" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-playfair font-bold text-lg text-white">Midas Markets</span>
          </div>
          <button onClick={() => setMenuOpen(false)} className="p-2 text-zinc-300 hover:text-white" aria-label="Close menu">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 space-y-4 overflow-y-auto py-6">
          
          {/* Highlighted VIP Access Button */}
          <button
            onClick={() => { setMenuOpen(false); setVipModalOpen(true); }}
            className="w-full text-left bg-gradient-to-r from-[#d4af37]/20 via-[#f9e7b9]/15 to-transparent border border-[#d4af37]/50 rounded-2xl p-4 flex items-center justify-between group hover:border-[#d4af37] transition-all shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#d4af37] flex items-center justify-center text-black font-black shadow-md">
                <Crown className="w-5 h-5 fill-black" />
              </div>
              <div>
                <div className="font-playfair font-black text-xl text-white group-hover:text-[#f9e7b9] transition-colors">VIP Membership</div>
                <div className="text-[12px] text-zinc-300 font-inter font-medium">Includes setups, private access & TikTok breakdowns</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#d4af37]" />
          </button>

          {/* Highlighted Social Media Hub */}
          <button
            onClick={() => { setMenuOpen(false); setSocialModalOpen(true); }}
            className="w-full text-left bg-black/60 border border-white/15 rounded-2xl p-4 flex items-center justify-between group hover:border-[#d4af37]/50 transition-all shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#d4af37]">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-playfair font-black text-xl text-white group-hover:text-[#d4af37] transition-colors">Social Media</div>
                <div className="text-[12px] text-zinc-300 font-inter font-medium">TikTok, Instagram, Twitter & Telegram</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white" />
          </button>

          {/* Standard Navigation Links */}
          <div className="flex flex-col space-y-3 pt-2">
            {[
              { name: "Verified Proof", id: "proof-section" },
              { name: "Account Management", id: "account-mgmt" },
              { name: "Member Reviews", id: "reviews" },
              { name: "FAQ", id: "faq" },
            ].map((link) => (
              <button
                key={link.id}
                onClick={(e) => handleNavClick(e, link.id)}
                className="font-playfair font-bold text-2xl text-left text-zinc-200 hover:text-[#d4af37] transition-colors py-1 flex items-center justify-between"
              >
                <span>{link.name}</span>
                <ChevronDown className="w-4 h-4 text-zinc-500 -rotate-90" />
              </button>
            ))}
          </div>

          {/* Join Telegram CTA */}
          <div className="pt-4">
            <button
              onClick={() => { setMenuOpen(false); handleTrackedLink('telegram_menu', telegramLink); }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#f9e7b9] to-[#d4af37] text-black font-bold text-base rounded-full py-4 shadow-[0_0_25px_rgba(212,175,55,0.3)] btn-sheen"
            >
              Join Free Telegram <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Social Media Direct Icons */}
          <div className="pt-2 flex items-center justify-center gap-4 text-zinc-400 text-xs font-inter font-semibold">
            <button onClick={() => handleTrackedLink('menu_quick_tiktok', tiktokLink)} className="hover:text-white flex items-center gap-1">TikTok</button>
            <span>&middot;</span>
            <button onClick={() => handleTrackedLink('menu_quick_ig', instagramLink)} className="hover:text-white flex items-center gap-1">Instagram</button>
            <span>&middot;</span>
            <button onClick={() => handleTrackedLink('menu_quick_x', twitterLink)} className="hover:text-white flex items-center gap-1">Twitter/X</button>
          </div>

        </div>
      </div>

      {/* ─── VIP MODAL / DRAWER (Found via the Three Dots) ─── */}
      {vipModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setVipModalOpen(false); }}>
          <div className="bg-[#0c0c0c] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-10 max-w-3xl w-full relative max-h-[92vh] overflow-y-auto shadow-2xl">
            <button 
              onClick={() => setVipModalOpen(false)} 
              className="absolute top-5 right-5 text-zinc-400 hover:text-white bg-white/5 p-2 rounded-full border border-white/10"
              aria-label="Close VIP modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 text-[#d4af37] text-xs uppercase font-bold tracking-widest mb-2">
              <Crown className="w-4 h-4 fill-[#d4af37]" /> Exclusive VIP Access
            </div>
            <h2 className="font-playfair text-[28px] sm:text-[40px] font-black text-white leading-tight mb-3">
              Midas VIP &mdash; The Unfair Advantage
            </h2>
            <p className="text-[15px] sm:text-[18px] text-[#f9e7b9] font-playfair font-bold mb-4">
              95% of VIP members make back their membership fee from a single VIP setup.
            </p>
            <p className="text-zinc-200 font-inter font-medium text-[14px] sm:text-[15px] leading-relaxed mb-6">
              The free group is already better than most paid services. VIP is on a different level entirely. This is where the real edge lives &mdash; earlier alerts, deeper analysis, and direct personal access to the trader behind every setup.
            </p>

            {/* What you get */}
            <div className="bg-black/60 border border-white/10 rounded-2xl p-5 mb-6">
              <h3 className="text-base sm:text-lg font-bold font-playfair text-white mb-3">What You Get in VIP:</h3>
              <ul className="flex flex-col gap-3">
                {[
                  "Every single one of the 20 forex pair setups sent to you before anyone else — first in, best positioned.",
                  "Full pre-trade analysis on every setup so you know exactly what to look for before candles form.",
                  "Direct personal access — message the lead trader directly and get real-time sizing & account growth advice.",
                  "More setups daily than the free group — dedicated to members who trade seriously.",
                  "Exclusive VIP-only setups that never get posted anywhere else.",
                  "Personal account growth guidance — build your account step by step, not just copy trades."
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-zinc-100 font-inter font-medium text-[13px] sm:text-[14px] leading-relaxed">
                    <Check className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* VIP Pricing Options */}
            <h3 className="text-base sm:text-lg font-bold font-playfair text-white mb-3">Choose Your Membership:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-[#141414] border border-white/15 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-white font-bold text-base">Monthly</h4>
                  <div className="text-[#d4af37] font-black text-2xl mt-1">£50<span className="text-xs font-normal text-zinc-300">/mo</span></div>
                  <p className="text-zinc-300 text-xs mt-1">Full VIP access, cancel any time.</p>
                </div>
                <button onClick={() => handleTrackedLink('vip_monthly_modal', 'https://buy.stripe.com/6oU6oAgLQd2xasfgCufAc03')} className="mt-4 w-full bg-white text-black font-bold text-xs py-2.5 rounded-full hover:bg-zinc-200 transition-colors text-center">
                  Join Monthly
                </button>
              </div>

              <div className="bg-gradient-to-br from-[#d4af37]/25 to-black border border-[#d4af37] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden shadow-lg">
                <div className="absolute top-2 right-2 text-[9px] bg-[#d4af37] text-black font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  Discounted
                </div>
                <div>
                  <h4 className="text-white font-bold text-base">6 Months</h4>
                  <div className="text-[#f9e7b9] font-black text-2xl mt-1">£240<span className="text-xs font-normal text-zinc-300"> (£40/mo)</span></div>
                  <p className="text-zinc-200 text-xs mt-1">Save £60 with 6-month commitment.</p>
                </div>
                <button onClick={() => handleTrackedLink('vip_6month_modal', 'https://buy.stripe.com/8x2dR29jobYt7g3eumfAc04')} className="mt-4 w-full bg-[#d4af37] text-black font-bold text-xs py-2.5 rounded-full hover:bg-[#f9e7b9] transition-colors text-center btn-sheen">
                  Join 6 Months
                </button>
              </div>

              <div className="bg-[#141414] border border-white/15 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-white font-bold text-base">12 Months</h4>
                  <div className="text-[#d4af37] font-black text-2xl mt-1">£450<span className="text-xs font-normal text-zinc-300"> (£37.5/mo)</span></div>
                  <p className="text-zinc-300 text-xs mt-1">Best value for full year access.</p>
                </div>
                <button onClick={() => handleTrackedLink('vip_12month_modal', 'https://buy.stripe.com/6oU3co1QW9Ql57V2LEfAc06')} className="mt-4 w-full bg-white text-black font-bold text-xs py-2.5 rounded-full hover:bg-zinc-200 transition-colors text-center">
                  Join 12 Months
                </button>
              </div>
            </div>

            {/* Crypto Payment Option */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left">
                <span className="text-white font-bold text-sm block">Prefer paying with Crypto (USDT / BTC)?</span>
                <span className="text-zinc-300 text-xs">Direct instant activation via Telegram confirmation.</span>
              </div>
              <button onClick={() => handleTrackedLink('crypto_modal', telegramLink)} className="border border-[#d4af37]/60 text-[#f9e7b9] font-bold text-xs px-5 py-2 rounded-full hover:bg-[#d4af37]/10 transition-colors whitespace-nowrap">
                Pay with Crypto &rarr;
              </button>
            </div>

            {/* VIP Chart Example Previews */}
            <div className="bg-black/80 border border-white/10 rounded-2xl p-5 mb-6">
              <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-[#d4af37] fill-[#d4af37]" /> Example VIP Analysis Chart
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <img src="/proofs/photo_5904347879357222490_y.jpg" alt="VIP Markup" className="w-full h-[160px] object-cover rounded-xl border border-white/10" />
                <img src="/proofs/photo_5904347879357222501_y.jpg" alt="VIP Alert" className="w-full h-[160px] object-cover rounded-xl border border-white/10" />
              </div>
            </div>

            {/* ─── TIKTOK INTEGRATION INSIDE VIP ─── */}
            <div className="bg-gradient-to-br from-blue-950/40 via-black to-black border border-blue-500/30 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-full sm:w-2/3">
                <div className="text-blue-400 font-bold uppercase text-[11px] tracking-widest mb-1 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" /> Official TikTok Channel
                </div>
                <h4 className="text-white font-playfair font-bold text-xl mb-2">Watch Our Analysis Live on TikTok</h4>
                <p className="text-zinc-200 font-inter font-medium text-xs sm:text-sm leading-relaxed mb-4">
                  We don't just post entries &mdash; we break down order blocks, liquidity sweeps, and trade logic live before the session. Follow <strong className="text-white">@midasmarketsai</strong>.
                </p>
                <button 
                  onClick={() => handleTrackedLink('vip_tiktok_cta', tiktokLink)}
                  className="bg-white text-black font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full hover:bg-zinc-200 transition-colors inline-flex items-center gap-2"
                >
                  Follow @midasmarketsai <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="w-full sm:w-1/3 flex justify-center">
                <img src="/tiktok.jpg" alt="TikTok Profile" className="w-28 sm:w-32 rounded-xl border border-white/20 shadow-lg object-contain" />
              </div>
            </div>

            {/* Collapsible VIP Inquiry Box */}
            <div className="border-t border-white/10 pt-4">
              <button 
                onClick={() => setVipInquiryOpen(!vipInquiryOpen)}
                className="w-full text-left text-zinc-300 hover:text-white text-sm font-semibold flex items-center justify-between py-2"
              >
                <span>Have a question about VIP before joining?</span>
                <span className="text-[#d4af37] text-xs flex items-center gap-1">
                  {vipInquiryOpen ? 'Close inquiry' : 'Ask question'} {vipInquiryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
              </button>

              {vipInquiryOpen && (
                <form onSubmit={submitVipInquiry} className="mt-4 flex flex-col gap-3 bg-black/60 p-4 rounded-xl border border-white/10 animate-fade-in">
                  <input 
                    required 
                    type="text" 
                    value={vipInquiryName} 
                    onChange={(e) => setVipInquiryName(e.target.value)} 
                    placeholder="Your Name" 
                    className="bg-black border border-white/20 rounded-lg p-2.5 text-white text-xs font-medium placeholder:text-zinc-400" 
                  />
                  <input 
                    required 
                    type="text" 
                    value={vipInquiryContact} 
                    onChange={(e) => setVipInquiryContact(e.target.value)} 
                    placeholder="Telegram Username or Email" 
                    className="bg-black border border-white/20 rounded-lg p-2.5 text-white text-xs font-medium placeholder:text-zinc-400" 
                  />
                  <textarea 
                    required 
                    rows={3} 
                    value={vipInquiryMessage} 
                    onChange={(e) => setVipInquiryMessage(e.target.value)} 
                    placeholder="Your question about VIP..." 
                    className="bg-black border border-white/20 rounded-lg p-2.5 text-white text-xs font-medium placeholder:text-zinc-400 resize-none" 
                  />
                  <div className="flex items-center justify-between">
                    <button type="submit" className="bg-[#d4af37] text-black font-bold text-xs px-5 py-2 rounded-lg hover:bg-[#f9e7b9] transition-colors">
                      Send VIP Inquiry
                    </button>
                    {vipInquiryStatus && <span className="text-[#10b981] text-xs font-bold font-inter">{vipInquiryStatus}</span>}
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ─── SOCIAL MEDIA MODAL (Found via the Three Dots) ─── */}
      {socialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) setSocialModalOpen(false); }}>
          <div className="bg-[#0c0c0c] border border-white/20 rounded-3xl p-6 sm:p-8 max-w-xl w-full relative shadow-2xl">
            <button 
              onClick={() => setSocialModalOpen(false)} 
              className="absolute top-5 right-5 text-zinc-400 hover:text-white bg-white/5 p-2 rounded-full border border-white/10"
              aria-label="Close social modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#d4af37] text-xs uppercase font-bold tracking-widest mb-2">
              <Share2 className="w-4 h-4" /> Official Social Channels
            </div>
            <h2 className="font-playfair text-[26px] sm:text-[34px] font-black text-white leading-tight mb-2">
              Connect With Midas
            </h2>
            <p className="text-zinc-200 font-inter font-medium text-xs sm:text-sm leading-relaxed mb-6">
              Follow our official verified channels. Beware of impersonator accounts &mdash; all real updates and trade setups are shared exclusively here.
            </p>

            <div className="flex flex-col gap-3.5">
              {/* TikTok */}
              <div className="bg-black/60 border border-white/15 rounded-2xl p-4 flex items-center justify-between hover:border-[#d4af37]/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                    TT
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm sm:text-base">TikTok</h4>
                    <p className="text-zinc-300 text-xs font-medium">@midasmarketsai &middot; Daily chart breakdowns</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleTrackedLink('social_tiktok', tiktokLink)}
                  className="bg-white text-black font-bold text-xs px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors"
                >
                  Follow &rarr;
                </button>
              </div>

              {/* Instagram */}
              <div className="bg-black/60 border border-white/15 rounded-2xl p-4 flex items-center justify-between hover:border-[#d4af37]/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center font-bold text-sm">
                    IG
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm sm:text-base">Instagram</h4>
                    <p className="text-zinc-300 text-xs font-medium">@midasmarketsai &middot; Stories, recaps & setups</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleTrackedLink('social_instagram', instagramLink)}
                  className="bg-white text-black font-bold text-xs px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors"
                >
                  Follow &rarr;
                </button>
              </div>

              {/* Twitter / X */}
              <div className="bg-black/60 border border-white/15 rounded-2xl p-4 flex items-center justify-between hover:border-[#d4af37]/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-sm">
                    X
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm sm:text-base">Twitter / X</h4>
                    <p className="text-zinc-300 text-xs font-medium">@midasmarketsai &middot; Real-time macro updates</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleTrackedLink('social_twitter', twitterLink)}
                  className="bg-white text-black font-bold text-xs px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors"
                >
                  Follow &rarr;
                </button>
              </div>

              {/* Telegram */}
              <div className="bg-gradient-to-r from-[#d4af37]/20 to-black border border-[#d4af37]/60 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#d4af37] text-black flex items-center justify-center font-black text-sm">
                    TG
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm sm:text-base flex items-center gap-1.5">
                      Telegram <span className="text-[10px] bg-[#d4af37] text-black px-1.5 py-0.2 rounded font-bold">1,400+ Members</span>
                    </h4>
                    <p className="text-zinc-200 text-xs font-medium">Free trade calls & real-time executions</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleTrackedLink('social_telegram', telegramLink)}
                  className="bg-[#d4af37] text-black font-bold text-xs px-4 py-2 rounded-full hover:bg-[#f9e7b9] transition-colors btn-sheen"
                >
                  Join Free &rarr;
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <main className={`relative z-10 flex flex-col items-center min-h-screen px-4 sm:px-6 md:px-12 ${settings.scarcity_banner_active === 'true' ? 'pt-[140px] sm:pt-[160px]' : 'pt-[100px] sm:pt-[120px]'} pb-0 max-w-[1400px] mx-auto`}>
        
        {/* Mobile Initial Viewport Spacer: Initial load shows only the logo video animation & top navigation */}
        <div className="md:hidden w-full min-h-[calc(100dvh-130px)] flex flex-col items-center justify-end pb-8 pointer-events-none select-none">
          <div className="flex flex-col items-center gap-2 text-white/70 animate-bounce">
            <span className="text-[11px] uppercase tracking-[0.25em] font-inter font-bold text-[#f9e7b9]">Scroll to explore</span>
            <ChevronDown className="w-4 h-4 text-[#d4af37]" />
          </div>
        </div>

        {/* ═══ HERO ═══ */}
        <div id="hero" className="w-full flex flex-col items-start max-w-[940px] scroll-mt-32">
          <div className="flex items-center gap-2 border border-[#4A3E1E] rounded-full px-3.5 py-1.5 bg-black/60 text-[12px] sm:text-[13px] text-white font-semibold mb-4 sm:mb-6">
            <div className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.9)]"></div>
            Live signals &middot; 1,400+ traders inside
          </div>

          <h1 className="font-playfair font-normal text-white leading-[1.14] sm:leading-[1.08] tracking-[-0.01em]" style={{ fontSize: 'clamp(42px, 8.5vw, 92px)' }}>
            Turn Market Liquidity <br className="hidden sm:inline" />
            Into <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#f9e7b9] via-[#d4af37] to-[#8c6b12]">Pure Gold.</span>
          </h1>

          {/* Bold, high-contrast text separated by large editorial gap */}
          <p className="mt-16 sm:mt-24 md:mt-28 text-[17px] sm:text-[21px] leading-[1.65] text-white max-w-[720px] font-inter font-semibold">
            We trade 20 forex pairs including gold. Clean analysis. Elite risk-to-reward. <span className="text-[#f9e7b9] font-bold">4 weeks straight without a stop loss.</span>
          </p>

          <p className="mt-4 sm:mt-6 text-[15px] sm:text-[17px] leading-[1.75] text-zinc-100 max-w-[680px] font-inter font-medium">
            Midas Markets is a live trading operation you get to watch in real time. Every day we post full chart breakdowns, show exactly why we enter, and share verified proof. No guessing. No recycled ideas. Just clean trades that print.
            <br/><br/>
            <strong className="text-white font-bold">Do we occasionally hit stop loss? Yes.</strong> Every real trader does. But we always recover &mdash; tighter, faster, and more precise than before. That is the journey.
          </p>

          {/* Desktop CTA Row */}
          <div className="mt-8 sm:mt-10 hidden md:flex flex-col items-start gap-2.5">
            <div className="flex gap-4 flex-wrap items-center">
              <button onClick={() => handleTrackedLink('telegram_hero_cta', telegramLink)} className="flex items-center gap-2 bg-gradient-to-br from-[#f9e7b9] to-[#d4af37] text-black text-[15px] font-bold rounded-full px-7 py-3.5 hover:scale-105 transition-transform btn-sheen shadow-lg">
                Join Free &mdash; Steal the Signals <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => setSocialModalOpen(true)} className="flex items-center justify-center border border-white/30 text-white text-[15px] font-semibold rounded-full px-6 py-3.5 hover:bg-white/10 transition-colors">
                View Official Socials
              </button>
            </div>
            <span className="text-[12px] sm:text-[13px] text-zinc-300 font-semibold tracking-[0.03em] mt-1 font-inter">4 weeks. 20 pairs. Zero stop losses hit. Come see why.</span>
          </div>
          
          {/* Mobile CTA */}
          <div className="mt-6 md:hidden w-full flex flex-col gap-3">
             <button onClick={() => handleTrackedLink('telegram_hero_mobile', telegramLink)} className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-[#f9e7b9] to-[#d4af37] text-black text-[15px] font-bold rounded-full px-5 py-3.5 btn-sheen shadow-lg">
                Join Free on Telegram <ArrowRight className="w-4 h-4" />
             </button>
             <button onClick={() => setSocialModalOpen(true)} className="w-full flex items-center justify-center border border-white/20 text-white text-[14px] font-semibold rounded-full px-5 py-3 hover:bg-white/5 transition-colors">
                Official Social Media Hub
             </button>
          </div>

          {/* Stats Bar */}
          <div className="mt-10 sm:mt-14 flex gap-4 sm:gap-12 flex-wrap w-full bg-black/40 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
            {[
              { val: "1,400+", label: "Members" },
              { val: "20", label: "Pairs Traded" },
              { val: "1:3.4", label: "Avg RR" },
            ].map(s => (
              <div key={s.label} className="flex flex-col flex-1 min-w-[28%]">
                <div className="font-playfair text-[26px] sm:text-[32px] font-extrabold leading-[1] text-transparent bg-clip-text bg-gradient-to-br from-[#f9e7b9] to-[#d4af37]">{s.val}</div>
                <div className="text-[11px] sm:text-[12px] tracking-[0.15em] uppercase text-zinc-200 font-bold mt-2 font-inter">{s.label}</div>
              </div>
            ))}
            <div className="flex flex-col flex-1 min-w-[28%]">
              <div className="font-playfair text-[26px] sm:text-[32px] font-extrabold leading-[1] text-transparent bg-clip-text bg-gradient-to-br from-[#f9e7b9] to-[#d4af37] flex items-center gap-1">
                4.5 <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-[#d4af37] text-[#d4af37]" />
              </div>
              <div className="text-[11px] sm:text-[12px] tracking-[0.15em] uppercase text-zinc-200 font-bold mt-2 font-inter">Rating</div>
            </div>
          </div>
        </div>

        {/* ═══ PROOF SECTION (Spacious, Separated, Uncrowded) ═══ */}
        <div id="proof-section" className="mt-20 sm:mt-32 w-full max-w-[1200px] scroll-mt-24 sm:scroll-mt-32">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10 gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-[12px] text-[#d4af37] font-bold uppercase tracking-widest block mb-1">Live Executions</span>
              <h2 className="font-playfair text-[28px] sm:text-[36px] font-bold text-white m-0">Latest Verified Trades</h2>
            </div>
            <button 
              onClick={() => setShowAllProofs(!showAllProofs)} 
              className="text-[#d4af37] text-[13px] sm:text-[15px] font-bold hover:text-[#f9e7b9] flex items-center gap-1.5 transition-colors"
            >
              {showAllProofs ? "Show fewer trades" : `View all ${activeProofs.length} verified trades`} <ArrowRight className={`w-4 h-4 transition-transform ${showAllProofs ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {/* Spacious, separated grid: 1 column on mobile, 2 columns on desktop so cards are large and never squished */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-8">
            {(showAllProofs ? activeProofs : top4Proofs).map((proof, i) => (
              <ProofCard key={i} {...proof} />
            ))}
          </div>

          {!showAllProofs && activeProofs.length > 4 && (
            <div className="flex justify-center mt-10">
              <button 
                onClick={() => setShowAllProofs(true)} 
                className="flex items-center gap-2 border border-[#d4af37]/50 bg-black/80 hover:bg-[#d4af37]/10 text-[#d4af37] px-8 py-3 rounded-full text-[14px] font-bold transition-all shadow-md"
              >
                View Full Trade Archive ({activeProofs.length} setups) <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ═══ WHY FREE ═══ */}
        <div id="why-free" className="mt-20 sm:mt-32 w-full flex flex-col items-center justify-center text-center py-12 sm:py-20 relative border-t border-white/10 scroll-mt-24 sm:scroll-mt-32">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <img src="/midas-logo.jpg" alt="" className="w-full max-w-[600px] object-contain rounded-full" />
          </div>
          <p className="text-[12px] sm:text-[13px] text-[#d4af37] tracking-[0.2em] uppercase font-inter font-bold mb-3 sm:mb-4 relative z-10">NO CATCH</p>
          <h2 className="font-playfair text-[32px] sm:text-[54px] font-black text-white leading-tight max-w-[800px] relative z-10 px-4">Why Is It <span className="text-[#d4af37]">Free?</span></h2>
          <p className="text-[17px] sm:text-[24px] text-[#f9e7b9] font-playfair font-bold mt-3 sm:mt-4 mb-5 sm:mb-8 relative z-10 px-4">You are not buying signals. You are stealing them.</p>
          <p className="text-zinc-100 font-inter font-medium text-[15px] sm:text-[17px] leading-relaxed max-w-[660px] mx-auto relative z-10 px-4">Most groups charge £200 a month for vague entries. We give ours away free because the Telegram is how we prove we are the real thing &mdash; before you ever spend a penny. Watch the trades. Watch the results. Then decide.</p>
          <button onClick={() => handleTrackedLink('telegram_why_free', telegramLink)} className="mt-8 flex items-center gap-2 bg-gradient-to-br from-[#f9e7b9] to-[#d4af37] text-black text-[15px] sm:text-[16px] font-bold rounded-full px-8 py-3.5 sm:py-4 shadow-[0_0_30px_rgba(212,175,55,0.2)] relative z-10 btn-sheen">
            Join Free Telegram <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* ═══ ACCOUNT MANAGEMENT (With Collapsible Inquiry Box) ═══ */}
        <div id="account-mgmt" className="mt-20 sm:mt-32 w-full max-w-[1200px] border-t border-white/10 pt-12 sm:pt-20 scroll-mt-24 sm:scroll-mt-32">
          <div className="flex flex-col items-center text-center mb-10 sm:mb-16 px-4">
            <span className="text-[#d4af37] font-bold uppercase text-[12px] tracking-widest mb-2">Hands-Free Growth</span>
            <h2 className="font-playfair text-[28px] sm:text-[48px] font-black text-white leading-[1.1] mb-3 sm:mb-4">We Trade. You Profit.</h2>
            <p className="text-[16px] sm:text-[20px] text-[#f9e7b9] font-playfair font-bold mb-4 sm:mb-6 max-w-[800px]">Let the professionals handle it. You do nothing.</p>
            <p className="text-zinc-100 font-inter font-medium text-[15px] sm:text-[16px] max-w-[800px] leading-[1.75]">Not everyone has the time to sit at charts every day. Account management is for traders who want professional-level results without having to do the work themselves. Whether you have a personal trading account or a funded prop firm account &mdash; we manage it for you, and we split the profits fairly.</p>
          </div>

          {/* 3 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-8 sm:mb-12">
            {[
              { n: "01", t: "Share Access", d: "You share investor access to your trading account — whether it is a personal broker account or a prop firm funded challenge." },
              { n: "02", t: "We Execute", d: "We handle all the analysis, execution, and risk management on your behalf using the exact same elite precision applied to our own accounts." },
              { n: "03", t: "You Grow", d: "You watch your account grow without lifting a finger. At the end of each trading period, we split the generated profits fairly." }
            ].map(c => (
              <div key={c.n} className="bg-[#0c0c0c]/90 border border-white/15 rounded-2xl p-6 shadow-xl">
                <div className="text-[#d4af37] text-3xl mb-3 font-black opacity-40">{c.n}</div>
                <h3 className="text-lg font-bold text-white mb-2">{c.t}</h3>
                <p className="text-zinc-200 font-inter font-medium text-[14px] leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>

          {/* Collapsed Inquiry Box Container */}
          <div className="max-w-[700px] mx-auto w-full bg-black/60 border border-white/15 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-white font-bold text-base sm:text-lg">Ready to have your account managed?</h4>
                <p className="text-zinc-300 font-inter font-medium text-xs sm:text-sm mt-1">Submit an inquiry or connect with the trader directly on Telegram.</p>
              </div>
              <button 
                onClick={() => setMgmtInquiryOpen(!mgmtInquiryOpen)} 
                className="bg-[#d4af37] text-black font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-[#f9e7b9] transition-colors whitespace-nowrap flex items-center gap-1.5"
              >
                {mgmtInquiryOpen ? 'Collapse Form' : 'Apply for Management'} {mgmtInquiryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Collapsible Form Body */}
            {mgmtInquiryOpen && (
              <form onSubmit={submitMgmtInquiry} className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 text-xs font-semibold mb-1">Full Name</label>
                    <input 
                      required 
                      type="text" 
                      value={mgmtName} 
                      onChange={(e) => setMgmtName(e.target.value)} 
                      placeholder="e.g. David Ross" 
                      className="w-full bg-black border border-white/20 rounded-xl p-3 text-white text-sm font-medium placeholder:text-zinc-400" 
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 text-xs font-semibold mb-1">Telegram or Email</label>
                    <input 
                      required 
                      type="text" 
                      value={mgmtContact} 
                      onChange={(e) => setMgmtContact(e.target.value)} 
                      placeholder="@username or email" 
                      className="w-full bg-black border border-white/20 rounded-xl p-3 text-white text-sm font-medium placeholder:text-zinc-400" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 text-xs font-semibold mb-1">Account Size</label>
                    <select 
                      value={mgmtSize} 
                      onChange={(e) => setMgmtSize(e.target.value)} 
                      className="w-full bg-black border border-white/20 rounded-xl p-3 text-white text-sm font-medium"
                    >
                      <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                      <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                      <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                      <option value="$100,000 - $200,000">$100,000 - $200,000</option>
                      <option value="$200,000+">$200,000+ (Institutional)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-300 text-xs font-semibold mb-1">Account Type</label>
                    <select 
                      value={mgmtType} 
                      onChange={(e) => setMgmtType(e.target.value)} 
                      className="w-full bg-black border border-white/20 rounded-xl p-3 text-white text-sm font-medium"
                    >
                      <option value="Personal Broker Account">Personal Broker Account</option>
                      <option value="Prop Firm Funded Account">Prop Firm Funded Account</option>
                      <option value="Prop Firm Challenge / Evaluation">Prop Firm Challenge / Evaluation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-300 text-xs font-semibold mb-1">Notes or Specific Goals (Optional)</label>
                  <textarea 
                    rows={2} 
                    value={mgmtNotes} 
                    onChange={(e) => setMgmtNotes(e.target.value)} 
                    placeholder="Tell us about your account or timeline..." 
                    className="w-full bg-black border border-white/20 rounded-xl p-3 text-white text-sm font-medium placeholder:text-zinc-400 resize-none" 
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button type="submit" className="w-full sm:w-auto bg-[#d4af37] text-black font-bold text-sm px-8 py-3.5 rounded-full hover:bg-[#f9e7b9] transition-colors shadow-md">
                    Submit Application &rarr;
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleTrackedLink('mgmt_direct_telegram', telegramLink)}
                    className="text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    Or enquire directly on Telegram <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {mgmtStatus && (
                  <p className="text-center text-[#10b981] font-bold text-sm font-inter mt-1">{mgmtStatus}</p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* ═══ REVIEWS ═══ */}
        <div id="reviews" className="mt-20 sm:mt-32 w-full max-w-[1200px] scroll-mt-24 sm:scroll-mt-32">
          <div className="flex flex-col items-center text-center mb-8 px-4">
            <p className="text-[12px] sm:text-[13px] text-[#d4af37] tracking-[0.2em] uppercase font-inter font-bold mb-2 sm:mb-3">Real Talk</p>
            <h2 className="font-playfair text-[28px] sm:text-[48px] font-black text-white leading-[1.1] mb-3 sm:mb-4">{reviewsData.length}+ Verified <span className="text-[#d4af37]">Reviews</span></h2>
            <p className="text-zinc-200 font-inter font-medium text-[14px] sm:text-[16px] max-w-[500px]">Read unfiltered thoughts from traders inside the VIP. The good, the bad, and the extremely profitable.</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-6 sm:mb-10 px-4">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar max-w-[100vw] px-4 sm:px-0">
              {['ALL', 'POSITIVE', 'NEGATIVE'].map((tab) => (
                <button key={tab} onClick={() => { setReviewTab(tab as ReviewTab); setReviewsExpanded(false); }} className={`px-5 sm:px-6 py-2 sm:py-2.5 rounded-full text-[12px] sm:text-[13px] font-bold font-inter transition-all whitespace-nowrap ${reviewTab === tab ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-white/10 text-zinc-200 hover:bg-white/15 hover:text-white'}`}>
                  {tab === 'ALL' ? 'All Reviews' : tab === 'POSITIVE' ? 'Positive' : 'Mixed / Negative'}
                </button>
              ))}
            </div>
            <button onClick={() => setShowReviewForm(true)} className="px-5 sm:px-6 py-2.5 rounded-full text-[12px] sm:text-[13px] font-bold font-inter border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10 transition-all flex items-center gap-2 whitespace-nowrap">Write a Review</button>
          </div>

          {/* Review Form Modal */}
          {showReviewForm && (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowReviewForm(false); }}>
              <div className="bg-[#0c0c0c] border border-white/20 rounded-2xl p-6 sm:p-8 max-w-md w-full relative animate-scale-in shadow-2xl">
                <button onClick={() => setShowReviewForm(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><X /></button>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Leave a Review</h3>
                <form onSubmit={submitReview} className="flex flex-col gap-4">
                  <input required name="reviewName" type="text" placeholder="Your Name or Initials" className="bg-black border border-white/20 rounded-lg p-3 text-white text-sm font-medium" />
                  <select required name="reviewStars" className="bg-black border border-white/20 rounded-lg p-3 text-white text-sm font-medium">
                    <option value="5">5 Stars - Excellent</option><option value="4">4 Stars - Good</option><option value="3">3 Stars - Average</option><option value="2">2 Stars - Poor</option><option value="1">1 Star - Terrible</option>
                  </select>
                  <textarea required name="reviewText" rows={4} placeholder="Your honest experience..." className="bg-black border border-white/20 rounded-lg p-3 text-white text-sm font-medium resize-none"></textarea>
                  <button type="submit" className="bg-[#d4af37] text-black font-bold rounded-lg py-3 hover:bg-[#f9e7b9] transition-colors mt-2 text-sm">Submit Review</button>
                </form>
              </div>
            </div>
          )}

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 sm:px-0">
            {displayedReviews.map((review, i) => (
              <div key={review.id || i} className="bg-[#0c0c0c]/90 border border-white/15 rounded-2xl p-5 flex flex-col gap-2 hover:border-[#d4af37]/40 transition-colors shadow-lg">
                <ReviewStars rating={review.stars} />
                <p className="text-zinc-100 text-[14px] sm:text-[15px] leading-relaxed font-inter font-medium flex-1 italic mt-1">"{review.text}"</p>
                {review.admin_response && (
                  <div className="mt-2 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-lg p-3 relative">
                    <span className="text-[#d4af37] text-[10px] font-bold uppercase tracking-widest block mb-1">Midas Response</span>
                    <p className="text-white text-[12px] font-medium">{review.admin_response}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2 pt-3 border-t border-white/10">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-[10px] font-bold text-white">{review.name.charAt(0)}</div>
                  <span className="text-zinc-200 text-[12px] sm:text-[13px] font-bold font-inter">{review.name}</span>
                </div>
              </div>
            ))}
          </div>
          {!reviewsExpanded && filteredReviews.length > 12 && (
            <div className="flex justify-center mt-8">
              <button onClick={() => setReviewsExpanded(true)} className="flex items-center gap-2 border border-[#d4af37]/50 text-[#d4af37] hover:bg-[#d4af37]/10 px-6 py-2.5 rounded-full text-[12px] sm:text-[13px] font-bold transition-colors">
                Read all {filteredReviews.length} reviews <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ═══ FAQ ═══ */}
        <div id="faq" className="mt-20 sm:mt-32 w-full max-w-[840px] mx-auto scroll-mt-24 sm:scroll-mt-32 border-t border-white/10 pt-12 sm:pt-20">
          <div className="text-center mb-8 sm:mb-12 px-4">
            <p className="text-[12px] sm:text-[13px] text-[#d4af37] tracking-[0.2em] uppercase font-inter font-bold mb-2 sm:mb-3">Got Questions?</p>
            <h2 className="font-playfair text-[28px] sm:text-[48px] font-black text-white leading-[1.1] mb-3 sm:mb-4">Frequently Asked <span className="text-[#d4af37]">Questions</span></h2>
          </div>
          <div className="bg-[#0c0c0c]/90 border border-white/15 rounded-2xl p-5 sm:p-8 mx-4 sm:mx-0 shadow-xl">
            {faqsData.map((faq, i) => <FAQItem key={i} question={faq.question} answer={faq.answer} />)}
          </div>
        </div>

        {/* ═══ EMAIL WAITLIST ═══ */}
        <div id="waitlist" className="mt-20 sm:mt-32 w-full max-w-[800px] mx-auto scroll-mt-24 sm:scroll-mt-32 border-t border-white/10 pt-12 sm:pt-20 px-4 sm:px-0">
          <div className="bg-gradient-to-br from-[#d4af37]/15 to-[#0a0a0a] border border-[#d4af37]/40 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-12 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute -bottom-20 -right-20 w-[200px] sm:w-[250px] h-[200px] sm:h-[250px] bg-[#d4af37]/10 blur-[80px] rounded-full pointer-events-none"></div>
            <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-[#d4af37] mx-auto mb-3 sm:mb-4" />
            <h2 className="font-playfair text-[24px] sm:text-[40px] font-black text-white leading-[1.1] mb-3 sm:mb-4 relative z-10">Stay Ahead of the Market</h2>
            <p className="text-zinc-200 font-inter font-medium text-[14px] sm:text-[15px] mb-6 sm:mb-8 max-w-[500px] mx-auto relative z-10">Join the waitlist and be the first to know when we drop exclusive content, courses, and limited VIP slots. No spam — only signal.</p>
            <form onSubmit={submitWaitlist} className="flex flex-col sm:flex-row gap-3 relative z-10 max-w-[500px] mx-auto">
              <input type="text" value={waitlistName} onChange={(e) => setWaitlistName(e.target.value)} placeholder="Your name" className="bg-black/80 border border-white/20 rounded-xl p-3.5 sm:p-4 text-white font-inter text-sm font-medium flex-1 min-w-0 placeholder:text-zinc-400" />
              <input required type="email" value={waitlistEmail} onChange={(e) => setWaitlistEmail(e.target.value)} placeholder="Your email" className="bg-black/80 border border-white/20 rounded-xl p-3.5 sm:p-4 text-white font-inter text-sm font-medium flex-1 min-w-0 placeholder:text-zinc-400" />
              <button type="submit" className="bg-[#d4af37] text-black font-bold text-sm px-6 py-3.5 sm:py-4 rounded-xl hover:bg-[#f9e7b9] transition-colors whitespace-nowrap shadow-md">Join Waitlist</button>
            </form>
            {waitlistStatus && <p className={`mt-3 sm:mt-4 text-[13px] sm:text-sm font-bold font-inter relative z-10 ${waitlistStatus.includes('error') || waitlistStatus.includes('already') ? 'text-red-400' : 'text-[#10b981]'}`}>{waitlistStatus}</p>}
          </div>
        </div>

        {/* ═══ SUGGESTIONS ═══ */}
        <div id="suggestions" className="mt-16 sm:mt-24 w-full max-w-[800px] mx-auto px-4 sm:px-0 scroll-mt-24 sm:scroll-mt-32">
          <div className="bg-[#0c0c0c]/90 border border-white/15 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-12 text-center relative overflow-hidden shadow-xl">
            <div className="absolute -top-32 -left-32 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[#d4af37]/10 blur-[80px] sm:blur-[100px] rounded-full pointer-events-none"></div>
            <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-[#d4af37] mx-auto mb-3 sm:mb-4 relative z-10" />
            <h2 className="font-playfair text-[24px] sm:text-[40px] font-black text-white leading-[1.1] mb-3 sm:mb-4 relative z-10">Make Midas Better</h2>
            <p className="text-zinc-200 font-inter font-medium text-[14px] sm:text-[15px] mb-5 sm:mb-8 max-w-[600px] mx-auto relative z-10">If you have an idea, a request, or something you think would make this group even better — tell us. Every suggestion is read personally.</p>
            <form onSubmit={submitSuggestion} className="flex flex-col gap-3 sm:gap-4 relative z-10 text-left">
              <input type="text" value={suggestionName} onChange={(e) => setSuggestionName(e.target.value)} placeholder="Name (optional)" className="bg-black/80 border border-white/20 rounded-xl p-3.5 sm:p-4 text-white font-inter text-sm font-medium placeholder:text-zinc-400" />
              <textarea required value={suggestionText} onChange={(e) => setSuggestionText(e.target.value)} rows={3} placeholder="Your suggestion..." className="bg-black/80 border border-white/20 rounded-xl p-3.5 sm:p-4 text-white font-inter text-sm font-medium placeholder:text-zinc-400 resize-none"></textarea>
              <div className="flex flex-col sm:flex-row items-center justify-between mt-1 sm:mt-2 gap-3">
                <button type="submit" className="bg-white text-black font-bold text-sm px-6 py-3.5 rounded-full hover:bg-zinc-200 transition-colors w-full sm:w-auto">Send Suggestion</button>
                {suggestionStatus && <span className="text-[#10b981] text-[13px] sm:text-sm font-bold font-inter">{suggestionStatus}</span>}
              </div>
            </form>
          </div>
        </div>

      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 mt-20 sm:mt-32 border-t border-white/10 bg-[#030303]">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-12 py-10 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 sm:mb-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/midas-logo.jpg" alt="Midas Markets" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#d4af37]/30" />
                <span className="font-playfair font-black text-lg sm:text-xl text-white">Midas Markets</span>
              </div>
              <p className="text-zinc-300 text-[13px] sm:text-sm font-inter font-medium leading-relaxed max-w-[300px]">Elite forex signals and analysis. Built by traders, for traders.</p>
            </div>
            <div>
              <h4 className="text-white font-bold text-[13px] sm:text-sm mb-4 uppercase tracking-widest">Navigate</h4>
              <ul className="flex flex-col gap-2">
                <li><button onClick={(e) => handleNavClick(e, 'proof-section')} className="text-zinc-300 hover:text-[#d4af37] text-[13px] sm:text-sm font-inter font-medium transition-colors text-left">Verified Proof</button></li>
                <li><button onClick={() => setVipModalOpen(true)} className="text-[#d4af37] hover:text-[#f9e7b9] text-[13px] sm:text-sm font-inter font-bold transition-colors text-left flex items-center gap-1"><Crown className="w-3.5 h-3.5" /> VIP Membership</button></li>
                <li><button onClick={(e) => handleNavClick(e, 'reviews')} className="text-zinc-300 hover:text-[#d4af37] text-[13px] sm:text-sm font-inter font-medium transition-colors text-left">Reviews</button></li>
                <li><button onClick={(e) => handleNavClick(e, 'faq')} className="text-zinc-300 hover:text-[#d4af37] text-[13px] sm:text-sm font-inter font-medium transition-colors text-left">FAQ</button></li>
                <li><button onClick={(e) => handleNavClick(e, 'suggestions')} className="text-zinc-300 hover:text-[#d4af37] text-[13px] sm:text-sm font-inter font-medium transition-colors text-left">Suggestions</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-[13px] sm:text-sm mb-4 uppercase tracking-widest">Services</h4>
              <ul className="flex flex-col gap-2">
                <li><a href="#why-free" onClick={(e) => handleNavClick(e, 'why-free')} className="text-zinc-300 hover:text-[#d4af37] text-[13px] sm:text-sm font-inter font-medium transition-colors">Free Signals</a></li>
                <li><button onClick={() => setVipModalOpen(true)} className="text-zinc-300 hover:text-[#d4af37] text-[13px] sm:text-sm font-inter font-medium transition-colors text-left">VIP Signals</button></li>
                <li><a href="#account-mgmt" onClick={(e) => handleNavClick(e, 'account-mgmt')} className="text-zinc-300 hover:text-[#d4af37] text-[13px] sm:text-sm font-inter font-medium transition-colors">Account Management</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-[13px] sm:text-sm mb-4 uppercase tracking-widest">Connect</h4>
              <ul className="flex flex-col gap-2">
                <li><button onClick={() => handleTrackedLink('telegram_footer', telegramLink)} className="text-zinc-300 hover:text-[#d4af37] text-[13px] sm:text-sm font-inter font-medium transition-colors text-left">Telegram</button></li>
                <li><button onClick={() => handleTrackedLink('tiktok_footer', tiktokLink)} className="text-zinc-300 hover:text-[#d4af37] text-[13px] sm:text-sm font-inter font-medium transition-colors text-left">TikTok</button></li>
                <li><button onClick={() => handleTrackedLink('instagram_footer', instagramLink)} className="text-zinc-300 hover:text-[#d4af37] text-[13px] sm:text-sm font-inter font-medium transition-colors text-left">Instagram</button></li>
                <li><button onClick={() => handleTrackedLink('twitter_footer', twitterLink)} className="text-zinc-300 hover:text-[#d4af37] text-[13px] sm:text-sm font-inter font-medium transition-colors text-left">Twitter / X</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-6 sm:pt-8 mb-6 sm:mb-8">
            <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/20 rounded-xl p-4 sm:p-5">
              <Shield className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-zinc-300 text-[11px] sm:text-[12px] font-inter font-normal leading-relaxed">
                <strong className="text-white font-semibold">Risk Disclaimer:</strong> Trading foreign exchange and leveraged financial instruments on margin carries a high level of risk and may not be suitable for all investors. Past performance is not indicative of future results.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <p className="text-zinc-400 text-[11px] sm:text-[12px] font-inter">&copy; {new Date().getFullYear()} Midas Markets. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
