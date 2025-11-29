
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { assistantId, threadId } = await req.json();

    if (!assistantId) {
      throw new Error('Missing required field: assistantId');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Deleting OpenAI assistant: ${assistantId}`);
    console.log(`Deleting OpenAI thread: ${threadId}`);

    const errors: string[] = [];
    const successes: string[] = [];

    // Delete the thread first (if provided)
    if (threadId) {
      try {
        const threadResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        });

        if (!threadResponse.ok) {
          const errorData = await threadResponse.text();
          console.error(`Failed to delete OpenAI thread ${threadId}:`, errorData);
          errors.push(`Failed to delete thread: ${errorData}`);
        } else {
          console.log(`✓ Successfully deleted OpenAI thread: ${threadId}`);
          successes.push(`Deleted thread ${threadId}`);
        }
      } catch (error) {
        console.error(`Exception deleting OpenAI thread ${threadId}:`, error);
        errors.push(`Exception deleting thread: ${error.message}`);
      }
    }

    // Delete the assistant
    try {
      const assistantResponse = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });

      if (!assistantResponse.ok) {
        const errorData = await assistantResponse.text();
        console.error(`Failed to delete OpenAI assistant ${assistantId}:`, errorData);
        errors.push(`Failed to delete assistant: ${errorData}`);
      } else {
        console.log(`✓ Successfully deleted OpenAI assistant: ${assistantId}`);
        successes.push(`Deleted assistant ${assistantId}`);
      }
    } catch (error) {
      console.error(`Exception deleting OpenAI assistant ${assistantId}:`, error);
      errors.push(`Exception deleting assistant: ${error.message}`);
    }

    // Return result
    if (errors.length > 0) {
      console.log('Deletion completed with errors:', errors);
      return new Response(JSON.stringify({ 
        success: false,
        errors,
        successes,
        message: `Deletion completed with ${errors.length} errors`
      }), {
        status: 207, // Multi-Status
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.log('Deletion completed successfully:', successes);
      return new Response(JSON.stringify({ 
        success: true,
        successes,
        message: 'All resources deleted successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in delete-ai-assistant function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Failed to delete AI assistant' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
