import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { 
  Users, 
  Activity, 
  Bell, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  Brain,
  Search,
  Plus,
  MoreVertical,
  Calendar,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// --- Demo Data ---
const DEMO_PATIENTS = [
  { 
    id: "1", 
    name: "Margaret Wilson", 
    age: 78, 
    condition: "Early-stage Alzheimer's", 
    status: "stable", 
    lastCheck: "10 min ago",
    caregiver: "Sarah (Daughter)",
    image: "https://images.unsplash.com/photo-1551185887-22a92c0531fc?w=150&h=150&fit=crop&crop=faces",
    mood: "Happy"
  },
  { 
    id: "2", 
    name: "Robert Chen", 
    age: 82, 
    condition: "Dementia", 
    status: "attention", 
    lastCheck: "2 hours ago",
    caregiver: "David (Son)",
    image: "https://images.unsplash.com/photo-1545167622-3a6ac156ad0f?w=150&h=150&fit=crop&crop=faces",
    mood: "Confused"
  },
  { 
    id: "3", 
    name: "Eleanor Davis", 
    age: 75, 
    condition: "Mild Cognitive Impairment", 
    status: "stable", 
    lastCheck: "5 min ago",
    caregiver: "James (Husband)",
    image: "https://images.unsplash.com/photo-1551290464-647952efd91e?w=150&h=150&fit=crop&crop=faces",
    mood: "Calm"
  }
];

const DEMO_ALERTS = [
  { id: 1, type: "warning", message: "Robert Chen appears confused about medication time", time: "2 hours ago", resolved: false },
  { id: 2, type: "info", message: "Margaret Wilson completed morning routine", time: "4 hours ago", resolved: true },
  { id: 3, type: "critical", message: "Night wandering detected for Robert Chen", time: "Yesterday", resolved: true },
  { id: 4, type: "info", message: "Eleanor Davis successfully recalled family names", time: "Yesterday", resolved: true },
];

const DEMO_ACTIVITIES = [
  { id: 1, user: "Sarah (Caregiver)", action: "Updated medication schedule", target: "Margaret Wilson", time: "1 hour ago" },
  { id: 2, user: "System", action: "Daily health check completed", target: "Robert Chen", time: "3 hours ago" },
  { id: 3, user: "James (Caregiver)", action: "Added new family photo", target: "Eleanor Davis", time: "5 hours ago" },
  { id: 4, user: "System", action: "Generated weekly report", target: "All Patients", time: "Yesterday" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { signOut } = useAuthActions();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "stable": return "bg-emerald-500";
      case "attention": return "bg-amber-500";
      case "critical": return "bg-red-500";
      default: return "bg-slate-500";
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <span className="font-bold text-slate-800 text-lg">Memory Companion</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Button 
            variant={activeTab === "overview" ? "secondary" : "ghost"} 
            className={`w-full justify-start ${activeTab === "overview" ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-slate-50"}`}
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard className="w-4 h-4 mr-3" />
            Overview
          </Button>
          <Button 
            variant={activeTab === "patients" ? "secondary" : "ghost"} 
            className={`w-full justify-start ${activeTab === "patients" ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-slate-50"}`}
            onClick={() => setActiveTab("patients")}
          >
            <Users className="w-4 h-4 mr-3" />
            Patients
          </Button>
          <Button 
            variant={activeTab === "alerts" ? "secondary" : "ghost"} 
            className={`w-full justify-start ${activeTab === "alerts" ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-slate-50"}`}
            onClick={() => setActiveTab("alerts")}
          >
            <Bell className="w-4 h-4 mr-3" />
            Alerts
            {DEMO_ALERTS.some(a => !a.resolved) && (
              <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {DEMO_ALERTS.filter(a => !a.resolved).length}
              </span>
            )}
          </Button>
          <Button 
            variant={activeTab === "activity" ? "secondary" : "ghost"} 
            className={`w-full justify-start ${activeTab === "activity" ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-slate-50"}`}
            onClick={() => setActiveTab("activity")}
          >
            <Activity className="w-4 h-4 mr-3" />
            Activity
          </Button>
          
          <Separator className="my-4" />
          
          <Link to="/admin">
            <Button variant="ghost" className="w-full justify-start text-slate-600 hover:bg-slate-50">
              <Settings className="w-4 h-4 mr-3" />
              Admin Panel
            </Button>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar className="w-8 h-8 border border-slate-200">
              <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-slate-900 truncate">John Doe</span>
              <span className="text-xs text-slate-500 truncate">Caregiver</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-10">
          <div className="md:hidden flex items-center gap-2">
            <div className="bg-purple-100 p-1.5 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <span className="font-bold text-slate-800">Memory Companion</span>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <h1 className="text-xl font-semibold text-slate-800">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "patients" && "My Patients"}
              {activeTab === "alerts" && "Alerts & Notifications"}
              {activeTab === "activity" && "Recent Activity"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search..." 
                className="pl-9 w-64 h-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="icon" variant="ghost" className="relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1 bg-slate-50 p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Overview Tab Content */}
            {activeTab === "overview" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Total Patients</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-1">{DEMO_PATIENTS.length}</h3>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                          <Activity className="w-3 h-3 mr-1" />
                          All active
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Active Alerts</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-1">{DEMO_ALERTS.filter(a => !a.resolved).length}</h3>
                        <p className="text-xs text-amber-600 flex items-center mt-1">
                          <Bell className="w-3 h-3 mr-1" />
                          Needs attention
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                        <Bell className="w-6 h-6 text-amber-600" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">System Status</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-1">98%</h3>
                        <p className="text-xs text-purple-600 flex items-center mt-1">
                          <Activity className="w-3 h-3 mr-1" />
                          Operational
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                        <Activity className="w-6 h-6 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle>Recent Patient Activity</CardTitle>
                      <CardDescription>Latest updates from your patients</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {DEMO_PATIENTS.slice(0, 3).map(patient => (
                          <div key={patient.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                            <Avatar className="w-10 h-10 border border-slate-200">
                              <AvatarImage src={patient.image} />
                              <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-800">{patient.name}</h4>
                              <p className="text-xs text-slate-500">{patient.condition} • {patient.status}</p>
                            </div>
                            <Badge variant={patient.status === 'stable' ? 'outline' : 'default'} className={patient.status === 'stable' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'bg-amber-500 hover:bg-amber-600'}>
                              {patient.mood}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Common tasks for today</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200">
                        <Plus className="w-6 h-6" />
                        <span>Add Patient</span>
                      </Button>
                      <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200">
                        <Calendar className="w-6 h-6" />
                        <span>Schedule Visit</span>
                      </Button>
                      <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200">
                        <Heart className="w-6 h-6" />
                        <span>Log Vitals</span>
                      </Button>
                      <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200">
                        <Bell className="w-6 h-6" />
                        <span>Send Alert</span>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* Patients Tab Content */}
            {activeTab === "patients" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DEMO_PATIENTS.map(patient => (
                  <Card key={patient.id} className="overflow-hidden border-slate-200 hover:shadow-md transition-all group">
                    <div className={`h-2 w-full ${getStatusColor(patient.status)}`} />
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <Avatar className="w-16 h-16 border-2 border-white shadow-sm">
                          <AvatarImage src={patient.image} />
                          <AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-800">{patient.name}</h3>
                        <p className="text-sm text-slate-500">{patient.condition}</p>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Age</span>
                          <span className="font-medium text-slate-700">{patient.age} years</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Caregiver</span>
                          <span className="font-medium text-slate-700">{patient.caregiver}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Last Check</span>
                          <span className="font-medium text-slate-700">{patient.lastCheck}</span>
                        </div>
                      </div>
                      
                      <Button className="w-full bg-white text-purple-600 border border-purple-200 hover:bg-purple-50">
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                
                <Card className="border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-purple-300 transition-all cursor-pointer flex items-center justify-center min-h-[300px]">
                  <CardContent className="flex flex-col items-center text-center p-6">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4 text-purple-600">
                      <Plus className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-slate-700">Add New Patient</h3>
                    <p className="text-sm text-slate-500 mt-1">Register a new patient to the system</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Alerts Tab Content */}
            {activeTab === "alerts" && (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>System Alerts</CardTitle>
                  <CardDescription>Recent notifications requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {DEMO_ALERTS.map(alert => (
                      <div key={alert.id} className={`p-4 rounded-lg border flex items-start gap-4 ${alert.type === 'critical' ? 'bg-red-50 border-red-100' : alert.type === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                        <div className={`mt-1 p-2 rounded-full ${alert.type === 'critical' ? 'bg-red-100 text-red-600' : alert.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${alert.type === 'critical' ? 'text-red-900' : 'text-slate-800'}`}>
                              {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
                            </h4>
                            <span className="text-xs text-slate-500">{alert.time}</span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
                          <div className="mt-3 flex gap-2">
                            {!alert.resolved && (
                              <Button size="sm" variant={alert.type === 'critical' ? 'destructive' : 'default'} className="h-8">
                                Resolve Issue
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="h-8">Dismiss</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Tab Content */}
            {activeTab === "activity" && (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>Detailed history of all actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative border-l border-slate-200 ml-3 space-y-8 py-2">
                    {DEMO_ACTIVITIES.map(activity => (
                      <div key={activity.id} className="relative pl-8">
                        <span className="absolute -left-3 top-1 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white bg-slate-100 text-slate-500">
                          <div className="w-2 h-2 rounded-full bg-current" />
                        </span>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <p className="text-sm text-slate-800">
                              <span className="font-semibold">{activity.user}</span> {activity.action.toLowerCase()} for <span className="font-medium text-purple-600">{activity.target}</span>
                            </p>
                          </div>
                          <time className="text-xs text-slate-500">{activity.time}</time>
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
