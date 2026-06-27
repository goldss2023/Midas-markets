require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("FATAL ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const dbPath = path.resolve(__dirname, 'database.sqlite');

if (!fs.existsSync(dbPath)) {
  console.error('database.sqlite not found. Cannot migrate.');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath);

function dbAll(sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => err ? reject(err) : resolve(rows));
  });
}

async function migrateTable(tableName, columns) {
  try {
    const rows = await dbAll(`SELECT * FROM ${tableName}`);
    if (rows.length === 0) {
      console.log(`No data in ${tableName} to migrate.`);
      return;
    }
    
    console.log(`Migrating ${rows.length} rows from ${tableName}...`);
    // Filter out id to let Supabase auto-increment, and map SQLite booleans if needed
    const dataToInsert = rows.map(row => {
      const newRow = {};
      columns.forEach(col => {
        if (col === 'is_red') {
           newRow[col] = row[col] === 1 || row[col] === 'true';
        } else {
           newRow[col] = row[col];
        }
      });
      return newRow;
    });

    const { error } = await supabase.from(tableName).insert(dataToInsert);
    if (error) {
      console.error(`Error inserting into ${tableName}:`, error);
    } else {
      console.log(`✅ Successfully migrated ${tableName}`);
    }
  } catch (err) {
    console.error(`Error reading ${tableName} from SQLite:`, err);
  }
}

async function migrateImages() {
  try {
    const rows = await dbAll(`SELECT * FROM proofs`);
    console.log(`Migrating ${rows.length} images to Supabase Storage...`);
    
    for (const row of rows) {
      if (!row.filename) continue;
      
      const filePath = path.resolve(__dirname, '../public/proofs', row.filename);
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        
        // determine mime type crudely
        const ext = path.extname(row.filename).toLowerCase();
        let mime = 'image/jpeg';
        if (ext === '.png') mime = 'image/png';
        if (ext === '.webp') mime = 'image/webp';
        
        const { error } = await supabase.storage.from('proofs').upload(row.filename, fileBuffer, {
          contentType: mime,
          upsert: true
        });
        
        if (error) {
           console.error(`Error uploading ${row.filename}:`, error.message);
        } else {
           console.log(`Uploaded ${row.filename}`);
        }
      } else {
        console.warn(`File not found locally: ${filePath}`);
      }
    }
    console.log('✅ Image migration complete');
  } catch (err) {
    console.error('Error during image migration:', err);
  }
}

async function runMigration() {
  console.log("Starting migration to Supabase...");
  
  // 1. Upload Images to Storage
  await migrateImages();
  
  // 2. Migrate Tables
  await migrateTable('reviews', ['type', 'name', 'text', 'stars', 'status', 'admin_response', 'created_at']);
  await migrateTable('faqs', ['question', 'answer', 'created_at']);
  await migrateTable('proofs', ['filename', 'title', 'subtitle', 'badge', 'is_red', 'details', 'created_at']);
  await migrateTable('settings', ['key', 'value']);
  await migrateTable('emails', ['email', 'name', 'source', 'created_at']);
  
  console.log("Migration finished!");
  db.close();
}

runMigration();
