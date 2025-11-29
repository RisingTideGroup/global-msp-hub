
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with the user's token for auth check
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user is an admin
    const { data: roleData, error: roleError } = await supabaseAuth
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      console.error('Error verifying admin role:', roleError);
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Now use service role to fetch prompts
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to get existing prompts from a settings table
    const { data: settings, error } = await supabase
      .from('ai_system_prompts')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error fetching system prompts:', error);
    }

    // Default prompts if none exist
    const defaultPrompts = {
      global: "You are a helpful business assistant and expert consultant. Provide professional, actionable advice to help businesses grow and succeed. Be encouraging, insightful, and supportive in your responses.",
      mission: "Focus on helping the business articulate their core purpose and impact. Ask thoughtful questions about their goals, values, and the change they want to create in the world.",
      culture: "Guide them in defining the workplace environment and values they want to cultivate. Consider team dynamics, work-life balance, collaboration, and company traditions.",
      benefits: "Help them think through competitive compensation packages, health benefits, professional development opportunities, and unique perks that align with their company culture.",
      values: "Assist in identifying and articulating the fundamental principles that guide their business decisions and behavior. Focus on authentic values that truly represent their organization.",
      general: "Provide general business guidance on strategy, operations, marketing, and growth. Be specific and actionable in your recommendations.",
      outputFormat: "Always provide clear, actionable suggestions. Format your response to be professional and easy to implement. End with specific next steps when applicable."
    };

    const prompts = settings?.prompts || defaultPrompts;

    return new Response(JSON.stringify({ prompts }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-system-prompts function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
