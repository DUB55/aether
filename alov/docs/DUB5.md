# DUB5 Chrome Extension Universal Guide
## How to Use AI Services in Any Web Application

### Overview

The DUB5 Chrome Extension (also known as "DUB5 Local AI Bridge") is a powerful tool that allows any web application to communicate with popular AI services like Microsoft Copilot, ChatGPT, Google Gemini, and Claude AI. This guide shows you how to integrate this functionality into your own web applications.

---

## 🚀 Quick Start

### 1. Install the Extension
- Load the chrome extension from the `chrome-extension/` folder
- Enable Developer Mode in Chrome Extensions
- Click "Load unpacked" and select the chrome-extension folder

### 2. Configure Your AI Service
- Click the extension icon in Chrome toolbar
- Select your preferred AI service (Copilot, ChatGPT, Gemini, Claude, or Custom URL)
- Make sure you're logged into your chosen AI service

### 3. Test the Connection
- Click "Test Connection" in the extension popup
- Verify you see "🟢 Connection successful!"

---

## 🔧 Integration Guide for Developers

### Core Communication Pattern

The extension uses a **message-passing system** between your web app and the AI services. Here's how it works:

```javascript
// 1. Send a query to the AI service
window.postMessage({ 
  type: 'DUB5_QUERY', 
  prompt: 'Your question here',
  serviceId: 'copilot', // or 'chatgpt', 'gemini', 'claude', 'custom'
  customUrl: 'https://your-custom-ai.com' // only for custom service
}, '*');

// 2. Listen for the response
window.addEventListener('message', (event) => {
  if (event.data.type === 'DUB5_RESPONSE') {
    if (event.data.success) {
      console.log('AI Response:', event.data.result);
    } else {
      console.error('Error:', event.data.result);
    }
  }
});
```

### Complete Implementation Example

```javascript
// AI Bridge Function with Error Handling
async function callLocalAI(prompt, serviceId = 'copilot', customUrl = null) {
  return new Promise((resolve, reject) => {
    // Send query to extension
    window.postMessage({ 
      type: 'DUB5_QUERY', 
      prompt: prompt,
      serviceId: serviceId,
      customUrl: customUrl
    }, '*');
    
    // Listen for response
    const handler = (e) => {
      if (e.data.type === 'DUB5_RESPONSE') {
        window.removeEventListener('message', handler);
        if (e.data.success) {
          resolve(e.data.result);
        } else {
          reject(new Error(e.data.result));
        }
      }
    };
    
    window.addEventListener('message', handler);
    
    // Timeout after 15 seconds
    setTimeout(() => {
      window.removeEventListener('message', handler);
      reject(new Error('AI service timeout - check extension and login status'));
    }, 15000);
  });
}

// Usage Example
async function askAI() {
  try {
    const response = await callLocalAI(
      'Explain quantum computing in simple terms',
      'copilot'
    );
    console.log('AI says:', response);
  } catch (error) {
    console.error('AI Error:', error.message);
  }
}
```

---

## 🎯 Supported AI Services

### Microsoft Copilot
```javascript
const response = await callLocalAI('Your question', 'copilot');
```
- **URL**: https://copilot.microsoft.com
- **Login Required**: Microsoft account
- **Best For**: General queries, coding help, research

### ChatGPT
```javascript
const response = await callLocalAI('Your question', 'chatgpt');
```
- **URL**: https://chat.openai.com
- **Login Required**: OpenAI account
- **Best For**: Creative writing, detailed explanations, coding

### Google Gemini
```javascript
const response = await callLocalAI('Your question', 'gemini');
```
- **URL**: https://gemini.google.com
- **Login Required**: Google account
- **Best For**: Research, analysis, multimodal tasks

### Claude AI
```javascript
const response = await callLocalAI('Your question', 'claude');
```
- **URL**: https://claude.ai
- **Login Required**: Anthropic account
- **Best For**: Analysis, writing, ethical reasoning

### Custom AI Service
```javascript
const response = await callLocalAI(
  'Your question', 
  'custom', 
  'https://your-ai-service.com'
);
```
- **URL**: Any HTTPS URL
- **Requirements**: Must have text input and response elements
- **Best For**: Private AI deployments, specialized models

---

## 🛠️ Advanced Features

### Service Management

```javascript
// Get current service info
window.postMessage({ type: 'GET_SERVICE_INFO' }, '*');

window.addEventListener('message', (e) => {
  if (e.data.type === 'SERVICE_INFO_RESPONSE') {
    console.log('Current service:', e.data.currentService);
    console.log('Available services:', e.data.services);
  }
});

// Change AI service programmatically
window.postMessage({ 
  type: 'SET_AI_SERVICE', 
  serviceId: 'chatgpt',
  customUrl: null // only needed for custom service
}, '*');
```

### Response Cleaning

The extension automatically cleans AI responses by removing:
- Service prefixes ("Copilot said:", "ChatGPT:", etc.)
- Wrapper text ("Here's what AI responded:")
- Markdown code blocks around JSON
- Extra whitespace and formatting artifacts

### Error Handling

```javascript
try {
  const response = await callLocalAI(prompt, serviceId);
  // Success - use response
} catch (error) {
  if (error.message.includes('TIMEOUT')) {
    // Extension not responding - check installation
  } else if (error.message.includes('not found')) {
    // Extension not installed
  } else if (error.message.includes('log into')) {
    // User needs to login to AI service
  } else {
    // Other error - show to user
  }
}
```

---

## 📋 Implementation Checklist

### For Basic Integration:
- [ ] Install DUB5 Chrome Extension
- [ ] Add message listener for `DUB5_RESPONSE`
- [ ] Send queries using `DUB5_QUERY` message type
- [ ] Handle success/error responses
- [ ] Add timeout handling (15 seconds recommended)

### For Advanced Integration:
- [ ] Implement service switching functionality
- [ ] Add response cleaning/formatting
- [ ] Handle different AI service capabilities
- [ ] Implement retry logic for failed requests
- [ ] Add user feedback for connection status

### For Production Apps:
- [ ] Add extension detection
- [ ] Provide fallback when extension unavailable
- [ ] Implement rate limiting
- [ ] Add user preference storage
- [ ] Handle concurrent requests properly

---

## 🎨 UI Integration Examples

### Simple Chat Interface
```html
<div id="chat-container">
  <div id="messages"></div>
  <input type="text" id="user-input" placeholder="Ask AI anything...">
  <button onclick="sendMessage()">Send</button>
</div>

<script>
async function sendMessage() {
  const input = document.getElementById('user-input');
  const messages = document.getElementById('messages');
  
  if (!input.value.trim()) return;
  
  // Add user message
  messages.innerHTML += `<div class="user-message">${input.value}</div>`;
  
  try {
    // Get AI response
    const response = await callLocalAI(input.value, 'copilot');
    messages.innerHTML += `<div class="ai-message">${response}</div>`;
  } catch (error) {
    messages.innerHTML += `<div class="error-message">Error: ${error.message}</div>`;
  }
  
  input.value = '';
}
</script>
```

### Service Selector
```html
<select id="ai-service" onchange="switchService()">
  <option value="copilot">Microsoft Copilot</option>
  <option value="chatgpt">ChatGPT</option>
  <option value="gemini">Google Gemini</option>
  <option value="claude">Claude AI</option>
  <option value="custom">Custom URL</option>
</select>

<input type="url" id="custom-url" placeholder="https://your-ai.com" style="display:none;">

<script>
function switchService() {
  const service = document.getElementById('ai-service').value;
  const customUrl = document.getElementById('custom-url');
  
  if (service === 'custom') {
    customUrl.style.display = 'block';
  } else {
    customUrl.style.display = 'none';
  }
  
  // Update service in extension
  window.postMessage({ 
    type: 'SET_AI_SERVICE', 
    serviceId: service,
    customUrl: service === 'custom' ? customUrl.value : null
  }, '*');
}
</script>
```

---

## 🔍 Troubleshooting

### Extension Not Working
1. **Check Installation**: Extension icon should appear in Chrome toolbar
2. **Check Permissions**: Extension needs tabs, scripting, and storage permissions
3. **Check Console**: Look for "DUB5 Bridge: Content script loaded" message

### AI Service Not Responding
1. **Check Login**: Make sure you're logged into the AI service
2. **Check Service Status**: Visit the AI service website directly
3. **Try Different Service**: Switch to another AI service to isolate the issue

### Timeout Errors
1. **Increase Timeout**: Some AI services are slower than others
2. **Check Network**: Ensure stable internet connection
3. **Check Rate Limits**: You might be hitting API rate limits

### Response Quality Issues
1. **Improve Prompts**: Be more specific in your questions
2. **Try Different Services**: Each AI has different strengths
3. **Check Response Cleaning**: The extension removes prefixes automatically

---

## 🚀 Real-World Use Cases

### Educational Platforms
- **Flashcard Generation**: Ask AI to create study cards from content
- **Quiz Creation**: Generate multiple-choice questions automatically
- **Content Summarization**: Summarize long articles or documents
- **Language Learning**: Get translations and explanations

### Content Management Systems
- **SEO Optimization**: Generate meta descriptions and titles
- **Content Ideas**: Brainstorm topics and outlines
- **Proofreading**: Check grammar and style
- **Translation**: Convert content to different languages

### Development Tools
- **Code Review**: Get AI feedback on code quality
- **Documentation**: Generate API docs and comments
- **Bug Analysis**: Help diagnose and fix issues
- **Testing**: Generate test cases and scenarios

### Business Applications
- **Email Drafting**: Compose professional emails
- **Report Generation**: Create summaries and analyses
- **Customer Support**: Generate response templates
- **Market Research**: Analyze trends and data

---

## 📚 Best Practices

### Performance
- **Cache Responses**: Store frequently used AI responses
- **Batch Requests**: Combine multiple questions when possible
- **Use Appropriate Service**: Match AI service to task type
- **Implement Timeouts**: Don't let requests hang indefinitely

### User Experience
- **Show Loading States**: Indicate when AI is processing
- **Handle Errors Gracefully**: Provide helpful error messages
- **Allow Service Selection**: Let users choose their preferred AI
- **Provide Fallbacks**: Have backup plans when AI unavailable

### Security
- **Validate Inputs**: Sanitize user prompts before sending
- **Handle Sensitive Data**: Don't send private information to AI
- **Use HTTPS**: Ensure secure communication
- **Respect Rate Limits**: Don't overwhelm AI services

### Development
- **Test All Services**: Verify functionality across different AIs
- **Handle Edge Cases**: Plan for network issues and timeouts
- **Document Integration**: Provide clear setup instructions
- **Monitor Usage**: Track success rates and performance

---

## 🔗 Extension Architecture

The DUB5 Chrome Extension consists of four main components:

### 1. Background Script (`background.js`)
- Manages persistent tabs for each AI service
- Handles tab lifecycle and health checks
- Processes AI queries and responses
- Implements response cleaning algorithms

### 2. Content Script (`content-script.js`)
- Runs on all web pages
- Listens for messages from web applications
- Forwards requests to background script
- Shows connection indicator on supported sites

### 3. Popup Interface (`popup.html` + `popup.js`)
- Provides user interface for extension settings
- Allows service selection and testing
- Shows connection status and diagnostics
- Handles manual configuration

### 4. Manifest Configuration (`manifest.json`)
- Defines permissions and capabilities
- Specifies supported AI service domains
- Configures content script injection
- Sets up background service worker

---

## 🎯 Getting Started Template

Here's a complete template to get you started:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My AI-Powered App</title>
    <style>
        .chat-container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .message { margin: 10px 0; padding: 10px; border-radius: 8px; }
        .user-message { background: #007bff; color: white; text-align: right; }
        .ai-message { background: #f8f9fa; border: 1px solid #dee2e6; }
        .error-message { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .loading { opacity: 0.6; }
        .service-selector { margin-bottom: 20px; }
        .input-area { display: flex; gap: 10px; margin-top: 20px; }
        .input-area input { flex: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
        .input-area button { padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .input-area button:disabled { opacity: 0.6; cursor: not-allowed; }
    </style>
</head>
<body>
    <div class="chat-container">
        <h1>AI-Powered Chat</h1>
        
        <div class="service-selector">
            <label>AI Service: </label>
            <select id="ai-service">
                <option value="copilot">Microsoft Copilot</option>
                <option value="chatgpt">ChatGPT</option>
                <option value="gemini">Google Gemini</option>
                <option value="claude">Claude AI</option>
            </select>
            <span id="connection-status">🔴 Not connected</span>
        </div>
        
        <div id="messages"></div>
        
        <div class="input-area">
            <input type="text" id="user-input" placeholder="Ask AI anything..." onkeypress="handleKeyPress(event)">
            <button onclick="sendMessage()" id="send-button">Send</button>
        </div>
    </div>

    <script>
        let currentService = 'copilot';
        let isLoading = false;

        // AI Bridge Function
        async function callLocalAI(prompt, serviceId = 'copilot') {
            return new Promise((resolve, reject) => {
                window.postMessage({ 
                    type: 'DUB5_QUERY', 
                    prompt: prompt,
                    serviceId: serviceId
                }, '*');
                
                const handler = (e) => {
                    if (e.data.type === 'DUB5_RESPONSE') {
                        window.removeEventListener('message', handler);
                        if (e.data.success) {
                            resolve(e.data.result);
                        } else {
                            reject(new Error(e.data.result));
                        }
                    }
                };
                
                window.addEventListener('message', handler);
                
                setTimeout(() => {
                    window.removeEventListener('message', handler);
                    reject(new Error('Timeout: DUB5 extension not responding. Please check installation.'));
                }, 15000);
            });
        }

        // Send Message Function
        async function sendMessage() {
            const input = document.getElementById('user-input');
            const messages = document.getElementById('messages');
            const sendButton = document.getElementById('send-button');
            
            if (!input.value.trim() || isLoading) return;
            
            const userMessage = input.value.trim();
            input.value = '';
            isLoading = true;
            sendButton.disabled = true;
            sendButton.textContent = 'Sending...';
            
            // Add user message
            messages.innerHTML += `<div class="message user-message">${userMessage}</div>`;
            
            // Add loading indicator
            const loadingId = 'loading-' + Date.now();
            messages.innerHTML += `<div class="message ai-message loading" id="${loadingId}">AI is thinking...</div>`;
            messages.scrollTop = messages.scrollHeight;
            
            try {
                const response = await callLocalAI(userMessage, currentService);
                
                // Remove loading indicator
                document.getElementById(loadingId).remove();
                
                // Add AI response
                messages.innerHTML += `<div class="message ai-message">${response}</div>`;
                
            } catch (error) {
                // Remove loading indicator
                document.getElementById(loadingId).remove();
                
                // Add error message
                messages.innerHTML += `<div class="message error-message">Error: ${error.message}</div>`;
            } finally {
                isLoading = false;
                sendButton.disabled = false;
                sendButton.textContent = 'Send';
                messages.scrollTop = messages.scrollHeight;
            }
        }

        // Handle Enter key
        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }

        // Service selector change
        document.getElementById('ai-service').addEventListener('change', function() {
            currentService = this.value;
            window.postMessage({ 
                type: 'SET_AI_SERVICE', 
                serviceId: currentService
            }, '*');
        });

        // Check extension status on load
        window.addEventListener('load', function() {
            // Test extension connection
            window.postMessage({ type: 'GET_SERVICE_INFO' }, '*');
            
            setTimeout(() => {
                const status = document.getElementById('connection-status');
                status.textContent = '🟢 Connected';
            }, 1000);
        });

        // Listen for service info response
        window.addEventListener('message', function(e) {
            if (e.data.type === 'SERVICE_INFO_RESPONSE') {
                const status = document.getElementById('connection-status');
                if (e.data.currentService) {
                    status.textContent = '🟢 Connected';
                } else {
                    status.textContent = '🔴 Extension not found';
                }
            }
        });
    </script>
</body>
</html>
```

---

## 📞 Support & Resources

### Extension Issues
- Check Chrome Extensions page for DUB5 Local AI Bridge
- Verify all permissions are granted
- Try reloading the extension

### AI Service Issues
- Ensure you're logged into the AI service
- Check service status pages
- Try different AI services

### Integration Help
- Review the message passing examples above
- Check browser console for error messages
- Test with the provided template first

---

**Ready to integrate AI into your web app? Start with the template above and customize it for your needs!**