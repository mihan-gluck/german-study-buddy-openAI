# Teacher Guide: Setting Minimum Completion Time

## 🎯 What is Minimum Completion Time?

The **Minimum Completion Time** is the shortest amount of time a student must spend in a module before the AI bot can complete the session automatically.

### Why is this important?

- Ensures students get adequate practice time
- Prevents rushing through important concepts
- Allows natural completion for quick scenarios
- Gives you control over learning depth

---

## ⏱️ How to Set the Right Time

### Quick Reference Table

| Scenario Type | Example | Suggested Time |
|---------------|---------|----------------|
| **Quick Interaction** | Ordering coffee, buying ticket, greetings | **5-8 minutes** |
| **Standard Conversation** | Restaurant meal, shopping, hotel check-in | **10-15 minutes** |
| **Complex Interaction** | Job interview, business meeting, negotiation | **15-20 minutes** |
| **Grammar Practice** | Verb conjugation, sentence structure | **15 minutes** |
| **Vocabulary Building** | Learning new words, phrases | **15 minutes** |
| **Free Conversation** | Open discussion, casual chat | **12 minutes** |
| **Reading Comprehension** | Text analysis, questions | **20 minutes** |
| **Writing Practice** | Essay, letter writing | **20 minutes** |
| **Listening Exercises** | Audio comprehension | **10 minutes** |

---

## 📝 When Creating a Module

### Step 1: Choose Your Module Type
Think about what students will practice:
- Is it a quick transaction? (coffee order)
- Is it a full conversation? (restaurant dining)
- Is it complex problem-solving? (job interview)

### Step 2: Set the Time
In the module creation form, you'll see:

```
Minimum Completion Time: [__] minutes
Suggestions: Quick (5-8) | Standard (10-15) | Complex (15-20)
```

**Enter a number between 5-60 minutes**

### Step 3: Consider These Factors

✅ **Vocabulary Count**: More words = more time needed
- 5-10 words: 5-8 minutes
- 10-20 words: 10-15 minutes
- 20+ words: 15-20 minutes

✅ **Grammar Complexity**: Complex structures need more practice
- Simple present: 8-10 minutes
- Past tense: 12-15 minutes
- Subjunctive: 15-20 minutes

✅ **Conversation Stages**: Count the steps
- 2-3 stages (greet, order, pay): 5-8 minutes
- 4-5 stages (greet, browse, ask, order, pay): 10-15 minutes
- 6+ stages (full interaction): 15-20 minutes

✅ **Student Level**: Beginners need more time
- A1-A2: Add 2-3 minutes
- B1-B2: Standard time
- C1-C2: Can reduce by 2-3 minutes

---

## 💡 Examples

### Example 1: Quick Coffee Order ☕
```
Scenario: Student orders coffee at a café
Vocabulary: 8 words (coffee, please, size, milk, sugar, pay, thank you)
Stages: Greet → Order → Pay (3 stages)
Level: A1

Recommended Time: 6 minutes
```

### Example 2: Restaurant Dining 🍽️
```
Scenario: Full restaurant experience
Vocabulary: 25 words (menu items, ordering, complaints, bill)
Stages: Greet → Menu → Order → Eat → Problem → Bill (6 stages)
Level: A2

Recommended Time: 12 minutes
```

### Example 3: Job Interview 💼
```
Scenario: Formal job interview
Vocabulary: 40+ words (qualifications, experience, skills)
Stages: Introduction → Questions → Discussion → Closing (4 complex stages)
Level: B2

Recommended Time: 18 minutes
```

---

## 🎭 What Happens During the Session?

### If Student Completes BEFORE Minimum Time:

```
Time: 5 minutes (minimum: 10 minutes)
Student: "I'd like the bill please" (tries to finish)
AI: "Thank you for dining!"

System Override:
"Great progress! Let's continue practicing to reinforce 
what you've learned. We have about 5 more minutes to 
explore this topic further. What would you like to 
practice next?"

→ Session continues with additional practice
```

### If Student Completes AFTER Minimum Time:

```
Time: 12 minutes (minimum: 10 minutes)
Student: Completes all objectives
AI: "Thank you for practicing! Have a great day!"

System Response:
"Would you like to end this session now?"
Options: [Yes, end session] [Continue practicing]

→ Student chooses when to end
```

---

## 🔧 Tips for Success

### ✅ DO:
- Set realistic times based on scenario complexity
- Consider your students' level
- Test the module yourself first
- Adjust time if students consistently finish early/late

### ❌ DON'T:
- Set time too short (< 5 min) - not enough practice
- Set time too long (> 30 min) - students lose focus
- Use same time for all modules - customize!
- Forget to test your modules

---

## 📊 Monitoring and Adjusting

### After Students Use Your Module:

1. **Check Session Records**
   - How long do students actually take?
   - Are they finishing early or late?

2. **Read Student Feedback**
   - "Too short" → Increase time
   - "Too long" → Decrease time
   - "Just right" → Perfect!

3. **Adjust as Needed**
   - Edit the module
   - Change minimum completion time
   - Save and republish

---

## ❓ FAQ

**Q: What if I set the time too short?**
A: Students will complete quickly but may not get enough practice. You can edit the module and increase the time.

**Q: What if I set the time too long?**
A: Students might get frustrated waiting. You can edit the module and decrease the time.

**Q: Can students end the session early?**
A: Yes! Students can always say "stop" to end manually, but the module won't be marked as completed if they haven't met the minimum time.

**Q: What's the default time?**
A: 15 minutes for backward compatibility, but you should customize it for each module.

**Q: Can I change the time after creating the module?**
A: Yes! Edit the module and update the minimum completion time anytime.

**Q: Does this affect existing modules?**
A: Existing modules will default to 15 minutes until you edit them or run the migration script.

---

## 🎓 Best Practices

1. **Start Conservative**: Set a slightly longer time, then reduce if needed
2. **Test First**: Try the module yourself before publishing
3. **Get Feedback**: Ask students if the time feels right
4. **Be Consistent**: Similar scenarios should have similar times
5. **Document**: Note why you chose that time (for future reference)

---

## 📞 Need Help?

If you're unsure about the right time for your module:
- Ask a colleague to test it
- Start with the suggested ranges above
- Monitor student completion times
- Adjust based on feedback

Remember: You can always change it later! 🎯

---

**Last Updated**: February 7, 2026
