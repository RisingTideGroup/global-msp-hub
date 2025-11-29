
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

    // Verify user owns the assistant being used
    const { assistantId, threadId, message } = await req.json();
    
    if (!assistantId || !threadId || !message) {
      throw new Error('Missing required fields: assistantId, threadId, or message');
    }

    // Check if user has access to this assistant
    const { data: assistant, error: assistantError } = await supabase
      .from('ai_assistants')
      .select('business_id, businesses!inner(owner_id)')
      .eq('openai_assistant_id', assistantId)
      .maybeSingle();

    if (assistantError || !assistant) {
      throw new Error('Assistant not found or access denied');
    }

    // Verify user owns the business that owns this assistant
    if (assistant.businesses.owner_id !== user.id) {
      throw new Error('Access denied - you do not own this assistant');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Sending message to assistant:', assistantId, 'thread:', threadId);

    // Add message to thread
    const addMessageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        role: 'user',
        content: message
      })
    });

    if (!addMessageResponse.ok) {
      const errorData = await addMessageResponse.text();
      throw new Error(`Failed to add message to thread: ${errorData}`);
    }

    // Create run
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: assistantId
      })
    });

    if (!runResponse.ok) {
      const errorData = await runResponse.text();
      throw new Error(`Failed to create run: ${errorData}`);
    }

    const run = await runResponse.json();

    // Poll for completion
    let runStatus = run;
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${run.id}`, {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      if (!statusResponse.ok) {
        throw new Error('Failed to check run status');
      }

      runStatus = await statusResponse.json();
    }

    if (runStatus.status !== 'completed') {
      throw new Error(`Run failed with status: ${runStatus.status}`);
    }

    // Get messages
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!messagesResponse.ok) {
      throw new Error('Failed to retrieve messages');
    }

    const messages = await messagesResponse.json();
    
    // Get the latest assistant message
    const assistantMessages = messages.data.filter((msg: any) => msg.role === 'assistant');
    if (assistantMessages.length === 0) {
      throw new Error('No assistant response found');
    }

    const latestMessage = assistantMessages[0];
    const responseContent = latestMessage.content[0]?.text?.value || 'No response content';

    return new Response(JSON.stringify({ 
      success: true,
      response: responseContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-assistant-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to chat with AI assistant' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
