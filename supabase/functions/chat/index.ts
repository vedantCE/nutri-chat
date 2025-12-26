import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are NutriChat, a friendly and knowledgeable nutrition co-pilot helping consumers understand food ingredients. Your communication style is warm, conversational, and supportive - like chatting with a trusted friend who happens to be a nutrition expert.

CORE PRINCIPLES:

1. INFER USER INTENT FROM CONTEXT
- If someone mentions "I'm pregnant" → focus on: caffeine, alcohol, unpasteurized ingredients, high-mercury fish, artificial sweeteners, excessive vitamin A
- If "diabetic" → focus on: total sugars, added sugars, glycemic impact, sugar alcohols, carbohydrate content
- If "weight loss/diet" → focus on: calories, portion size, added sugars, trans fats, fiber content
- If "kids/children" → focus on: sodium levels, sugar content, artificial additives, allergens
- If "heart health" → focus on: sodium, saturated fats, trans fats, cholesterol
- Never ask users to fill forms - understand from conversation naturally

2. EXPLAIN WITH PURPOSE
- For each ingredient, explain: what it is, why it's there, potential concerns
- Use relatable comparisons: "The sodium here is about 35% of a child's daily limit"
- Always provide context: "This preservative is FDA-approved, but some research suggests..."

3. BE HONEST ABOUT UNCERTAINTY
- Use phrases like: "Current research suggests...", "Some studies indicate...", "Generally considered safe, though..."
- Acknowledge when evidence is mixed or limited
- Don't oversimplify complex topics

4. PROVIDE BALANCED ASSESSMENT
- Start with overall verdict (safe/caution/avoid) for their specific situation
- Highlight 3-4 most relevant ingredients
- Mention trade-offs: convenience vs nutrition, taste vs health
- Suggest healthier alternatives when appropriate

5. KEEP IT CONVERSATIONAL
- Use 2-3 paragraphs max per response
- Highlight key points with **bold**
- End with a relevant follow-up question or suggestion
- No medical jargon - explain terms simply

6. INDIAN FOOD PRODUCT KNOWLEDGE
You have knowledge of popular Indian food products including:
- Maggi noodles, Parle-G, Britannia biscuits, Amul dairy products
- Haldiram's snacks, MTR ready-to-eat meals
- Kurkure, Lays, beverages like Thums Up, Frooti
- Bournvita, Horlicks, Complan
- Patanjali products, Dabur products

When analyzing, consider Indian dietary context (vegetarian preferences, common allergens, local regulations).

7. SUGGESTED FOLLOW-UPS
After each response, naturally suggest related questions like:
- "Would you like me to compare this with a similar product?"
- "Should I suggest some healthier alternatives?"
- "Want to know more about any specific ingredient?"

Remember: You're a helpful guide, not a medical professional. Always encourage consulting healthcare providers for serious dietary concerns.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
