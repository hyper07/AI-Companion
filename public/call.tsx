import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Conversation } from '@11labs/client';
import { ArrowLeft, Phone, Mic, MicOff, PhoneOff, Heart, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Family Members Configuration
const DEMO_FAMILY_MEMBERS = [
  {
    _id: "demo1",
    name: "David Wilson",
    relationship: "Son",
    agentId: "agent_9901kjb8zvmwek09tq9by2ba1dz6",
    avatarEmoji: "👨",
    gradientFrom: "from-blue-500",
    gradientTo: "to-purple-600",
  },
  {
    _id: "demo2", 
    name: "Sarah Wilson",
    relationship: "Daughter",
    agentId: "agent_9901kjb8zvmwek09tq9by2ba1dz6",
    avatarEmoji: "👩",
    gradientFrom: "from-pink-500",
    gradientTo: "to-rose-600",
  }
];

type FamilyMember = typeof DEMO_FAMILY_MEMBERS[0];

export default function VirtualCallPage() {
  const navigate = useNavigate();
  const conversationRef = useRef<Conversation | null>(null);
  
  // State
  const [callState, setCallState] = useState<"idle" | "connecting" | "connected" | "ended">("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [agentMode, setAgentMode] = useState<'speaking' | 'listening' | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [transcript, setTranscript] = useState<{role: "user"|"ai", text: string}[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      conversationRef.current?.endSession();
    };
  }, []);

  const handleStartCall = async (member: FamilyMember) => {
    setSelectedMember(member);
    setCallState("connecting");
    setTranscript([]);
    setError(null);

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const conv = await Conversation.startSession({
        agentId: member.agentId,
        onConnect: () => {
          setCallState("connected");
          setAgentMode("listening");
        },
        onDisconnect: () => {
          setCallState("ended");
          setAgentMode(null);
          setIsSpeaking(false);
        },
        onMessage: (message: any) => {
          const text = typeof message === "string" ? message : message?.text ?? message?.message ?? "";
          if (!text) return;

          setTranscript(prev => [
            ...prev.slice(-10),
            { 
              role: "ai",
              text, 
            }
          ]);
        },
        onModeChange: (mode: any) => {
          if (mode === "speaking" || mode === "listening") {
            setAgentMode(mode);
            setIsSpeaking(mode === "speaking");
          }
        },
        onError: (err: any) => {
          console.error("Conversation error:", err);
          setError(String(err));
          setCallState("idle");
          setAgentMode(null);
          setIsSpeaking(false);
        },
      } as any);
      conversationRef.current = conv;
    } catch (err) {
      console.error("Failed to start call:", err);
      setError("Could not access microphone or connect to call.");
      setCallState("idle");
    }
  };

  const handleEndCall = async () => {
    if (conversationRef.current) {
      await conversationRef.current.endSession();
      conversationRef.current = null;
    }
    setCallState("ended");
    setSelectedMember(null);
    setTranscript([]);
    setIsSpeaking(false);
  };

  const handleToggleMute = async () => {
    if (conversationRef.current) {
      const nextMuted = !isMuted;
      await (conversationRef.current as any).setMicMuted(nextMuted);
      setIsMuted(nextMuted);
    }
  };

  // 1. Member Selection Screen
  if (selectedMember === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Header */}
        <header className="bg-white p-6 shadow-sm sticky top-0 z-10">
          <div className="max-w-md mx-auto w-full flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-4 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
              aria-label="Go back"
            >
              <ArrowLeft className="w-8 h-8" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Virtual Call</h1>
              <p className="text-base text-slate-500">Choose who to call</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 flex flex-col items-center justify-center gap-8 max-w-lg mx-auto w-full">
          {DEMO_FAMILY_MEMBERS.map((member) => (
            <button 
              key={member._id}
              type="button"
              onClick={() => handleStartCall(member)}
              className="w-full text-left bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 hover:scale-[1.02] transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-slate-200"
            >
              <div className="flex items-center gap-6 mb-8">
                <div className={cn(
                  "w-28 h-28 rounded-full flex items-center justify-center text-6xl shadow-lg bg-gradient-to-br",
                  member.gradientFrom,
                  member.gradientTo
                )}>
                  {member.avatarEmoji}
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900">{member.name}</h3>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-base font-medium flex items-center gap-2">
                      <Heart className="w-4 h-4 fill-slate-400 text-slate-400" />
                      {member.relationship}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={cn(
                  "w-full py-5 rounded-2xl text-white font-bold text-xl shadow-lg flex items-center justify-center gap-3 bg-gradient-to-r",
                  member.gradientFrom,
                  member.gradientTo
                )}
              >
                <Phone className="w-6 h-6 fill-current" />
                Call {member.name.split(' ')[0]}
              </div>
            </button>
          ))}
          
          {error && (
            <div className="w-full bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  // 2. Active Call Screen
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden">
      {/* Top Bar */}
      <div className="p-6 flex items-center justify-between z-20">
        <div className="w-12" /> {/* Spacer */}
        <div className="text-center">
          <h3 className="font-bold text-xl">{selectedMember.name}</h3>
          <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
            {selectedMember.relationship}
          </p>
        </div>
        <div className="w-12" /> {/* Spacer */}
      </div>

      {/* Main Call UI */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 relative w-full max-w-md mx-auto">
        
        {/* Error Message */}
        {error && (
          <div className="absolute top-0 w-full bg-red-500/90 backdrop-blur text-white px-4 py-3 rounded-xl mb-8 text-center text-sm font-bold shadow-lg flex items-center justify-center gap-2 z-50">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Avatar Area */}
        <div className="relative mb-12 mt-4">
          {/* Pulsing Animation */}
          {isSpeaking && (
             <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-pulse duration-[2000ms]" />
          )}
          
          <div className={cn(
            "relative z-10 w-64 h-64 rounded-full flex items-center justify-center text-8xl shadow-2xl transition-all duration-500 bg-gradient-to-br border-4",
            selectedMember.gradientFrom,
            selectedMember.gradientTo,
            isSpeaking ? "border-purple-400 scale-105 shadow-purple-500/50" : "border-white/10"
          )}>
            {selectedMember.avatarEmoji}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="text-center mb-8 h-12 flex flex-col items-center justify-center">
          <p className="text-2xl font-medium text-slate-200 animate-pulse">
            {callState === "connecting" ? "Connecting..." : 
             callState === "connected" ? (isSpeaking ? "Speaking..." : "Listening...") : 
             callState === "ended" ? "Call Ended" : ""}
          </p>
        </div>

        {/* Transcript Area */}
        <div 
          ref={scrollRef}
          className="w-full bg-black/20 backdrop-blur-md rounded-2xl p-4 mb-8 overflow-hidden border border-white/10 h-48 overflow-y-auto flex flex-col gap-3"
        >
          {transcript.length === 0 && (
            <p className="text-slate-500 text-center italic my-auto">Conversation will appear here...</p>
          )}
          {transcript.map((msg, i) => (
            <div key={i} className={cn(
              "flex flex-col max-w-[85%]",
              msg.role === 'user' ? "self-end items-end" : "self-start items-start"
            )}>
              <p className={cn(
                "px-4 py-2 rounded-2xl text-sm",
                msg.role === 'user' 
                  ? "bg-slate-700 text-slate-100 rounded-br-none" 
                  : "bg-purple-600 text-white rounded-bl-none"
              )}>
                {msg.text}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <button
            onClick={handleToggleMute}
            className={cn(
              "p-6 rounded-full transition-all duration-300 min-w-[80px] min-h-[80px] flex items-center justify-center",
              isMuted ? "bg-white text-slate-900" : "bg-white/10 text-white hover:bg-white/20"
            )}
            aria-label={isMuted ? "Unmute Mic" : "Mute Mic"}
            disabled={callState !== "connected"}
          >
            {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>

          <button
            onClick={handleEndCall}
            className="p-6 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 min-w-[80px] min-h-[80px] flex items-center justify-center"
            aria-label="End call"
          >
            <PhoneOff className="w-8 h-8 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}
