import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, ChevronDown, ChevronUp, Star, ArrowUp, Mail, MessageCircle, Shield, MoreVertical } from 'lucide-react';

const API = 'http://localhost:3001/api';

// ─── Analytics helper ───
function trackClick(target: string) {
  fetch(`${API}/analytics/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type: 'click', event_target: target, referrer: document.referrer, user_agent: navigator.userAgent })
  }).catch(() => {});
}

// ─── Proof Card ───
function ProofCard({ filename, title, subtitle, badge, isRed, details }: any) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 group hover:border-[#d4af37]/30 transition-all duration-300">
      <div className="w-full relative overflow-hidden rounded-xl bg-[#0A0A0A] flex items-center justify-center">
        <img src={`/proofs/${filename}`} alt={title} className="w-full max-h-[400px] object-contain opacity-90 group-hover:opacity-100 transition-opacity" loading="lazy" />
        {badge && (
          <div className={`absolute top-3 right-3 text-[11px] sm:text-[12px] font-bold px-2 py-1 rounded border backdrop-blur-md ${isRed ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30'}`}>
            {badge}
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 mt-1">
        <h3 className="text-white text-[15px] sm:text-[16px] font-semibold leading-tight font-inter">{title}</h3>
        <p className="text-white/60 text-[12px] sm:text-[13px] mt-1 font-inter leading-relaxed">{subtitle}</p>
        <div className="mt-auto pt-3">
          <button onClick={() => setExpanded(!expanded)} className="text-[#d4af37] text-[12px] sm:text-[13px] font-medium flex items-center gap-1 hover:underline transition-colors focus:outline-none">
            Read setup {expanded ? <ChevronUp className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${expanded ? 'grid-rows-[1fr] mt-3 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="text-[12px] sm:text-[13px] text-white/70 font-inter leading-relaxed bg-white/5 p-3 rounded-lg border border-white/10">{details}</div>
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
        <Star key={star} className={`w-3 h-3 ${star <= rating ? 'fill-[#d4af37] text-[#d4af37]' : 'fill-transparent text-white/20'}`} />
      ))}
    </div>
  );
}

// ─── FAQ Accordion Item ───
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center py-4 sm:py-5 text-left group">
        <span className="text-white font-inter font-medium text-[14px] sm:text-[15px] md:text-[16px] pr-4 group-hover:text-[#d4af37] transition-colors leading-snug">{question}</span>
        <ChevronDown className={`w-5 h-5 text-[#d4af37] shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr] opacity-100 pb-4 sm:pb-5' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="text-white/60 font-inter text-[13px] sm:text-[14px] leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Floating Navigation Dots ───
function FloatingNav({ sections, activeSection }: { sections: { id: string; label: string }[]; activeSection: string }) {
  const [open, setOpen] = useState(false);
  
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };
  
  return (
    <div className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end gap-2">
      <button onClick={() => setOpen(!open)} className="w-10 h-10 rounded-full bg-black/80 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:border-[#d4af37]/50 transition-all shadow-lg" aria-label="Navigation menu">
        <MoreVertical className="w-4 h-4" />
      </button>
      <div className={`flex flex-col gap-1.5 transition-all duration-300 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
        {sections.map((s) => (
          <button key={s.id} onClick={() => scrollTo(s.id)} className="group flex items-center gap-2 sm:gap-3 justify-end" title={s.label}>
            <span className="text-[10px] sm:text-[11px] font-inter font-medium text-white/60 group-hover:text-[#d4af37] transition-colors bg-black/80 px-2 py-1 rounded-md backdrop-blur-md border border-white/10 whitespace-nowrap">
              {s.label}
            </span>
            <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${activeSection === s.id ? 'bg-[#d4af37] border-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.8)]' : 'bg-transparent border-white/30 group-hover:border-[#d4af37]'}`} />
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
  { id: "vip", label: "VIP" },
  { id: "account-mgmt", label: "Acc. Mgmt" },
  { id: "tiktok", label: "TikTok" },
  { id: "reviews", label: "Reviews" },
  { id: "faq", label: "FAQ" },
  { id: "waitlist", label: "Waitlist" },
];

type ReviewTab = 'ALL' | 'POSITIVE' | 'NEGATIVE';

function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAllProofs, setShowAllProofs] = useState(false);
  const allProofsRef = useRef<HTMLDivElement>(null);
  
  // Dynamic Data States
  const [reviewsData, setReviewsData] = useState<any[]>([]);
  const [proofsData, setProofsData] = useState<any[]>([]);
  const [faqsData, setFaqsData] = useState<any[]>([]);
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
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [navScrolled, setNavScrolled] = useState(false);

  // Fallback data in case backend hasn't initialized yet
  const top4Proofs = proofsData.slice(0, 4);
  const remainingProofs = proofsData.slice(4);

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
    { name: "TikTok", href: "#tiktok", id: "tiktok" },
    { name: "Reviews", href: "#reviews", id: "reviews" },
    { name: "VIP", href: "#vip", id: "vip" },
    { name: "FAQ", href: "#faq", id: "faq" },
  ];

  const telegramLink = "https://t.me/MidasMarketsai";

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

  const handleTrackedLink = useCallback((target: string, url: string) => {
    trackClick(target);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-[#050505] text-white selection:bg-[#d4af37]/30 pb-20 md:pb-0">
      
      {/* Background Video */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
        <video src="/bg-video.mp4" autoPlay muted loop playsInline className="w-full h-full max-w-[1200px] max-h-[800px] object-contain opacity-30 mix-blend-screen scale-90" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] bg-[#d4af37]/10 rounded-full blur-[150px] pointer-events-none"></div>
      </div>

      {/* Floating Section Navigation (Desktop only, mobile relies on standard scrolling) */}
      <div className="hidden md:block">
        <FloatingNav sections={navSections} activeSection={activeSection} />
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
      <div className="fixed bottom-0 left-0 w-full z-40 bg-[#050505]/95 backdrop-blur-md border-t border-white/10 p-4 md:hidden animate-fade-up">
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

          <div className="hidden md:flex items-center gap-10">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} onClick={(e) => handleNavClick(e, link.id)} className="font-inter text-[13px] text-white/80 font-medium hover:text-[#f9e7b9] transition-colors">{link.name}</a>
              ))}
            </div>
            <button onClick={() => handleTrackedLink('telegram_nav', telegramLink)} className="flex items-center justify-center bg-gradient-to-r from-[#f9e7b9] to-[#d4af37] text-black font-bold rounded-full px-6 py-2 text-[13px] transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] btn-sheen">
              Join Telegram
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button className="flex md:hidden flex-col items-end space-y-1.5 p-2" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <div className="w-6 h-[2px] bg-white"></div>
            <div className="w-6 h-[2px] bg-white"></div>
            <div className="w-4 h-[2px] bg-white"></div>
          </button>
        </div>
      </nav>

      {/* ─── MOBILE MENU ─── */}
      <div className={`fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-md transition-all duration-500 flex flex-col ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="flex justify-between items-center px-4 py-4 border-b border-white/5">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black border border-[#d4af37]/30 overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.4)]">
            <img src="/midas-logo.jpg" alt="Midas Markets" className="w-6 h-6 object-contain" />
          </div>
          <button onClick={() => setMenuOpen(false)} className="p-2 text-white/80 hover:text-white" aria-label="Close menu"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 flex flex-col justify-center px-6 space-y-6">
          {[...navLinks, { name: "Account Mgmt", href: "#account-mgmt", id: "account-mgmt" }, { name: "Join Telegram", href: telegramLink, id: "telegram" }].map((link, i) => (
            <a key={link.name} href={link.href}
              onClick={(e) => { if (link.id !== 'telegram') { handleNavClick(e, link.id); } else { setMenuOpen(false); trackClick('telegram_mobile_menu'); window.open(telegramLink, '_blank'); } }}
              className={`font-playfair font-black text-3xl text-white uppercase w-fit ${link.name === 'Join Telegram' ? 'font-inter text-lg tracking-wide bg-gradient-to-r from-[#f9e7b9] to-[#d4af37] text-black font-bold rounded-full px-8 py-4 mt-4 text-center btn-sheen' : ''}`}
              style={{ transitionDelay: `${i * 60 + 80}ms`, transform: menuOpen ? 'translateY(0)' : 'translateY(20px)', opacity: menuOpen ? 1 : 0, transition: 'all 400ms ease-out' }}
            >{link.name}</a>
          ))}
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <main className={`relative z-10 flex flex-col items-center min-h-screen px-4 sm:px-6 md:px-12 ${settings.scarcity_banner_active === 'true' ? 'pt-[140px] sm:pt-[160px]' : 'pt-[100px] sm:pt-[120px]'} pb-0 max-w-[1400px] mx-auto`}>
        
        {/* ═══ HERO ═══ */}
        <div id="hero" className="w-full flex flex-col items-start max-w-[940px] scroll-mt-32">
          <div className="flex items-center gap-2 border border-[#4A3E1E] rounded-full px-3 py-1 bg-black/40 text-[11px] sm:text-[13px] text-white/90 mb-4 sm:mb-6 font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_rgba(16,185,129,0.8)]"></div>
            Live signals &middot; 1,400+ traders inside
          </div>

          <h1 className="flex flex-wrap gap-x-2 sm:gap-x-3 gap-y-0 sm:gap-y-1 font-playfair font-black uppercase text-white leading-[1.05] sm:leading-[1.02] tracking-[-0.025em]" style={{ fontSize: 'clamp(38px, 9vw, 92px)' }}>
            <span>TURN</span><span>MARKET</span><span>LIQUIDITY</span><span>INTO</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#f9e7b9] via-[#d4af37] to-[#8c6b12]">PURE</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#f9e7b9] via-[#d4af37] to-[#8c6b12]">GOLD.</span>
          </h1>

          <p className="mt-5 sm:mt-8 text-[16px] sm:text-[20px] leading-[1.55] text-white/90 max-w-[720px] font-inter font-medium">
            We trade 20 forex pairs including gold. Clean analysis. Elite risk-to-reward. <span className="text-[#f9e7b9] font-bold">4 weeks straight without a stop loss.</span>
          </p>

          <p className="mt-4 sm:mt-6 text-[14px] sm:text-[16px] leading-[1.75] text-white/70 max-w-[680px] font-inter">
            Midas Markets is a live trading operation you get to watch in real time. Every day we post full chart breakdowns, show exactly why we enter, and share verified proof. No guessing. No recycled ideas. Just clean trades that print.
            <br/><br/>
            <strong className="text-white">Do we occasionally hit stop loss? Yes.</strong> Every real trader does. But we always recover &mdash; tighter, faster, and more precise than before. That is the journey.
          </p>

          {/* CTA Desktop */}
          <div className="mt-8 sm:mt-10 hidden md:flex flex-col items-start gap-2.5">
            <div className="flex gap-4 flex-wrap items-center">
              <button onClick={() => handleTrackedLink('telegram_hero_cta', telegramLink)} className="flex items-center gap-2 bg-gradient-to-br from-[#f9e7b9] to-[#d4af37] text-black text-[15px] font-bold rounded-full px-6 py-3.5 hover:scale-105 transition-transform btn-sheen">
                Join Free &mdash; Steal the Signals <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => handleTrackedLink('tiktok_hero', 'https://www.tiktok.com/@midasmarketsai?_r=1&_t=ZG-97Wu9CP9KJl')} className="flex items-center justify-center border border-white/20 text-white/90 text-[15px] font-medium rounded-full px-6 py-3.5 hover:bg-white/5 transition-colors">
                Watch on TikTok
              </button>
            </div>
            <span className="text-[12px] text-white/50 tracking-[0.04em] mt-1 font-inter">4 weeks. 20 pairs. Zero stop losses hit. Come see why.</span>
          </div>
          
          {/* Mobile TikTok CTA */}
          <div className="mt-6 md:hidden w-full">
             <button onClick={() => handleTrackedLink('tiktok_hero_mobile', 'https://www.tiktok.com/@midasmarketsai?_r=1&_t=ZG-97Wu9CP9KJl')} className="w-full flex items-center justify-center border border-white/20 text-white/90 text-[14px] font-medium rounded-full px-5 py-3 hover:bg-white/5 transition-colors">
                Watch on TikTok
             </button>
          </div>

          {/* Stats */}
          <div className="mt-10 sm:mt-12 flex gap-4 sm:gap-12 flex-wrap w-full">
            {[
              { val: "1,400+", label: "Members" },
              { val: "20", label: "Pairs Traded" },
              { val: "1:3.4", label: "Avg RR" },
            ].map(s => (
              <div key={s.label} className="flex flex-col flex-1 min-w-[30%]">
                <div className="font-playfair text-[24px] sm:text-[30px] font-extrabold leading-[1] text-transparent bg-clip-text bg-gradient-to-br from-[#f9e7b9] to-[#d4af37]">{s.val}</div>
                <div className="text-[10px] sm:text-[11px] tracking-[0.1em] sm:tracking-[0.2em] uppercase text-white/55 mt-1.5 sm:mt-2 font-inter">{s.label}</div>
              </div>
            ))}
            <div className="flex flex-col flex-1 min-w-[30%]">
              <div className="font-playfair text-[24px] sm:text-[30px] font-extrabold leading-[1] text-transparent bg-clip-text bg-gradient-to-br from-[#f9e7b9] to-[#d4af37] flex items-center gap-1">
                4.5 <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-[#d4af37] text-[#d4af37]" />
              </div>
              <div className="text-[10px] sm:text-[11px] tracking-[0.1em] sm:tracking-[0.2em] uppercase text-white/55 mt-1.5 sm:mt-2 font-inter">Rating</div>
            </div>
          </div>
        </div>

        {/* ═══ PROOF ═══ */}
        <div id="proof-section" className="mt-20 sm:mt-32 w-full max-w-[1200px] scroll-mt-24 sm:scroll-mt-32">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3">
            <h2 className="font-playfair text-[26px] sm:text-[28px] font-bold text-white m-0">Latest Verified Trades</h2>
            {!showAllProofs && top4Proofs.length > 0 && (
              <button onClick={(e) => handleNavClick(e, 'proof-all')} className="text-[#d4af37] text-[13px] sm:text-[15px] font-medium hover:underline flex items-center gap-1">
                See all proof <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {proofsData.length === 0 ? (
               <div className="col-span-full py-10 text-center text-white/40 italic font-inter text-sm">No proofs uploaded yet. Admin can upload screenshots via the dashboard.</div>
            ) : top4Proofs.map((proof, i) => <ProofCard key={i} {...proof} />)}
          </div>
        </div>

        {/* Expanded Proof Wall */}
        {showAllProofs && (
          <div id="proof-all" ref={allProofsRef} className="mt-12 sm:mt-24 w-full max-w-[1200px] scroll-mt-24 sm:scroll-mt-32 border-t border-white/10 pt-10 sm:pt-16 animate-fade-in">
            <div className="flex flex-col gap-3 sm:gap-4 mb-8 sm:mb-10 text-left">
              <p className="text-[12px] sm:text-[14px] text-[#d4af37] tracking-[0.2em] uppercase font-inter font-bold m-0">The Full Archive</p>
              <h2 className="font-playfair text-[26px] sm:text-[42px] font-black text-white leading-[1.1] max-w-[800px]">Undeniable execution. Real accounts.</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {remainingProofs.map((proof, index) => <ProofCard key={index} {...proof} />)}
            </div>
          </div>
        )}

        {/* ═══ WHY FREE ═══ */}
        <div id="why-free" className="mt-20 sm:mt-32 w-full flex flex-col items-center justify-center text-center py-12 sm:py-20 relative border-t border-white/5 scroll-mt-24 sm:scroll-mt-32">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <img src="/midas-logo.jpg" alt="" className="w-full max-w-[600px] object-contain rounded-full" />
          </div>
          <p className="text-[11px] sm:text-[12px] text-[#d4af37] tracking-[0.2em] uppercase font-inter font-bold mb-3 sm:mb-4 relative z-10">NO CATCH</p>
          <h2 className="font-playfair text-[32px] sm:text-[60px] font-black text-white leading-tight max-w-[800px] relative z-10 px-4">Why Is It <span className="text-[#d4af37]">Free?</span></h2>
          <p className="text-[16px] sm:text-[24px] text-[#f9e7b9] font-playfair font-bold mt-3 sm:mt-4 mb-5 sm:mb-8 relative z-10 px-4">You are not buying signals. You are stealing them.</p>
          <p className="text-white/70 font-inter text-[14px] sm:text-[16px] leading-relaxed max-w-[600px] mx-auto relative z-10 px-4">Most groups charge £200 a month for vague entries. We give ours away free because the Telegram is how we prove we are the real thing — before you ever spend a penny. Watch the trades. Watch the results. Then decide.</p>
          <button onClick={() => handleTrackedLink('telegram_why_free', telegramLink)} className="mt-8 flex items-center gap-2 bg-gradient-to-br from-[#f9e7b9] to-[#d4af37] text-black text-[14px] sm:text-[16px] font-bold rounded-full px-6 sm:px-8 py-3 sm:py-4 shadow-[0_0_30px_rgba(212,175,55,0.2)] relative z-10 btn-sheen">
            Join Free <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* ═══ VIP ═══ */}
        <div id="vip" className="mt-20 sm:mt-32 w-full max-w-[1200px] scroll-mt-24 sm:scroll-mt-32 border-t border-white/5 pt-12 sm:pt-20">
          <div className="flex flex-col items-center text-center mb-10 sm:mb-16 px-4">
            <h2 className="font-playfair text-[30px] sm:text-[50px] font-black text-white leading-[1.1] mb-4">Midas VIP — The Unfair Advantage</h2>
            <p className="text-[15px] sm:text-[20px] text-[#d4af37] font-playfair font-bold mb-4 sm:mb-6 max-w-[800px]">95% of VIP members make back their membership fee from a single VIP setup.</p>
            <p className="text-white/70 font-inter text-[14px] sm:text-[16px] max-w-[700px] leading-[1.7]">The free group is already better than most paid services. VIP is on a different level entirely. This is where the real edge lives — earlier alerts, deeper analysis, and direct personal access to the trader behind every setup.</p>
          </div>
          <div className="flex flex-col lg:flex-row gap-8 sm:gap-12">
            <div className="w-full lg:w-1/2">
              <h3 className="text-lg sm:text-2xl font-bold font-playfair text-white mb-5 sm:mb-6">What you get in VIP:</h3>
              <ul className="flex flex-col gap-4 sm:gap-5">
                {["Every single one of the 20 forex pair setups sent to you before anyone else — so you are always first in, best positioned","Full pre-trade analysis on every setup so you know exactly what to look for, where to enter, where to stop, and where to take profit — before the move even happens","Direct personal access — message me directly, ask questions about any trade, get help sizing your positions and growing your account in real time","More setups daily than the free group — because VIP members are here to trade seriously","Exclusive VIP-only setups that never get posted anywhere else","Personal account growth guidance — I help you build your account step by step, not just give you trades"].map((item, idx) => (
                  <li key={idx} className="flex gap-3 sm:gap-4 text-white/80 font-inter text-[13px] sm:text-[15px] leading-relaxed">
                    <div className="mt-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 min-w-[6px] sm:min-w-[8px] bg-[#d4af37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]"></div>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full lg:w-1/2 flex flex-col gap-4 sm:gap-6">
              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div><h4 className="text-white font-bold text-base sm:text-lg">Monthly — £50/month</h4><p className="text-white/50 text-xs sm:text-sm mt-1">Full VIP access, cancel any time.</p></div>
                <button onClick={() => handleTrackedLink('vip_monthly', 'https://buy.stripe.com/6oU6oAgLQd2xasfgCufAc03')} className="bg-white text-black font-bold text-xs sm:text-sm px-6 py-3 rounded-full hover:bg-gray-200 transition-colors w-full sm:w-auto text-center">Join Monthly</button>
              </div>
              <div className="bg-gradient-to-r from-[#d4af37]/20 to-[#8c6b12]/20 border border-[#d4af37] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#d4af37]/10 blur-[20px] rounded-full"></div>
                <div className="relative z-10"><h4 className="text-white font-bold text-base sm:text-lg flex items-center gap-2 flex-wrap">6 Months <span className="text-[9px] sm:text-[10px] bg-[#d4af37] text-black px-2 py-0.5 rounded uppercase font-black tracking-widest">Discounted</span></h4><p className="text-white/70 text-xs sm:text-sm mt-1">Lock in 6 months at a reduced rate and save.</p></div>
                <button onClick={() => handleTrackedLink('vip_6month', 'https://buy.stripe.com/8x2dR29jobYt7g3eumfAc04')} className="relative z-10 bg-[#d4af37] text-black font-bold text-xs sm:text-sm px-6 py-3 rounded-full hover:bg-[#f9e7b9] transition-colors w-full sm:w-auto text-center shadow-[0_0_15px_rgba(212,175,55,0.3)] btn-sheen">Join 6 Months</button>
              </div>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div><h4 className="text-white font-bold text-base sm:text-lg">12 Months — Best Value</h4><p className="text-white/50 text-xs sm:text-sm mt-1">The full year. Maximum savings.</p></div>
                <button onClick={() => handleTrackedLink('vip_12month', 'https://buy.stripe.com/6oU3co1QW9Ql57V2LEfAc06')} className="bg-white text-black font-bold text-xs sm:text-sm px-6 py-3 rounded-full hover:bg-gray-200 transition-colors w-full sm:w-auto text-center">Join 12 Months</button>
              </div>
              <p className="text-center text-white/40 text-[10px] sm:text-[11px] font-inter uppercase tracking-wider mt-1 sm:mt-2">100% secure checkout powered by Stripe.</p>
              <div className="mt-2 bg-[#1e1e1e]/50 border border-white/5 rounded-2xl p-5 text-center">
                <h4 className="text-white font-bold text-sm sm:text-md mb-2">Prefer to pay with crypto?</h4>
                <button onClick={() => handleTrackedLink('crypto_pay', telegramLink)} className="inline-flex items-center gap-2 border border-white/20 text-white font-bold text-xs sm:text-sm px-5 py-2 rounded-full hover:bg-white/10 transition-colors">Pay with Crypto &rarr;</button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ ACCOUNT MANAGEMENT ═══ */}
        <div id="account-mgmt" className="mt-20 sm:mt-32 w-full max-w-[1200px] border-t border-white/5 pt-12 sm:pt-20 scroll-mt-24 sm:scroll-mt-32">
          <div className="flex flex-col items-center text-center mb-10 sm:mb-16 px-4">
            <h2 className="font-playfair text-[28px] sm:text-[50px] font-black text-white leading-[1.1] mb-3 sm:mb-4">We Trade. You Profit.</h2>
            <p className="text-[15px] sm:text-[20px] text-[#d4af37] font-playfair font-bold mb-4 sm:mb-6 max-w-[800px]">Let the professionals handle it. You do nothing.</p>
            <p className="text-white/70 font-inter text-[14px] sm:text-[16px] max-w-[800px] leading-[1.7]">Not everyone has the time to sit at charts every day. Account management is for traders who want professional-level results without having to do the work themselves. Whether you have a personal trading account or a funded account — we manage it for you, and we split the profits fairly.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {[{ n: "01", t: "Share Access", d: "You share access to your trading account — whether it is a personal broker account or a prop firm funded account." },
              { n: "02", t: "We Execute", d: "We do all the analysis, execution, and management on your behalf using the same elite precision applied to our own accounts." },
              { n: "03", t: "You Grow", d: "You watch your account grow without lifting a finger. At the end of the period, we split the profits fairly." }
            ].map(c => (
              <div key={c.n} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
                <div className="text-[#d4af37] text-3xl mb-3 font-black opacity-30">{c.n}</div>
                <h3 className="text-lg font-bold text-white mb-2">{c.t}</h3>
                <p className="text-white/60 text-[13px] sm:text-sm leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center px-4">
            <button onClick={() => handleTrackedLink('account_mgmt_enquiry', telegramLink)} className="bg-[#d4af37] text-black font-bold text-[14px] sm:text-[16px] px-8 py-3.5 sm:py-4 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform btn-sheen">Enquire About Account Management &rarr;</button>
          </div>
        </div>

        {/* ═══ TIKTOK ═══ */}
        <div id="tiktok" className="mt-20 sm:mt-32 w-full max-w-[1200px] flex flex-col md:flex-row gap-6 sm:gap-12 items-center bg-black/40 border border-white/10 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-12 scroll-mt-24 sm:scroll-mt-32 relative overflow-hidden">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-blue-500/10 blur-[80px] sm:blur-[100px] rounded-full pointer-events-none"></div>
          <div className="w-full md:w-1/2 relative z-10 text-center md:text-left">
            <p className="text-[12px] sm:text-[13px] text-blue-400 tracking-[0.2em] uppercase font-inter font-bold mb-2 sm:mb-3">Daily Insights</p>
            <h2 className="font-playfair text-[28px] sm:text-[46px] font-black text-white leading-[1.1] mb-4 sm:mb-6">Watch Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Analysis Live</span></h2>
            <p className="text-white/70 font-inter text-[14px] sm:text-[16px] leading-[1.7] mb-6 max-w-[500px] mx-auto md:mx-0">We don't just send signals, we explain exactly why we are entering. Follow our TikTok for daily market breakdowns. <strong className="text-white">@midasmarketsai is our ONLY official TikTok account.</strong></p>
            <button onClick={() => handleTrackedLink('tiktok_section', 'https://www.tiktok.com/@midasmarketsai?_r=1&_t=ZG-97Wu9CP9KJl')} className="inline-flex items-center justify-center gap-2 bg-white text-black font-bold text-[13px] sm:text-[14px] px-6 py-3 rounded-full hover:bg-gray-200 transition-colors w-full md:w-auto">Follow @midasmarketsai <ArrowRight className="w-4 h-4" /></button>
          </div>
          <div className="w-full md:w-1/2 relative z-10 mt-6 md:mt-0">
            <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl shadow-blue-500/20 w-full max-w-[280px] sm:max-w-[340px] mx-auto bg-[#0A0A0A]">
              <img src="/tiktok.jpg" alt="TikTok Profile Preview" className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>

        {/* ═══ REVIEWS ═══ */}
        <div id="reviews" className="mt-20 sm:mt-32 w-full max-w-[1200px] scroll-mt-24 sm:scroll-mt-32">
          <div className="flex flex-col items-center text-center mb-8 px-4">
            <p className="text-[12px] sm:text-[13px] text-[#d4af37] tracking-[0.2em] uppercase font-inter font-bold mb-2 sm:mb-3">Real Talk</p>
            <h2 className="font-playfair text-[28px] sm:text-[48px] font-black text-white leading-[1.1] mb-3 sm:mb-4">{reviewsData.length}+ Verified <span className="text-[#d4af37]">Reviews</span></h2>
            <p className="text-white/60 font-inter text-[13px] sm:text-[15px] max-w-[500px]">Read unfiltered thoughts from traders inside the VIP. The good, the bad, and the extremely profitable.</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-6 sm:mb-10 px-4">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar max-w-[100vw] px-4 sm:px-0">
              {['ALL', 'POSITIVE', 'NEGATIVE'].map((tab) => (
                <button key={tab} onClick={() => { setReviewTab(tab as ReviewTab); setReviewsExpanded(false); }} className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[12px] sm:text-[13px] font-bold font-inter transition-all whitespace-nowrap ${reviewTab === tab ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}>
                  {tab === 'ALL' ? 'All Reviews' : tab === 'POSITIVE' ? 'Positive' : 'Mixed / Negative'}
                </button>
              ))}
            </div>
            <button onClick={() => setShowReviewForm(true)} className="px-5 sm:px-6 py-2.5 rounded-full text-[12px] sm:text-[13px] font-bold font-inter border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37]/10 transition-all flex items-center gap-2 whitespace-nowrap">Write a Review</button>
          </div>

          {/* Review Form Modal */}
          {showReviewForm && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowReviewForm(false); }}>
              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full relative animate-scale-in">
                <button onClick={() => setShowReviewForm(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X /></button>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">Leave a Review</h3>
                <form onSubmit={submitReview} className="flex flex-col gap-4">
                  <input required name="reviewName" type="text" placeholder="Your Name or Initials" className="bg-black border border-white/10 rounded-lg p-3 text-white text-sm" />
                  <select required name="reviewStars" className="bg-black border border-white/10 rounded-lg p-3 text-white text-sm">
                    <option value="5">5 Stars - Excellent</option><option value="4">4 Stars - Good</option><option value="3">3 Stars - Average</option><option value="2">2 Stars - Poor</option><option value="1">1 Star - Terrible</option>
                  </select>
                  <textarea required name="reviewText" rows={4} placeholder="Your honest experience..." className="bg-black border border-white/10 rounded-lg p-3 text-white text-sm resize-none"></textarea>
                  <button type="submit" className="bg-[#d4af37] text-black font-bold rounded-lg py-3 hover:bg-[#f9e7b9] transition-colors mt-2 text-sm">Submit Review</button>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-0">
            {displayedReviews.map((review, i) => (
              <div key={review.id || i} className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col gap-2 hover:border-[#d4af37]/30 transition-colors">
                <ReviewStars rating={review.stars} />
                <p className="text-white/80 text-[13px] sm:text-[14px] leading-relaxed font-inter flex-1 italic mt-1">"{review.text}"</p>
                {review.admin_response && (
                  <div className="mt-2 bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-lg p-3 relative">
                    <span className="text-[#d4af37] text-[10px] font-bold uppercase tracking-widest block mb-1">Midas Response</span>
                    <p className="text-white/90 text-[11px] sm:text-xs">{review.admin_response}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2 pt-2 sm:pt-3 border-t border-white/5">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-white">{review.name.charAt(0)}</div>
                  <span className="text-white/60 text-[11px] sm:text-[12px] font-medium font-inter">{review.name}</span>
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
        <div id="faq" className="mt-20 sm:mt-32 w-full max-w-[800px] mx-auto scroll-mt-24 sm:scroll-mt-32 border-t border-white/5 pt-12 sm:pt-20">
          <div className="text-center mb-8 sm:mb-12 px-4">
            <p className="text-[12px] sm:text-[13px] text-[#d4af37] tracking-[0.2em] uppercase font-inter font-bold mb-2 sm:mb-3">Got Questions?</p>
            <h2 className="font-playfair text-[28px] sm:text-[48px] font-black text-white leading-[1.1] mb-3 sm:mb-4">Frequently Asked <span className="text-[#d4af37]">Questions</span></h2>
          </div>
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 sm:p-8 mx-4 sm:mx-0">
            {faqsData.length === 0 ? <p className="text-white/40 text-center italic text-sm">No FAQs available.</p> :
             faqsData.map((faq, i) => <FAQItem key={i} question={faq.question} answer={faq.answer} />)}
          </div>
        </div>

        {/* ═══ EMAIL WAITLIST ═══ */}
        <div id="waitlist" className="mt-20 sm:mt-32 w-full max-w-[800px] mx-auto scroll-mt-24 sm:scroll-mt-32 border-t border-white/5 pt-12 sm:pt-20 px-4 sm:px-0">
          <div className="bg-gradient-to-br from-[#d4af37]/10 to-[#0a0a0a] border border-[#d4af37]/30 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute -bottom-20 -right-20 w-[200px] sm:w-[250px] h-[200px] sm:h-[250px] bg-[#d4af37]/10 blur-[80px] rounded-full pointer-events-none"></div>
            <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-[#d4af37] mx-auto mb-3 sm:mb-4" />
            <h2 className="font-playfair text-[24px] sm:text-[40px] font-black text-white leading-[1.1] mb-3 sm:mb-4 relative z-10">Stay Ahead of the Market</h2>
            <p className="text-white/70 font-inter text-[13px] sm:text-[15px] mb-6 sm:mb-8 max-w-[500px] mx-auto relative z-10">Join the waitlist and be the first to know when we drop exclusive content, courses, and limited VIP slots. No spam — only signal.</p>
            <form onSubmit={submitWaitlist} className="flex flex-col sm:flex-row gap-3 relative z-10 max-w-[500px] mx-auto">
              <input type="text" value={waitlistName} onChange={(e) => setWaitlistName(e.target.value)} placeholder="Your name" className="bg-black/50 border border-white/10 rounded-xl p-3.5 sm:p-4 text-white font-inter text-sm flex-1 min-w-0" />
              <input required type="email" value={waitlistEmail} onChange={(e) => setWaitlistEmail(e.target.value)} placeholder="Your email" className="bg-black/50 border border-white/10 rounded-xl p-3.5 sm:p-4 text-white font-inter text-sm flex-1 min-w-0" />
              <button type="submit" className="bg-[#d4af37] text-black font-bold text-sm px-6 py-3.5 sm:py-4 rounded-xl hover:bg-[#f9e7b9] transition-colors whitespace-nowrap">Join Waitlist</button>
            </form>
            {waitlistStatus && <p className={`mt-3 sm:mt-4 text-[13px] sm:text-sm font-bold font-inter relative z-10 ${waitlistStatus.includes('error') || waitlistStatus.includes('already') ? 'text-red-400' : 'text-[#10b981]'}`}>{waitlistStatus}</p>}
          </div>
        </div>

        {/* ═══ SUGGESTIONS ═══ */}
        <div id="suggestions" className="mt-16 sm:mt-24 w-full max-w-[800px] mx-auto px-4 sm:px-0 scroll-mt-24 sm:scroll-mt-32">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute -top-32 -left-32 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-[#d4af37]/10 blur-[80px] sm:blur-[100px] rounded-full pointer-events-none"></div>
            <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-[#d4af37] mx-auto mb-3 sm:mb-4 relative z-10" />
            <h2 className="font-playfair text-[24px] sm:text-[40px] font-black text-white leading-[1.1] mb-3 sm:mb-4 relative z-10">Make Midas Better</h2>
            <p className="text-white/70 font-inter text-[13px] sm:text-[15px] mb-5 sm:mb-8 max-w-[600px] mx-auto relative z-10">If you have an idea, a request, or something you think would make this group even better — tell us. Every suggestion is read personally.</p>
            <form onSubmit={submitSuggestion} className="flex flex-col gap-3 sm:gap-4 relative z-10 text-left">
              <input type="text" value={suggestionName} onChange={(e) => setSuggestionName(e.target.value)} placeholder="Name (optional)" className="bg-black/50 border border-white/10 rounded-xl p-3.5 sm:p-4 text-white font-inter text-sm" />
              <textarea required value={suggestionText} onChange={(e) => setSuggestionText(e.target.value)} rows={3} placeholder="Your suggestion..." className="bg-black/50 border border-white/10 rounded-xl p-3.5 sm:p-4 text-white font-inter text-sm resize-none"></textarea>
              <div className="flex flex-col sm:flex-row items-center justify-between mt-1 sm:mt-2 gap-3">
                <button type="submit" className="bg-white text-black font-bold text-sm px-6 py-3.5 rounded-full hover:bg-gray-200 transition-colors w-full sm:w-auto">Send Suggestion</button>
                {suggestionStatus && <span className="text-[#10b981] text-[13px] sm:text-sm font-bold font-inter">{suggestionStatus}</span>}
              </div>
            </form>
          </div>
        </div>

      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 mt-20 sm:mt-32 border-t border-white/5 bg-[#030303]">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-12 py-10 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 sm:mb-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/midas-logo.jpg" alt="Midas Markets" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#d4af37]/30" />
                <span className="font-playfair font-black text-lg sm:text-xl text-white">Midas Markets</span>
              </div>
              <p className="text-white/50 text-[13px] sm:text-sm font-inter leading-relaxed max-w-[300px]">Elite forex signals and analysis. Built by traders, for traders.</p>
            </div>
            <div>
              <h4 className="text-white font-bold text-[13px] sm:text-sm mb-4 uppercase tracking-widest">Navigate</h4>
              <ul className="flex flex-col gap-2">
                {["Proof", "VIP", "Reviews", "FAQ", "Suggestions"].map(l => (
                  <li key={l}><a href={`#${l.toLowerCase()}`} onClick={(e) => handleNavClick(e, l.toLowerCase() === 'proof' ? 'proof-section' : l.toLowerCase())} className="text-white/50 hover:text-[#d4af37] text-[13px] sm:text-sm font-inter transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-[13px] sm:text-sm mb-4 uppercase tracking-widest">Services</h4>
              <ul className="flex flex-col gap-2">
                <li><a href="#why-free" onClick={(e) => handleNavClick(e, 'why-free')} className="text-white/50 hover:text-[#d4af37] text-[13px] sm:text-sm font-inter transition-colors">Free Signals</a></li>
                <li><a href="#vip" onClick={(e) => handleNavClick(e, 'vip')} className="text-white/50 hover:text-[#d4af37] text-[13px] sm:text-sm font-inter transition-colors">VIP Membership</a></li>
                <li><a href="#account-mgmt" onClick={(e) => handleNavClick(e, 'account-mgmt')} className="text-white/50 hover:text-[#d4af37] text-[13px] sm:text-sm font-inter transition-colors">Account Management</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-[13px] sm:text-sm mb-4 uppercase tracking-widest">Connect</h4>
              <ul className="flex flex-col gap-2">
                <li><button onClick={() => handleTrackedLink('telegram_footer', telegramLink)} className="text-white/50 hover:text-[#d4af37] text-[13px] sm:text-sm font-inter transition-colors text-left">Telegram</button></li>
                <li><button onClick={() => handleTrackedLink('tiktok_footer', 'https://www.tiktok.com/@midasmarketsai')} className="text-white/50 hover:text-[#d4af37] text-[13px] sm:text-sm font-inter transition-colors text-left">TikTok</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-6 sm:pt-8 mb-6 sm:mb-8">
            <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/10 rounded-xl p-4 sm:p-5">
              <Shield className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-white/40 text-[10px] sm:text-[11px] font-inter leading-relaxed">
                <strong className="text-white/60">Risk Disclaimer:</strong> Trading foreign exchange on margin carries a high level of risk...
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <p className="text-white/30 text-[10px] sm:text-[11px] font-inter">&copy; {new Date().getFullYear()} Midas Markets. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
