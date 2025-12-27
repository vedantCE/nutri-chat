import { FoodProduct, findProduct, searchProducts } from '@/data/foodProducts';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image?: string;
}

export interface UserContext {
  healthConcerns?: string[];
  dietaryRestrictions?: string[];
  goals?: string[];
  age?: string;
  conditions?: string[];
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

const SYSTEM_PROMPT = `You are a food helper. Use SIMPLE words that anyone can understand.

ALWAYS respond in this EXACT format:

For IMAGE ANALYSIS:
1. WHAT I SEE IN THE IMAGE
2. TYPES OF INGREDIENTS
3. BAD INGREDIENTS
4. SAFE FOR WHO?
5. ALLERGY WARNING
6. HEALTH INFO
7. RATING
8. BETTER CHOICES
9. IMPORTANT NOTE

For TEXT QUESTIONS:
🔍 ABOUT: [Food Name] - [Good/Okay/Bad]
📝 MAIN POINTS
⚠️ BAD STUFF
✅ EAT THESE INSTEAD
❌ DON'T EAT
⭐ RATING
💡 TIPS
⚖️ IMPORTANT NOTE

Use simple words. Make each point short and clear.`;

export class GeminiService {
  private apiKey: string;
  private userContext: UserContext = {};

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Gemini API key not found. Using mock responses.');
    }
  }

  private extractUserContext(message: string): void {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('pregnant') || lowerMessage.includes('pregnancy')) {
      this.userContext.conditions = [...(this.userContext.conditions || []), 'pregnancy'];
    }
    if (lowerMessage.includes('diabetic') || lowerMessage.includes('diabetes')) {
      this.userContext.conditions = [...(this.userContext.conditions || []), 'diabetes'];
    }
    if (lowerMessage.includes('lose weight') || lowerMessage.includes('weight loss')) {
      this.userContext.goals = [...(this.userContext.goals || []), 'weight_loss'];
    }
    if (lowerMessage.includes('kid') || lowerMessage.includes('child')) {
      this.userContext.age = 'child';
    }
  }

  private findRelevantProduct(message: string): FoodProduct | null {
    const exactMatch = findProduct(message);
    if (exactMatch) return exactMatch;

    const searchResults = searchProducts(message);
    if (searchResults.length > 0) return searchResults[0];

    return null;
  }

  private createContextualPrompt(userMessage: string, product?: FoodProduct, imageData?: string): string {
    let prompt = SYSTEM_PROMPT + '\n\n';
    
    if (Object.keys(this.userContext).length > 0) {
      prompt += `User Context: ${JSON.stringify(this.userContext)}\n\n`;
    }

    if (imageData) {
      prompt += `ANALYZE THE UPLOADED INGREDIENT IMAGE:\n`;
      prompt += `Follow the complete 9-step analysis structure above.\n`;
      prompt += `User question: ${userMessage}\n\n`;
    } else if (product) {
      prompt += `Product: ${product.name} by ${product.brand}
Ingredients: ${product.ingredients.slice(0, 8).join(', ')}
`;
      if (product.nutritionPer100g) {
        const nutrition = product.nutritionPer100g;
        prompt += `Calories: ${nutrition.calories}, Sugar: ${nutrition.sugar}g, Sodium: ${nutrition.sodium}mg\n`;
      }
      prompt += `\nUser asks: ${userMessage}\n\nProvide detailed nutrition analysis with harmful component highlighting.`;
    } else {
      prompt += `User asks: ${userMessage}\n\nProvide detailed nutrition advice with harmful component highlighting.`;
    }
    
    return prompt;
  }

  private async callGeminiAPI(prompt: string, imageData?: string): Promise<string> {
    if (!this.apiKey) {
      return this.getMockResponse(prompt);
    }

    try {
      const parts: any[] = [{ text: prompt }];
      
      if (imageData) {
        parts.push({
          inline_data: {
            mime_type: "image/jpeg",
            data: imageData.split(',')[1] // Remove data:image/jpeg;base64, prefix
          }
        });
      }

      const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getMockResponse(prompt);
    }
  }

  private getMockResponse(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('analyze the uploaded ingredient image')) {
      return `1. VISUAL INGREDIENT ANALYSIS
- Wheat flour (maida) - **High confidence**
- Sugar - **High confidence** 
- Palm oil - **Medium confidence**
- Salt - **High confidence**
- Artificial colors (E110, E129) - **Medium confidence**
- Preservatives (E211) - **Low confidence** (text partially unclear)

2. INGREDIENT CLASSIFICATION
**Natural ingredients:** Wheat flour, sugar, salt
**Processed ingredients:** Palm oil, invert syrup
**Artificial/chemical additives:** E110 (Sunset Yellow), E129 (Allura Red), E211 (Sodium Benzoate)

3. HARMFUL & RISKY INGREDIENTS
🔴 **High Risk:** E110 & E129 (Artificial colors) - Linked to hyperactivity in children, potential carcinogen
🟡 **Medium Risk:** Palm oil - High saturated fat, environmental concerns - Limit to 10g daily

4. SAFETY ASSESSMENT
**Children:** 🔴 Not recommended (artificial colors harmful)
**Adults:** 🟡 Use with caution (limit consumption)
**Special warnings for:** Pregnant women (avoid artificial additives), ADHD children (colors worsen symptoms)

5. ALLERGEN CHECK
⚠️ **Contains:** Gluten (wheat), may contain traces of nuts, dairy

6. HEALTH & NUTRITION INSIGHT
- **Ultra-processed:** Yes
- **High in:** Sugar (26g per 100g), artificial additives
- **Healthiness Level:** Low

7. HEALTH RATING
**Overall Rating:** ⭐⭐ (2/5 stars)

8. SMART HEALTH TIPS
- Choose whole wheat alternatives without artificial colors
- Limit to 2-3 pieces occasionally
- Make homemade cookies with natural ingredients

9. DISCLAIMER
"This analysis is based on visual recognition and general food safety knowledge. It is not a medical diagnosis. For specific health conditions, consult a qualified healthcare professional."`;
    }
    
    // Specific product questions first
    if (lowerPrompt.includes('maggi')) {
      return `🔍 ABOUT: Maggi Noodles - Okay

📝 MAIN POINTS
• Has too much salt - 820mg (more than half your daily need)
• Made with white flour - not very healthy
• Gives quick energy but makes you hungry again fast

⚠️ BAD STUFF
• **MSG** - Can give headaches to some people
• **TBHQ** - Chemical that might hurt your liver
• **Too much salt** - Bad for your heart

✅ EAT THESE INSTEAD
• Whole wheat noodles with vegetables
• Homemade pasta with tomato sauce
• Brown rice noodles

❌ DON'T EAT
• Every day - only sometimes
• With extra salt or sauce
• Late at night

⭐ RATING
**2 out of 5 stars** - Not great but okay sometimes

💡 TIPS
• Only eat once a week
• Add fresh vegetables
• Drink lots of water after eating

⚖️ IMPORTANT NOTE
"This is just advice. Ask a doctor for health problems."`;
    }

    // Cancer risk questions (more specific first)
    if (lowerPrompt.includes('cancer') || lowerPrompt.includes('hormone')) {
      return `🔍 ABOUT: Cancer Risk Ingredients

📝 MAIN POINTS
• **Artificial colors (Red 40, Yellow 6)** - Some studies link to cancer risk
• **Nitrates/Nitrites** - In processed meats, may form cancer-causing compounds
• **BHA/BHT preservatives** - Possible cancer risk, banned in some countries

⚠️ BAD STUFF
• **Processed meats** - WHO classified as cancer-causing
• **Artificial sweeteners** - Some studies suggest cancer links
• **Pesticide residues** - May disrupt hormones and increase cancer risk

✅ EAT THESE INSTEAD
• Fresh fruits and vegetables
• Organic foods without pesticides
• Natural, unprocessed foods

❌ DON'T EAT
• Processed and cured meats daily
• Foods with artificial colors and preservatives
• Non-organic foods with high pesticide residues

⭐ RATING
**Risk Level: 4 out of 5 stars** - High concern

💡 TIPS
• Choose organic when possible
• Limit processed foods
• Eat variety of colorful natural foods

⚖️ IMPORTANT NOTE
"This is just advice. Ask a doctor for health problems."`;
    }

    // Allergen questions
    if (lowerPrompt.includes('allerg') || lowerPrompt.includes('gluten') || lowerPrompt.includes('dairy') || lowerPrompt.includes('lactose')) {
      return `🔍 ABOUT: Allergen Information

📝 MAIN POINTS
• **Common allergens** - Nuts, dairy, gluten, soy, eggs, shellfish
• **Hidden allergens** - May be in unexpected foods
• **Cross-contamination** - Can happen during manufacturing

⚠️ BAD STUFF
• **"May contain" labels** - Risk of cross-contamination
• **Hidden dairy** - In many processed foods
• **Gluten in sauces** - Often hidden in seasonings

✅ EAT THESE INSTEAD
• Certified allergen-free products
• Fresh, whole foods
• Foods with clear, simple ingredient lists

❌ DON'T EAT
• Products with "may contain" warnings if severely allergic
• Foods with unclear ingredient lists
• Cross-contaminated products

⭐ RATING
**Safety Level: 5 out of 5 stars** - Critical for allergic people

💡 TIPS
• Always read labels carefully
• Contact manufacturers if unsure
• Carry emergency medication if needed

⚖️ IMPORTANT NOTE
"This is just advice. Ask a doctor for health problems."`;
    }

    // General harmful ingredients (less specific, comes later)
    if (lowerPrompt.includes('harmful') || lowerPrompt.includes('controversial') || lowerPrompt.includes('avoid')) {
      return `🔍 ABOUT: Harmful Ingredients Analysis

📝 MAIN POINTS
• **MSG (E621)** - Can cause headaches and nausea in some people
• **TBHQ preservative** - May damage liver with long-term use
• **Artificial colors (E110, E129)** - Linked to hyperactivity in children

⚠️ BAD STUFF
• **Trans fats** - Increase heart disease risk, banned in many countries
• **High sodium** - Causes high blood pressure and kidney problems
• **Artificial sweeteners** - May disrupt gut bacteria and metabolism

✅ EAT THESE INSTEAD
• Foods with natural ingredients only
• Homemade meals with fresh ingredients
• Organic products without chemicals

❌ DON'T EAT
• Foods with long chemical ingredient lists
• Products with artificial colors and flavors
• Highly processed packaged foods

⭐ RATING
**Awareness Level: 5 out of 5 stars** - Very important to know

💡 TIPS
• Read ingredient labels carefully
• Choose products with less than 5 ingredients
• Avoid ingredients you can't pronounce

⚖️ IMPORTANT NOTE
"This is just advice. Ask a doctor for health problems."`;
    }

    if (lowerPrompt.includes('cupcake') || lowerPrompt.includes('cup cake')) {
      return `🔍 ABOUT: Cupcake Ingredients - Okay

📝 MAIN POINTS
• Made with white flour, sugar, butter, and eggs
• Has lots of sugar - about 20-25g per cupcake
• Frosting adds even more sugar and fat

⚠️ BAD STUFF
• **Too much sugar** - Can cause tooth decay and weight gain
• **White flour** - Not very nutritious, spikes blood sugar
• **Artificial colors in frosting** - May cause hyperactivity in kids

✅ EAT THESE INSTEAD
• Homemade muffins with whole wheat flour
• Banana bread with less sugar
• Fresh fruit with yogurt

❌ DON'T EAT
• More than one at a time
• Every day - only for special occasions
• Store-bought ones with lots of chemicals

⭐ RATING
**2 out of 5 stars** - Treat food only

💡 TIPS
• Make at home with healthier ingredients
• Use whole wheat flour and less sugar
• Add fruits like blueberries for nutrition

⚖️ IMPORTANT NOTE
"This is just advice. Ask a doctor for health problems."`;
    }

    if (lowerPrompt.includes('pizza')) {
      return `🔍 ABOUT: Pizza Ingredients - Okay

📝 MAIN POINTS
• Made with flour, tomato sauce, cheese, and toppings
• Can be healthy or unhealthy depending on toppings
• Cheese provides protein and calcium

⚠️ BAD STUFF
• **Too much cheese** - High in saturated fat and calories
• **Processed meats** - Like pepperoni, high in sodium and preservatives
• **White flour crust** - Not very nutritious

✅ EAT THESE INSTEAD
• Whole wheat crust pizza
• Vegetable toppings like bell peppers, mushrooms
• Less cheese, more tomato sauce

❌ DON'T EAT
• Deep dish or thick crust - too many calories
• Lots of processed meats
• More than 2-3 slices

⭐ RATING
**3 out of 5 stars** - Can be healthy with right toppings

💡 TIPS
• Make at home with whole wheat base
• Load up on vegetables
• Use less cheese, more herbs

⚖️ IMPORTANT NOTE
"This is just advice. Ask a doctor for health problems."`;
    }

    if (lowerPrompt.includes('chocolate') || lowerPrompt.includes('candy')) {
      return `🔍 ABOUT: Chocolate/Candy - Bad for Daily Eating

📝 MAIN POINTS
• Made mostly of sugar and cocoa (for chocolate)
• Very high in calories and sugar
• Can be addictive and cause cravings

⚠️ BAD STUFF
• **Lots of sugar** - Causes tooth decay and blood sugar spikes
• **Artificial colors** - May cause hyperactivity in children
• **High calories** - Easy to gain weight

✅ EAT THESE INSTEAD
• Dark chocolate (70% cocoa or higher)
• Fresh fruits like grapes or berries
• Dates or dried fruits without added sugar

❌ DON'T EAT
• Every day - only as occasional treats
• Large amounts at once
• Before meals - spoils appetite

⭐ RATING
**1 out of 5 stars** - Only for special treats

💡 TIPS
• Choose dark chocolate over milk chocolate
• Eat small portions
• Brush teeth after eating sweets

⚖️ IMPORTANT NOTE
"This is just advice. Ask a doctor for health problems."`;
    }

    if (lowerPrompt.includes('bread')) {
      return `🔍 ABOUT: Bread Ingredients - Depends on Type

📝 MAIN POINTS
• Made with flour, water, yeast, and salt
• White bread vs whole wheat bread are very different
• Good source of carbs for energy

⚠️ BAD STUFF
• **White bread** - Made with refined flour, lacks nutrients
• **Added sugar** - Some breads have unnecessary sugar
• **Preservatives** - Store-bought bread has chemicals to stay fresh

✅ EAT THESE INSTEAD
• Whole wheat bread - has fiber and nutrients
• Multigrain bread with seeds
• Homemade bread without preservatives

❌ DON'T EAT
• Too much white bread
• Bread with lots of added sugar
• Moldy or stale bread

⭐ RATING
**3 out of 5 stars** - Good if you choose whole grain

💡 TIPS
• Read labels - choose bread with whole grains first
• Look for bread with less than 5 ingredients
• Store properly to avoid mold

⚖️ IMPORTANT NOTE
"This is just advice. Ask a doctor for health problems."`;
    }
    
    if (lowerPrompt.includes('maggi')) {
      return `## 🔍 ABOUT: Maggi Noodles - Okay

## 📝 MAIN POINTS
• Has too much salt - 820mg (more than half your daily need)
• Made with white flour - not very healthy
• Gives quick energy but makes you hungry again fast

## ⚠️ BAD STUFF
• **MSG** - Can give headaches to some people
• **TBHQ** - Chemical that might hurt your liver
• **Too much salt** - Bad for your heart

## ✅ EAT THESE INSTEAD
• Whole wheat noodles with vegetables
• Homemade pasta with tomato sauce
• Brown rice noodles

## ❌ DON'T EAT
• Every day - only sometimes
• With extra salt or sauce
• Late at night

## ⭐ RATING
**2 out of 5 stars** - Not great but okay sometimes

## 💡 TIPS
• Only eat once a week
• Add fresh vegetables
• Drink lots of water after eating

## ⚖️ IMPORTANT NOTE
"This is just advice. Ask a doctor for health problems."`;
    }

    if (lowerPrompt.includes('parle-g') || lowerPrompt.includes('biscuit')) {
      if (lowerPrompt.includes('diabetic')) {
      return `🔍 ABOUT: Parle-G for Diabetes - Bad

📝 MAIN POINTS
• Has 26g sugar (6 spoons) - makes blood sugar go up fast
• Made with white flour - bad for diabetes
• No fiber to help control sugar

⚠️ BAD STUFF
• **Too much sugar** - Makes diabetes worse
• **Palm oil** - Bad fat that hurts your heart
• **White flour** - Spikes blood sugar quickly

✅ EAT THESE INSTEAD
• Sugar-free biscuits
• Almonds (10-15 pieces)
• Roasted chana

❌ DON'T EAT
• Any sweet biscuits
• Cookies with sugar
• With sweet tea or milk

⭐ RATING
**1 out of 5 stars** - Very bad for diabetes

💡 TIPS
• Check blood sugar after eating new foods
• Choose snacks with less than 5g sugar
• Always eat protein with carbs

⚖️ IMPORTANT NOTE
"This is just advice. Ask your doctor about diabetes food."`;
      }
      
      return `🔍 ABOUT: Parle-G Biscuits - Okay

📝 MAIN POINTS
• Has lots of sugar (26g) - gives energy but makes you want more
• Made with white flour - not very healthy
• Has 460 calories - easy to eat too much

⚠️ BAD STUFF
• **Palm oil** - Bad fat for your heart
• **Too much sugar** - Bad for teeth and weight
• **Chemicals (E322, E471)** - May upset your stomach

✅ EAT THESE INSTEAD
• Whole wheat biscuits
• Homemade oats cookies
• Fresh fruits with nuts

❌ DON'T EAT
• More than 2-3 pieces daily
• With sweet tea
• Late at night

⭐ RATING
**2 out of 5 stars** - Okay sometimes

💡 TIPS
• Only eat as treats, not daily
• Drink plain tea with it
• Choose whole grain options when possible

⚖️ IMPORTANT NOTE
"This is just advice. Ask a doctor for health problems."`;
    }

    return `🔍 ABOUT: Food Helper - Ready to Help

📝 MAIN POINTS
• I check food ingredients to help you eat better
• I find bad chemicals that can hurt you
• I give advice based on your health needs

⚠️ BAD STUFF
• **Fake colors** - Can make kids hyper, might cause cancer
• **Bad fats** - Hurt your heart, banned in many countries
• **Too much salt** - Bad for your heart over time

✅ EAT THESE INSTEAD
• Fresh fruits and vegetables
• Home cooked food
• Foods from your local area

❌ DON'T EAT
• Foods with long ingredient lists
• Foods with fake colors and flavors
• Foods with chemicals you can't pronounce

⭐ RATING
**5 out of 5 stars** - I'm here to help you!

💡 TIPS
• Read labels - choose foods with less than 5 ingredients
• Cook at home most of the time
• Ask me about any food you're not sure about

⚖️ IMPORTANT NOTE
"This is just advice. Ask a doctor for health problems."`;
  }

  async generateResponse(userMessage: string, conversationHistory: ChatMessage[] = [], imageData?: string): Promise<string> {
    this.extractUserContext(userMessage);
    const product = this.findRelevantProduct(userMessage);
    const prompt = this.createContextualPrompt(userMessage, product || undefined, imageData);
    const response = await this.callGeminiAPI(prompt, imageData);
    
    return response;
  }

  getUserContext(): UserContext {
    return this.userContext;
  }

  resetContext(): void {
    this.userContext = {};
  }
}

export const geminiService = new GeminiService();