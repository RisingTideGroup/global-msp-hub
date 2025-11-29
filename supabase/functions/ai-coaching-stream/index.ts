
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, upgrade, connection, sec-websocket-key, sec-websocket-version, sec-websocket-protocol',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, UPGRADE',
};

serve(async (req) => {
  console.log("Edge function called, method:", req.method);
  console.log("Full URL:", req.url);
  console.log("Headers received:", Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight");
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  // Check for WebSocket upgrade headers
  const upgrade = req.headers.get("upgrade");
  const connection = req.headers.get("connection");
  const wsKey = req.headers.get("sec-websocket-key");
  const wsVersion = req.headers.get("sec-websocket-version");
  
  console.log("WebSocket headers check:");
  console.log("- upgrade:", upgrade);
  console.log("- connection:", connection);
  console.log("- sec-websocket-key:", wsKey);
  console.log("- sec-websocket-version:", wsVersion);

  // More lenient WebSocket detection for Cloudflare proxy
  const isWebSocketRequest = (
    upgrade?.toLowerCase() === "websocket" ||
    connection?.toLowerCase().includes("upgrade") ||
    wsKey !== null ||
    req.headers.get("sec-websocket-protocol") !== null
  );

  if (!isWebSocketRequest) {
    console.log("Not a WebSocket request - missing required headers");
    console.log("This might be a regular HTTP request or headers were stripped by proxy");
    
    // Return a helpful response for non-WebSocket requests
    return new Response(JSON.stringify({ 
      error: "WebSocket connection required",
      received_headers: Object.fromEntries(req.headers.entries()),
      help: "This endpoint requires a WebSocket connection. Make sure your client sends proper WebSocket upgrade headers."
    }), { 
      status: 400,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });
  }

  try {
    console.log("Attempting WebSocket upgrade...");
    
    // Try to upgrade to WebSocket
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    console.log("WebSocket upgrade successful");
    
    socket.onopen = () => {
      console.log("WebSocket connection opened - server side");
      try {
        socket.send(JSON.stringify({ 
          type: 'connection_established',
          message: 'WebSocket connection successful' 
        }));
        console.log("Sent connection_established message");
      } catch (e) {
        console.error("Error sending initial message:", e);
      }
    };

    socket.onmessage = async (event) => {
      try {
        console.log("Received WebSocket message:", event.data);
        const data = JSON.parse(event.data);
        const { prompt, context, type } = data;
        
        if (!prompt || !type) {
          console.log("Missing required fields in message");
          socket.send(JSON.stringify({ 
            type: 'error',
            error: 'Missing required fields: prompt and type' 
          }));
          return;
        }

        const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
        if (!openaiApiKey) {
          console.log("OpenAI API key not found");
          socket.send(JSON.stringify({ 
            type: 'error',
            error: 'OpenAI API key not configured' 
          }));
          return;
        }

        console.log("Processing AI coaching request for type:", type);

        // Get Supabase client for system prompts
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get system prompts configuration
        console.log("Fetching system prompts...");
        const { data: promptsData, error: promptsError } = await supabase
          .from('ai_system_prompts')
          .select('prompts')
          .maybeSingle();

        let systemPrompts;
        if (promptsError || !promptsData) {
          console.log('Using default prompts due to error:', promptsError);
          systemPrompts = {
            global: "You are a helpful business assistant and expert consultant. Provide professional, actionable advice to help businesses grow and succeed.",
            mission: "Focus on helping the business articulate their core purpose and impact.",
            culture: "Guide them in defining the workplace environment and values they want to cultivate.",
            benefits: "Help them think through competitive compensation packages and unique perks.",
            values: "Assist in identifying fundamental principles that guide their business decisions.",
            general: "Provide general business guidance on strategy, operations, marketing, and growth.",
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

${outputFormatInstructions}`;

        // Prepare messages for chat completion
        const messages = [
          {
            role: 'system',
            content: completeSystemPrompt
          },
          {
            role: 'user',
            content: `Current content: ${context || 'None'}

User question: ${prompt}`
          }
        ];

        console.log("Calling OpenAI API with streaming...");

        // Stream response from OpenAI
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000,
            stream: true
          }),
        });

        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.text();
          console.error("OpenAI API error:", errorData);
          socket.send(JSON.stringify({ 
            type: 'error',
            error: `OpenAI API error: ${errorData}` 
          }));
          return;
        }

        const reader = openaiResponse.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          console.log("Failed to get response reader");
          socket.send(JSON.stringify({ 
            type: 'error',
            error: 'Failed to get response reader' 
          }));
          return;
        }

        // Signal stream start
        console.log("Starting stream...");
        socket.send(JSON.stringify({ type: 'stream_start' }));

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              console.log("Stream completed");
              socket.send(JSON.stringify({ type: 'stream_end' }));
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                
                if (data === '[DONE]') {
                  console.log("Received [DONE] signal");
                  socket.send(JSON.stringify({ type: 'stream_end' }));
                  break;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    socket.send(JSON.stringify({ 
                      type: 'stream_token', 
                      content: content 
                    }));
                  }
                } catch (parseError) {
                  // Skip invalid JSON lines
                  console.log("Skipping invalid JSON line:", data);
                  continue;
                }
              }
            }
          }
        } catch (streamError) {
          console.error('Streaming error:', streamError);
          socket.send(JSON.stringify({ 
            type: 'error',
            error: 'Streaming error occurred' 
          }));
        }

      } catch (error) {
        console.error('Error in WebSocket message handler:', error);
        socket.send(JSON.stringify({ 
          type: 'error',
          error: error.message 
        }));
      }
    };

    socket.onclose = (event) => {
      console.log("WebSocket connection closed - server side. Code:", event.code, "Reason:", event.reason || "No reason provided");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error in edge function:", error);
    };

    console.log("Returning WebSocket response");
    return response;

  } catch (error) {
    console.error('Error upgrading to WebSocket:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return new Response(JSON.stringify({ 
      error: `Failed to upgrade to WebSocket: ${error.message}`,
      details: "This might be due to proxy configuration or missing WebSocket headers"
    }), { 
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });
  }
});
