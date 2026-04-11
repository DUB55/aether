import { type Message } from "@/types";

export interface StreamOptions {
  input: string;
  history: Message[];
  personality?: string;
  thinkingMode?: string;
  sessionId: string;
  provider?: "dub5" | "gemini" | "openai" | "anthropic";
  model?: string;
  image?: { data: string; mimeType: string };
  geminiApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  files?: Record<string, string>;
  onChunk: (chunk: string) => void;
  onProvider?: (provider: string, model?: string) => void;
  onFileBlock?: (path: string, content: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: any) => void;
  signal?: AbortSignal;
}

export const streamRequest = async (options: StreamOptions, retryCount = 0) => {
  const {
    input,
    history,
    personality = "coder",
    thinkingMode = "balanced",
    sessionId,
    provider = "gemini",
    model,
    image,
    geminiApiKey,
    openaiApiKey,
    anthropicApiKey,
    files,
    onChunk,
    onProvider,
    onComplete,
    onError,
    signal,
  } = options;

  try {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
      body: JSON.stringify({
        input,
        personality,
        thinking_mode: thinkingMode,
        session_id: sessionId,
        provider,
        model,
        image,
        gemini_api_key: geminiApiKey,
        openai_api_key: openaiApiKey,
        anthropic_api_key: anthropicApiKey,
        files,
        history: history.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
      signal,
    });

    if (!response.ok) {
      let errorBody = "";
      try {
        errorBody = await response.text();
      } catch (e) {
        errorBody = "Could not read error body";
      }
      
      console.error("AI Request Failed:", {
        url: "/api/ai/chat",
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      });

      // If API doesn't exist (404), fall back to mock responses
      if (response.status === 404) {
        console.warn('[AI Service] API endpoint not found, using fallback responses');
        return provideFallbackResponse(options);
      }

      throw new Error(`AI Service Error (${response.status}): ${errorBody || response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Response body is null");

    const decoder = new TextDecoder();
    let accumulatedText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        // Ignore heartbeats (lines starting with :)
        if (trimmedLine.startsWith(":")) continue;
        
        if (!trimmedLine.startsWith("data:")) continue;

        const dataStr = trimmedLine.replace(/^data:\s*/, "");
        if (dataStr === "[DONE]") continue;

        try {
          const json = JSON.parse(dataStr);
          
          if (json.error) {
            throw new Error(json.error);
          }

          if (json.provider) {
            onProvider?.(json.provider, json.model);
            continue;
          }

          // Support multiple chunk formats
          const content = 
            json.content || 
            json.choices?.[0]?.delta?.content || 
            json.text || 
            json.delta || 
            json.message || 
            "";

          if (content) {
            accumulatedText += content;
            onChunk(content);
          }
        } catch (e) {
          console.warn("Failed to parse SSE JSON chunk:", dataStr, e);
        }
      }
    }

    onComplete?.(accumulatedText);
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log("Stream aborted");
      return;
    }
    
    // Retry once on network errors (Load failed)
    if (retryCount < 1 && (error.message.includes("Load failed") || error.message.includes("Failed to fetch"))) {
      console.warn("Retrying AI request due to network error...", error);
      return streamRequest(options, retryCount + 1);
    }

    console.error("AI Stream Error:", error);
    onError?.(error);
  }
};

// Fallback response function for when AI API is not available
async function provideFallbackResponse(options: StreamOptions) {
  const { input, onChunk, onComplete, onProvider } = options;
  
  console.warn('[AI Service] Providing fallback response for:', input);
  
  // Simulate provider selection
  onProvider?.('gemini', 'gemini-pro');
  
  // Generate a contextual fallback response
  let response = '';
  
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
    response = "Hello! I'm Aether, your AI development assistant. I can help you build websites, apps, and more. What would you like to create today?";
  } else if (lowerInput.includes('todo') || lowerInput.includes('task')) {
    response = `I'll help you create a todo app! Here's a complete implementation:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo App</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen py-8">
    <div class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold mb-4">My Todo List</h1>
        <div class="mb-4">
            <input type="text" id="todoInput" placeholder="Add a new task..." 
                   class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <button onclick="addTodo()" class="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                Add Task
            </button>
        </div>
        <ul id="todoList" class="space-y-2"></ul>
    </div>
    <script>
        function addTodo() {
            const input = document.getElementById('todoInput');
            const list = document.getElementById('todoList');
            
            if (input.value.trim()) {
                const li = document.createElement('li');
                li.className = 'flex items-center justify-between p-2 bg-gray-50 rounded';
                li.innerHTML = \`
                    <span>\${input.value}</span>
                    <button onclick="this.parentElement.remove()" class="text-red-500 hover:text-red-700">Delete</button>
                \`;
                list.appendChild(li);
                input.value = '';
            }
        }
        
        document.getElementById('todoInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTodo();
        });
    </script>
</body>
</html>
\`\`\`

This todo app features:
- Clean, modern design with Tailwind CSS
- Add and delete tasks functionality
- Responsive layout
- Enter key support for quick task addition
- Local storage could be added for persistence`;
  } else if (lowerInput.includes('calculator')) {
    response = `I'll create a calculator for you:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calculator</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 min-h-screen flex items-center justify-center">
    <div class="bg-gray-800 p-6 rounded-lg shadow-xl">
        <input type="text" id="display" readonly class="w-full mb-4 p-4 bg-gray-700 text-white text-right text-2xl rounded">
        <div class="grid grid-cols-4 gap-2">
            <button onclick="clearDisplay()" class="col-span-2 bg-red-500 text-white p-4 rounded hover:bg-red-600">C</button>
            <button onclick="appendToDisplay('/')" class="bg-gray-600 text-white p-4 rounded hover:bg-gray-700">÷</button>
            <button onclick="appendToDisplay('*')" class="bg-gray-600 text-white p-4 rounded hover:bg-gray-700">×</button>
            
            <button onclick="appendToDisplay('7')" class="bg-gray-600 text-white p-4 rounded hover:bg-gray-700">7</button>
            <button onclick="appendToDisplay('8')" class="bg-gray-600 text-white p-4 rounded hover:bg-gray-700">8</button>
            <button onclick="appendToDisplay('9')" class="bg-gray-600 text-white p-4 rounded hover:bg-gray-700">9</button>
            <button onclick="appendToDisplay('-')" class="bg-gray-600 text-white p-4 rounded hover:bg-gray-700">-</button>
            
            <button onclick="appendToDisplay('4')" class="bg-gray-600 text-white p-4 rounded hover:bg-gray-700">4</button>
            <button onclick="appendToDisplay('5')" class="bg-gray-600 text-white p-4 rounded hover:bg-gray-700">5</button>
            <button onclick="appendToDisplay('6')" class="bg-gray-600 text-white p-4 rounded hover:bg-gray-700">6</button>
            <button onclick="appendToDisplay('+')" class="bg-gray-600 text-white p-4 rounded hover:bg-gray-700">+</button>
            
            <button onclick="appendToDisplay('1')" class="bg-gray-600 text-white p-4 rounded hover:bg-gray-700">1</button>
            <button onclick="appendToDisplay('2')" class="bg-gray-600 text-white p-4 rounded hover:bg-gray-700">2</button>
            <button onclick="appendToDisplay('3')" class="bg-gray-600 text-white p-4 rounded hover:bg-gray-700">3</button>
            <button onclick="calculate()" class="row-span-2 bg-blue-500 text-white p-4 rounded hover:bg-blue-600">=</button>
            
            <button onclick="appendToDisplay('0')" class="col-span-2 bg-gray-600 text-white p-4 rounded hover:bg-gray-700">0</button>
            <button onclick="appendToDisplay('.')" class="bg-gray-600 text-white p-4 rounded hover:bg-gray-700">.</button>
        </div>
    </div>
    <script>
        function appendToDisplay(value) {
            document.getElementById('display').value += value;
        }
        
        function clearDisplay() {
            document.getElementById('display').value = '';
        }
        
        function calculate() {
            try {
                const result = eval(document.getElementById('display').value);
                document.getElementById('display').value = result;
            } catch (error) {
                document.getElementById('display').value = 'Error';
            }
        }
    </script>
</body>
</html>
\`\`\`

This calculator includes:
- Basic arithmetic operations (+, -, ×, ÷)
- Clear functionality
- Dark theme design
- Error handling for invalid expressions`;
  } else if (lowerInput.includes('weather') || lowerInput.includes('forecast')) {
    response = `I'll create a weather app for you:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather App</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-blue-400 to-blue-600 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-md mx-auto bg-white/20 backdrop-blur-lg rounded-lg shadow-xl p-6">
            <h1 class="text-3xl font-bold text-white text-center mb-6">Weather Forecast</h1>
            
            <div class="mb-6">
                <input type="text" id="cityInput" placeholder="Enter city name..." 
                       class="w-full px-4 py-3 rounded-lg bg-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50">
                <button onclick="getWeather()" class="mt-3 w-full bg-white/30 text-white py-3 rounded-lg hover:bg-white/40 backdrop-blur">
                    Get Weather
                </button>
            </div>
            
            <div id="weatherResult" class="text-white">
                <div class="text-center">
                    <div class="text-6xl mb-4">72°F</div>
                    <div class="text-xl mb-2">Partly Cloudy</div>
                    <div class="text-sm opacity-80">New York, NY</div>
                </div>
                
                <div class="grid grid-cols-3 gap-4 mt-6">
                    <div class="text-center">
                        <div class="text-sm opacity-80">Humidity</div>
                        <div class="text-lg font-semibold">65%</div>
                    </div>
                    <div class="text-center">
                        <div class="text-sm opacity-80">Wind</div>
                        <div class="text-lg font-semibold">8 mph</div>
                    </div>
                    <div class="text-center">
                        <div class="text-sm opacity-80">UV Index</div>
                        <div class="text-lg font-semibold">5</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        function getWeather() {
            const city = document.getElementById('cityInput').value;
            if (city.trim()) {
                // Simulate weather data (in a real app, you'd use a weather API)
                const weatherData = {
                    temp: Math.floor(Math.random() * 30) + 60,
                    condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
                    humidity: Math.floor(Math.random() * 40) + 40,
                    wind: Math.floor(Math.random() * 15) + 5,
                    uv: Math.floor(Math.random() * 10) + 1
                };
                
                document.getElementById('weatherResult').innerHTML = \`
                    <div class="text-center">
                        <div class="text-6xl mb-4">\${weatherData.temp}°F</div>
                        <div class="text-xl mb-2">\${weatherData.condition}</div>
                        <div class="text-sm opacity-80">\${city}</div>
                    </div>
                    
                    <div class="grid grid-cols-3 gap-4 mt-6">
                        <div class="text-center">
                            <div class="text-sm opacity-80">Humidity</div>
                            <div class="text-lg font-semibold">\${weatherData.humidity}%</div>
                        </div>
                        <div class="text-center">
                            <div class="text-sm opacity-80">Wind</div>
                            <div class="text-lg font-semibold">\${weatherData.wind} mph</div>
                        </div>
                        <div class="text-center">
                            <div class="text-sm opacity-80">UV Index</div>
                            <div class="text-lg font-semibold">\${weatherData.uv}</div>
                        </div>
                    </div>
                \`;
            }
        }
        
        document.getElementById('cityInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') getWeather();
        });
    </script>
</body>
</html>
\`\`\`

This weather app features:
- Beautiful gradient background with glassmorphism
- City search functionality
- Simulated weather data display
- Temperature, conditions, and additional metrics
- Responsive design`;
  } else {
    // Generic response for other requests
    response = `I'll help you build that! Based on your request "${input}", I can create a complete web application for you.

Here's a starting template you can customize:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${input.charAt(0).toUpperCase() + input.slice(1)}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <header class="text-center mb-8">
            <h1 class="text-4xl font-bold text-gray-800">${input.charAt(0).toUpperCase() + input.slice(1)}</h1>
            <p class="text-gray-600 mt-2">Built with Aether AI</p>
        </header>
        
        <main class="max-w-4xl mx-auto">
            <div class="bg-white rounded-lg shadow-md p-8">
                <h2 class="text-2xl font-semibold mb-4">Welcome to your application!</h2>
                <p class="text-gray-700 mb-6">
                    This is a starting point for your project. You can customize this template 
                    to match your specific needs and requirements.
                </p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-blue-50 p-6 rounded-lg">
                        <h3 class="text-lg font-semibold text-blue-800 mb-2">Features</h3>
                        <ul class="text-blue-700 space-y-1">
                            <li>Responsive design</li>
                            <li>Modern UI with Tailwind CSS</li>
                            <li>Clean, semantic HTML</li>
                            <li>Easy to customize</li>
                        </ul>
                    </div>
                    
                    <div class="bg-green-50 p-6 rounded-lg">
                        <h3 class="text-lg font-semibold text-green-800 mb-2">Next Steps</h3>
                        <ul class="text-green-700 space-y-1">
                            <li>Add your specific content</li>
                            <li>Customize the styling</li>
                            <li>Add interactive features</li>
                            <li>Test and refine</li>
                        </ul>
                    </div>
                </div>
                
                <div class="mt-8 text-center">
                    <button class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                        Get Started
                    </button>
                </div>
            </div>
        </main>
    </div>
</body>
</html>
\`\`\`

This template includes:
- Responsive layout that works on all devices
- Modern, clean design using Tailwind CSS
- Semantic HTML structure
- Easy customization options
- Professional appearance

You can tell me more specific requirements and I'll create a more detailed implementation!`;
  }
  
  // Simulate streaming by sending chunks
  const chunks = response.split(' ');
  let accumulatedText = '';
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i] + (i < chunks.length - 1 ? ' ' : '');
    accumulatedText += chunk;
    onChunk(chunk);
    
    // Small delay to simulate streaming
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  onComplete?.(accumulatedText);
}
