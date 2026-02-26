import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { 
  Users, 
  Activity, 
  Server, 
  Search, 
  Shield, 
  ArrowLeft,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// --- Demo Data ---
const DEMO_USERS = [
  { id: "1", email: "admin@memorybridge.ai", role: "Admin", status: "online", lastSeen: "Now", joined: "Jan 2024" },
  { id: "2", email: "caregiver1@example.com", role: "Caregiver", status: "online", lastSeen: "2 min ago", joined: "Feb 2024" },
  { id: "3", email: "caregiver2@example.com", role: "Caregiver", status: "offline", lastSeen: "1 hour ago", joined: "Mar 2024" },
  { id: "4", email: "nurse.sarah@hospital.org", role: "Caregiver", status: "online", lastSeen: "5 min ago", joined: "Mar 2024" },
];

const DEMO_ACTIVITY = [
  { id: 1, message: "System startup sequence initiated", time: "2 hours ago", type: "system" },
  { id: 2, message: "Database connection established", time: "2 hours ago", type: "system" },
  { id: 3, message: "User caregiver1@example.com logged in", time: "1 hour ago", type: "auth" },
  { id: 4, message: "New patient profile created: Margaret Wilson", time: "45 min ago", type: "user" },
  { id: 5, message: "API health check passed", time: "10 min ago", type: "system" },
];

// Helper to generate avatar colors
const getAvatarColor = (email: string) => {
  const gradients = [
    "from-purple-500 to-indigo-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-pink-500 to-rose-500",
    "from-fuchsia-500 to-purple-500",
  ];
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

const getInitials = (email: string) => {
  if (!email) return "??";
  const parts = email.split("@")[0].split(/[._-]/);
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return email.substring(0, 2).toUpperCase();
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const filteredUsers = DEMO_USERS.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <Shield className="w-6 h-6 text-purple-500" />
            <span>Admin Panel</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <Button 
            variant={activeTab === "users" ? "secondary" : "ghost"} 
            className={`w-full justify-start ${activeTab === "users" ? "bg-slate-800 text-white" : "hover:bg-slate-800 hover:text-white"}`}
            onClick={() => setActiveTab("users")}
          >
            <Users className="w-4 h-4 mr-2" />
            Users
          </Button>
          <Button 
            variant={activeTab === "system" ? "secondary" : "ghost"} 
            className={`w-full justify-start ${activeTab === "system" ? "bg-slate-800 text-white" : "hover:bg-slate-800 hover:text-white"}`}
            onClick={() => setActiveTab("system")}
          >
            <Server className="w-4 h-4 mr-2" />
            System Info
          </Button>
          <Button 
            variant={activeTab === "activity" ? "secondary" : "ghost"} 
            className={`w-full justify-start ${activeTab === "activity" ? "bg-slate-800 text-white" : "hover:bg-slate-800 hover:text-white"}`}
            onClick={() => setActiveTab("activity")}
          >
            <Activity className="w-4 h-4 mr-2" />
            Activity
          </Button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link to="/dashboard">
            <Button variant="ghost" className="w-full justify-start hover:bg-slate-800 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start hover:bg-red-900/30 hover:text-red-400 text-slate-400"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-4">
             <div className="md:hidden">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <h1 className="text-xl font-semibold text-slate-800 capitalize">
              {activeTab === "users" ? "User Management" : activeTab === "system" ? "System Status" : "Recent Activity"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex flex-col items-end">
                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Total Users</span>
                <span className="font-medium text-slate-900">{DEMO_USERS.length}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Online</span>
                <span className="font-medium text-emerald-600">3</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Status</span>
                <span className="font-medium text-purple-600">Operational</span>
              </div>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1 p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 text-sm bg-white">
                      All Users
                    </Badge>
                  </div>
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Search users by email..." 
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUsers.map((user) => (
                    <Card key={user.id} className="overflow-hidden hover:shadow-md transition-shadow border-slate-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getAvatarColor(user.email)} flex items-center justify-center text-white text-xl font-bold shadow-inner`}>
                            {getInitials(user.email)}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {user.status === "online" ? (
                              <Badge className="bg-emerald-500 hover:bg-emerald-600 border-0 gap-1 pl-1.5">
                                <span className="w-2 h-2 rounded-full bg-white" />
                                Online
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-slate-500 gap-1 pl-1.5 border-slate-300">
                                <span className="w-2 h-2 rounded-full bg-slate-300" />
                                Offline
                              </Badge>
                            )}
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                              {user.role}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-1 mb-4">
                          <h3 className="font-semibold text-slate-800 truncate" title={user.email}>
                            {user.email}
                          </h3>
                          <p className="text-sm text-slate-500">
                            Last seen: {user.lastSeen}
                          </p>
                        </div>

                        <Separator className="my-3" />
                        
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Joined {user.joined}</span>
                          <div className="w-2 h-2 rounded-full bg-emerald-500" title="Active Account" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* System Info Tab */}
            {activeTab === "system" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-purple-500" />
                      Backend Infrastructure
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-slate-500">Provider</span>
                      <span className="font-medium">Convex</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-slate-500">Status</span>
                      <Badge className="bg-emerald-500 hover:bg-emerald-600">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-slate-500">API Endpoint</span>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded">https://stoic-crane-894.convex.site</code>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-500">Authentication</span>
                      <span className="font-medium">Convex Auth (Password)</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      AI & Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-slate-500">LLM Model</span>
                      <span className="font-medium text-sm">ft:gpt-4.1-mini-2025-04-14...</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-slate-500">TTS/STT Provider</span>
                      <span className="font-medium">ElevenLabs</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-slate-500">Database</span>
                      <span className="font-medium">Convex Document Store</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-500">Collections</span>
                      <span className="text-xs text-right text-slate-600">
                        patients, knowledgeBase, familyMembers, conversations, alerts
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <Card>
                <CardHeader>
                  <CardTitle>System Activity Log</CardTitle>
                  <CardDescription>Recent system events and actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative border-l border-slate-200 ml-3 space-y-8 py-2">
                    {DEMO_ACTIVITY.map((item) => (
                      <div key={item.id} className="relative pl-8">
                        <span className={`absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white ${
                          item.type === 'system' ? 'bg-slate-100 text-slate-500' : 
                          item.type === 'auth' ? 'bg-purple-100 text-purple-500' :
                          'bg-emerald-100 text-emerald-500'
                        }`}>
                          <div className="w-2 h-2 rounded-full bg-current" />
                        </span>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h3 className="text-sm font-medium text-slate-900">{item.message}</h3>
                          <time className="text-xs text-slate-500">{item.time}</time>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
