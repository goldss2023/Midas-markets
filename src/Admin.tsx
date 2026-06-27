import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Trash2, MessageSquare, Mail, BarChart3, Image as ImageIcon, HelpCircle, Settings as SettingsIcon } from 'lucide-react';

const API = '/api';

function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reviews'|'proofs'|'faqs'|'settings'|'suggestions'|'emails'|'analytics'>('reviews');

  // Data States
  const [reviews, setReviews] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [proofs, setProofs] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [settings, setSettings] = useState<{ [key: string]: string }>({});

  // Form States
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  
  // Proof Form
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofTitle, setProofTitle] = useState('');
  const [proofSubtitle, setProofSubtitle] = useState('');
  const [proofDetails, setProofDetails] = useState('');
  const [proofBadge, setProofBadge] = useState('');
  const [proofIsRed, setProofIsRed] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  // FAQ Form
  const [faqQ, setFaqQ] = useState('');
  const [faqA, setFaqA] = useState('');

  const fetchData = async () => {
    try {
      const [revRes, sugRes, emailRes, statsRes, analyticsRes, proofsRes, faqsRes, settingsRes] = await Promise.all([
        fetch(`${API}/admin/reviews`),
        fetch(`${API}/admin/suggestions`),
        fetch(`${API}/admin/emails`),
        fetch(`${API}/admin/stats`),
        fetch(`${API}/admin/analytics/summary`),
        fetch(`${API}/proofs`),
        fetch(`${API}/faqs`),
        fetch(`${API}/settings`)
      ]);
      const [revData, sugData, emailData, statsData, analyticsData, proofsData, faqsData, settingsData] = await Promise.all([
        revRes.json(), sugRes.json(), emailRes.json(), statsRes.json(), analyticsRes.json(), proofsRes.json(), faqsRes.json(), settingsRes.json()
      ]);
      
      setReviews(revData.reviews || []);
      setSuggestions(sugData.suggestions || []);
      setEmails(emailData.emails || []);
      setStats(statsData);
      setAnalytics(analyticsData.summary || []);
      setProofs(proofsData.proofs || []);
      setFaqs(faqsData.faqs || []);
      
      const stgs: any = {};
      if (settingsData.settings) {
        settingsData.settings.forEach((s: any) => stgs[s.key] = s.value);
      }
      setSettings(stgs);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // ─── Actions ───

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${API}/admin/reviews/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    fetchData();
  };

  const addReply = async (id: string) => {
    if (!replyText[id]?.trim()) return;
    await fetch(`${API}/admin/reviews/${id}/respond`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ response: replyText[id] }) });
    setReplyText({ ...replyText, [id]: '' });
    fetchData();
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await fetch(`${API}/admin/reviews/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const deleteSuggestion = async (id: string) => {
    await fetch(`${API}/admin/suggestions/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const uploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) return alert("Please select an image");
    setUploadingProof(true);
    const formData = new FormData();
    formData.append('image', proofFile);
    formData.append('title', proofTitle);
    formData.append('subtitle', proofSubtitle);
    formData.append('details', proofDetails);
    formData.append('badge', proofBadge);
    formData.append('is_red', proofIsRed.toString());

    try {
      await fetch(`${API}/admin/proofs`, { method: 'POST', body: formData });
      setProofFile(null); setProofTitle(''); setProofSubtitle(''); setProofDetails(''); setProofBadge(''); setProofIsRed(false);
      fetchData();
    } catch (err) { alert('Upload failed'); }
    finally { setUploadingProof(false); }
  };

  const deleteProof = async (id: string) => {
    if (!confirm('Delete this proof?')) return;
    await fetch(`${API}/admin/proofs/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const addFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API}/admin/faqs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: faqQ, answer: faqA }) });
    setFaqQ(''); setFaqA('');
    fetchData();
  };

  const deleteFaq = async (id: string) => {
    if (!confirm('Delete FAQ?')) return;
    await fetch(`${API}/admin/faqs/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const updateSetting = async (key: string, value: string) => {
    await fetch(`${API}/admin/settings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) });
    setSettings({ ...settings, [key]: value });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const pendingReviews = reviews.filter(r => r.status === 'pending');
  const otherReviews = reviews.filter(r => r.status !== 'pending');

  return (
    <div className="min-h-screen bg-[#050505] text-white font-inter pb-20">
      {/* Top Bar */}
      <div className="border-b border-white/10 bg-[#0a0a0a] sticky top-0 z-20">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-white/60 hover:text-white flex items-center gap-2 text-sm"><ArrowLeft className="w-4 h-4" /> Back to Site</button>
          <div className="h-6 w-px bg-white/10"></div>
          <h1 className="text-xl font-bold font-playfair text-[#d4af37]">Midas Admin</h1>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Reviews", val: stats.totalReviews || 0, icon: <Star className="w-4 h-4" />, color: "from-[#d4af37]/20" },
            { label: "Pending", val: stats.pendingReviews || 0, icon: <MessageSquare className="w-4 h-4" />, color: "from-red-500/20" },
            { label: "Emails", val: stats.totalEmails || 0, icon: <Mail className="w-4 h-4" />, color: "from-blue-500/20" },
            { label: "Clicks", val: stats.totalClicks || 0, icon: <BarChart3 className="w-4 h-4" />, color: "from-[#10b981]/20" },
          ].map(s => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} to-[#0a0a0a] border border-white/10 rounded-xl p-4`}>
              <div className="flex items-center gap-2 text-white/50 text-xs mb-2">{s.icon}{s.label}</div>
              <div className="text-2xl font-black">{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {[
            { key: 'reviews', label: `Reviews (${pendingReviews.length})` },
            { key: 'proofs', label: 'Proofs' },
            { key: 'faqs', label: 'FAQs' },
            { key: 'settings', label: 'Settings' },
            { key: 'suggestions', label: 'Suggestions' },
            { key: 'emails', label: 'Emails' },
            { key: 'analytics', label: 'Analytics' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-2 rounded-lg text-[13px] font-bold transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-[#d4af37] text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">

        {/* ─── Proofs Tab ─── */}
        {activeTab === 'proofs' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><ImageIcon className="w-5 h-5" /> Upload New Proof</h2>
              <form onSubmit={uploadProof} className="flex flex-col gap-4">
                <input required type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} className="bg-black border border-white/10 rounded p-3 text-sm" />
                <input required type="text" placeholder="Title (e.g., Gold Buy +£15,000)" value={proofTitle} onChange={e => setProofTitle(e.target.value)} className="bg-black border border-white/10 rounded p-3 text-sm text-white" />
                <input required type="text" placeholder="Subtitle (e.g., 200 Pips secured in 4 hours)" value={proofSubtitle} onChange={e => setProofSubtitle(e.target.value)} className="bg-black border border-white/10 rounded p-3 text-sm text-white" />
                <input type="text" placeholder="Badge Text (e.g., +£15,000)" value={proofBadge} onChange={e => setProofBadge(e.target.value)} className="bg-black border border-white/10 rounded p-3 text-sm text-white" />
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input type="checkbox" checked={proofIsRed} onChange={e => setProofIsRed(e.target.checked)} /> Make Badge Red (for losses)
                </label>
                <textarea required rows={4} placeholder="Full setup details / explanation..." value={proofDetails} onChange={e => setProofDetails(e.target.value)} className="bg-black border border-white/10 rounded p-3 text-sm text-white"></textarea>
                <button disabled={uploadingProof} type="submit" className="bg-[#d4af37] text-black font-bold py-3 rounded hover:bg-[#f9e7b9] transition-colors">{uploadingProof ? 'Uploading...' : 'Upload Proof'}</button>
              </form>
            </div>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Existing Proofs</h2>
              <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto">
                {proofs.map(p => (
                  <div key={p.id} className="bg-white/5 border border-white/10 rounded-lg p-3 flex gap-4">
                    <img src={`/proofs/${p.filename}`} alt="" className="w-24 h-24 object-cover rounded bg-black" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{p.title}</h4>
                      <p className="text-xs text-white/50 mt-1">{p.subtitle}</p>
                      <button onClick={() => deleteProof(p.id)} className="text-red-400 text-xs mt-3 hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── FAQs Tab ─── */}
        {activeTab === 'faqs' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><HelpCircle className="w-5 h-5" /> Add FAQ</h2>
              <form onSubmit={addFaq} className="flex flex-col gap-4">
                <input required type="text" placeholder="Question" value={faqQ} onChange={e => setFaqQ(e.target.value)} className="bg-black border border-white/10 rounded p-3 text-sm text-white" />
                <textarea required rows={4} placeholder="Answer" value={faqA} onChange={e => setFaqA(e.target.value)} className="bg-black border border-white/10 rounded p-3 text-sm text-white"></textarea>
                <button type="submit" className="bg-[#d4af37] text-black font-bold py-3 rounded hover:bg-[#f9e7b9]">Add FAQ</button>
              </form>
            </div>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Manage FAQs</h2>
              <div className="flex flex-col gap-3">
                {faqs.map(f => (
                  <div key={f.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-[#d4af37]">{f.question}</h4>
                      <button onClick={() => deleteFaq(f.id)} className="text-red-400 text-xs"><Trash2 className="w-3 h-3"/></button>
                    </div>
                    <p className="text-xs text-white/70 mt-2">{f.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Settings Tab ─── */}
        {activeTab === 'settings' && (
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 max-w-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><SettingsIcon className="w-5 h-5" /> Global Settings</h2>
            <div className="flex flex-col gap-6">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="font-bold text-sm mb-3 text-[#d4af37]">Scarcity Banner (Top of site)</h3>
                <label className="flex items-center gap-3 text-sm mb-4">
                  <input type="checkbox" checked={settings.scarcity_banner_active === 'true'} onChange={e => updateSetting('scarcity_banner_active', e.target.checked.toString())} className="w-4 h-4 accent-[#d4af37]" />
                  Enable Scarcity Banner
                </label>
                <div className="flex gap-2">
                  <input type="text" value={settings.scarcity_banner_text || ''} onChange={e => setSettings({...settings, scarcity_banner_text: e.target.value})} className="bg-black border border-white/10 rounded p-2 text-sm text-white flex-1" />
                  <button onClick={() => updateSetting('scarcity_banner_text', settings.scarcity_banner_text)} className="bg-white text-black text-xs font-bold px-4 rounded hover:bg-gray-200">Save Text</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Existing Tabs (Reviews, Suggestions, Emails, Analytics) ─── */}
        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Pending Reviews</h2>
              <div className="flex flex-col gap-4">
                {pendingReviews.map(r => (
                  <div key={r.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm">{r.name}</span>
                      <div className="flex gap-1">{[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= r.stars ? 'fill-[#d4af37] text-[#d4af37]' : 'text-white/20'}`} />)}</div>
                    </div>
                    <p className="text-white/80 text-sm italic mb-3">"{r.text}"</p>
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(r.id, 'approved')} className="bg-[#10b981] text-black text-xs font-bold px-4 py-2 rounded">Approve</button>
                      <button onClick={() => updateStatus(r.id, 'rejected')} className="bg-red-500/20 text-red-400 text-xs font-bold px-4 py-2 rounded">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6">Manage Reviews</h2>
              <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto">
                {otherReviews.map(r => (
                  <div key={r.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-sm">{r.name} <span className="text-[10px] text-[#10b981]">{r.status}</span></span>
                      <button onClick={() => deleteReview(r.id)} className="text-white/20 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <p className="text-white/80 text-xs italic mb-2">"{r.text}"</p>
                    {!r.admin_response ? (
                      <div className="flex gap-2 mt-2">
                        <input type="text" placeholder="Reply..." className="flex-1 bg-black border border-white/20 rounded px-2 py-1 text-xs text-white" value={replyText[r.id]||''} onChange={e => setReplyText({...replyText, [r.id]: e.target.value})} />
                        <button onClick={() => addReply(r.id)} className="bg-[#d4af37] text-black text-xs font-bold px-3 py-1 rounded">Reply</button>
                      </div>
                    ) : (
                      <div className="mt-2 bg-[#d4af37]/10 p-2 rounded border border-[#d4af37]/20 text-xs text-[#d4af37]">Rep: {r.admin_response}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add simplified placeholders for Suggestions, Emails, Analytics just for the UI switch */}
        {activeTab === 'suggestions' && (
           <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 max-w-3xl">
             <h2 className="text-xl font-bold mb-6">Suggestions</h2>
             <div className="flex flex-col gap-3">
               {suggestions.map(s => (
                 <div key={s.id} className="bg-white/5 rounded-xl p-4 border border-white/10 flex justify-between">
                   <div><div className="text-xs text-white/40 mb-1">{s.name}</div><p className="text-sm">{s.text}</p></div>
                   <button onClick={() => deleteSuggestion(s.id)} className="text-white/20 hover:text-red-400"><Trash2 className="w-4 h-4"/></button>
                 </div>
               ))}
             </div>
           </div>
        )}

        {activeTab === 'emails' && (
           <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 max-w-3xl">
             <h2 className="text-xl font-bold mb-6">Emails</h2>
             <table className="w-full text-sm text-left">
               <thead><tr className="text-white/40 border-b border-white/10"><th className="pb-2">Email</th><th className="pb-2">Name</th></tr></thead>
               <tbody>{emails.map(e => <tr key={e.id} className="border-b border-white/5"><td className="py-2">{e.email}</td><td className="py-2">{e.name}</td></tr>)}</tbody>
             </table>
           </div>
        )}

        {activeTab === 'analytics' && (
           <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 max-w-3xl">
             <h2 className="text-xl font-bold mb-6">Clicks</h2>
             <div className="flex flex-col gap-3">
               {analytics.map((a:any) => (
                 <div key={a.event_target} className="flex justify-between bg-white/5 p-3 rounded">
                   <span>{a.event_target}</span><span className="text-[#d4af37] font-bold">{a.count}</span>
                 </div>
               ))}
             </div>
           </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
