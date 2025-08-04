// Azure cloud advisor responses and knowledge base
const azureResponses = {
    greetings: [
        "Hello! I'm your AI Azure advisor. How can I help you with your cloud journey today?",
        "Hi there! I'm here to assist you with all your Azure and cloud questions.",
        "Welcome! I'm your personal Azure assistant. What would you like to know about Azure services?"
    ],
    
    services: [
        "Azure offers a comprehensive range of cloud services! Here are some key categories:\n\n☁️ **Compute**: Virtual Machines, App Service, Azure Functions, AKS\n🗄️ **Storage**: Blob Storage, File Storage, Queue Storage, Table Storage\n🌐 **Networking**: Virtual Network, Load Balancer, Application Gateway\n📊 **Databases**: SQL Database, Cosmos DB, MySQL, PostgreSQL\n🤖 **AI/ML**: Cognitive Services, Machine Learning, Bot Service\n\nWhat type of application are you building?",
        "Great question about Azure services! Here's how to choose the right ones:\n\n🎯 **Start with your requirements**: Performance, scalability, budget\n🔍 **Consider service tiers**: Basic, Standard, Premium options\n📈 **Think about growth**: Choose services that can scale with you\n🔒 **Security first**: Enable built-in security features\n\nWhat's your specific use case or application type?"
    ],
    
    costs: [
        "Azure cost optimization is crucial! Here are my top strategies:\n\n💰 **Right-sizing**: Use Azure Advisor recommendations\n⏰ **Scheduling**: Auto-shutdown VMs during off-hours\n📊 **Reserved Instances**: Up to 72% savings for predictable workloads\n🔄 **Spot VMs**: Up to 90% savings for fault-tolerant workloads\n📈 **Monitor with Cost Management**: Set budgets and alerts\n\nWhich Azure services are you currently using?",
        "Smart thinking about costs! Here's a comprehensive approach:\n\n1. **Use Azure Cost Management** - track spending in real-time\n2. **Implement tagging strategy** - organize resources by project/environment\n3. **Leverage Azure Hybrid Benefit** - save on Windows and SQL licenses\n4. **Consider consumption-based services** - pay only for what you use\n5. **Regular cost reviews** - monthly optimization checks\n\nWhat's your biggest cost concern right now?"
    ],
    
    security: [
        "Azure security best practices are essential! Here's my recommended approach:\n\n🔒 **Identity & Access**: Use Azure AD, enable MFA, implement RBAC\n🛡️ **Network Security**: NSGs, Azure Firewall, Private Endpoints\n🔑 **Key Management**: Azure Key Vault for secrets and certificates\n📊 **Monitoring**: Azure Security Center, Sentinel for threat detection\n🔐 **Data Protection**: Encryption at rest and in transit\n\nWhat type of workload are you securing?",
        "Security should be built into every layer! Here's a comprehensive checklist:\n\n✅ **Enable Azure Security Center** - continuous security assessment\n✅ **Implement Zero Trust** - verify every request\n✅ **Use managed identities** - eliminate stored credentials\n✅ **Regular security reviews** - quarterly assessments\n✅ **Backup and disaster recovery** - protect against data loss\n\nAre you looking for specific compliance requirements?"
    ],
    
    architecture: [
        "Let's design a scalable Azure architecture! Here are key principles:\n\n🏗️ **Well-Architected Framework**: Reliability, Security, Cost, Performance, Operations\n🔄 **Microservices**: Break down monoliths for better scalability\n⚖️ **Load Balancing**: Distribute traffic across multiple instances\n📊 **Auto-scaling**: Automatically adjust resources based on demand\n🌍 **Multi-region**: Deploy across regions for high availability\n\nWhat's your application's expected scale and requirements?",
        "Great thinking about architecture! Here's my step-by-step approach:\n\n1. **Define requirements** - performance, availability, compliance\n2. **Choose compute model** - VMs, containers, serverless, or hybrid\n3. **Design for resilience** - implement retry policies and circuit breakers\n4. **Plan data strategy** - storage types, backup, and replication\n5. **Implement monitoring** - Application Insights, Log Analytics\n\nWhat type of application are you architecting?"
    ],
};

const fallbackResponses = [
    "That's an interesting question! While I don't have specific information about that topic, I'd recommend checking the Azure documentation or speaking with a Microsoft Azure specialist for detailed guidance.",
    "I'd love to help with that! For detailed information on this Azure topic, I suggest consulting the official Azure documentation or contacting Microsoft Support for personalized assistance.",
    "That's a great question about Azure and cloud services! For the most accurate and up-to-date information, I recommend checking the Azure portal or speaking with a certified Azure solutions architect.",
    "I appreciate your question! While I can provide general Azure guidance, for specific scenarios like this, it's best to consult the Azure documentation or speak with a Microsoft certified professional who can review your specific requirements."
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
    avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-cloud"></i>';
    
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
    avatar.innerHTML = '<i class="fas fa-cloud"></i>';
    
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
        return getRandomResponse(azureResponses.greetings);
    }
    
    // Azure services related
    if (message.match(/\b(azure services?|services?|compute|storage|database|networking|ai|ml|functions?|app service|virtual machine)\b/)) {
        return getRandomResponse(azureResponses.services);
    }
    
    // Cost optimization related
    if (message.match(/\b(cost|costs?|optimize|optimization|budget|pricing|expensive|save|saving|money)\b/)) {
        return getRandomResponse(azureResponses.costs);
    }
    
    // Security related
    if (message.match(/\b(security|secure|firewall|encryption|identity|access|compliance|threat|vulnerability|protection)\b/)) {
        return getRandomResponse(azureResponses.security);
    }
    
    // Architecture related
    if (message.match(/\b(architecture|architect|scalable|scale|design|microservices?|load.balanc|high.availabil|disaster.recover)\b/)) {
        return getRandomResponse(azureResponses.architecture);
    }
    
    // Azure general services
    if (message.match(/\b(azure|cloud|microsoft|subscription|resource|portal|deployment)\b/)) {
        return "Azure is Microsoft's comprehensive cloud platform! Here's what makes it powerful:\n\n☁️ **Global Infrastructure**: 60+ regions worldwide\n🔧 **200+ Services**: From compute to AI to IoT\n🔒 **Enterprise Security**: Built-in compliance and governance\n💼 **Hybrid Capabilities**: Seamlessly connect on-premises and cloud\n🤖 **AI Integration**: Cognitive Services and Machine Learning\n\nWhat specific Azure challenge can I help you solve today?";
    }
    
    // Thank you responses
    if (message.match(/\b(thank you|thanks|appreciate|helpful)\b/)) {
        return "You're very welcome! I'm here to help you navigate your Azure cloud journey. Feel free to ask me anything else about Azure services, architecture, security, cost optimization, or any other cloud topics. Remember, for specific account details or billing, you'll want to contact Microsoft Support directly. Is there anything else I can help you with today?";
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
                <i class="fas fa-cloud"></i>
            </div>
            <div class="message-content">
                <h2>Welcome to Azure Assistant!</h2>
                <p>I'm your AI cloud advisor. I can help you with:</p>
                <div class="suggestion-cards">
                    <div class="suggestion-card" onclick="sendSuggestion('What Azure services should I use for my application?')">
                        <i class="fas fa-server"></i>
                        <span>Azure Services</span>
                    </div>
                    <div class="suggestion-card" onclick="sendSuggestion('How can I optimize my Azure costs?')">
                        <i class="fas fa-chart-line"></i>
                        <span>Cost Optimization</span>
                    </div>
                    <div class="suggestion-card" onclick="sendSuggestion('What are the best security practices for Azure?')">
                        <i class="fas fa-shield-alt"></i>
                        <span>Security Best Practices</span>
                    </div>
                    <div class="suggestion-card" onclick="sendSuggestion('Help me architect a scalable solution')">
                        <i class="fas fa-sitemap"></i>
                        <span>Architecture Guidance</span>
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
