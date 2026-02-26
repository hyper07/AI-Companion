import { useState } from "react";
import { Link } from "react-router";
import { 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Server, 
  ArrowLeft,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// API Data
const CATEGORIES = [
  { id: "dashboard", name: "Dashboard", color: "bg-amber-500", count: 4 },
  { id: "companion", name: "Companion Chat", color: "bg-emerald-500", count: 1 },
  { id: "call", name: "Virtual Call", color: "bg-blue-500", count: 1 },
  { id: "family", name: "Family & KB Setup", color: "bg-purple-500", count: 5 },
];

const ENDPOINTS = [
  // Dashboard
  {
    id: "loadDashboard",
    method: "POST",
    path: "/processFlow_loadDashboard",
    summary: "Load caregiver patients",
    category: "dashboard",
    description: "Retrieves the list of patients associated with the current caregiver.",
    request: {
      type: "object",
      properties: {}
    },
    response: {
      type: "object",
      properties: {
        patients: { type: "array", description: "List of patient profiles" }
      }
    }
  },
  {
    id: "loadAlerts",
    method: "POST",
    path: "/processFlow_loadAlerts",
    summary: "Load unresolved alerts",
    category: "dashboard",
    description: "Fetches all active distress alerts that require attention.",
    request: {
      type: "object",
      properties: {}
    },
    response: {
      type: "object",
      properties: {
        alerts: { type: "array", description: "List of active alerts" }
      }
    }
  },
  {
    id: "createPatient",
    method: "POST",
    path: "/processFlow_createPatient",
    summary: "Create patient profile",
    category: "dashboard",
    description: "Creates a new patient profile under the current caregiver's account.",
    request: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", description: "Full name of the patient" },
        birthYear: { type: "string", description: "Year of birth (optional)" },
        notes: { type: "string", description: "Medical notes (optional)" }
      }
    },
    response: {
      type: "object",
      properties: {
        patientId: { type: "string", description: "ID of the created patient" }
      }
    }
  },
  {
    id: "resolveAlert",
    method: "POST",
    path: "/processFlow_resolveAlert",
    summary: "Resolve distress alert",
    category: "dashboard",
    description: "Marks a specific distress alert as resolved.",
    request: {
      type: "object",
      required: ["alertId"],
      properties: {
        alertId: { type: "string", description: "ID of the alert to resolve" }
      }
    },
    response: {
      type: "object",
      properties: {
        success: { type: "boolean", description: "True if successful" }
      }
    }
  },

  // Companion Chat
  {
    id: "chat",
    method: "POST",
    path: "/processFlow_chat",
    summary: "Send message to AI companion",
    category: "companion",
    description: "Sends a user message to the AI companion and receives a response.",
    request: {
      type: "object",
      required: ["message", "patientId"],
      properties: {
        message: { type: "string", description: "User's message content" },
        patientId: { type: "string", description: "ID of the patient context" }
      }
    },
    response: {
      type: "object",
      properties: {
        reply: { type: "string", description: "AI's response text" }
      }
    }
  },

  // Virtual Call
  {
    id: "callTurn",
    method: "POST",
    path: "/processFlow_callTurn",
    summary: "Process call turn",
    category: "call",
    description: "Processes a turn in the virtual voice call session.",
    request: {
      type: "object",
      required: ["audioData", "patientId"],
      properties: {
        audioData: { type: "string", description: "Base64 encoded audio or transcript" },
        patientId: { type: "string", description: "ID of the patient context" }
      }
    },
    response: {
      type: "object",
      properties: {
        audioResponse: { type: "string", description: "Base64 encoded audio response" },
        textResponse: { type: "string", description: "Text transcript of response" }
      }
    }
  },

  // Family & KB Setup
  {
    id: "loadKb",
    method: "POST",
    path: "/processFlow_loadKb",
    summary: "Load KB entries",
    category: "family",
    description: "Retrieves knowledge base entries for a specific patient.",
    request: {
      type: "object",
      required: ["patientId"],
      properties: {
        patientId: { type: "string", description: "ID of the patient" }
      }
    },
    response: {
      type: "object",
      properties: {
        entries: { type: "array", description: "List of KB entries" }
      }
    }
  },
  {
    id: "addKb",
    method: "POST",
    path: "/processFlow_addKb",
    summary: "Add KB entry",
    category: "family",
    description: "Adds a new knowledge base entry for a patient.",
    request: {
      type: "object",
      required: ["patientId", "title", "content"],
      properties: {
        patientId: { type: "string", description: "ID of the patient" },
        title: { type: "string", description: "Entry title" },
        content: { type: "string", description: "Entry content details" }
      }
    },
    response: {
      type: "object",
      properties: {
        entryId: { type: "string", description: "ID of created entry" }
      }
    }
  },
  {
    id: "deleteKb",
    method: "POST",
    path: "/processFlow_deleteKb",
    summary: "Delete KB entry",
    category: "family",
    description: "Removes a knowledge base entry.",
    request: {
      type: "object",
      required: ["entryId"],
      properties: {
        entryId: { type: "string", description: "ID of entry to delete" }
      }
    },
    response: {
      type: "object",
      properties: {
        success: { type: "boolean", description: "True if successful" }
      }
    }
  },
  {
    id: "loadFam",
    method: "POST",
    path: "/processFlow_loadFam",
    summary: "Load family members",
    category: "family",
    description: "Retrieves family members associated with a patient.",
    request: {
      type: "object",
      required: ["patientId"],
      properties: {
        patientId: { type: "string", description: "ID of the patient" }
      }
    },
    response: {
      type: "object",
      properties: {
        members: { type: "array", description: "List of family members" }
      }
    }
  },
  {
    id: "addFam",
    method: "POST",
    path: "/processFlow_addFam",
    summary: "Add family member",
    category: "family",
    description: "Adds a new family member to a patient's profile.",
    request: {
      type: "object",
      required: ["patientId", "name", "relation"],
      properties: {
        patientId: { type: "string", description: "ID of the patient" },
        name: { type: "string", description: "Name of family member" },
        relation: { type: "string", description: "Relationship to patient" }
      }
    },
    response: {
      type: "object",
      properties: {
        memberId: { type: "string", description: "ID of created member" }
      }
    }
  }
];

export default function ApiReferencePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    const element = document.getElementById(`category-${catId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col border-r border-slate-800">
        <div className="p-6">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <Code2 className="w-6 h-6 text-emerald-400" />
            <span>API Ref</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">v1.0.0 • OpenAPI 3.0</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                activeCategory === cat.id 
                  ? "bg-slate-800 text-white" 
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                <span>{cat.name}</span>
              </div>
              <span className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                {cat.count}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link to="/dashboard">
            <Button variant="ghost" className="w-full justify-start hover:bg-slate-800 hover:text-white text-slate-400">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Sticky Top Bar */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <h1 className="font-semibold text-slate-800">API Documentation</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:inline">Base URL:</span>
            <code className="bg-slate-100 px-3 py-1.5 rounded text-sm font-mono text-slate-700 border border-slate-200">
              https://stoic-crane-894.convex.site
            </code>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-slate-500 hover:text-slate-900"
              onClick={() => handleCopy("https://stoic-crane-894.convex.site", "base-url")}
            >
              {copiedId === "base-url" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-12">
            
            {CATEGORIES.map((category) => (
              <section key={category.id} id={`category-${category.id}`} className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
                  <span className={`w-3 h-8 rounded-full ${category.color}`} />
                  <h2 className="text-2xl font-bold text-slate-800">{category.name}</h2>
                </div>

                <div className="grid gap-6">
                  {ENDPOINTS.filter(e => e.category === category.id).map((endpoint) => (
                    <Card key={endpoint.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 border-b border-slate-100 gap-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 font-bold uppercase tracking-wider">
                            {endpoint.method}
                          </Badge>
                          <code className="font-mono text-sm text-slate-700 font-semibold truncate">
                            {endpoint.path}
                          </code>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-slate-500 hover:text-slate-900 shrink-0"
                          onClick={() => handleCopy(`https://stoic-crane-894.convex.site${endpoint.path}`, endpoint.id)}
                        >
                          {copiedId === endpoint.id ? (
                            <span className="flex items-center text-emerald-600">
                              <Check className="w-4 h-4 mr-2" /> Copied
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Copy className="w-4 h-4 mr-2" /> Copy URL
                            </span>
                          )}
                        </Button>
                      </div>

                      <CardContent className="p-6 space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800 mb-1">{endpoint.summary}</h3>
                          <p className="text-slate-600">{endpoint.description}</p>
                        </div>

                        {/* Request Schema */}
                        <Collapsible className="border rounded-md border-slate-200 bg-white">
                          <CollapsibleTrigger asChild>
                            <button className="flex items-center justify-between w-full p-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                              <span>Request Body (JSON)</span>
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                              {Object.keys(endpoint.request.properties).length > 0 ? (
                                <div className="space-y-2">
                                  {Object.entries(endpoint.request.properties).map(([key, prop]: [string, any]) => (
                                    <div key={key} className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-sm">
                                      <div className="sm:col-span-3 font-mono text-purple-600 font-medium">
                                        {key}
                                        {endpoint.request.required?.includes(key) && <span className="text-red-500 ml-1">*</span>}
                                      </div>
                                      <div className="sm:col-span-2 text-slate-500 italic">{prop.type}</div>
                                      <div className="sm:col-span-7 text-slate-700">{prop.description}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-500 italic">No request body required.</p>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Response Schema */}
                        <Collapsible className="border rounded-md border-slate-200 bg-white">
                          <CollapsibleTrigger asChild>
                            <button className="flex items-center justify-between w-full p-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                              <span>Response Body (JSON)</span>
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                              <div className="space-y-2">
                                {Object.entries(endpoint.response.properties).map(([key, prop]: [string, any]) => (
                                  <div key={key} className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-sm">
                                    <div className="sm:col-span-3 font-mono text-emerald-600 font-medium">{key}</div>
                                    <div className="sm:col-span-2 text-slate-500 italic">{prop.type}</div>
                                    <div className="sm:col-span-7 text-slate-700">{prop.description}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
            
            <footer className="text-center text-slate-400 text-sm pt-12 pb-6">
              <p>&copy; {new Date().getFullYear()} Vibe Health API Reference</p>
            </footer>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
