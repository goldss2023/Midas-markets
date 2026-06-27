const fs = require('fs');

const pIntros = ["Wow.", "Just incredible.", "Honestly...", "Bro...", "Finally.", "Been here 3 weeks.", "No cap.", "Seriously,", "Okay so,", "Listen,", "Madness.", "Insane.", "10/10.", "Can't complain."];
const pBodies = ["Hit 100 pips on gold today.", "The SMC concepts actually make sense now.", "Passed my funded challenge using only these setups.", "Cleanest charts I've ever seen.", "Zero float on almost every entry.", "The London sweeps are too accurate.", "Actually took a withdrawal for the first time.", "Risk management is elite here.", "They literally call it before it happens.", "My win rate doubled."];
const pOutros = ["Highly recommend.", "LFGGGG.", "Will stay forever.", "Thanks Midas.", "Best group out there.", "Worth every second.", "Printing.", "Never leaving.", "Absolute goldmine.", "W."];

const mIntros = ["Decent.", "Not bad.", "Good signals,", "I mean...", "Honestly,", "It's okay,", "Look,", "Tough week,", "Mixed feelings.", "Alright so,"];
const mBodies = ["you really need to understand SMC to follow properly.", "but not ideal for complete beginners.", "the chat moves way too fast.", "missed a massive buy because I was asleep.", "hit a stop loss on GBPJPY today.", "my broker slipped my entry badly.", "I don't really understand how to execute properly yet.", "the analysis is very advanced.", "wish they explained the absolute basics.", "got stopped out yesterday."];
const mOutros = ["Trusting the process though.", "Still up for the month.", "Will keep trying.", "Frustrating but part of the game.", "Hopefully next week is better.", "We recovered it anyway.", "Just need more screen time.", "Still profitable overall.", "Need to study more.", "Slightly annoying."];

function generateReview(type) {
  const intros = type === 'POSITIVE' ? pIntros : mIntros;
  const bodies = type === 'POSITIVE' ? pBodies : mBodies;
  const outros = type === 'POSITIVE' ? pOutros : mOutros;
  
  // Decide length: 1, 2, or 3 parts
  const length = Math.floor(Math.random() * 3) + 1;
  let text = "";
  
  if (length === 1) {
    text = bodies[Math.floor(Math.random() * bodies.length)];
  } else if (length === 2) {
    text = intros[Math.floor(Math.random() * intros.length)] + " " + bodies[Math.floor(Math.random() * bodies.length)];
  } else {
    text = intros[Math.floor(Math.random() * intros.length)] + " " + bodies[Math.floor(Math.random() * bodies.length)] + " " + outros[Math.floor(Math.random() * outros.length)];
  }
  
  // Capitalize first letter just in case
  text = text.charAt(0).toUpperCase() + text.slice(1);
  return text;
}

const firstNames = ["James", "Sarah", "Alex", "Marcus", "Elena", "David", "Chris", "Jordan", "Sam", "Michael", "Jessica", "Omar", "Kevin", "Liam", "Ryan", "Tom", "Anna", "Daniel", "Chloe", "Ethan", "Mia", "Noah", "Olivia", "William", "Sophia", "Benjamin", "Isabella", "Lucas", "Emma", "Mason", "Ava", "Logan", "Harper", "Alexander", "Evelyn", "Jacob", "Abigail", "Elijah", "Emily", "Luke", "Elizabeth", "Jack", "Mila", "Jayden", "Ella", "Levi", "Avery", "Isaac", "Sofia", "Gabriel"];
const lastInitials = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

// Generate unique names
const uniqueNames = [];
for (let f of firstNames) {
  for (let l of lastInitials) {
    uniqueNames.push(`${f} ${l}.`);
  }
}

// Shuffle unique names
for (let i = uniqueNames.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [uniqueNames[i], uniqueNames[j]] = [uniqueNames[j], uniqueNames[i]];
}

const reviews = [];
let positiveCount = 137;
let negativeCount = 73;

for (let i = 0; i < positiveCount; i++) {
  const name = uniqueNames.pop();
  const text = generateReview('POSITIVE');
  reviews.push({ type: 'POSITIVE', name, text, stars: 5 });
}

for (let i = 0; i < negativeCount; i++) {
  const name = uniqueNames.pop();
  const text = generateReview('NEGATIVE');
  const stars = Math.floor(Math.random() * 2) + 3; // 3 or 4 stars for mixed/negative
  reviews.push({ type: 'NEGATIVE', name, text, stars });
}

// Shuffle reviews
for (let i = reviews.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [reviews[i], reviews[j]] = [reviews[j], reviews[i]];
}

const content = `export const reviewsData = ${JSON.stringify(reviews, null, 2)};\n`;

fs.writeFileSync('C:/Users/Administrator/.gemini/antigravity/scratch/midas-markets-app/src/reviewsData.ts', content);
console.log('Successfully generated 210 highly variable reviews.');
