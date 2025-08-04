# Cost Management & Monitoring Guide
## OpenAI API Integration for BankGPT

### Overview

This document provides detailed guidance on managing costs and monitoring the OpenAI API integration for the BankGPT application.

---

## Cost Structure Analysis

### OpenAI API Pricing (Current as of 2024)

#### GPT-3.5-turbo
- **Input**: $0.0005 per 1K tokens
- **Output**: $0.0015 per 1K tokens
- **Context Window**: 4,096 tokens

#### GPT-4
- **Input**: $0.03 per 1K tokens  
- **Output**: $0.06 per 1K tokens
- **Context Window**: 8,192 tokens

### Token Usage Estimation

#### Average Banking Conversation
```
System Prompt: ~200 tokens
User Question: ~20-50 tokens
AI Response: ~100-300 tokens
Context History: ~500-1000 tokens (for ongoing conversations)

Total per Exchange: ~820-1550 tokens
Cost per Exchange (GPT-3.5): ~$0.0008-0.0015
Cost per Exchange (GPT-4): ~$0.025-0.047
```

#### Monthly Cost Projections
```
Scenario 1: Low Usage (100 conversations/day)
- GPT-3.5: $25-45/month
- GPT-4: $750-1,410/month

Scenario 2: Medium Usage (500 conversations/day)
- GPT-3.5: $125-225/month
- GPT-4: $3,750-7,050/month

Scenario 3: High Usage (2000 conversations/day)
- GPT-3.5: $500-900/month
- GPT-4: $15,000-28,200/month
```

---

## Cost Optimization Strategies

### 1. Smart Model Selection

```javascript
class ModelSelector {
  static selectModel(message, conversationLength) {
    // Simple queries can use GPT-3.5-turbo
    const simpleKeywords = ['balance', 'hours', 'location', 'phone'];
    const isSimpleQuery = simpleKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    // Complex financial advice might need GPT-4
    const complexKeywords = ['investment strategy', 'portfolio', 'tax implications'];
    const isComplexQuery = complexKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    if (isSimpleQuery || conversationLength < 3) {
      return 'gpt-3.5-turbo';
    } else if (isComplexQuery) {
      return 'gpt-4';
    }
    
    return 'gpt-3.5-turbo'; // Default to cheaper model
  }
}
```

### 2. Intelligent Caching

```javascript
class CacheStrategy {
  constructor(redisClient) {
    this.redis = redisClient;
    this.commonQuestions = new Map();
  }

  async getCachedResponse(message) {
    // Normalize message for cache lookup
    const normalizedMessage = this.normalizeMessage(message);
    
    // Check for exact matches first
    let cacheKey = `exact:${normalizedMessage}`;
    let cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return { response: JSON.parse(cached), source: 'exact_cache' };
    }

    // Check for similar questions using semantic similarity
    const similarKey = await this.findSimilarQuestion(normalizedMessage);
    if (similarKey) {
      cached = await this.redis.get(`similar:${similarKey}`);
      if (cached) {
        return { response: JSON.parse(cached), source: 'similar_cache' };
      }
    }

    return null;
  }

  async cacheResponse(message, response, ttl = 86400) {
    const normalizedMessage = this.normalizeMessage(message);
    
    // Cache exact match
    await this.redis.setex(
      `exact:${normalizedMessage}`,
      ttl,
      JSON.stringify(response)
    );

    // Track common questions
    this.trackCommonQuestion(normalizedMessage);
  }

  normalizeMessage(message) {
    return message
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  trackCommonQuestion(message) {
    const count = this.commonQuestions.get(message) || 0;
    this.commonQuestions.set(message, count + 1);
    
    // Cache popular questions longer
    if (count > 10) {
      // Extend cache TTL for popular questions
      this.redis.expire(`exact:${message}`, 604800); // 7 days
    }
  }
}
```

### 3. Token Optimization

```javascript
class TokenOptimizer {
  static optimizePrompt(systemPrompt, conversationHistory, userMessage) {
    const maxTokens = 3500; // Leave room for response
    let optimizedHistory = conversationHistory;

    // Calculate current token usage (approximate)
    let currentTokens = this.estimateTokens(systemPrompt) + 
                       this.estimateTokens(userMessage);

    // Truncate history if needed
    while (currentTokens > maxTokens && optimizedHistory.length > 0) {
      optimizedHistory = optimizedHistory.slice(1); // Remove oldest
      currentTokens = this.estimateTokens(systemPrompt) + 
                     this.estimateTokens(userMessage) +
                     this.estimateTokens(this.formatHistory(optimizedHistory));
    }

    // Summarize if still too long
    if (currentTokens > maxTokens) {
      optimizedHistory = this.summarizeHistory(optimizedHistory);
    }

    return optimizedHistory;
  }

  static estimateTokens(text) {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  static summarizeHistory(history) {
    if (history.length <= 2) return history;

    const recent = history.slice(-2); // Keep last 2 exchanges
    const older = history.slice(0, -2);

    const summary = `Previous conversation covered: ${
      this.extractTopics(older).join(', ')
    }`;

    return [
      { role: 'system', content: summary },
      ...recent
    ];
  }

  static extractTopics(history) {
    const topics = new Set();
    const bankingKeywords = {
      'savings': ['savings', 'save', 'interest'],
      'credit': ['credit', 'score', 'report'],
      'investment': ['invest', 'portfolio', 'stocks'],
      'budget': ['budget', 'expenses', 'spending'],
      'loans': ['loan', 'mortgage', 'debt']
    };

    history.forEach(exchange => {
      const text = exchange.content?.toLowerCase() || '';
      Object.entries(bankingKeywords).forEach(([topic, keywords]) => {
        if (keywords.some(keyword => text.includes(keyword))) {
          topics.add(topic);
        }
      });
    });

    return Array.from(topics);
  }
}
```

---

## Cost Monitoring Implementation

### 1. Real-time Cost Tracking

```javascript
class CostTracker {
  constructor() {
    this.dailyUsage = {
      date: new Date().toDateString(),
      totalTokens: 0,
      totalCost: 0,
      requestCount: 0
    };
    this.budgetLimits = {
      daily: parseFloat(process.env.DAILY_COST_LIMIT) || 50,
      monthly: parseFloat(process.env.MONTHLY_COST_LIMIT) || 1000
    };
  }

  trackUsage(usage, model) {
    const cost = this.calculateCost(usage, model);
    
    // Update daily usage
    this.dailyUsage.totalTokens += usage.total_tokens;
    this.dailyUsage.totalCost += cost;
    this.dailyUsage.requestCount += 1;

    // Log usage
    console.log(`API Usage: ${usage.total_tokens} tokens, Cost: $${cost.toFixed(4)}, Model: ${model}`);

    // Check budget alerts
    this.checkBudgetAlerts();

    // Store in database for analytics
    this.storeUsageData(usage, cost, model);

    return cost;
  }

  calculateCost(usage, model) {
    const pricing = {
      'gpt-3.5-turbo': {
        input: 0.0005,
        output: 0.0015
      },
      'gpt-4': {
        input: 0.03,
        output: 0.06
      }
    };

    const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
    
    return (usage.prompt_tokens * modelPricing.input / 1000) + 
           (usage.completion_tokens * modelPricing.output / 1000);
  }

  checkBudgetAlerts() {
    const dailyPercentage = (this.dailyUsage.totalCost / this.budgetLimits.daily) * 100;

    if (dailyPercentage >= 90) {
      this.sendAlert('CRITICAL', `Daily budget 90% exceeded: $${this.dailyUsage.totalCost.toFixed(2)}`);
    } else if (dailyPercentage >= 75) {
      this.sendAlert('WARNING', `Daily budget 75% reached: $${this.dailyUsage.totalCost.toFixed(2)}`);
    } else if (dailyPercentage >= 50) {
      this.sendAlert('INFO', `Daily budget 50% reached: $${this.dailyUsage.totalCost.toFixed(2)}`);
    }
  }

  async sendAlert(level, message) {
    console.log(`[${level}] Cost Alert: ${message}`);
    
    // Send to monitoring service (Slack, email, etc.)
    // Implementation depends on your notification system
    await this.notificationService.send({
      level,
      message,
      timestamp: new Date().toISOString(),
      usage: this.dailyUsage
    });
  }
}
```

### 2. Usage Analytics

```javascript
class UsageAnalytics {
  constructor(database) {
    this.db = database;
  }

  async generateDailyReport() {
    const today = new Date().toDateString();
    const usage = await this.db.usage.aggregate([
      { $match: { date: today } },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$cost' },
          totalTokens: { $sum: '$tokens' },
          requestCount: { $sum: 1 },
          avgTokensPerRequest: { $avg: '$tokens' },
          models: { $addToSet: '$model' }
        }
      }
    ]);

    return {
      date: today,
      summary: usage[0] || {},
      recommendations: this.generateRecommendations(usage[0])
    };
  }

  generateRecommendations(usage) {
    const recommendations = [];

    if (usage.avgTokensPerRequest > 1000) {
      recommendations.push({
        type: 'optimization',
        message: 'Average tokens per request is high. Consider implementing conversation summarization.'
      });
    }

    if (usage.totalCost > 30) {
      recommendations.push({
        type: 'cost',
        message: 'Daily costs are high. Review caching strategies and model selection.'
      });
    }

    return recommendations;
  }

  async getTopQuestions(limit = 10) {
    return await this.db.conversations.aggregate([
      { $unwind: '$messages' },
      { $match: { 'messages.role': 'user' } },
      {
        $group: {
          _id: '$messages.content',
          count: { $sum: 1 },
          avgTokens: { $avg: '$messages.tokens' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
  }
}
```

---

## Monitoring Dashboard Implementation

### 1. Real-time Metrics

```javascript
class MetricsDashboard {
  constructor() {
    this.metrics = {
      requests: new Map(),
      costs: new Map(),
      errors: new Map(),
      performance: new Map()
    };
  }

  recordMetric(type, value, timestamp = new Date()) {
    const hour = timestamp.getHours();
    const key = `${timestamp.toDateString()}-${hour}`;

    if (!this.metrics[type].has(key)) {
      this.metrics[type].set(key, []);
    }

    this.metrics[type].get(key).push(value);
  }

  getHourlyStats(type, hours = 24) {
    const now = new Date();
    const stats = [];

    for (let i = hours - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
      const key = `${time.toDateString()}-${time.getHours()}`;
      const values = this.metrics[type].get(key) || [];
      
      stats.push({
        hour: time.getHours(),
        count: values.length,
        total: values.reduce((sum, val) => sum + val, 0),
        average: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
        max: values.length > 0 ? Math.max(...values) : 0,
        min: values.length > 0 ? Math.min(...values) : 0
      });
    }

    return stats;
  }

  generateDashboard() {
    return {
      timestamp: new Date().toISOString(),
      requests: this.getHourlyStats('requests'),
      costs: this.getHourlyStats('costs'),
      errors: this.getHourlyStats('errors'),
      performance: this.getHourlyStats('performance'),
      summary: {
        totalRequests: Array.from(this.metrics.requests.values()).flat().length,
        totalCost: Array.from(this.metrics.costs.values()).flat().reduce((sum, val) => sum + val, 0),
        errorRate: this.calculateErrorRate(),
        avgResponseTime: this.calculateAvgResponseTime()
      }
    };
  }
}
```

### 2. Alert System

```javascript
class AlertSystem {
  constructor() {
    this.thresholds = {
      costDaily: 50,
      errorRate: 0.05,
      responseTime: 5000,
      tokenUsage: 100000
    };
    this.alertCooldowns = new Map();
  }

  checkAlerts(metrics) {
    const alerts = [];

    // Cost alerts
    if (metrics.totalCost > this.thresholds.costDaily) {
      alerts.push(this.createAlert('cost', 'Daily cost threshold exceeded', metrics.totalCost));
    }

    // Error rate alerts
    if (metrics.errorRate > this.thresholds.errorRate) {
      alerts.push(this.createAlert('error', 'High error rate detected', metrics.errorRate));
    }

    // Performance alerts
    if (metrics.avgResponseTime > this.thresholds.responseTime) {
      alerts.push(this.createAlert('performance', 'Slow response times detected', metrics.avgResponseTime));
    }

    // Send alerts (with cooldown to prevent spam)
    alerts.forEach(alert => this.sendAlertIfNotCooling(alert));
  }

  createAlert(type, message, value) {
    return {
      type,
      message,
      value,
      timestamp: new Date().toISOString(),
      severity: this.getSeverity(type, value)
    };
  }

  getSeverity(type, value) {
    const severityRules = {
      cost: value > this.thresholds.costDaily * 2 ? 'critical' : 'warning',
      error: value > 0.1 ? 'critical' : 'warning',
      performance: value > 10000 ? 'critical' : 'warning'
    };

    return severityRules[type] || 'info';
  }

  sendAlertIfNotCooling(alert) {
    const cooldownKey = `${alert.type}-${alert.severity}`;
    const lastAlert = this.alertCooldowns.get(cooldownKey);
    const now = Date.now();

    // 1 hour cooldown for warnings, 30 minutes for critical
    const cooldownPeriod = alert.severity === 'critical' ? 30 * 60 * 1000 : 60 * 60 * 1000;

    if (!lastAlert || (now - lastAlert) > cooldownPeriod) {
      this.sendAlert(alert);
      this.alertCooldowns.set(cooldownKey, now);
    }
  }

  async sendAlert(alert) {
    console.log(`[ALERT-${alert.severity.toUpperCase()}] ${alert.message}: ${alert.value}`);
    
    // Send to external services (Slack, PagerDuty, email, etc.)
    // Implementation depends on your notification preferences
  }
}
```

---

## Budget Management Best Practices

### 1. Budget Allocation Strategy

```javascript
const budgetStrategy = {
  // Allocate budget across different components
  allocation: {
    development: 0.2,    // 20% for development/testing
    production: 0.6,     // 60% for production usage
    buffer: 0.2          // 20% buffer for unexpected usage
  },

  // Set progressive limits
  limits: {
    hourly: 2,           // $2/hour limit
    daily: 30,           // $30/day limit
    weekly: 150,         // $150/week limit
    monthly: 500         // $500/month limit
  },

  // Cost-saving measures
  costSaving: {
    enableCaching: true,
    useGPT35ForSimple: true,
    implementSummarization: true,
    setTokenLimits: true
  }
};
```

### 2. Emergency Procedures

```javascript
class EmergencyProcedures {
  static async handleBudgetExceeded() {
    console.log('EMERGENCY: Budget exceeded - implementing cost-saving measures');

    // 1. Switch to cheaper model
    process.env.OPENAI_MODEL = 'gpt-3.5-turbo';

    // 2. Reduce max tokens
    process.env.OPENAI_MAX_TOKENS = '200';

    // 3. Increase cache TTL
    process.env.CACHE_TTL = '86400';

    // 4. Enable aggressive rate limiting
    process.env.RATE_LIMIT_REQUESTS_PER_MINUTE = '30';

    // 5. Switch to fallback responses if needed
    process.env.ENABLE_FALLBACK_MODE = 'true';

    // 6. Send immediate notification
    await this.notifyStakeholders('Budget exceeded - emergency measures activated');
  }

  static async handleAPIFailure() {
    console.log('EMERGENCY: OpenAI API failure - switching to fallback mode');

    // Enable fallback responses
    process.env.ENABLE_FALLBACK_MODE = 'true';

    // Notify team
    await this.notifyStakeholders('OpenAI API unavailable - using fallback responses');
  }
}
```

---

## ROI Analysis

### 1. Value Metrics

```javascript
const roiMetrics = {
  // Customer engagement improvements
  engagement: {
    averageSessionDuration: '+45%',
    conversationCompletionRate: '+30%',
    userReturnRate: '+25%'
  },

  // Operational efficiency
  efficiency: {
    supportTicketReduction: '-40%',
    responseAccuracy: '+60%',
    customerSatisfaction: '+35%'
  },

  // Cost-benefit analysis
  costBenefit: {
    aiCosts: '$500/month',
    supportSavings: '$2000/month',
    netBenefit: '$1500/month',
    paybackPeriod: '2 months'
  }
};
```

### 2. Success Metrics

```javascript
const successMetrics = {
  technical: {
    responseTime: '<3 seconds',
    uptime: '>99.5%',
    errorRate: '<2%',
    costPerConversation: '<$0.10'
  },

  business: {
    userSatisfaction: '>4.5/5',
    conversionRate: '+20%',
    supportDeflection: '>60%',
    costEfficiency: '$1500 net positive/month'
  }
};
```

This comprehensive cost management and monitoring strategy ensures that the OpenAI integration remains financially sustainable while providing maximum value to users and the business.