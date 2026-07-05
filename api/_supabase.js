const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rredzebycviyqakevzdl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZWR6ZWJ5Y3ZpeXFha2V2emRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjk2MzAsImV4cCI6MjA5ODg0NTYzMH0.b7quMoIeurfy_B5Rl3o85RrbFbLUBGsaNZLhJMdiREQ'
);

module.exports = { supabase };
