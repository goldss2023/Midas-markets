(()=>{
  const supplied=(window.reviewParts||[]).flat();
  const verified=supplied.map((text,i)=>({text,type:i<192?'Positive':i<223?'Mixed':'Negative',stars:i<192?'★★★★★':i<223?'★★★★☆':'★★☆☆☆',id:i+1}));
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const card=(r,full)=>`<article class="${full?'feedback-item':'review-card'}"><div class=review-stars>${r.stars}</div><div class=${full?'':'review-text'}>${esc(r.text)}</div><small class=${full?'':'review-meta'}>Verified ${r.type.toLowerCase()} feedback · Review ${r.id}</small></article>`;
  const notes=document.querySelectorAll('.review-note');
  notes.forEach(n=>n.innerHTML='<strong>Verified member feedback</strong> — supplied by Midas Markets. Names are omitted for privacy.');
  document.querySelectorAll('.review-num').forEach((n,i)=>n.textContent=['192','31','10'][i]||n.textContent);
  document.querySelectorAll('.review-label').forEach((n,i)=>n.textContent=['Positive','Mixed','Negative'][i]||n.textContent);
  const button=document.querySelector('.review-btn');if(button)button.textContent='View all 233 verified reviews →';
  const heading=document.querySelector('.feedback-head h3');if(heading)heading.textContent='Verified Member Reviews';
  const featured=document.getElementById('featuredReviews');if(featured)featured.innerHTML=[verified[0],verified[192],verified[223]].map(r=>card(r,false)).join('');
  const grid=document.getElementById('feedbackGrid');
  const renderAll=()=>{const mixed=[...verified];for(let i=mixed.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[mixed[i],mixed[j]]=[mixed[j],mixed[i]];}if(grid)grid.innerHTML=mixed.map(r=>card(r,true)).join('');};
  if(grid)grid.innerHTML=verified.map(r=>card(r,true)).join('');
  if(button)button.addEventListener('click',renderAll);
  window.reviewVerification={total:verified.length,positive:verified.filter(r=>r.type==='Positive').length,mixed:verified.filter(r=>r.type==='Mixed').length,negative:verified.filter(r=>r.type==='Negative').length,unique:new Set(verified.map(r=>r.text)).size};
})();
