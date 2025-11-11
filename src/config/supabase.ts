import { createClient } from '@supabase/supabase-js';

// Supabase Configuration (from mobile app)
const supabaseUrl = 'https://ecvqhfbiwqmqgiqfxheu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdnFoZmJpd3FtcWdpcWZ4aGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDEwMTksImV4cCI6MjA2MDg3NzAxOX0.rRF6VbPIRMucv2ePb4QFKA6gvmevrhqO0M_nTiWm5n4';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API endpoints
export const API_ENDPOINTS = {
  baseUrl: `${supabaseUrl}/rest/v1`,
  rpcUrl: `${supabaseUrl}/rest/v1/rpc`,
};

// Database function names
export const DB_FUNCTIONS = {
  getMasterData: 'get_heritage_master_data',
  getMasterCategories: 'get_heritage_master_categories',
  getDashboardData: 'heritage_get_dashboard_data',
};

