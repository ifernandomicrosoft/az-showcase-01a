// Banking advisor responses and knowledge base
const bankingResponses = {
    greetings: [
        "Hello! I'm your AI banking advisor. How can I help you today?",
        "Hi there! I'm here to assist you with all your banking and financial questions.",
        "Welcome! I'm your personal banking assistant. What would you like to know?"
    ],
    
    savings: [
        "For savings accounts, I recommend looking into high-yield savings accounts which typically offer better interest rates than traditional savings. Consider accounts with no monthly fees and easy access to your funds. Online banks often offer competitive rates of 4-5% APY.",
        "Great question about savings! Here are some options to consider:\n\n🏦 **High-Yield Savings**: 4-5% APY, perfect for emergency funds\n💰 **Money Market Accounts**: Higher rates with check-writing privileges\n📈 **CDs**: Fixed rates for specific terms, great for goals with timelines\n\nWhat's your savings goal and timeline?"
    ],
    
    credit: [
        "To improve your credit score, focus on these key areas:\n\n✅ **Pay bills on time** (35% of your score)\n✅ **Keep credit utilization below 30%** (30% of your score)\n✅ **Don't close old credit cards** (length of history matters)\n✅ **Monitor your credit report** for errors\n✅ **Consider becoming an authorized user** on someone's good account\n\nWould you like specific strategies for any of these areas?",
        "Credit improvement is a marathon, not a sprint! Here's my recommended approach:\n\n1. **Check your credit report** for free at annualcreditreport.com\n2. **Set up autopay** for at least minimum payments\n3. **Pay down high balances** - even small payments help\n4. **Consider a secured credit card** if you're building credit\n\nWhat's your current credit situation?"
    ],
    
    investment: [
        "For investment guidance, I'd suggest starting with these fundamentals:\n\n📊 **Emergency Fund First**: 3-6 months of expenses in savings\n🎯 **401(k) Match**: Free money from your employer\n📈 **Index Funds**: Low-cost, diversified options like S&P 500\n🏠 **Consider Your Timeline**: Longer timeline = more growth potential\n\nWhat's your investment timeline and risk tolerance?",
        "Smart thinking about investments! Here's a beginner-friendly approach:\n\n💡 **Start with target-date funds** - they adjust automatically\n💡 **Dollar-cost averaging** - invest the same amount regularly\n💡 **Diversification** - don't put all eggs in one basket\n💡 **Low fees matter** - expense ratios under 0.5% are ideal\n\nAre you investing for retirement, a house, or another goal?"
    ],
    
    budget: [
        "Let's create a budget that works for you! I recommend the 50/30/20 rule:\n\n🏠 **50% Needs**: Housing, utilities, groceries, minimum debt payments\n🎉 **30% Wants**: Entertainment, dining out, hobbies\n💰 **20% Savings**: Emergency fund, retirement, debt payoff\n\nWould you like help calculating your specific numbers?",
        "Budgeting is the foundation of financial success! Here's my step-by-step approach:\n\n1. **Track spending** for a week to see patterns\n2. **List all income sources** and fixed expenses\n3. **Identify categories** where you can optimize\n4. **Use the envelope method** for variable expenses\n5. **Review and adjust** monthly\n\nWhat's your biggest budgeting challenge right now?"
    ],
    
    mortgage: [
        "For mortgage advice, here are the key factors to consider:\n\n🏡 **Down Payment**: 20% avoids PMI, but 3-5% options exist\n📊 **Credit Score**: 740+ gets best rates\n💰 **Debt-to-Income**: Keep total debts under 36% of income\n⏰ **Rate Type**: Fixed vs. adjustable based on your timeline\n\nAre you a first-time homebuyer or looking to refinance?"
    ],
    
    debt: [
        "Let's tackle that debt strategically! Two popular approaches:\n\n❄️ **Debt Snowball**: Pay minimums on all, extra on smallest balance (psychological wins)\n⚡ **Debt Avalanche**: Pay minimums on all, extra on highest interest rate (saves most money)\n\nAlso consider:\n- Debt consolidation loans\n- Balance transfer cards (0% intro APR)\n- Negotiating with creditors\n\nWhat types of debt are you dealing with?"
    ],
    
    retirement: [
        "Retirement planning is crucial! Here's my recommended priority order:\n\n1. **Employer 401(k) match** - always get the full match\n2. **High-yield savings** - emergency fund first\n3. **Max out Roth IRA** - $6,500 for 2023 (tax-free growth)\n4. **Back to 401(k)** - up to $22,500 for 2023\n5. **Taxable investments** - for early retirement goals\n\nHow many years until retirement are you planning for?"
    ]
};

const fallbackResponses = [
    "That's an interesting question! While I don't have specific information about that topic, I'd recommend speaking with a licensed financial advisor or your bank's representative for personalized advice.",
    "I'd love to help with that! For detailed information on this topic, I suggest contacting your bank directly or consulting with a certified financial planner who can provide personalized guidance.",
    "That's a great question about banking and finance! For the most accurate and up-to-date information, I recommend checking with your financial institution or speaking with a qualified financial advisor.",
    "I appreciate your question! While I can provide general banking guidance, for specific situations like this, it's best to consult with your bank or a licensed financial professional who can review your individual circumstances."
];

let chatHistory = [];
let isTyping = false;

// Initialize the chat
document.addEventListener('DOMContentLoaded', function() {
    adjustTextareaHeight(document.getElementById('messageInput'));
});

// Handle keyboard shortcuts
function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// Adjust textarea height
function adjustTextareaHeight(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

// Send message function
function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (message === '' || isTyping) return;
    
    // Add user message to chat
    addMessage(message, 'user');
    input.value = '';
    adjustTextareaHeight(input);
    
    // Show typing indicator and generate response
    showTypingIndicator();
    setTimeout(() => {
        const response = generateResponse(message);
        hideTypingIndicator();
        addMessage(response, 'bot');
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
}

// Send suggestion
function sendSuggestion(suggestion) {
    document.getElementById('messageInput').value = suggestion;
    sendMessage();
}

// Add message to chat
function addMessage(message, sender) {
    const chatContainer = document.getElementById('chatContainer');
    const welcomeMessage = document.querySelector('.welcome-message');
    
    // Remove welcome message after first interaction
    if (welcomeMessage && chatHistory.length === 0) {
        welcomeMessage.style.display = 'none';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = `message-avatar ${sender}`;
    avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-university"></i>';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.innerHTML = formatMessage(message);
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageText);
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Add to chat history
    chatHistory.push({ message, sender, timestamp: new Date() });
}

// Format message with basic markdown-like formatting
function formatMessage(message) {
    return message
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\n/g, '<br>') // Line breaks
        .replace(/(\d+\.\s)/g, '<br>$1') // Numbered lists
        .replace(/(✅|❄️|⚡|🏦|💰|📈|🎯|📊|🏠|🎉|💡|📍)/g, '<br>$1'); // Icons on new lines
}

// Show typing indicator
function showTypingIndicator() {
    isTyping = true;
    const chatContainer = document.getElementById('chatContainer');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar bot';
    avatar.innerHTML = '<i class="fas fa-university"></i>';
    
    const typingText = document.createElement('div');
    typingText.className = 'message-text';
    typingText.innerHTML = '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(typingText);
    
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Disable send button
    document.getElementById('sendBtn').disabled = true;
}

// Hide typing indicator
function hideTypingIndicator() {
    isTyping = false;
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    
    // Enable send button
    document.getElementById('sendBtn').disabled = false;
}

// Generate AI response
function generateResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Greeting responses
    if (message.match(/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/)) {
        return getRandomResponse(bankingResponses.greetings);
    }
    
    // Savings related
    if (message.match(/\b(savings?|save|saving|interest|emergency fund|high.yield)\b/)) {
        return getRandomResponse(bankingResponses.savings);
    }
    
    // Credit related
    if (message.match(/\b(credit|score|credit score|improve credit|credit report|credit card)\b/)) {
        return getRandomResponse(bankingResponses.credit);
    }
    
    // Investment related
    if (message.match(/\b(invest|investment|stocks?|bonds?|401k|ira|retirement|portfolio|etf|mutual fund)\b/)) {
        return getRandomResponse(bankingResponses.investment);
    }
    
    // Budget related
    if (message.match(/\b(budget|budgeting|expenses?|spending|money management|financial plan)\b/)) {
        return getRandomResponse(bankingResponses.budget);
    }
    
    // Mortgage related
    if (message.match(/\b(mortgage|home loan|house|buying.home|down payment|refinanc)\b/)) {
        return getRandomResponse(bankingResponses.mortgage);
    }
    
    // Debt related
    if (message.match(/\b(debt|loan|pay off|consolidat|balance transfer|debt management)\b/)) {
        return getRandomResponse(bankingResponses.debt);
    }
    
    // Retirement related
    if (message.match(/\b(retirement|retire|pension|401k|403b|ira|roth|social security)\b/)) {
        return getRandomResponse(bankingResponses.retirement);
    }
    
    // Banking services
    if (message.match(/\b(checking|account|bank|banking|debit|atm|fees|mobile banking)\b/)) {
        return "For checking accounts, I recommend looking for accounts with:\n\n✅ **No monthly maintenance fees**\n✅ **Free ATM access** or reimbursements\n✅ **Mobile banking** with check deposit\n✅ **Overdraft protection** options\n✅ **Direct deposit** benefits\n\nMany online banks offer these features with competitive benefits. What specific banking services are you most interested in?";
    }
    
    // Thank you responses
    if (message.match(/\b(thank you|thanks|appreciate|helpful)\b/)) {
        return "You're very welcome! I'm here to help you navigate your financial journey. Feel free to ask me anything else about banking, investments, budgeting, or any other financial topics. Remember, for specific account details or transactions, you'll want to contact your bank directly. Is there anything else I can help you with today?";
    }
    
    // Default fallback
    return getRandomResponse(fallbackResponses);
}

// Get random response from array
function getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
}

// Start new chat
function startNewChat() {
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.innerHTML = `
        <div class="welcome-message">
            <div class="bot-avatar">
                <i class="fas fa-university"></i>
            </div>
            <div class="message-content">
                <h2>Welcome to IssBankGPT!</h2>
                <p>I'm your AI banking advisor. I can help you with:</p>
                <div class="suggestion-cards">
                    <div class="suggestion-card" onclick="sendSuggestion('What are the best savings account options?')">
                        <i class="fas fa-piggy-bank"></i>
                        <span>Savings accounts</span>
                    </div>
                    <div class="suggestion-card" onclick="sendSuggestion('How can I improve my credit score?')">
                        <i class="fas fa-chart-line"></i>
                        <span>Credit advice</span>
                    </div>
                    <div class="suggestion-card" onclick="sendSuggestion('What investment options do you recommend?')">
                        <i class="fas fa-coins"></i>
                        <span>Investment guidance</span>
                    </div>
                    <div class="suggestion-card" onclick="sendSuggestion('Help me create a budget plan')">
                        <i class="fas fa-calculator"></i>
                        <span>Budget planning</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    chatHistory = [];
    document.getElementById('messageInput').value = '';
}

// Select chat (placeholder for future functionality)
function selectChat(element) {
    document.querySelectorAll('.chat-history-item').forEach(item => {
        item.classList.remove('active');
    });
    element.classList.add('active');
}

// Mobile sidebar toggle (for future mobile implementation)
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}
