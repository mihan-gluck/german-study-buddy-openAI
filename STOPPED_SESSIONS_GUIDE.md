# Stopped Sessions - Complete Guide

## 🎯 Overview

When students stop a module session in between (before completion), the system handles it differently from completed sessions. This guide shows exactly how stopped sessions appear in both student summaries and teacher views.

## 📊 Session States

### 1. ✅ **Completed Sessions**
- **Status**: `completed`
- **Module Completed**: Yes
- **Student Experience**: Full completion summary with congratulations
- **Teacher View**: Green success indicators

### 2. ⚠️ **Manually Ended Sessions** (Stopped Early)
- **Status**: `manually_ended`
- **Module Completed**: No
- **Student Experience**: Modified summary indicating early stop
- **Teacher View**: Yellow warning indicators

### 3. ❌ **Abandoned Sessions**
- **Status**: `abandoned`
- **Module Completed**: No
- **Student Experience**: No summary (student left without proper ending)
- **Teacher View**: Red danger indicators

## 👤 Student Summary Examples

### ✅ Completed Session Summary
```
Session Complete! 🎉

💬 Conversations: 15
⏱️ Time Spent: 20 minutes
📚 Vocabulary Used: hello, goodbye, restaurant, menu, order, please, thank you

Great job! 🌟
```

### ⚠️ Stopped Session Summary (NEW)
```
Session ended by your request. 🎯

💬 Conversations: 5
⏱️ Time Spent: 8 minutes
📚 Vocabulary Used: hello, menu, order

⚠️ Note: Module not completed - you can continue anytime!
Great job so far! 🌟
```

### ❌ Abandoned Session
- **No summary shown** (student left without proper ending)
- Session automatically marked as abandoned after timeout

## 👩‍🏫 Teacher Dashboard View

### Enhanced Visual Indicators

#### Row Colors:
- **Green Row**: Module completed successfully
- **Yellow Row**: Session stopped early (needs attention)
- **Red Row**: Session abandoned (requires follow-up)

#### Status Badges:
- **✅ Completed**: Session finished successfully
- **⚠️ Stopped Early**: Student ended session manually
- **❌ Abandoned**: Student left without completing
- **🔄 In Progress**: Session still active

#### Additional Indicators:
- **🛑 Stopped Early**: Clear warning for manually ended sessions
- **❌ Abandoned**: Danger indicator for abandoned sessions
- **⚠️ Very Short Session**: Warning for sessions under 5 minutes
- **📝 Needs Review**: Sessions requiring teacher attention

### Sample Teacher View

```
Student: John Smith (A2)
Module: Restaurant Conversation - English Practice
Session Info: 💬 5 conversations, ⏱️ 8 minutes ⚠️ Very Short Session
Performance: 📚 Vocabulary: 3 words (hello, menu, order)
Status: ⚠️ Stopped Early 🛑 Stopped Early 📝 Needs Review
Actions: [View Details] [Add Review]
```

## 📈 Performance Metrics for Stopped Sessions

### Conversation Count
- **Completed**: Usually 10-20+ conversations
- **Stopped Early**: Usually 2-10 conversations
- **Abandoned**: Usually 0-3 conversations

### Time Spent
- **Completed**: 15-30+ minutes
- **Stopped Early**: 5-15 minutes
- **Abandoned**: 1-5 minutes

### Vocabulary Usage
- **Completed**: 5-15+ words used
- **Stopped Early**: 1-5 words used
- **Abandoned**: 0-2 words used

### Scores
- **Completed**: High scores (80-200+ points)
- **Stopped Early**: Low-medium scores (20-80 points)
- **Abandoned**: Very low scores (0-20 points)

## 🎯 Teacher Insights & Actions

### For Stopped Sessions (⚠️):
**Possible Reasons:**
- Content too difficult for student level
- Time constraints (student had to leave)
- Technical issues or confusion
- Lack of engagement with content

**Recommended Actions:**
- Review conversation history for difficulty indicators
- Ask student about experience and challenges
- Consider adjusting module difficulty
- Provide encouragement to complete modules
- Check if student needs additional support

### For Abandoned Sessions (❌):
**Possible Reasons:**
- Technical problems (browser crash, internet issues)
- Student disengagement or frustration
- External interruptions
- System errors

**Recommended Actions:**
- Follow up with student directly
- Check for technical issues
- Assess student motivation and engagement
- Provide additional support or guidance
- Consider one-on-one session to address concerns

## 📊 Statistics Impact

### Completion Rates
- **Only completed sessions** count toward module completion
- **Stopped and abandoned sessions** are tracked separately
- **Overall engagement** includes all session types

### Progress Tracking
- **Module Progress**: Only advances with completed sessions
- **Time Tracking**: All session time is recorded
- **Vocabulary Progress**: Cumulative across all sessions

## 💡 Best Practices for Teachers

### Monitoring Stopped Sessions
1. **Regular Review**: Check stopped sessions weekly
2. **Pattern Recognition**: Look for recurring issues
3. **Student Communication**: Follow up on concerning patterns
4. **Content Adjustment**: Modify difficult modules based on feedback

### Encouraging Completion
1. **Set Expectations**: Explain importance of completing modules
2. **Break Down Content**: Create shorter modules if needed
3. **Provide Support**: Offer help for struggling students
4. **Celebrate Progress**: Acknowledge partial completion efforts

### Using Data Effectively
1. **Identify Trends**: Which modules have high stop rates?
2. **Student Patterns**: Which students frequently stop early?
3. **Time Analysis**: When do students typically stop?
4. **Content Review**: Which parts cause students to stop?

## 🔧 Technical Implementation

### Database Storage
```javascript
{
  sessionState: 'manually_ended', // or 'abandoned'
  isModuleCompleted: false,
  summary: {
    conversationCount: 5,
    timeSpentMinutes: 8,
    vocabularyUsed: ['hello', 'menu', 'order'],
    // ... other metrics
  }
}
```

### Frontend Display Logic
- **Color coding** based on session state
- **Badge indicators** for quick status recognition
- **Warning messages** for concerning patterns
- **Action buttons** for teacher follow-up

## 📋 Summary

Stopped sessions are clearly distinguished from completed sessions in both student and teacher interfaces:

**For Students:**
- Clear indication that module is not completed
- Encouragement to continue later
- Progress is still saved and recognized

**For Teachers:**
- Visual indicators highlight stopped sessions
- Detailed metrics help understand student behavior
- Action items guide appropriate follow-up
- Analytics help improve content and support

This system ensures that partial progress is valued while encouraging completion and providing teachers with the insights needed to support student success.