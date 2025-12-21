# Restaurant Role-Play Modules - Complete Guide 🍽️

## 🎯 What We Have Now

**Clean Setup**: All old modules deleted, only 2 new restaurant role-play modules created

### Module 1: English Practice 🇬🇧
- **Title**: "Restaurant Conversation - English Practice"
- **For**: German speakers learning English
- **Target Language**: English (speech recognition: en-US)
- **Native Language**: German (explanations in German)
- **Scenario**: Customer at a London restaurant
- **Your Role**: Customer
- **AI Role**: Waiter
- **Vocabulary**: 28 English words with German translations

### Module 2: German Practice 🇩🇪
- **Title**: "Restaurant Conversation - German Practice"  
- **For**: English speakers learning German
- **Target Language**: German (speech recognition: de-DE)
- **Native Language**: English (explanations in English)
- **Scenario**: Customer at a Berlin restaurant
- **Your Role**: Kunde/Kundin (Customer)
- **AI Role**: Kellner/Kellnerin (Waiter)
- **Vocabulary**: 28 German words with English translations

## 🧪 Testing Instructions

### Test Login Credentials
- **Email**: `student.platinum@germanbuddy.com`
- **Password**: `password123`

### Test Both Modules

#### 1. **Test English Practice Module**
1. Go to: http://localhost:4200/learning-modules
2. Find: "Restaurant Conversation - English Practice"
3. Start AI Tutor session
4. **Expected Experience**:
   - AI speaks in English: "Welcome to Role-Play Session! You will be the Customer, I will be the Waiter..."
   - Speech recognition uses English (en-US)
   - Say "Let's start" in English
   - AI responds as English waiter: "Good evening! Welcome to our restaurant!"
   - Continue conversation in English using allowed vocabulary

#### 2. **Test German Practice Module**
1. Find: "Restaurant Conversation - German Practice"
2. Start AI Tutor session
3. **Expected Experience**:
   - AI speaks in English (explanations): "Welcome to Role-Play Session! You will be the Kunde/Kundin, I will be the Kellner..."
   - Speech recognition uses German (de-DE)
   - Say "Let's start" or "Beginnen wir" in German
   - AI responds as German waiter: "Guten Abend! Willkommen in unserem Restaurant!"
   - Continue conversation in German using allowed vocabulary

## 🎤 Speech Recognition Testing

### English Module:
- **Language**: English (en-US)
- **Test Phrases**: 
  - "Let's start"
  - "Hello, good evening"
  - "I would like water please"
  - "Can I have the menu?"
  - "What do you recommend?"
  - "How much is the chicken?"
  - "Can I have the bill?"

### German Module:
- **Language**: German (de-DE)
- **Test Phrases**:
  - "Beginnen wir" or "Let's start"
  - "Hallo, guten Abend"
  - "Ich möchte Wasser bitte"
  - "Kann ich die Speisekarte haben?"
  - "Was empfehlen Sie?"
  - "Wie viel kostet das Hähnchen?"
  - "Kann ich die Rechnung haben?"

## 🔍 What to Verify

### ✅ System Features:
- [ ] Only 2 modules appear in the learning modules list
- [ ] English module uses English speech recognition
- [ ] German module uses German speech recognition
- [ ] AI gives short welcome message (not long detailed explanation)
- [ ] Microphone auto-activates after AI finishes speaking
- [ ] Spoken words appear in chat automatically
- [ ] AI responds as waiter character (not generic responses)
- [ ] AI uses only allowed vocabulary during role-play
- [ ] "Show Details" button reveals vocabulary and grammar constraints
- [ ] "Stop" command ends the session gracefully

### ✅ ChatGPT-4o Integration:
- [ ] Backend logs show: "🤖 Using OpenAI ChatGPT-4o"
- [ ] AI responses are intelligent and contextual
- [ ] AI stays in character as waiter
- [ ] AI adapts to student's input appropriately
- [ ] No generic "Let's practice German/English" responses

### ✅ Role-Play Flow:
1. **Introduction**: AI explains scenario, waits for "Let's start"
2. **Character Mode**: AI switches to waiter, greets customer
3. **Conversation**: Natural back-and-forth within vocabulary constraints
4. **Completion**: AI recognizes when objective is achieved OR student says "stop"

## 🎯 Conversation Examples

### English Module Example:
```
AI: "Welcome to Role-Play Session! You will be the Customer, I will be the Waiter. Say 'Let's start' to begin."
You: "Let's start"
AI: "Good evening! Welcome to our restaurant. Here is your menu."
You: "Thank you. What do you recommend?"
AI: "Our chicken is very popular. We also have fresh fish today."
You: "I would like the chicken please."
AI: "Excellent choice! What would you like to drink?"
```

### German Module Example:
```
AI: "Welcome to Role-Play Session! You will be the Kunde, I will be the Kellner. Say 'Let's start' to begin."
You: "Beginnen wir"
AI: "Guten Abend! Willkommen in unserem Restaurant. Hier ist die Speisekarte."
You: "Danke. Was empfehlen Sie?"
AI: "Unser Hähnchen ist sehr beliebt. Wir haben auch frischen Fisch heute."
You: "Ich möchte das Hähnchen bitte."
AI: "Ausgezeichnete Wahl! Was möchten Sie trinken?"
```

## 🚀 Ready for Testing!

**Status**: ✅ Database cleaned, 2 new modules created, both servers running

**Next Steps**:
1. Test both modules with speech recognition
2. Verify language switching works correctly
3. Confirm ChatGPT-4o provides intelligent responses
4. Test the complete role-play flow from start to finish

Both modules are now ready for comprehensive testing! 🎉