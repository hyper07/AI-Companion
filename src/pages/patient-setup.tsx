import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Authenticated, Unauthenticated } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Copy,
  Brain,
  Users,
  Loader2,
  Phone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KbEntry {
  _id: string;
  category: string;
  question: string;
  answer: string;
}

interface FamilyMember {
  _id: string;
  name: string;
  relationship: string;
  avatarEmoji?: string;
  voiceId?: string;
  greetingScript?: string;
}

export default function PatientSetupPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [kbEntries, setKbEntries] = useState<KbEntry[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("kb");

  // KB Form
  const [kbCategory, setKbCategory] = useState("biography");
  const [kbQuestion, setKbQuestion] = useState("");
  const [kbAnswer, setKbAnswer] = useState("");
  const [kbSaving, setKbSaving] = useState(false);

  // Family Form
  const [famName, setFamName] = useState("");
  const [famRelation, setFamRelation] = useState("");
  const [famEmoji, setFamEmoji] = useState("👤");
  const [famVoiceId, setFamVoiceId] = useState("");
  const [famScript, setFamScript] = useState("");
  const [famSaving, setFamSaving] = useState(false);

  // Fetch Data (Simulated for now)
  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // Start with empty state as requested
      setKbEntries([]);
      setFamilyMembers([]);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({ title: "Failed to load patient data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) fetchData();
  }, [patientId]);

  const handleAddKb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbQuestion.trim() || !kbAnswer.trim()) return;
    
    setKbSaving(true);
    try {
      // Simulate adding
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newEntry: KbEntry = {
        _id: Date.now().toString(),
        category: kbCategory,
        question: kbQuestion,
        answer: kbAnswer
      };
      
      setKbEntries(prev => [...prev, newEntry]);
      
      toast({ title: "Memory added successfully" });
      setKbQuestion("");
      setKbAnswer("");
    } catch (error) {
      toast({ title: "Error adding memory", variant: "destructive" });
    } finally {
      setKbSaving(false);
    }
  };

  const handleDeleteKb = async (entryId: string) => {
    try {
      // Simulate deleting
      setKbEntries(prev => prev.filter(e => e._id !== entryId));
      toast({ title: "Memory deleted" });
    } catch (error) {
      toast({ title: "Error deleting memory", variant: "destructive" });
    }
  };

  const handleAddFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!famName.trim()) return;

    setFamSaving(true);
    try {
      // Simulate adding
      await new Promise(resolve => setTimeout(resolve, 500));

      const newMember: FamilyMember = {
        _id: Date.now().toString(),
        name: famName,
        relationship: famRelation,
        avatarEmoji: famEmoji,
        voiceId: famVoiceId || "21m00Tcm4TlvDq8ikWAM",
        greetingScript: famScript
      };

      setFamilyMembers(prev => [...prev, newMember]);

      toast({ title: "Family member added" });
      setFamName("");
      setFamRelation("");
      setFamEmoji("👤");
      setFamScript("");
    } catch (error) {
      toast({ title: "Error adding family member", variant: "destructive" });
    } finally {
      setFamSaving(false);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/companion/${patientId}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Copied to clipboard", description: "Share this link with your loved one." });
  };

  return (
    <>
      <Unauthenticated>
        <div className="flex h-screen items-center justify-center">
           <p>Redirecting...</p>
           {(() => { navigate("/"); return null; })()}
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Link to="/dashboard">
                  <Button variant="ghost" size="icon">
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Patient Setup</h1>
                  <p className="text-slate-500 text-sm">Configure AI memory and contacts</p>
                </div>
              </div>
              <Button onClick={copyLink} variant="outline" className="gap-2 bg-white">
                <Copy className="w-4 h-4" />
                Copy Patient Link
              </Button>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
                <TabsTrigger value="kb" className="text-lg">
                  <Brain className="w-4 h-4 mr-2" />
                  Memory Knowledge Base
                </TabsTrigger>
                <TabsTrigger value="family" className="text-lg">
                  <Users className="w-4 h-4 mr-2" />
                  Family Members
                </TabsTrigger>
              </TabsList>

              {/* Knowledge Base Tab */}
              <TabsContent value="kb" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Memory</CardTitle>
                    <CardDescription>
                      Teach the AI about the patient's past, preferences, and important facts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddKb} className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={kbCategory} onValueChange={setKbCategory}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="biography">Biography</SelectItem>
                              <SelectItem value="preference">Preference</SelectItem>
                              <SelectItem value="medical">Medical</SelectItem>
                              <SelectItem value="routine">Routine</SelectItem>
                              <SelectItem value="family">Family Fact</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label>Question / Prompt</Label>
                          <Input 
                            value={kbQuestion} 
                            onChange={(e) => setKbQuestion(e.target.value)}
                            placeholder="e.g. What is her favorite flower?" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Answer / Fact</Label>
                        <Textarea 
                          value={kbAnswer} 
                          onChange={(e) => setKbAnswer(e.target.value)}
                          placeholder="e.g. She loves sunflowers because they remind her of summer." 
                          className="min-h-[100px]"
                        />
                      </div>
                      <Button type="submit" disabled={kbSaving} className="w-full">
                        {kbSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" />Add Memory</>}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-700 px-1">Existing Memories</h3>
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />)}
                    </div>
                  ) : kbEntries.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed rounded-lg text-slate-400">
                      No memories added yet. Start adding some facts!
                    </div>
                  ) : (
                    kbEntries.map((entry) => (
                      <Card key={entry._id} className="group hover:border-purple-200 transition-colors">
                        <CardContent className="p-4 flex justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                                {entry.category}
                              </span>
                              <h4 className="font-medium text-slate-800">{entry.question}</h4>
                            </div>
                            <p className="text-slate-600 text-sm">{entry.answer}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-300 hover:text-red-500"
                            onClick={() => handleDeleteKb(entry._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Family Tab */}
              <TabsContent value="family" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Add Family Member</CardTitle>
                    <CardDescription>
                      Create virtual profiles for family members that the patient can "call".
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddFamily} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input 
                            value={famName} 
                            onChange={(e) => setFamName(e.target.value)}
                            placeholder="e.g. David Wilson" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Relationship</Label>
                          <Input 
                            value={famRelation} 
                            onChange={(e) => setFamRelation(e.target.value)}
                            placeholder="e.g. Son" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Emoji Avatar</Label>
                          <Input 
                            value={famEmoji} 
                            onChange={(e) => setFamEmoji(e.target.value)}
                            placeholder="e.g. 👨" 
                            className="text-2xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Voice ID (ElevenLabs)</Label>
                          <Input 
                            value={famVoiceId} 
                            onChange={(e) => setFamVoiceId(e.target.value)}
                            placeholder="Optional: Enter ID" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Greeting Script</Label>
                        <Textarea 
                          value={famScript} 
                          onChange={(e) => setFamScript(e.target.value)}
                          placeholder="What should they say when answering the phone?" 
                        />
                      </div>
                      <Button type="submit" disabled={famSaving} className="w-full">
                        {famSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" />Add Profile</>}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                  {loading ? (
                    [1, 2].map(i => <div key={i} className="h-32 bg-slate-100 rounded-lg animate-pulse" />)
                  ) : familyMembers.length === 0 ? (
                    <div className="col-span-2 text-center p-8 border-2 border-dashed rounded-lg text-slate-400">
                      No family members added.
                    </div>
                  ) : (
                    familyMembers.map((member) => (
                      <Card key={member._id} className="relative overflow-hidden">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-full text-2xl">
                            {member.avatarEmoji || "👤"}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800">{member.name}</h3>
                            <p className="text-sm text-slate-500">{member.relationship}</p>
                            {member.voiceId && (
                              <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                                <Phone className="w-3 h-3" /> Voice Enabled
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Authenticated>
    </>
  );
}
