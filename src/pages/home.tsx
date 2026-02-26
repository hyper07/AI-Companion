import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Brain, Heart, ArrowRight, Loader2 } from "lucide-react";

function AuthRedirect() {
  const navigate = useNavigate();
  useEffect(() => { navigate("/dashboard"); }, [navigate]);
  return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin text-purple-600" /></div>;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { signIn } = useAuthActions();
  
  const [patientCode, setPatientCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePatientAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientCode.trim()) return;
    navigate(`/companion/${patientCode.trim()}`);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("flow", authMode);

      await signIn("password", formData);
      // Redirect happens automatically or via AuthLoading/Authenticated state
      // But we can also force it if needed, though usually better to let the auth state drive it
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "";
      if (msg.includes("InvalidAccountId")) {
        setError("Account not found. Please Sign Up first.");
      } else {
        setError(msg || "Authentication failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col font-sans">
      {/* Header */}
      <header className="p-6 md:p-8 flex items-center gap-3">
        <div className="bg-white p-2 rounded-xl shadow-sm">
          <Brain className="w-8 h-8 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Memory Companion</h1>
          <p className="text-slate-500 text-sm hidden sm:block">Bringing comfort and connection to your loved ones</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
          
          {/* Left: Patient Access */}
          <div className="order-2 md:order-1">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className="h-2 bg-emerald-500 w-full" />
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-emerald-500 fill-emerald-500" />
                  I'm a Patient
                </CardTitle>
                <CardDescription className="text-lg">
                  Enter your access code to connect with your companion.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePatientAccess} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="patient-code" className="text-base text-slate-600">Access Code</Label>
                    <Input 
                      id="patient-code"
                      placeholder="e.g. k92m-x4p1" 
                      className="text-2xl h-16 px-4 bg-white border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                      value={patientCode}
                      onChange={(e) => setPatientCode(e.target.value)}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-xl bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-lg hover:shadow-emerald-200"
                    disabled={!patientCode.trim()}
                  >
                    Enter Companion
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right: Caregiver Login */}
          <div className="order-1 md:order-2">
            <Card className="border-0 shadow-xl bg-white">
              <div className="h-2 bg-purple-600 w-full" />
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-2xl font-bold text-slate-800">Caregiver Access</CardTitle>
                  <AuthLoading>
                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                  </AuthLoading>
                </div>
                <CardDescription>
                  Manage profiles, alerts, and memories for your loved ones.
                </CardDescription>
              </CardHeader>
              
              <Authenticated>
                <CardContent>
                  <AuthRedirect />
                </CardContent>
              </Authenticated>

              <Unauthenticated>
                <CardContent>
                  <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as "signIn" | "signUp")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="signIn">Sign In</TabsTrigger>
                      <TabsTrigger value="signUp">Sign Up</TabsTrigger>
                    </TabsList>
                    
                    <form onSubmit={handleAuth} className="space-y-4">
                      {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                          {error}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="you@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        {authMode === "signUp" && (
                          <p className="text-xs text-slate-400 mt-1">Minimum 8 characters required</p>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-700 mt-2"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          authMode === "signIn" ? "Sign In" : "Create Account"
                        )}
                      </Button>
                    </form>
                  </Tabs>
                </CardContent>
              </Unauthenticated>
            </Card>
          </div>
          
        </div>
      </main>
      
      <footer className="p-6 text-center text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} Memory Companion. All rights reserved.
      </footer>
    </div>
  );
}
