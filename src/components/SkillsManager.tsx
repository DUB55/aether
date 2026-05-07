import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Code2, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Save,
  Download,
  Upload,
  Zap,
  Brain,
  FileText,
  Settings
} from 'lucide-react';
import { TauriCommands, isTauriApp } from '@/lib/tauri-commands';
import { AITools } from '@/lib/ai-tools';
import { cn } from '@/lib/utils';

interface Skill {
  id: string;
  name: string;
  description: string;
  type: 'javascript' | 'python' | 'shell' | 'prompt';
  content: string;
  category: string;
  tags: string[];
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SkillsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSkillExecute?: (skill: Skill) => void;
}

const BUILTIN_SKILLS: Skill[] = [
  {
    id: 'create-react-component',
    name: 'Create React Component',
    description: 'Creates a new React component with TypeScript and Tailwind CSS',
    type: 'javascript',
    content: `// Create a new React component
const componentName = args.name || 'NewComponent';
const filePath = \`src/components/\${componentName}.tsx\`;

const componentTemplate = \`import React from 'react';

interface \${componentName}Props {
  // Define your props here
}

export function \${componentName}(props: \${componentName}Props) {
  return (
    <div className="p-4">
      <h2>\${componentName}</h2>
      {/* Add your component content here */}
    </div>
  );
}
\`;

await writeFile(filePath, componentTemplate);
console.log(\`Created component: \${filePath}\`);`,
    category: 'Development',
    tags: ['react', 'typescript', 'component'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'setup-git-repo',
    name: 'Setup Git Repository',
    description: 'Initialize a new Git repository and create initial commit',
    type: 'shell',
    content: `git init
echo "# Project" > README.md
git add README.md
git commit -m "Initial commit"`,
    category: 'Development',
    tags: ['git', 'repository', 'setup'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'install-dependencies',
    name: 'Install Dependencies',
    description: 'Install npm packages from package.json',
    type: 'shell',
    content: `npm install`,
    category: 'Development',
    tags: ['npm', 'dependencies', 'install'],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function SkillsManager({ isOpen, onClose, onSkillExecute }: SkillsManagerProps) {
  const [skills, setSkills] = useState<Skill[]>(BUILTIN_SKILLS);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Partial<Skill>>({
    name: '',
    description: '',
    type: 'javascript',
    content: '',
    category: 'Development',
    tags: []
  });
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const savedSkills = localStorage.getItem('aether_skills');
      if (savedSkills) {
        const parsed = JSON.parse(savedSkills);
        setSkills([...BUILTIN_SKILLS, ...parsed]);
      }
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  };

  const saveSkills = (updatedSkills: Skill[]) => {
    const customSkills = updatedSkills.filter(skill => !skill.isBuiltIn);
    localStorage.setItem('aether_skills', JSON.stringify(customSkills));
  };

  const executeSkill = async (skill: Skill) => {
    if (!isTauriApp()) {
      alert('Skill execution is only available in the desktop app');
      return;
    }

    setIsExecuting(true);
    try {
      switch (skill.type) {
        case 'javascript':
          await executeJavaScriptSkill(skill);
          break;
        case 'shell':
          await executeShellSkill(skill);
          break;
        case 'prompt':
          await executePromptSkill(skill);
          break;
        case 'python':
          await executePythonSkill(skill);
          break;
        default:
          throw new Error(`Unsupported skill type: ${skill.type}`);
      }

      onSkillExecute?.(skill);
    } catch (error) {
      console.error('Skill execution failed:', error);
      alert(`Skill execution failed: ${error}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const executeJavaScriptSkill = async (skill: Skill) => {
    // Create a safe execution context with available functions
    const context = {
      writeFile: TauriCommands.writeFile,
      readFile: TauriCommands.readFile,
      executeCommand: TauriCommands.executeCommand,
      manageDirectory: TauriCommands.manageDirectory,
      console: {
        log: (...args: any[]) => {
          console.log(`[Skill: ${skill.name}]`, ...args);
        }
      },
      args: {} // Can be extended to accept parameters
    };

    // Execute the skill code in a safe context
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const fn = new AsyncFunction('context', `
      const { writeFile, readFile, executeCommand, manageDirectory, console, args } = context;
      ${skill.content}
    `);
    
    await fn(context);
  };

  const executeShellSkill = async (skill: Skill) => {
    const commands = skill.content.split('\n').filter(cmd => cmd.trim());
    for (const command of commands) {
      const result = await TauriCommands.executeCommand(command);
      if (!result.success) {
        throw new Error(`Command failed: ${command}\n${result.stderr}`);
      }
    }
  };

  const executePromptSkill = async (skill: Skill) => {
    // For prompt skills, we would integrate with the AI system
    // This is a placeholder for now
    console.log('Executing prompt skill:', skill.content);
  };

  const executePythonSkill = async (skill: Skill) => {
    // For Python skills, we would need to set up Python execution
    // This is a placeholder for now
    throw new Error('Python skill execution not yet implemented');
  };

  const saveSkill = () => {
    if (!editingSkill.name || !editingSkill.content) {
      alert('Name and content are required');
      return;
    }

    if (selectedSkill && !selectedSkill.isBuiltIn) {
      // Update existing skill
      const updatedSkills = skills.map(skill => 
        skill.id === selectedSkill.id 
          ? { ...skill, ...editingSkill, updatedAt: new Date().toISOString() }
          : skill
      );
      setSkills(updatedSkills);
      saveSkills(updatedSkills);
    } else {
      // Create new skill
      const newSkill: Skill = {
        id: Math.random().toString(36).substring(7),
        name: editingSkill.name,
        description: editingSkill.description || '',
        type: editingSkill.type as Skill['type'],
        content: editingSkill.content,
        category: editingSkill.category || 'Custom',
        tags: editingSkill.tags || [],
        isBuiltIn: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedSkills = [...skills, newSkill];
      setSkills(updatedSkills);
      saveSkills(updatedSkills);
    }

    setIsEditing(false);
    setEditingSkill({
      name: '',
      description: '',
      type: 'javascript',
      content: '',
      category: 'Development',
      tags: []
    });
    setSelectedSkill(null);
  };

  const deleteSkill = (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (skill?.isBuiltIn) {
      alert('Cannot delete built-in skills');
      return;
    }

    const updatedSkills = skills.filter(s => s.id !== skillId);
    setSkills(updatedSkills);
    saveSkills(updatedSkills);
    setSelectedSkill(null);
  };

  const exportSkills = () => {
    const customSkills = skills.filter(skill => !skill.isBuiltIn);
    const blob = new Blob([JSON.stringify(customSkills, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aether-skills.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSkills = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSkills = JSON.parse(e.target?.result as string);
        const updatedSkills = [...skills, ...importedSkills];
        setSkills(updatedSkills);
        saveSkills(updatedSkills);
      } catch (error) {
        alert('Failed to import skills: Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const categories = [...new Set(skills.map(skill => skill.category))];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Skills Manager
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[600px] gap-4">
          {/* Skills List */}
          <div className="w-1/3 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Skills</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportSkills}>
                  <Download className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <label>
                    <Upload className="w-3 h-3" />
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={importSkills}
                    />
                  </label>
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setIsEditing(true);
                    setSelectedSkill(null);
                    setEditingSkill({
                      name: '',
                      description: '',
                      type: 'javascript',
                      content: '',
                      category: 'Custom',
                      tags: []
                    });
                  }}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {skills.map(skill => (
                  <div
                    key={skill.id}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-colors",
                      selectedSkill?.id === skill.id 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:bg-muted"
                    )}
                    onClick={() => setSelectedSkill(skill)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{skill.name}</h4>
                          {skill.isBuiltIn && (
                            <Badge variant="secondary" className="text-xs">Built-in</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {skill.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {skill.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {skill.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            executeSkill(skill);
                          }}
                          disabled={isExecuting}
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                        {!skill.isBuiltIn && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                                setSelectedSkill(skill);
                                setEditingSkill(skill);
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSkill(skill.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Skill Details/Edit */}
          <div className="flex-1 flex flex-col">
            {isEditing ? (
              <div className="space-y-4">
                <h3 className="font-medium">Edit Skill</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={editingSkill.name}
                    onChange={(e) => setEditingSkill(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Skill name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={editingSkill.description}
                    onChange={(e) => setEditingSkill(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Skill description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <Select
                      value={editingSkill.type}
                      onValueChange={(value) => setEditingSkill(prev => ({ ...prev, type: value as Skill['type'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="shell">Shell</SelectItem>
                        <SelectItem value="prompt">Prompt</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Input
                      value={editingSkill.category}
                      onChange={(e) => setEditingSkill(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="Category"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={editingSkill.content}
                    onChange={(e) => setEditingSkill(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Skill code or commands"
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveSkill}>
                    <Save className="w-3 h-3 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : selectedSkill ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{selectedSkill.name}</h3>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => executeSkill(selectedSkill)}
                      disabled={isExecuting}
                    >
                      {isExecuting ? (
                        <>
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-2" />
                          Execute
                        </>
                      )}
                    </Button>
                    {!selectedSkill.isBuiltIn && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(true);
                          setEditingSkill(selectedSkill);
                        }}
                      >
                        <Edit className="w-3 h-3 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{selectedSkill.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedSkill.type}</Badge>
                    <Badge variant="outline">{selectedSkill.category}</Badge>
                    {selectedSkill.isBuiltIn && (
                      <Badge variant="secondary">Built-in</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Content</label>
                  <div className="p-3 border rounded-lg bg-muted">
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      {selectedSkill.content}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <p>Select a skill to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
