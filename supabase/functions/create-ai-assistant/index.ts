import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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

    const { businessId, assistantType, businessContext } = await req.json();

    // Verify user owns this business
    const { data: businessData, error: businessError } = await supabaseAuth
      .from('businesses')
      .select('owner_id')
      .eq('id', businessId)
      .maybeSingle();

    if (businessError || !businessData) {
      console.error('Error verifying business ownership:', businessError);
      return new Response(JSON.stringify({ error: 'Business not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (businessData.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: 'You do not own this business' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!businessId || !assistantType || !businessContext) {
      throw new Error('Missing required fields: businessId, assistantType, or businessContext');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create the Supabase client with service role for database operations
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get system prompts configuration
    const { data: promptsData, error: promptsError } = await supabase
      .from('ai_system_prompts')
      .select('prompts')
      .maybeSingle();

    let systemPrompts;
    if (promptsError || !promptsData) {
      // Default prompts if none configured
      systemPrompts = {
        global: "You are a helpful business assistant and expert consultant. Provide professional, actionable advice to help businesses grow and succeed.",
        outputFormat: "Always provide clear, actionable suggestions. Format your response professionally."
      };
    } else {
      systemPrompts = promptsData.prompts;
    }

    // Prepare the assistant instructions using configured prompts
    const assistantInstructions = `${systemPrompts.global}

You are currently helping ${businessContext.name}, ${businessContext.industry ? `a ${businessContext.industry} company` : 'a business'} ${businessContext.location ? `located in ${businessContext.location}` : ''}.

Business Details:
- Company: ${businessContext.name}
- Industry: ${businessContext.industry || 'Not specified'}
- Size: ${businessContext.company_size || 'Not specified'}  
- Location: ${businessContext.location || 'Not specified'}
- Description: ${businessContext.description || 'Not provided yet'}

Your role is to help them develop their business profile by:
1. Providing expert guidance on each section of their business profile
2. Asking thoughtful questions to help them think deeper about their business
3. Offering industry-specific insights and best practices
4. Helping them articulate their vision, mission, values, and culture clearly
5. Suggesting improvements to make their business more attractive to potential employees and customers

When they're working on a specific field, provide contextual advice for that field while keeping in mind their overall business goals and industry. Be encouraging, professional, and insightful.

Always remember the context of previous conversations and build upon what you've learned about their business.

${systemPrompts.outputFormat}`;

    // Create OpenAI Assistant
    const assistantResponse = await fetch('https://api.openai.com/v1/assistants', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        name: `${businessContext.name} Business Coach`,
        instructions: assistantInstructions,
        tools: [],
        temperature: 0.7
      })
    });

    if (!assistantResponse.ok) {
      const errorData = await assistantResponse.text();
      throw new Error(`Failed to create OpenAI assistant: ${errorData}`);
    }

    const assistant = await assistantResponse.json();

    // Create OpenAI Thread
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({})
    });

    if (!threadResponse.ok) {
      const errorData = await threadResponse.text();
      throw new Error(`Failed to create OpenAI thread: ${errorData}`);
    }

    const thread = await threadResponse.json();

    // Calculate expiration for basic plan (24 hours from now)
    const expiresAt = assistantType === 'basic' 
      ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Store in Supabase
    const { data: aiAssistant, error: dbError } = await supabase
      .from('ai_assistants')
      .insert({
        business_id: businessId,
        openai_assistant_id: assistant.id,
        openai_thread_id: thread.id,
        assistant_type: assistantType,
        expires_at: expiresAt,
        is_active: true
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to save assistant to database: ${dbError.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      assistant: aiAssistant,
      openai_assistant_id: assistant.id,
      openai_thread_id: thread.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-ai-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create AI assistant' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
