/**
 * One-time migration script: uploads static data.js content → Firestore
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrate-to-firestore.mjs
 *
 * Safe to re-run — skips any document whose ID already exists in Firestore.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { selectedWorks, videos, exhibitions2 } from '../src/data.js';

// ─── Firebase init ────────────────────────────────────────────────────────────

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const db = getFirestore();

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function migrateCollection(collectionName, items, labelFn) {
  console.log(`\n📦 Migrating "${collectionName}" (${items.length} items)…`);
  let added = 0;
  let skipped = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const docId = String(item.id);
    const ref = db.collection(collectionName).doc(docId);
    const existing = await ref.get();

    if (existing.exists) {
      console.log(`  ⏭  skip  [${docId}] ${labelFn(item)}`);
      skipped++;
      continue;
    }

    // Strip the id field (Firestore uses the doc ID) and add order
    const { id, ...rest } = item;
    await ref.set({ ...rest, order: i, createdAt: new Date() });
    console.log(`  ✅ added [${docId}] ${labelFn(item)}`);
    added++;
  }

  console.log(`   → ${added} added, ${skipped} skipped`);
}

// ─── Run ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Starting Firestore migration…');
  console.log(`   Project: ${process.env.FIREBASE_PROJECT_ID}`);

  await migrateCollection('edie_works',       selectedWorks,  w => w.title);
  await migrateCollection('edie_videos',      videos,         v => v.title);
  await migrateCollection('edie_exhibitions', exhibitions2,   e => e.title);

  console.log('\n🎉 Migration complete!');
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Migration failed:', err);
  process.exit(1);
});
