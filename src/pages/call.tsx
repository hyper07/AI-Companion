import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ArrowLeft, Phone, Mic, MicOff, PhoneOff, Heart, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Family Members Configuration
type FamilyMember = {
  _id: string;
  name: string;
  relationship: string;
  voiceId: string;
  avatarImage?: string;
  gradientFrom: string;
  gradientTo: string;
};

const FAMILY_MEMBERS: FamilyMember[] = [
  {
    _id: "demo1",
    name: "David Wilson",
    relationship: "Son",
    voiceId: "21m00Tcm4TlvDq8ikWAM",
    avatarImage: "https://randomuser.me/api/portraits/men/45.jpg",
    gradientFrom: "from-blue-500",
    gradientTo: "to-purple-600",
  },
  {
    _id: "demo2",
    name: "Sarah Wilson",
    relationship: "Daughter",
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    avatarImage: "https://randomuser.me/api/portraits/women/42.jpg",
    gradientFrom: "from-pink-500",
    gradientTo: "to-rose-600",
  },
];

function toFamilyMember(m: { _id: string; name: string; relationship: string; voiceId?: string; avatarImage?: string | null }): FamilyMember {
  const known = FAMILY_MEMBERS.find((d) => d._id === m._id);
  if (known) return known;
  return {
    _id: m._id,
    name: m.name,
    relationship: m.relationship,
    voiceId: m.voiceId || "21m00Tcm4TlvDq8ikWAM", // Default fallback
    avatarImage: (m as { avatarImage?: string }).avatarImage ?? undefined,
    gradientFrom: "from-blue-500",
    gradientTo: "to-purple-600",
  };
}

export default function VirtualCallPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const autoStartedRef = useRef(false);

  // Call State
  const [callState, setCallState] = useState<"idle" | "connecting" | "connected" | "listening" | "recording" | "processing" | "speaking" | "ended">("idle");
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [transcript, setTranscript] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Audio & Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Convex Action
  const processFlow = useAction(api.actions.processFlow_node_1772047247454_d5w4464);

  // --- Audio Helpers ---

  const playAudioBase64 = useCallback(async (base64: string, mimeType = "audio/mpeg") => {
    return new Promise<void>((resolve, reject) => {
      try {
        const audio = new Audio(`data:${mimeType};base64,${base64}`);
        audio.onended = () => resolve();
        audio.onerror = (e) => {
          console.error("Audio playback error", e);
          reject(new Error("Audio playback failed"));
        };
        audio.play().catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  }, []);

  const blobToBase64 = useCallback(async (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        // Format: "data:audio/webm;base64,......"
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  // --- Call Flow Logic ---

  const handleStartCall = useCallback(async (member: FamilyMember) => {
    setTranscript([]);
    setError(null);
    setSelectedMember(member);
    setCallState("connecting");

    try {
      // 1. Initialize Microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 2. Call Opening Turn Backend Action
      const response = await processFlow({
        input: {
          patientId: (location.state as any)?.patientId || "demo",
          familyMemberName: member.name,
          relationship: member.relationship,
          voiceId: member.voiceId,
          isOpening: true,
          base64Audio: "",
          mimeType: ""
        }
      });

      const result = response.__result?.Return_Opening_Response__05jsx79;
      if (!result) {
        throw new Error("Failed to initialize call. Please try again.");
      }

      setCallState("connected");

      // 3. Process Opening Response (Greeting)
      if (result.greetingText) {
        setTranscript(prev => [...prev, { role: "ai", text: result.greetingText }]);
      }

      // 4. Play Greeting Audio
      if (result.audioBase64) {
        setCallState("speaking");
        await playAudioBase64(result.audioBase64);
      }

      // 5. Transition to Listening
      setCallState("listening");

    } catch (err) {
      console.error("Start call error:", err);
      setError(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Microphone access denied. Please allow access to start the call."
          : "Could not connect. Please check your internet and try again."
      );
      setCallState("idle");
      // Cleanup stream if it was opened
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    }
  }, [location.state, processFlow, playAudioBase64]);

  const startRecording = useCallback(() => {
    if (!streamRef.current || callState !== "listening") return;

    audioChunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    recorder.start();
    setCallState("recording");
  }, [callState]);

  const stopRecordingAndSend = useCallback(async () => {
    if (!mediaRecorderRef.current || callState !== "recording" || !selectedMember) return;

    setCallState("processing");

    mediaRecorderRef.current.onstop = async () => {
      try {
        const blob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
        const base64Audio = await blobToBase64(blob);

        // Send to backend
        const response = await processFlow({
          input: {
            patientId: (location.state as any)?.patientId || "demo",
            familyMemberName: selectedMember.name,
            relationship: selectedMember.relationship,
            voiceId: selectedMember.voiceId,
            isOpening: false,
            base64Audio: base64Audio,
            mimeType: blob.type
          }
        });

        const result = response.__result?.Return_Call_Response__ahzxbwo;
        if (!result) {
          throw new Error("No response from AI companion.");
        }

        // Add user transcript
        if (result.transcript) {
          setTranscript(prev => [...prev, { role: "user", text: result.transcript }]);
        }

        // Add AI transcript
        if (result.responseText) {
          setTranscript(prev => [...prev, { role: "ai", text: result.responseText }]);
        }

        // Play AI Audio
        if (result.audioBase64) {
          setCallState("speaking");
          await playAudioBase64(result.audioBase64);
        }

        // Back to listening
        setCallState("listening");

      } catch (err) {
        console.error("Processing error:", err);
        setError("I didn't catch that. Please try again.");
        setCallState("listening");
      }
    };

    mediaRecorderRef.current.stop();
  }, [callState, selectedMember, processFlow, blobToBase64, playAudioBase64, location.state]);

  const handleMicClick = () => {
    if (callState === "listening") {
      startRecording();
    } else if (callState === "recording") {
      stopRecordingAndSend();
    }
  };

  const handleEndCall = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCallState("ended");
    setSelectedMember(null);
    setTranscript([]);
    autoStartedRef.current = false;
  }, []);

  // --- Effects ---

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // Auto-call from companion page
  useEffect(() => {
    const autoMember = (location.state as any)?.autoCallMember;
    if (autoMember && !autoStartedRef.current && callState === "idle") {
      autoStartedRef.current = true;
      handleStartCall(toFamilyMember(autoMember));
    }
  }, [location.state, handleStartCall, callState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // --- Render ---

  const showPicker = selectedMember === null && !autoStartedRef.current;
  const connectingFromCompanion = autoStartedRef.current && (callState === "idle" || callState === "connecting");

  // Status Text Helper
  const getStatusText = () => {
    switch (callState) {
      case "connecting": return "Connecting...";
      case "connected": return "Connected";
      case "listening": return "Listening (Tap Mic to Speak)";
      case "recording": return "Recording... (Tap Mic to Send)";
      case "processing": return "Thinking...";
      case "speaking": return "Speaking...";
      case "ended": return "Call Ended";
      default: return "";
    }
  };

  if (showPicker) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
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
        <main className="flex-1 p-6 flex flex-col items-center justify-center gap-8 max-w-lg mx-auto w-full">
          {FAMILY_MEMBERS.map((member) => (
            <button
              key={member._id}
              type="button"
              onClick={() => handleStartCall(member)}
              className="w-full text-left bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 hover:scale-[1.02] transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-slate-200"
            >
              <div className="flex items-center gap-6 mb-8">
                <Avatar className={cn("w-28 h-28 rounded-full shadow-lg ring-2 ring-white", member.gradientFrom, member.gradientTo)}>
                  {member.avatarImage ? (
                    <AvatarImage src={member.avatarImage} alt={member.name} className="object-cover" />
                  ) : null}
                  <AvatarFallback className={cn("text-4xl bg-gradient-to-br text-white", member.gradientFrom, member.gradientTo)}>
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
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
                Call {member.name.split(" ")[0]}
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

  if (connectingFromCompanion) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <Loader2 className="w-16 h-16 text-white/30 animate-spin mb-4" />
        <p className="text-xl text-slate-300">Connecting your call...</p>
      </div>
    );
  }

  if (!selectedMember) return null;

  // Active Call Screen
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
        <div className="relative mb-8 mt-4">
          {/* Pulsing Animation for Speaking/Recording */}
          {(callState === "speaking" || callState === "recording") && (
            <div className={cn(
              "absolute inset-0 rounded-full animate-pulse duration-[2000ms]",
              callState === "recording" ? "bg-red-500/30" : "bg-purple-500/30"
            )} />
          )}
          
          <Avatar className={cn(
            "relative z-10 w-64 h-64 rounded-full shadow-2xl transition-all duration-500 border-4 overflow-hidden",
            selectedMember.gradientFrom,
            selectedMember.gradientTo,
            callState === "speaking" ? "border-purple-400 scale-105 shadow-purple-500/50" : 
            callState === "recording" ? "border-red-400 scale-105 shadow-red-500/50" : "border-white/10"
          )}>
            {selectedMember.avatarImage ? (
              <AvatarImage src={selectedMember.avatarImage} alt={selectedMember.name} className="object-cover w-full h-full" />
            ) : null}
            <AvatarFallback className={cn("text-7xl bg-gradient-to-br text-white", selectedMember.gradientFrom, selectedMember.gradientTo)}>
              {selectedMember.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Status Indicator */}
        <div className="text-center mb-8 h-12 flex flex-col items-center justify-center">
          <p className={cn(
            "text-xl font-medium transition-colors duration-300",
            callState === "recording" ? "text-red-400 animate-pulse" : 
            callState === "speaking" ? "text-purple-300 animate-pulse" : "text-slate-200"
          )}>
            {getStatusText()}
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
          {/* Processing Indicator in transcript */}
          {callState === "processing" && (
            <div className="self-start items-start max-w-[85%]">
              <p className="px-4 py-2 rounded-2xl text-sm bg-purple-600/50 text-white/70 rounded-bl-none flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Thinking...
              </p>
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-center gap-8 mb-8">
          <button
            onClick={handleMicClick}
            disabled={callState !== "listening" && callState !== "recording"}
            className={cn(
              "p-6 rounded-full transition-all duration-300 min-w-[80px] min-h-[80px] flex items-center justify-center border-4",
              callState === "listening" ? "bg-white text-slate-900 hover:scale-105 border-white" :
              callState === "recording" ? "bg-red-500 text-white animate-pulse border-red-400" :
              "bg-white/10 text-white/30 border-transparent cursor-not-allowed"
            )}
            aria-label={callState === "recording" ? "Stop Recording" : "Start Recording"}
          >
            {callState === "processing" || callState === "connecting" ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : callState === "recording" ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
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
