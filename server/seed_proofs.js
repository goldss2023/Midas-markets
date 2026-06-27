const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.resolve(__dirname, 'database.sqlite'));

db.run('DELETE FROM proofs', (err) => {
  if (err) { console.error(err); process.exit(1); }
  console.log('Cleared old proofs.');

  const proofs = [
    {
      f: 'photo_5904347879357222486_y.jpg',
      t: 'XAUUSD Sell — £44,356 Floating Profit',
      s: 'One signal. Multiple positions. Gold called to the pip.',
      badge: '+£44,356', red: 0,
      d: 'We identified a major distribution zone on the daily chart at 4040. Price had swept the previous high, creating a liquidity trap. We entered a staged sell across multiple lots at 4040 and rode the move all the way to 3972, catching nearly 70 pips on a full position. This is a single signal posted in the free Telegram — available to every member, completely free.'
    },
    {
      f: 'photo_5904347879357222492_y.jpg',
      t: 'XAUUSD Buy — £87,368 Live Account',
      s: 'Six-figure equity on a live account running our signals.',
      badge: '+£87,368', red: 0,
      d: 'This account started small and scaled using the exact VIP signals we post every week. XAUUSD buy positions entered at 4434 targeting 4516. The margin level of 4054% shows this is risk-managed precisely — no over-leveraging, no gambling. Just clean setups executed with discipline.'
    },
    {
      f: 'photo_5904347879357222495_y.jpg',
      t: 'XAUUSD — £12,152 Single Session',
      s: '£12,152 profit closed in a single trading session.',
      badge: '+£12,152', red: 0,
      d: 'History tab showing closed XAUUSD positions. Sell entries at 3350 targeting 3332 — a clean 18 pip move with 1 lot sizing generating over £1,700 per position. Multiple positions closed for a total of £12,152 profit on July 3rd alone. This is what disciplined sizing looks like.'
    },
    {
      f: 'photo_5904347879357222487_y.jpg',
      t: 'XAUUSD Sell — £31,254 Running Profit',
      s: 'Another day, another five-figure run on Gold sells.',
      badge: '+£31,254', red: 0,
      d: 'XAUUSD sell positions entered at 4197 targeting 4103 — over 90 pips of room to the downside. The account equity hit £89,924 while the trade was live, with a margin level of 3313% showing extreme risk discipline. This is the free signal channel doing what it does every week.'
    },
    {
      f: 'photo_5904347879357222501_y.jpg',
      t: 'Live Telegram — Gold Buy Call Posted',
      s: '1,405 members receive this analysis in the free channel before the move happens.',
      badge: 'Free Signal', red: 0,
      d: 'Screenshotted directly from the MidasMarkets free Telegram channel. 1,405 members, 290 join requests pending. The chart shows our 1H XAUUSD analysis identifying the green demand zone at 4659 as the next target. Message sent at 16:23 — trade triggered and filled within minutes. This is the quality of analysis you get completely free.'
    },
    {
      f: 'photo_5904347879357222502_y.jpg',
      t: '"70 Pips in 1 Minute" — Gold Buy 4643',
      s: 'Live trade call that printed 70 pips before most traders even opened their platforms.',
      badge: '100 Pips', red: 0,
      d: 'The Telegram chat shows the sequence: "Ready guys?" then "Gold buy now" then "4643-4633" — account screenshot showing £3,082 running — then "Zero float" — then "70 pips in 1 minute" — then "100 pips". This is the VIP experience — early alert, precise entry, and real-time updates as the trade runs.'
    },
    {
      f: 'photo_5904347879357222490_y.jpg',
      t: '4H XAUUSD Chart — Pre-Trade Analysis',
      s: 'Full chart breakdown showing key supply zones and demand levels marked before the move.',
      badge: 'VIP Analysis', red: 0,
      d: 'This is the type of chart analysis VIP members receive before every major setup. XAUUSD 4H showing the rejection from the supply zone at 4350, the demand zone at 4124, and price currently trading at 4170. Entry criteria, zone invalidation levels, and price targets are all mapped out in advance — not after the fact.'
    },
    {
      f: 'photo_5904347879357222489_y.jpg',
      t: 'XAUUSD Sell — £15,077 Running',
      s: '£15,077 floating profit on sells — same setup posted in the free channel.',
      badge: '+£15,077', red: 0,
      d: 'Running profit screenshot showing the sell positions from 4197 targeting 4153 currently printing £33 per position across multiple lots. Total floating at £15,077. This was a free signal posted in the Telegram. VIP members had entry alerts 2 hours earlier with tighter entry levels.'
    },
    {
      f: 'photo_5904347879357222493_y.jpg',
      t: 'Transparency — A Losing Session',
      s: 'Yes we take losses. Here is one of them. Real trading is not always green.',
      badge: '-£9,948', red: 1,
      d: 'We believe in full transparency. This screenshot shows a session where our XAUUSD sell positions went against us — -£9,948 with positions in the red. Free margin went negative at -£2,773. We held, reassessed, and the following session recovered it entirely. Losses are part of trading. What matters is how you manage and recover from them — and we always do.'
    },
    {
      f: 'photo_5904347879357222494_y.jpg',
      t: 'M15 XAUUSD — Exact Entry Execution',
      s: '15-minute chart showing the precise entry with live position marked on screen.',
      badge: 'Live', red: 0,
      d: 'M15 chart showing our XAUUSD sell execution at 4527, with the green demand zone at 4513 clearly marked as the first target. The blue EMA cross confirms the momentum shift. RSI sitting at 34.63, confirming oversold conditions approaching support. This is the precision entry level that VIP members get notified about before execution.'
    },
    {
      f: 'photo_5904347879357222488_y.jpg',
      t: 'Small Account — £1,013 Running From £4,250',
      s: 'Consistent profits on Gold starting from a small account.',
      badge: '+£1,013', red: 0,
      d: 'Not everyone starts with a big account. This account had a balance of £4,250 and is running £1,013 in open profit on XAUUSD sells at 4117 targeting 4107. Margin level of 1165% — safe, controlled, consistent. This is how you grow a small account using the exact same setups we post for free every single day.'
    },
  ];

  const stmt = db.prepare('INSERT INTO proofs (filename, title, subtitle, badge, is_red, details) VALUES (?, ?, ?, ?, ?, ?)');
  let inserted = 0;
  proofs.forEach(p => {
    stmt.run(p.f, p.t, p.s, p.badge, p.red, p.d, function(err) {
      if (err) console.error('Error inserting', p.t, ':', err.message);
      else inserted++;
      if (inserted === proofs.length) console.log('Done! ' + inserted + ' proofs inserted.');
    });
  });
  stmt.finalize(() => { db.close(); });
});
