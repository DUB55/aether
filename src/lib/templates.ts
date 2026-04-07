import { Project } from "@/types";

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  files: Record<string, string>;
}

export const TEMPLATES: Template[] = [
  {
    id: 'react-tailwind-starter',
    name: 'React + Tailwind',
    description: 'A clean starter with React 18, Tailwind CSS 4, and Lucide icons.',
    icon: '⚛️',
    category: 'Frontend',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React App</title>
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>`,
      'src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
      'src/App.tsx': `import React, { useState } from 'react';
import { Cpu, Rocket, Code2 } from 'lucide-react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <header className="text-center space-y-4">
        <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto border border-blue-500/20">
          <Cpu className="w-10 h-10 text-blue-500" />
        </div>
        <h1 className="text-5xl font-black tracking-tight text-slate-900">
          Aether <span className="text-blue-500">Starter</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-xl mx-auto">
          Your autonomous development journey starts here. Edit this file to see changes in real-time.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: 'React 18', desc: 'Modern functional components with hooks.', icon: Code2 },
          { title: 'Tailwind 4', desc: 'Utility-first styling with zero config.', icon: Cpu },
          { title: 'Fast Refresh', desc: 'See your changes instantly in the preview.', icon: Rocket },
        ].map((item) => (
          <div key={item.title} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <item.icon className="w-6 h-6 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-lg mb-2">{item.title}</h3>
            <p className="text-sm text-slate-500">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button 
          onClick={() => setCount(c => c + 1)}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95"
        >
          Count is {count}
        </button>
      </div>
    </div>
  );
}`
    }
  },
  {
    id: 'landing-page-bento',
    name: 'Bento Landing Page',
    description: 'A modern landing page with a bento grid layout and smooth animations.',
    icon: '🍱',
    category: 'Marketing',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bento Landing</title>
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
</head>
<body class="bg-black text-white selection:bg-white/20">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>`,
      'src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);`,
      'src/App.tsx': `import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Globe, Users, Star, ArrowRight } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <nav className="flex justify-between items-center p-6 bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10">
        <div className="text-2xl font-black tracking-tighter">BENTO.</div>
        <button className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm hover:opacity-90 transition-opacity">
          Get Started
        </button>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:grid-rows-2 h-full">
        {/* Hero */}
        <div className="md:col-span-2 md:row-span-2 p-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[48px] flex flex-col justify-end space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-20 group-hover:scale-110 transition-transform duration-700">
            <Zap className="w-64 h-64" />
          </div>
          <h1 className="text-6xl font-black leading-tight tracking-tighter">
            Build faster <br /> than ever.
          </h1>
          <p className="text-xl text-white/80 max-w-md">
            The next generation of development tools is here. Experience speed, security, and scale.
          </p>
          <button className="w-fit px-8 py-4 bg-white text-blue-600 rounded-2xl font-black flex items-center gap-2 group">
            Start Building <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Features */}
        <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] flex flex-col justify-between hover:bg-white/10 transition-colors">
          <Globe className="w-10 h-10 text-blue-400" />
          <div>
            <h3 className="text-xl font-bold mb-2">Global Scale</h3>
            <p className="text-sm text-white/40">Deploy to 100+ edge locations instantly.</p>
          </div>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] flex flex-col justify-between hover:bg-white/10 transition-colors">
          <Shield className="w-10 h-10 text-emerald-400" />
          <div>
            <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
            <p className="text-sm text-white/40">Bank-grade encryption by default.</p>
          </div>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] flex flex-col justify-between hover:bg-white/10 transition-colors">
          <Users className="w-10 h-10 text-purple-400" />
          <div>
            <h3 className="text-xl font-bold mb-2">Team Sync</h3>
            <p className="text-sm text-white/40">Collaborate in real-time with your team.</p>
          </div>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] flex flex-col justify-between hover:bg-white/10 transition-colors">
          <Star className="w-10 h-10 text-yellow-400" />
          <div>
            <h3 className="text-xl font-bold mb-2">Top Rated</h3>
            <p className="text-sm text-white/40">Trusted by 10k+ developers worldwide.</p>
          </div>
        </div>
      </div>
    </div>
  );
}`
    }
  },
  {
    id: 'dashboard-saas',
    name: 'SaaS Dashboard',
    description: 'A comprehensive admin dashboard with charts, data tables, and sidebar navigation.',
    icon: '📊',
    category: 'Application',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SaaS Dashboard</title>
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
</head>
<body class="bg-slate-50 text-slate-900">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>`,
      'src/main.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);`,
      'src/App.tsx': `import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Settings, 
  Bell, 
  Search,
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal
} from 'lucide-react';

export default function App() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 hidden lg:flex">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Nexus.</span>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { label: 'Dashboard', icon: LayoutDashboard, active: true },
            { label: 'Customers', icon: Users },
            { label: 'Analytics', icon: BarChart3 },
            { label: 'Settings', icon: Settings },
          ].map((item) => (
            <button 
              key={item.label}
              className={\`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors \${
                item.active ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }\`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded-xl relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Revenue', value: '$128,430', change: '+12.5%', color: 'indigo' },
            { label: 'Active Users', value: '2,842', change: '+18.2%', color: 'emerald' },
            { label: 'Conversion Rate', value: '4.2%', change: '-2.4%', color: 'rose' },
          ].map((stat) => (
            <div key={stat.label} className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                <span className={\`text-xs font-bold px-2 py-1 rounded-lg \${
                  stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }\`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold">Recent Transactions</h3>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Alex Rivera', email: 'alex@example.com', status: 'Completed', amount: '$450.00', date: 'Oct 24, 2023' },
                  { name: 'Sarah Chen', email: 'sarah@example.com', status: 'Pending', amount: '$1,200.00', date: 'Oct 23, 2023' },
                  { name: 'Marcus Bell', email: 'marcus@example.com', status: 'Completed', amount: '$85.00', date: 'Oct 22, 2023' },
                ].map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-xs">
                          {row.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{row.name}</div>
                          <div className="text-xs text-slate-500">{row.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={\`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider \${
                        row.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }\`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-sm">{row.amount}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{row.date}</td>
                    <td className="px-6 py-4">
                      <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}`
    }
  }
];
