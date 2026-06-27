const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const proofs = [
  {filename:"proof1.png", title:"XAUUSD Buy", subtitle:"150 Pips secured during NY session.", badge:"+£8,240", is_red:0, details:"Price swept Asian session liquidity and tapped into a 15m order block. We entered on the shift in market structure and rode it to the 4H supply zone."},
  {filename:"proof2.png", title:"GBPUSD Sell", subtitle:"Perfect distribution schematic play.", badge:"+£4,100", is_red:0, details:"Identified a Wyckoff distribution schematic on the 1H timeframe. Entered after the UTAD confirmation. Clean drop into the daily imbalance."},
  {filename:"proof3.png", title:"EURUSD Buy", subtitle:"Sniper entry on the 5m chart.", badge:"+£6,500", is_red:0, details:"Euro had strong fundamental backing today. We waited for a retracement into the 50% fib level which aligned perfectly with a fair value gap. Zero drawdown."},
  {filename:"proof4.png", title:"XAUUSD Sell", subtitle:"Counter-trend scalp.", badge:"+£3,200", is_red:0, details:"Quick scalp against the trend. Gold overextended into a daily resistance level. We caught a 50 pip pullback before the trend resumed."},
  {filename:"proof5.png", title:"USDJPY Buy", subtitle:"Break and retest of daily resistance.", badge:"+£9,800", is_red:0, details:"Classic break and retest. Price broke through a major daily level, retraced perfectly to test it as support, and we rode the continuation for massive RR."}
];

db.serialize(() => {
  const stmt = db.prepare('INSERT INTO proofs (filename, title, subtitle, badge, is_red, details) VALUES (?, ?, ?, ?, ?, ?)');
  proofs.forEach(p => {
    stmt.run(p.filename, p.title, p.subtitle, p.badge, p.is_red, p.details);
  });
  stmt.finalize(() => {
    console.log('Proofs inserted successfully');
    db.close();
  });
});
