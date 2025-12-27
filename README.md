# NutriChat - AI-Native Food Ingredient Interpreter

🥗 **Built for IIT Guwahati's Encode 2026 Hackathon**

An AI co-pilot that helps consumers understand food product ingredients through natural conversation, not forms or filters.

## 🌟 Features

- **Conversational Interface**: Chat naturally about food products
- **Smart Intent Detection**: AI infers your health concerns (diabetes, pregnancy, weight loss, etc.)
- **Simple Explanations**: Complex ingredients explained in everyday language
- **Instant Analysis**: Get quick, point-to-point answers with emojis and clear formatting
- **Indian Food Focus**: Pre-loaded with 25+ popular Indian products
- **No Signup Required**: Jump right into conversations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Gemini API key (get from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd nutri-chat

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your Gemini API key

# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file with:

```env
VITE_GEMINI_API_KEY="your_gemini_api_key_here"
```

Get your Gemini API key from: https://makersuite.google.com/app/apikey

## 💬 Example Conversations

**User**: "Is Maggi safe for kids?"

**NutriChat**: 
🔍 **Maggi Noodles**: ⚠️ Okay for occasional treats

Main concerns:
• **Too much salt** - 820mg (half your daily limit!)
• **MSG** - flavor booster, generally safe
• **Refined flour** - lacks nutrition

💡 **Better choice**: Whole wheat noodles or homemade pasta with veggies

---

**User**: "I'm diabetic, is Parle-G okay?"

**NutriChat**:
🔍 **Parle-G for Diabetes**: ❌ Not ideal

Main concerns:
• **High sugar** - 26g per 100g (6 teaspoons!)
• **Refined flour** - spikes blood sugar quickly
• **No fiber** - won't help control sugar

💡 **Better choice**: Sugar-free biscuits or nuts

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: Google Gemini 2.0 Flash
- **Build Tool**: Vite
- **Deployment**: Ready for Vercel/Netlify

## 📁 Project Structure

```
src/
├── components/          # UI components
│   ├── ui/             # shadcn/ui components
│   ├── ChatContainer.tsx
│   ├── ChatMessage.tsx
│   └── WelcomeMessage.tsx
├── data/
│   └── foodProducts.ts  # Indian food products database
├── services/
│   └── geminiService.ts # AI integration
└── pages/
    └── Index.tsx        # Main chat page
```

## 🥘 Supported Products

Pre-loaded with 25+ popular Indian products:
- Maggi Noodles, Parle-G, Britannia Marie Gold
- Amul Milk, Haldiram's Bhujia, MTR Ready-to-Eat
- Kurkure, Bournvita, Lays Chips
- And many more...

## 🎯 Key Design Principles

1. **AI-Native**: No forms, filters, or complex UI - just conversation
2. **Simple Language**: Avoid medical jargon, use everyday words
3. **Visual Clarity**: Emojis, bullet points, and clear formatting
4. **Honest Communication**: Acknowledge uncertainty, don't oversell
5. **Contextual**: Remember user's health concerns throughout conversation

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Netlify

```bash
# Build for production
npm run build

# Deploy dist/ folder to Netlify
```

## 🔧 Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📝 Adding New Products

Edit `src/data/foodProducts.ts`:

```typescript
{
  name: "Product Name",
  brand: "Brand Name",
  category: "Category",
  ingredients: ["ingredient1", "ingredient2"],
  nutritionPer100g: {
    calories: 400,
    sugar: 20,
    sodium: 500
  }
}
```

## 🎨 Customizing AI Responses

Edit the system prompt in `src/services/geminiService.ts` to change:
- Response tone and style
- Focus areas (health conditions, ingredients)
- Output format and length

## 📱 Mobile Responsive

Fully responsive design optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktop (1024px+)

## ⚠️ Disclaimer

This app provides educational information only. Always consult healthcare professionals for medical advice.

## 🏆 Built for Encode 2026

**Team**: [Your Team Name]
**Institution**: IIT Guwahati
**Hackathon**: Encode 2026

---

**Live Demo**: [Your deployed URL]
**GitHub**: [Your repo URL]
