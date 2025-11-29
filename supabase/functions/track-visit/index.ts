import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { type, id } = await req.json();

    if (!type || !id) {
      return new Response(
        JSON.stringify({ error: 'Missing type or id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type !== 'job' && type !== 'business') {
      return new Response(
        JSON.stringify({ error: 'Invalid type. Must be job or business' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get IP address from headers
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = req.headers.get('user-agent') || null;

    console.log('Tracking visit:', { type, id, ipAddress });

    // Check if this IP has visited in the last 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const table = type === 'job' ? 'job_visits' : 'business_visits';
    const idColumn = type === 'job' ? 'job_id' : 'business_id';

    const { data: recentVisit } = await supabase
      .from(table)
      .select('id')
      .eq(idColumn, id)
      .eq('ip_address', ipAddress)
      .gte('visited_at', thirtyMinutesAgo)
      .limit(1)
      .single();

    if (recentVisit) {
      console.log('Recent visit found, skipping');
      return new Response(
        JSON.stringify({ tracked: false, reason: 'Recent visit exists' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert new visit
    const visitData = {
      [idColumn]: id,
      ip_address: ipAddress,
      user_agent: userAgent,
      visited_at: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from(table)
      .insert(visitData);

    if (insertError) {
      console.error('Error inserting visit:', insertError);
      throw insertError;
    }

    console.log('Visit tracked successfully');

    return new Response(
      JSON.stringify({ tracked: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in track-visit:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
