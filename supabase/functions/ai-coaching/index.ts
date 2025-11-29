
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'coach';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header and verify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Invalid authentication');
    }
    const { prompt, context, type, conversationHistory = [] } = await req.json();

    if (!prompt || !type) {
      throw new Error('Missing required fields: prompt and type');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Use service role client only for reading system prompts (read-only operation)
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!, 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get system prompts configuration
    const { data: promptsData, error: promptsError } = await serviceSupabase
      .from('ai_system_prompts')
      .select('prompts')
      .maybeSingle();

    let systemPrompts;
    if (promptsError || !promptsData) {
      // Default prompts if none configured
      console.log('There was a failure loading prompts.\n ' + promptsError)
      systemPrompts = {
        global: "You are a helpful business assistant and expert consultant. Provide professional, actionable advice to help businesses grow and succeed.",
        mission: "Focus on helping the business articulate their core purpose and impact.",
        culture: "Guide them in defining the workplace environment and values they want to cultivate.",
        benefits: "Help them think through competitive compensation packages and unique perks.",
        values: "Assist in identifying fundamental principles that guide their business decisions.",
        general: "Provide general business guidance on strategy, operations, marketing, and growth.",
        cover_letter: "Help craft a compelling cover letter that highlights relevant skills and experience while demonstrating genuine interest in the position. Focus on connecting the candidate's background to the job requirements.",
        outputFormat: "Always provide clear, actionable suggestions. Format your response as well-structured HTML with proper headings, bullet points, and emphasis where appropriate. Use <h3> for main sections, <ul> for lists, <strong> for emphasis, and <p> for paragraphs."
      };
    } else {
      systemPrompts = promptsData.prompts;
    }

    // Build the complete system message
    const fieldSpecificPrompt = systemPrompts[type] || systemPrompts.general;
    const outputFormatInstructions = systemPrompts.outputFormat || "Always provide clear, actionable suggestions. Format your response as well-structured HTML with proper headings, bullet points, and emphasis where appropriate.";
    
    const completeSystemPrompt = `${systemPrompts.global}

${fieldSpecificPrompt}

${outputFormatInstructions}

IMPORTANT: Maintain context from our conversation history to provide relevant, personalized advice.`;

    // Convert conversation history to OpenAI message format
    const historyMessages = conversationHistory.map((msg: Message) => ({
      role: msg.role === 'coach' ? 'assistant' : 'user',
      content: msg.content
    }));

    // Prepare messages for chat completion with conversation history
    const messages = [
      {
        role: 'system',
        content: completeSystemPrompt
      },
      ...historyMessages,
      {
        role: 'user',
        content: `Current content: ${context || 'None'}

User question: ${prompt}`
      }
    ];

    console.log('Sending request to OpenAI with', messages.length, 'messages including', historyMessages.length, 'history messages');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API error: ${errorData}`);
    }

    const data = await response.json();
    const coaching = data.choices[0].message.content;

    return new Response(JSON.stringify({ coaching }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-coaching function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
