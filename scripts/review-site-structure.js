/**
 * Script to review site_id 1 data structure and table schemas
 * Run this with: node scripts/review-site-structure.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ecvqhfbiwqmqgiqfxheu.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdnFoZmJpd3FtcWdpcWZ4aGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDEwMTksImV4cCI6MjA2MDg3NzAxOX0.rRF6VbPIRMucv2ePb4QFKA6gvmevrhqO0M_nTiWm5n4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function reviewSiteStructure(siteId = 1) {
  console.log(`\n=== Reviewing Site ID: ${siteId} ===\n`);

  try {
    // Fetch all related data
    const [
      siteResult,
      mediaResult,
      visitingResult,
      ticketResult,
      transportResult,
      amenitiesResult,
      etiquettesResult,
      translationsResult,
      feedbackResult,
      reviewResult,
    ] = await Promise.all([
      supabase.from('heritage_site').select('*').eq('site_id', siteId).single(),
      supabase.from('heritage_sitemedia').select('*').eq('site_id', siteId),
      supabase.from('heritage_sitevisitinghours').select('*').eq('site_id', siteId).order('day_of_week', { ascending: true }),
      supabase.from('heritage_sitetickettype').select('*').eq('site_id', siteId),
      supabase.from('heritage_sitetransportation').select('*').eq('site_id', siteId),
      supabase.from('heritage_siteamenity').select('*').eq('site_id', siteId),
      supabase.from('heritage_siteetiquette').select('*').eq('site_id', siteId).order('display_order', { ascending: true }),
      supabase.from('heritage_sitetranslation').select('*').eq('site_id', siteId),
      supabase.from('heritage_sitefeedback').select('*').eq('site_id', siteId).limit(5),
      supabase.from('heritage_sitereview').select('*').eq('site_id', siteId).limit(5),
    ]);

    // Analyze and display results
    console.log('1. HERITAGE_SITE TABLE');
    console.log('='.repeat(50));
    if (siteResult.error) {
      console.error('Error:', siteResult.error);
    } else if (siteResult.data) {
      console.log('Columns found:', Object.keys(siteResult.data));
      console.log('Sample data:', JSON.stringify(siteResult.data, null, 2));
    } else {
      console.log('No data found for site_id', siteId);
    }

    console.log('\n2. HERITAGE_SITEMEDIA TABLE');
    console.log('='.repeat(50));
    if (mediaResult.error) {
      console.error('Error:', mediaResult.error);
    } else {
      console.log('Records found:', mediaResult.data?.length || 0);
      if (mediaResult.data && mediaResult.data.length > 0) {
        console.log('Columns found:', Object.keys(mediaResult.data[0]));
        console.log('Sample data:', JSON.stringify(mediaResult.data[0], null, 2));
      }
    }

    console.log('\n3. HERITAGE_SITEVISITINGHOURS TABLE');
    console.log('='.repeat(50));
    if (visitingResult.error) {
      console.error('Error:', visitingResult.error);
    } else {
      console.log('Records found:', visitingResult.data?.length || 0);
      if (visitingResult.data && visitingResult.data.length > 0) {
        console.log('Columns found:', Object.keys(visitingResult.data[0]));
        console.log('Sample data:', JSON.stringify(visitingResult.data[0], null, 2));
      }
    }

    console.log('\n4. HERITAGE_SITETICKETTYPE TABLE');
    console.log('='.repeat(50));
    if (ticketResult.error) {
      console.error('Error:', ticketResult.error);
    } else {
      console.log('Records found:', ticketResult.data?.length || 0);
      if (ticketResult.data && ticketResult.data.length > 0) {
        console.log('Columns found:', Object.keys(ticketResult.data[0]));
        console.log('Sample data:', JSON.stringify(ticketResult.data[0], null, 2));
      }
    }

    console.log('\n5. HERITAGE_SITETRANSPORTATION TABLE');
    console.log('='.repeat(50));
    if (transportResult.error) {
      console.error('Error:', transportResult.error);
    } else {
      console.log('Records found:', transportResult.data?.length || 0);
      if (transportResult.data && transportResult.data.length > 0) {
        console.log('Columns found:', Object.keys(transportResult.data[0]));
        console.log('Sample data:', JSON.stringify(transportResult.data[0], null, 2));
      }
    }

    console.log('\n6. HERITAGE_SITEAMENITY TABLE');
    console.log('='.repeat(50));
    if (amenitiesResult.error) {
      console.error('Error:', amenitiesResult.error);
    } else {
      console.log('Records found:', amenitiesResult.data?.length || 0);
      if (amenitiesResult.data && amenitiesResult.data.length > 0) {
        console.log('Columns found:', Object.keys(amenitiesResult.data[0]));
        console.log('Sample data:', JSON.stringify(amenitiesResult.data[0], null, 2));
      }
    }

    console.log('\n7. HERITAGE_SITEETIQUETTE TABLE');
    console.log('='.repeat(50));
    if (etiquettesResult.error) {
      console.error('Error:', etiquettesResult.error);
    } else {
      console.log('Records found:', etiquettesResult.data?.length || 0);
      if (etiquettesResult.data && etiquettesResult.data.length > 0) {
        console.log('Columns found:', Object.keys(etiquettesResult.data[0]));
        console.log('Sample data:', JSON.stringify(etiquettesResult.data[0], null, 2));
      }
    }

    console.log('\n8. HERITAGE_SITETRANSLATION TABLE');
    console.log('='.repeat(50));
    if (translationsResult.error) {
      console.error('Error:', translationsResult.error);
    } else {
      console.log('Records found:', translationsResult.data?.length || 0);
      if (translationsResult.data && translationsResult.data.length > 0) {
        console.log('Columns found:', Object.keys(translationsResult.data[0]));
        console.log('Sample data (first 3):');
        translationsResult.data.slice(0, 3).forEach((item, idx) => {
          console.log(`  [${idx + 1}]`, JSON.stringify(item, null, 2));
        });
        // Group by field_type
        const byFieldType = {};
        translationsResult.data.forEach(item => {
          if (!byFieldType[item.field_type]) {
            byFieldType[item.field_type] = [];
          }
          byFieldType[item.field_type].push(item);
        });
        console.log('\n  Grouped by field_type:');
        Object.keys(byFieldType).forEach(fieldType => {
          console.log(`    ${fieldType}: ${byFieldType[fieldType].length} records`);
        });
      }
    }

    console.log('\n9. HERITAGE_SITEFEEDBACK TABLE');
    console.log('='.repeat(50));
    if (feedbackResult.error) {
      console.error('Error:', feedbackResult.error);
    } else {
      console.log('Records found:', feedbackResult.data?.length || 0);
      if (feedbackResult.data && feedbackResult.data.length > 0) {
        console.log('Columns found:', Object.keys(feedbackResult.data[0]));
        console.log('Sample data:', JSON.stringify(feedbackResult.data[0], null, 2));
      }
    }

    console.log('\n10. HERITAGE_SITEREVIEW TABLE');
    console.log('='.repeat(50));
    if (reviewResult.error) {
      console.error('Error:', reviewResult.error);
    } else {
      console.log('Records found:', reviewResult.data?.length || 0);
      if (reviewResult.data && reviewResult.data.length > 0) {
        console.log('Columns found:', Object.keys(reviewResult.data[0]));
        console.log('Sample data:', JSON.stringify(reviewResult.data[0], null, 2));
      }
    }

    // Generate summary
    console.log('\n\n=== SUMMARY ===');
    console.log('='.repeat(50));
    console.log('Tables with data:');
    if (siteResult.data) console.log('  ✓ heritage_site');
    if (mediaResult.data?.length > 0) console.log(`  ✓ heritage_sitemedia (${mediaResult.data.length} records)`);
    if (visitingResult.data?.length > 0) console.log(`  ✓ heritage_sitevisitinghours (${visitingResult.data.length} records)`);
    if (ticketResult.data?.length > 0) console.log(`  ✓ heritage_sitetickettype (${ticketResult.data.length} records)`);
    if (transportResult.data?.length > 0) console.log(`  ✓ heritage_sitetransportation (${transportResult.data.length} records)`);
    if (amenitiesResult.data?.length > 0) console.log(`  ✓ heritage_siteamenity (${amenitiesResult.data.length} records)`);
    if (etiquettesResult.data?.length > 0) console.log(`  ✓ heritage_siteetiquette (${etiquettesResult.data.length} records)`);
    if (translationsResult.data?.length > 0) console.log(`  ✓ heritage_sitetranslation (${translationsResult.data.length} records)`);
    if (feedbackResult.data?.length > 0) console.log(`  ✓ heritage_sitefeedback (${feedbackResult.data.length} records)`);
    if (reviewResult.data?.length > 0) console.log(`  ✓ heritage_sitereview (${reviewResult.data.length} records)`);

  } catch (error) {
    console.error('Error reviewing site structure:', error);
  }
}

// Run the review
reviewSiteStructure(1).then(() => {
  console.log('\nReview completed!');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

