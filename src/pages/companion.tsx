import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mic, 
  Send, 
  MapPin, 
  Phone, 
  Users,
  MessageCircle,
  Loader2,
  Gamepad2,
  ArrowLeft,
  Music,
  Palette,
  Brain,
  Hash,
  Smile,
  CheckCircle,
  Star,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Message {
  role: 'patient' | 'assistant';
  content: string;
}

interface FamilyMember {
  _id: string;
  name: string;
  relationship: string;
  avatarEmoji?: string;
  voiceId?: string;
}

export default function CompanionPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [activeTab, setActiveTab] = useState<"chat" | "call" | "location" | "fun">("chat");
  
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm here to keep you company. How are you feeling today?" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isDistressed, setIsDistressed] = useState(false);
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { _id: "demo1", name: "David Wilson", relationship: "Son", avatarEmoji: "👨", voiceId: "21m00Tcm4TlvDq8ikWAM" },
    { _id: "demo2", name: "Sarah Wilson", relationship: "Daughter", avatarEmoji: "👩", voiceId: "EXAVITQu4vr4xnSDxMaL" }
  ]);
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [isRecording, setIsRecording] = useState(false);
  
  // Fun Tab State
  const [activeGame, setActiveGame] = useState<"selector" | "color-quiz" | "memory-cards" | "number-sequence" | "word-rhyme" | "emoji-guess" | "true-false" | "animal-sounds" | "odd-one-out" | "counting-stars">("selector");
  
  // Color Quiz State
  const [colorQuizScore, setColorQuizScore] = useState(0);
  const [colorQuizQuestion, setColorQuizQuestion] = useState<{ word: string, correctColor: string, options: string[], displayColor: string } | null>(null);
  const [colorQuizResult, setColorQuizResult] = useState<"correct" | "wrong" | null>(null);

  // Memory Game State
  const [memoryCards, setMemoryCards] = useState<{ id: number, emoji: string }[]>([]);
  const [memoryFlipped, setMemoryFlipped] = useState<number[]>([]);
  const [memoryMatched, setMemoryMatched] = useState<Set<number>>(new Set());
  const [memoryMoves, setMemoryMoves] = useState(0);

  // Number Sequence Game State
  const [numberSeqQuestion, setNumberSeqQuestion] = useState<{ sequence: number[], correctAnswer: number, options: number[] } | null>(null);
  const [numberSeqScore, setNumberSeqScore] = useState(0);
  const [numberSeqResult, setNumberSeqResult] = useState<"correct" | "wrong" | null>(null);

  // Word Rhyme Game State
  const [rhymeQuestion, setRhymeQuestion] = useState<{ targetWord: string, correctRhyme: string, options: string[] } | null>(null);
  const [rhymeScore, setRhymeScore] = useState(0);
  const [rhymeResult, setRhymeResult] = useState<"correct" | "wrong" | null>(null);

  // Emoji Guess Game State
  const [emojiGuessQuestion, setEmojiGuessQuestion] = useState<{ emoji: string, hint: string, correctWord: string, options: string[] } | null>(null);
  const [emojiGuessScore, setEmojiGuessScore] = useState(0);
  const [emojiGuessResult, setEmojiGuessResult] = useState<"correct" | "wrong" | null>(null);

  // True or False Game State
  const [trueFalseQuestion, setTrueFalseQuestion] = useState<{ statement: string; correct: boolean } | null>(null);
  const [trueFalseScore, setTrueFalseScore] = useState(0);
  const [trueFalseResult, setTrueFalseResult] = useState<"correct" | "wrong" | null>(null);

  // Animal Sounds Game State
  const [animalSoundsQuestion, setAnimalSoundsQuestion] = useState<{ emoji: string; animal: string; correctSound: string; options: string[] } | null>(null);
  const [animalSoundsScore, setAnimalSoundsScore] = useState(0);
  const [animalSoundsResult, setAnimalSoundsResult] = useState<"correct" | "wrong" | null>(null);

  // Odd One Out Game State
  const [oddOneOutQuestion, setOddOneOutQuestion] = useState<{ items: string[]; oddItem: string; category: string } | null>(null);
  const [oddOneOutScore, setOddOneOutScore] = useState(0);
  const [oddOneOutResult, setOddOneOutResult] = useState<"correct" | "wrong" | null>(null);

  // Counting Stars Game State
  const [countingQuestion, setCountingQuestion] = useState<{ count: number; options: number[] } | null>(null);
  const [countingScore, setCountingScore] = useState(0);
  const [countingResult, setCountingResult] = useState<"correct" | "wrong" | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Actions
  const chatAction: any = null;
  const voiceChatAction: any = null;
  const loadFamilyAction: any = null;

  // Auto-scroll to bottom
  useEffect(() => {
    if (activeTab === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  // Load Family Members
  useEffect(() => {
    if (patientId && loadFamilyAction) {
      loadFamilyAction({ input: { patientId } })
        .then((result: any) => {
          if (result && result.familyMembers) {
            setFamilyMembers(result.familyMembers);
          }
        })
        .catch((err: any) => console.error("Failed to load family", err));
    }
  }, [patientId, loadFamilyAction]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = { role: 'patient', content: inputText };
    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    setIsThinking(true);

    try {
      if (chatAction) {
        const result = await chatAction({ 
          input: { 
            patientId, 
            patientMessage: newMsg.content 
          } 
        });
        
        if (result) {
          if (result.isDistressed) {
            setIsDistressed(true);
          }
          
          if (result.message) {
            setMessages(prev => [...prev, { role: 'assistant', content: result.message }]);
          }
        }
      } else {
        // Fallback simulation
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'assistant', content: "I understand. Tell me more about that." }]);
          setIsThinking(false);
        }, 1000);
        return; 
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsThinking(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleVoiceMessage;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleVoiceMessage = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const reader = new FileReader();
    
    setIsThinking(true);
    
    reader.onloadend = async () => {
      const base64Audio = (reader.result as string).split(',')[1];
      const mimeType = audioBlob.type;

      try {
        if (voiceChatAction) {
          const result = await voiceChatAction({
            input: {
              patientId,
              base64Audio,
              mimeType
            }
          });

          if (result) {
            if (result.transcript) {
               setMessages(prev => [...prev, { role: 'patient', content: result.transcript }]);
            }
            
            if (result.message) {
               setMessages(prev => [...prev, { role: 'assistant', content: result.message }]);
            }
            
            if (result.audioBase64) {
               const audio = new Audio(`data:audio/mp3;base64,${result.audioBase64}`);
               audioPlayerRef.current = audio;
               audio.play();
            }
          }
        }
      } catch (err) {
        console.error("Voice chat error:", err);
      } finally {
        setIsThinking(false);
      }
    };
    
    reader.readAsDataURL(audioBlob);
  };

  const handleWhereAmI = () => {
    setLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          setLocationAddress(data.display_name);
        } catch (error) {
          setLocationAddress("Unable to fetch address, but your coordinates are: " + latitude.toFixed(4) + ", " + longitude.toFixed(4));
        } finally {
          setLocationLoading(false);
        }
      }, (_error) => {
        setLocationAddress("Location access denied or unavailable.");
        setLocationLoading(false);
      });
    } else {
      setLocationAddress("Geolocation is not supported by your browser.");
      setLocationLoading(false);
    }
  };

  const handleCallMember = (member: FamilyMember) => {
    navigate(`/call/${patientId}`, { state: { autoCallMember: member } });
  };

  // --- Game Logic ---
  
  // Reset game when leaving tab
  useEffect(() => {
    if (activeTab !== "fun") {
      setActiveGame("selector");
    }
  }, [activeTab]);

  const QUIZ_COLORS = [
    { word: "RED", bg: "bg-red-500", label: "Red", value: "red" },
    { word: "BLUE", bg: "bg-blue-500", label: "Blue", value: "blue" },
    { word: "GREEN", bg: "bg-green-500", label: "Green", value: "green" },
    { word: "YELLOW", bg: "bg-yellow-400", label: "Yellow", value: "yellow" },
    { word: "PURPLE", bg: "bg-purple-500", label: "Purple", value: "purple" },
    { word: "ORANGE", bg: "bg-orange-500", label: "Orange", value: "orange" },
  ];

  const MEMORY_EMOJIS = ["🌸", "🐶", "🎵", "🌈", "🦋", "⭐"];

  const startColorQuiz = () => {
    setActiveGame("color-quiz");
    setColorQuizScore(0);
    generateNextQuestion();
  };

  const generateNextQuestion = () => {
    setColorQuizResult(null);
    const correctIndex = Math.floor(Math.random() * QUIZ_COLORS.length);
    const correctColor = QUIZ_COLORS[correctIndex];
    
    // Stroop effect: Text color different from word meaning
    let displayColorIndex = Math.floor(Math.random() * QUIZ_COLORS.length);
    while (displayColorIndex === correctIndex) {
        displayColorIndex = Math.floor(Math.random() * QUIZ_COLORS.length);
    }
    const displayColor = QUIZ_COLORS[displayColorIndex];

    // Options: Correct + 3 random wrong
    const options = [correctColor];
    const wrongOptions = QUIZ_COLORS.filter((_, i) => i !== correctIndex);
    // Shuffle wrong options and take 3
    const shuffledWrong = [...wrongOptions].sort(() => Math.random() - 0.5).slice(0, 3);
    const finalOptions = [...options, ...shuffledWrong].sort(() => Math.random() - 0.5);

    setColorQuizQuestion({
      word: correctColor.word,
      correctColor: correctColor.value,
      displayColor: displayColor.value, 
      options: finalOptions.map(o => o.value)
    });
  };

  const handleQuizAnswer = (selectedColorValue: string) => {
    if (colorQuizResult) return; // Prevent double clicking

    if (selectedColorValue === colorQuizQuestion?.correctColor) {
      setColorQuizResult("correct");
      setColorQuizScore(prev => prev + 1);
      setTimeout(() => {
        generateNextQuestion();
      }, 1500);
    } else {
      setColorQuizResult("wrong");
      setTimeout(() => {
        setColorQuizResult(null);
      }, 1000);
    }
  };

  const startMemoryGame = () => {
    setActiveGame("memory-cards");
    setMemoryMoves(0);
    setMemoryMatched(new Set());
    setMemoryFlipped([]);
    
    // Create pairs
    const cards = [...MEMORY_EMOJIS, ...MEMORY_EMOJIS].map((emoji, index) => ({
      id: index,
      emoji
    }));
    
    // Shuffle
    setMemoryCards(cards.sort(() => Math.random() - 0.5));
  };

  const handleCardFlip = (index: number) => {
    // Ignore if already matched, already flipped, or 2 cards already flipped
    if (
      memoryMatched.has(index) || 
      memoryFlipped.includes(index) || 
      memoryFlipped.length >= 2
    ) return;

    const newFlipped = [...memoryFlipped, index];
    setMemoryFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves(prev => prev + 1);
      const [firstIndex, secondIndex] = newFlipped;
      
      if (memoryCards[firstIndex].emoji === memoryCards[secondIndex].emoji) {
        // Match!
        setTimeout(() => {
          setMemoryMatched(prev => new Set([...prev, firstIndex, secondIndex]));
          setMemoryFlipped([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setMemoryFlipped([]);
        }, 1000);
      }
    }
  };

  const getTailwindTextColor = (colorValue: string) => {
    const map: Record<string, string> = {
        "red": "text-red-500",
        "blue": "text-blue-500",
        "green": "text-green-500",
        "yellow": "text-yellow-500", 
        "purple": "text-purple-500",
        "orange": "text-orange-500"
    };
    return map[colorValue] || "text-slate-800";
  };
  
  const getTailwindBgColor = (colorValue: string) => {
     const map: Record<string, string> = {
        "red": "bg-red-500",
        "blue": "bg-blue-500",
        "green": "bg-green-500",
        "yellow": "bg-yellow-400",
        "purple": "bg-purple-500",
        "orange": "bg-orange-500"
    };
    return map[colorValue] || "bg-slate-200";
  };

  const getTailwindLabel = (colorValue: string) => {
     const map: Record<string, string> = {
        "red": "Red",
        "blue": "Blue",
        "green": "Green",
        "yellow": "Yellow",
        "purple": "Purple",
        "orange": "Orange"
    };
    return map[colorValue] || "";
  };

  // --- New Games Logic ---

  // 1. Number Sequence Game
  const NUMBER_SEQUENCES = [
    { sequence: [2, 4, 6], correct: 8, options: [7, 8, 9, 10] },
    { sequence: [5, 10, 15], correct: 20, options: [18, 19, 20, 25] },
    { sequence: [1, 2, 3], correct: 4, options: [3, 4, 5, 6] },
    { sequence: [10, 20, 30], correct: 40, options: [35, 38, 40, 45] },
    { sequence: [3, 6, 9], correct: 12, options: [10, 11, 12, 13] },
    { sequence: [10, 8, 6], correct: 4, options: [3, 4, 5, 2] },
    { sequence: [100, 200, 300], correct: 400, options: [350, 400, 450, 500] },
    { sequence: [11, 22, 33], correct: 44, options: [40, 42, 44, 46] }
  ];

  const startNumberSeq = () => {
    setActiveGame("number-sequence");
    setNumberSeqScore(0);
    generateNumberSeqQuestion();
  };

  const generateNumberSeqQuestion = () => {
    setNumberSeqResult(null);
    const randomIndex = Math.floor(Math.random() * NUMBER_SEQUENCES.length);
    const selected = NUMBER_SEQUENCES[randomIndex];
    
    // Shuffle options
    const shuffledOptions = [...selected.options].sort(() => Math.random() - 0.5);
    
    setNumberSeqQuestion({
      sequence: selected.sequence,
      correctAnswer: selected.correct,
      options: shuffledOptions
    });
  };

  const handleNumberSeqAnswer = (selected: number) => {
    if (numberSeqResult) return;
    
    if (selected === numberSeqQuestion?.correctAnswer) {
      setNumberSeqResult("correct");
      setNumberSeqScore(prev => prev + 1);
      setTimeout(() => {
        generateNumberSeqQuestion();
      }, 1500);
    } else {
      setNumberSeqResult("wrong");
      setTimeout(() => {
        setNumberSeqResult(null);
      }, 1000);
    }
  };

  // 2. Word Rhyme Game
  const RHYME_PAIRS = [
    { word: "CAT", rhymes: ["BAT", "HAT", "RAT", "MAT"], distractors: ["DOG", "CUP", "FISH", "BALL", "TREE", "BIRD"] },
    { word: "SUN", rhymes: ["FUN", "RUN", "BUN"], distractors: ["MOON", "STAR", "RAIN", "CLOUD"] },
    { word: "CAKE", rhymes: ["LAKE", "RAKE", "BAKE"], distractors: ["PIE", "BREAD", "SOUP", "RICE"] },
    { word: "BLUE", rhymes: ["TRUE", "NEW", "FLEW"], distractors: ["RED", "GREEN", "PINK", "GOLD"] },
    { word: "TREE", rhymes: ["FREE", "SEE", "BEE"], distractors: ["LEAF", "BUSH", "GRASS", "STONE"] },
    { word: "NIGHT", rhymes: ["LIGHT", "BRIGHT", "RIGHT"], distractors: ["DAY", "MOON", "DARK", "SLEEP"] }
  ];

  const startRhymeGame = () => {
    setActiveGame("word-rhyme");
    setRhymeScore(0);
    generateRhymeQuestion();
  };

  const generateRhymeQuestion = () => {
    setRhymeResult(null);
    const randomIndex = Math.floor(Math.random() * RHYME_PAIRS.length);
    const selected = RHYME_PAIRS[randomIndex];
    
    const correct = selected.rhymes[Math.floor(Math.random() * selected.rhymes.length)];
    const wrong = [...selected.distractors].sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [...wrong, correct].sort(() => Math.random() - 0.5);

    setRhymeQuestion({
      targetWord: selected.word,
      correctRhyme: correct,
      options
    });
  };

  const handleRhymeAnswer = (selected: string) => {
    if (rhymeResult) return;
    
    if (selected === rhymeQuestion?.correctRhyme) {
      setRhymeResult("correct");
      setRhymeScore(prev => prev + 1);
      setTimeout(() => generateRhymeQuestion(), 1500);
    } else {
      setRhymeResult("wrong");
      setTimeout(() => setRhymeResult(null), 1000);
    }
  };

  // 3. Emoji Guess Game
  const EMOJI_QUESTIONS = [
    { emoji: "🍎", hint: "A red fruit", correct: "Apple", options: ["Apple", "Banana", "Cherry", "Grape"] },
    { emoji: "🐶", hint: "Man's best friend", correct: "Dog", options: ["Cat", "Dog", "Bird", "Fish"] },
    { emoji: "🚗", hint: "Has 4 wheels", correct: "Car", options: ["Bike", "Bus", "Car", "Train"] },
    { emoji: "🌞", hint: "Shines in the sky", correct: "Sun", options: ["Moon", "Star", "Sun", "Cloud"] },
    { emoji: "🍕", hint: "Italian food", correct: "Pizza", options: ["Burger", "Pizza", "Taco", "Sushi"] }
  ];

  const startEmojiGuess = () => {
    setActiveGame("emoji-guess");
    setEmojiGuessScore(0);
    generateEmojiGuessQuestion();
  };

  const generateEmojiGuessQuestion = () => {
    setEmojiGuessResult(null);
    const randomIndex = Math.floor(Math.random() * EMOJI_QUESTIONS.length);
    const selected = EMOJI_QUESTIONS[randomIndex];
    setEmojiGuessQuestion({
      emoji: selected.emoji,
      hint: selected.hint,
      correctWord: selected.correct,
      options: selected.options.sort(() => Math.random() - 0.5)
    });
  };

  const handleEmojiGuessAnswer = (selected: string) => {
    if (emojiGuessResult) return;
    if (selected === emojiGuessQuestion?.correctWord) {
      setEmojiGuessResult("correct");
      setEmojiGuessScore(prev => prev + 1);
      setTimeout(() => generateEmojiGuessQuestion(), 1500);
    } else {
      setEmojiGuessResult("wrong");
      setTimeout(() => setEmojiGuessResult(null), 1000);
    }
  };

  // 4. True or False Game
  const TRUE_FALSE_QUESTIONS = [
    { statement: "The sky is blue.", correct: true },
    { statement: "Cats can fly.", correct: false },
    { statement: "Ice is hot.", correct: false },
    { statement: "Fish live in water.", correct: true },
    { statement: "Elephants are small.", correct: false }
  ];

  const startTrueFalse = () => {
    setActiveGame("true-false");
    setTrueFalseScore(0);
    generateTrueFalseQuestion();
  };

  const generateTrueFalseQuestion = () => {
    setTrueFalseResult(null);
    const randomIndex = Math.floor(Math.random() * TRUE_FALSE_QUESTIONS.length);
    setTrueFalseQuestion(TRUE_FALSE_QUESTIONS[randomIndex]);
  };

  const handleTrueFalseAnswer = (answer: boolean) => {
    if (trueFalseResult) return;
    if (answer === trueFalseQuestion?.correct) {
      setTrueFalseResult("correct");
      setTrueFalseScore(prev => prev + 1);
      setTimeout(() => generateTrueFalseQuestion(), 1500);
    } else {
      setTrueFalseResult("wrong");
      setTimeout(() => setTrueFalseResult(null), 1000);
    }
  };

  // 5. Animal Sounds Game
  const ANIMAL_SOUNDS = [
    { emoji: "🦁", animal: "Lion", correct: "Roar", options: ["Roar", "Meow", "Bark", "Moo"] },
    { emoji: "🐮", animal: "Cow", correct: "Moo", options: ["Quack", "Moo", "Baa", "Oink"] },
    { emoji: "🦆", animal: "Duck", correct: "Quack", options: ["Quack", "Roar", "Meow", "Hoot"] },
    { emoji: "🐕", animal: "Dog", correct: "Bark", options: ["Meow", "Bark", "Moo", "Roar"] },
    { emoji: "🐱", animal: "Cat", correct: "Meow", options: ["Bark", "Meow", "Roar", "Moo"] }
  ];

  const startAnimalSounds = () => {
    setActiveGame("animal-sounds");
    setAnimalSoundsScore(0);
    generateAnimalSoundsQuestion();
  };

  const generateAnimalSoundsQuestion = () => {
    setAnimalSoundsResult(null);
    const randomIndex = Math.floor(Math.random() * ANIMAL_SOUNDS.length);
    const selected = ANIMAL_SOUNDS[randomIndex];
    setAnimalSoundsQuestion({
      emoji: selected.emoji,
      animal: selected.animal,
      correctSound: selected.correct,
      options: selected.options.sort(() => Math.random() - 0.5)
    });
  };

  const handleAnimalSoundsAnswer = (selected: string) => {
    if (animalSoundsResult) return;
    if (selected === animalSoundsQuestion?.correctSound) {
      setAnimalSoundsResult("correct");
      setAnimalSoundsScore(prev => prev + 1);
      setTimeout(() => generateAnimalSoundsQuestion(), 1500);
    } else {
      setAnimalSoundsResult("wrong");
      setTimeout(() => setAnimalSoundsResult(null), 1000);
    }
  };

  // 6. Odd One Out Game
  const ODD_ONE_OUT_QUESTIONS = [
    { items: ["🍎", "🍌", "🍇", "🚗"], odd: "🚗", category: "Find the non-fruit" },
    { items: ["🐶", "🐱", "🐰", "✈️"], odd: "✈️", category: "Find the non-animal" },
    { items: ["🔴", "🔵", "🟢", "🔲"], odd: "🔲", category: "Find the non-circle" },
    { items: ["👕", "👖", "👗", "🍎"], odd: "🍎", category: "Find the non-clothing" },
    { items: ["1", "2", "3", "A"], odd: "A", category: "Find the non-number" }
  ];

  const startOddOneOut = () => {
    setActiveGame("odd-one-out");
    setOddOneOutScore(0);
    generateOddOneOutQuestion();
  };

  const generateOddOneOutQuestion = () => {
    setOddOneOutResult(null);
    const randomIndex = Math.floor(Math.random() * ODD_ONE_OUT_QUESTIONS.length);
    const selected = ODD_ONE_OUT_QUESTIONS[randomIndex];
    setOddOneOutQuestion({
      items: selected.items.sort(() => Math.random() - 0.5),
      oddItem: selected.odd,
      category: selected.category
    });
  };

  const handleOddOneOutAnswer = (selected: string) => {
    if (oddOneOutResult) return;
    if (selected === oddOneOutQuestion?.oddItem) {
      setOddOneOutResult("correct");
      setOddOneOutScore(prev => prev + 1);
      setTimeout(() => generateOddOneOutQuestion(), 1500);
    } else {
      setOddOneOutResult("wrong");
      setTimeout(() => setOddOneOutResult(null), 1000);
    }
  };

  // 7. Counting Stars
  const startCountingStars = () => {
    setActiveGame("counting-stars");
    setCountingScore(0);
    generateCountingStarsQuestion();
  };

  const generateCountingStarsQuestion = () => {
    setCountingResult(null);
    const count = Math.floor(Math.random() * 9) + 1; // 1 to 9
    const options = [count];
    while (options.length < 4) {
      const r = Math.floor(Math.random() * 9) + 1;
      if (!options.includes(r)) options.push(r);
    }
    setCountingQuestion({
      count,
      options: options.sort(() => Math.random() - 0.5)
    });
  };

  const handleCountingStarsAnswer = (selected: number) => {
    if (countingResult) return;
    if (selected === countingQuestion?.count) {
      setCountingResult("correct");
      setCountingScore(prev => prev + 1);
      setTimeout(() => generateCountingStarsQuestion(), 1500);
    } else {
      setCountingResult("wrong");
      setTimeout(() => setCountingResult(null), 1000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="flex-1 overflow-hidden relative">
        {activeTab === "chat" && (
          <div className="h-full flex flex-col p-4 max-w-2xl mx-auto w-full">
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex",
                  msg.role === 'patient' ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "rounded-2xl px-4 py-2 max-w-[80%] text-lg",
                    msg.role === 'patient' 
                      ? "bg-blue-600 text-white rounded-br-none" 
                      : "bg-white border border-slate-200 shadow-sm rounded-bl-none text-slate-800"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-bl-none px-4 py-2 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-slate-500 text-sm">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
              <Input
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 text-lg py-6"
                disabled={isThinking || isRecording}
              />
              <Button type="submit" size="icon" className="h-14 w-14 rounded-full" disabled={!inputText.trim() || isThinking || isRecording}>
                <Send className="w-6 h-6" />
              </Button>
              <Button 
                type="button" 
                variant={isRecording ? "destructive" : "secondary"}
                size="icon" 
                className="h-14 w-14 rounded-full"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isThinking}
              >
                <Mic className={cn("w-6 h-6", isRecording && "animate-pulse")} />
              </Button>
            </form>
          </div>
        )}

        {activeTab === "location" && (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-blue-100 p-8 rounded-full mb-6">
              <MapPin className="w-16 h-16 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Current Location</h2>
            {locationLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            ) : (
              <p className="text-xl text-slate-700 max-w-md">
                {locationAddress || "Tap the button below to see where you are."}
              </p>
            )}
            <Button 
              size="lg" 
              className="mt-8 text-lg px-8 py-6 rounded-full" 
              onClick={handleWhereAmI}
              disabled={locationLoading}
            >
              Where am I?
            </Button>
          </div>
        )}

        {activeTab === "call" && (
          <div className="h-full flex flex-col p-4 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Call a Family Member</h2>
              <p className="text-slate-500 mt-1">Your loved ones are here for you ❤️</p>
            </div>
            
            {familyMembers.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <Users className="w-16 h-16 mb-4 opacity-20" />
                <p>No family members set up yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {familyMembers.map(member => (
                  <Card 
                    key={member._id} 
                    className="cursor-pointer hover:border-purple-500 transition-all border-l-4 border-l-transparent hover:border-l-purple-500 shadow-md group"
                    onClick={() => handleCallMember(member)}
                  >
                    <CardContent className="flex items-center gap-6 p-6 min-h-[140px]">
                      <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-5xl border-4 border-white shadow-sm group-hover:scale-105 transition-transform">
                        {member.avatarEmoji || "👤"}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-2xl text-slate-800">{member.name}</h3>
                        <p className="text-slate-500 text-lg mb-1">{member.relationship}</p>
                      </div>
                      
                      <div className="bg-green-100 text-green-600 p-4 rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors shadow-sm">
                        <Phone className="w-8 h-8" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "fun" && (
          <div className="h-full flex flex-col p-4 max-w-2xl mx-auto">
            {activeGame === "selector" ? (
              <>
                <h2 className="text-2xl font-bold mb-6 text-center">Fun & Games</h2>
                <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-20">
                  <GameCard title="Color Quiz" icon={<Palette className="w-8 h-8 text-purple-500" />} onClick={startColorQuiz} />
                  <GameCard title="Memory Cards" icon={<Brain className="w-8 h-8 text-blue-500" />} onClick={startMemoryGame} />
                  <GameCard title="Number Sequence" icon={<Hash className="w-8 h-8 text-green-500" />} onClick={startNumberSeq} />
                  <GameCard title="Word Rhyme" icon={<Music className="w-8 h-8 text-pink-500" />} onClick={startRhymeGame} />
                  <GameCard title="Emoji Guess" icon={<Smile className="w-8 h-8 text-yellow-500" />} onClick={startEmojiGuess} />
                  <GameCard title="True or False" icon={<CheckCircle className="w-8 h-8 text-red-500" />} onClick={startTrueFalse} />
                  <GameCard title="Animal Sounds" icon={<Music className="w-8 h-8 text-orange-500" />} onClick={startAnimalSounds} />
                  <GameCard title="Odd One Out" icon={<HelpCircle className="w-8 h-8 text-teal-500" />} onClick={startOddOneOut} />
                  <GameCard title="Counting Stars" icon={<Star className="w-8 h-8 text-indigo-500" />} onClick={startCountingStars} />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col">
                <Button variant="ghost" className="self-start mb-4" onClick={() => setActiveGame("selector")}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games
                </Button>
                
                {/* Game Renderers */}
                {activeGame === "color-quiz" && colorQuizQuestion && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <h3 className="text-xl mb-8">What color is this word?</h3>
                    <div className={cn(
                      "text-6xl font-bold mb-12 p-8 rounded-xl shadow-sm bg-white", 
                      getTailwindTextColor(colorQuizQuestion.displayColor)
                    )}>
                      {colorQuizQuestion.word}
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full">
                      {colorQuizQuestion.options.map((option, i) => (
                        <Button 
                          key={i} 
                          className={cn("h-24 text-xl font-bold", getTailwindBgColor(option))}
                          onClick={() => handleQuizAnswer(option)}
                        >
                          {getTailwindLabel(option)}
                        </Button>
                      ))}
                    </div>
                    {colorQuizResult && (
                      <div className={cn(
                        "mt-8 text-2xl font-bold animate-bounce",
                        colorQuizResult === "correct" ? "text-green-600" : "text-red-600"
                      )}>
                        {colorQuizResult === "correct" ? "Correct! 🎉" : "Try Again! ❌"}
                      </div>
                    )}
                    <div className="mt-8 text-slate-400">Score: {colorQuizScore}</div>
                  </div>
                )}

                {activeGame === "number-sequence" && numberSeqQuestion && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <h3 className="text-xl mb-8">Complete the sequence:</h3>
                    <div className="flex gap-4 mb-12 text-4xl font-mono font-bold">
                      {numberSeqQuestion.sequence.map((n, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">{n}</div>
                      ))}
                      <div className="bg-blue-100 p-4 rounded-xl shadow-sm border border-blue-200 text-blue-600">?</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full">
                      {numberSeqQuestion.options.map((opt, i) => (
                        <Button key={i} variant="outline" className="h-20 text-2xl" onClick={() => handleNumberSeqAnswer(opt)}>
                          {opt}
                        </Button>
                      ))}
                    </div>
                    {numberSeqResult && (
                      <div className={cn("mt-8 text-2xl font-bold", numberSeqResult === "correct" ? "text-green-600" : "text-red-600")}>
                        {numberSeqResult === "correct" ? "Correct! 🎉" : "Wrong! ❌"}
                      </div>
                    )}
                    <div className="mt-8 text-slate-400">Score: {numberSeqScore}</div>
                  </div>
                )}
                
                {/* Simplified placeholder renders for other games to save space/time, but functional */}
                {activeGame === "word-rhyme" && rhymeQuestion && (
                   <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <h3 className="text-xl mb-8">What rhymes with?</h3>
                    <div className="text-6xl font-bold mb-12 text-pink-600">{rhymeQuestion.targetWord}</div>
                    <div className="grid grid-cols-2 gap-4 w-full">
                      {rhymeQuestion.options.map((opt, i) => (
                        <Button key={i} variant="outline" className="h-20 text-xl" onClick={() => handleRhymeAnswer(opt)}>
                          {opt}
                        </Button>
                      ))}
                    </div>
                    {rhymeResult && (
                      <div className={cn("mt-8 text-2xl font-bold", rhymeResult === "correct" ? "text-green-600" : "text-red-600")}>
                        {rhymeResult === "correct" ? "Correct! 🎉" : "Wrong! ❌"}
                      </div>
                    )}
                    <div className="mt-8 text-slate-400">Score: {rhymeScore}</div>
                  </div>
                )}

                {activeGame === "memory-cards" && (
                  <div className="flex-1 flex flex-col">
                    <div className="grid grid-cols-3 gap-3">
                      {memoryCards.map((card, i) => (
                        <div 
                          key={i}
                          onClick={() => handleCardFlip(i)}
                          className={cn(
                            "aspect-square rounded-xl flex items-center justify-center text-4xl cursor-pointer transition-all transform duration-300",
                            memoryFlipped.includes(i) || memoryMatched.has(i)
                              ? "bg-white border-2 border-blue-500 rotate-0"
                              : "bg-blue-500 rotate-180"
                          )}
                        >
                          {(memoryFlipped.includes(i) || memoryMatched.has(i)) ? card.emoji : "❓"}
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 text-center text-slate-500">Moves: {memoryMoves}</div>
                  </div>
                )}
                
                {/* Generic renderer for remaining simple quiz games */}
                {(activeGame === "emoji-guess" && emojiGuessQuestion) && (
                   <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="text-6xl mb-4">{emojiGuessQuestion.emoji}</div>
                    <div className="text-xl text-slate-500 mb-8 italic">Hint: {emojiGuessQuestion.hint}</div>
                    <div className="grid grid-cols-2 gap-4 w-full">
                      {emojiGuessQuestion.options.map((opt, i) => (
                        <Button key={i} variant="outline" className="h-20 text-xl" onClick={() => handleEmojiGuessAnswer(opt)}>{opt}</Button>
                      ))}
                    </div>
                    {emojiGuessResult && <div className={cn("mt-8 text-2xl font-bold", emojiGuessResult === "correct" ? "text-green-600" : "text-red-600")}>{emojiGuessResult === "correct" ? "Correct!" : "Wrong!"}</div>}
                    <div className="mt-4 text-slate-400">Score: {emojiGuessScore}</div>
                  </div>
                )}
                
                {(activeGame === "true-false" && trueFalseQuestion) && (
                   <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <h3 className="text-2xl font-bold mb-8">{trueFalseQuestion.statement}</h3>
                    <div className="flex gap-4 w-full justify-center">
                      <Button className="h-24 w-24 rounded-full bg-green-500 text-white text-xl" onClick={() => handleTrueFalseAnswer(true)}>True</Button>
                      <Button className="h-24 w-24 rounded-full bg-red-500 text-white text-xl" onClick={() => handleTrueFalseAnswer(false)}>False</Button>
                    </div>
                    {trueFalseResult && <div className={cn("mt-8 text-2xl font-bold", trueFalseResult === "correct" ? "text-green-600" : "text-red-600")}>{trueFalseResult === "correct" ? "Correct!" : "Wrong!"}</div>}
                    <div className="mt-4 text-slate-400">Score: {trueFalseScore}</div>
                  </div>
                )}
                
                 {(activeGame === "animal-sounds" && animalSoundsQuestion) && (
                   <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="text-8xl mb-4">{animalSoundsQuestion.emoji}</div>
                    <h3 className="text-xl mb-8">What sound does the {animalSoundsQuestion.animal} make?</h3>
                    <div className="grid grid-cols-2 gap-4 w-full">
                      {animalSoundsQuestion.options.map((opt, i) => (
                        <Button key={i} variant="outline" className="h-20 text-xl" onClick={() => handleAnimalSoundsAnswer(opt)}>{opt}</Button>
                      ))}
                    </div>
                    {animalSoundsResult && <div className={cn("mt-8 text-2xl font-bold", animalSoundsResult === "correct" ? "text-green-600" : "text-red-600")}>{animalSoundsResult === "correct" ? "Correct!" : "Wrong!"}</div>}
                    <div className="mt-4 text-slate-400">Score: {animalSoundsScore}</div>
                  </div>
                )}
                
                {(activeGame === "odd-one-out" && oddOneOutQuestion) && (
                   <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <h3 className="text-xl mb-4">{oddOneOutQuestion.category}</h3>
                    <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                      {oddOneOutQuestion.items.map((item, i) => (
                        <Button key={i} variant="outline" className="h-32 text-6xl" onClick={() => handleOddOneOutAnswer(item)}>{item}</Button>
                      ))}
                    </div>
                    {oddOneOutResult && <div className={cn("mt-8 text-2xl font-bold", oddOneOutResult === "correct" ? "text-green-600" : "text-red-600")}>{oddOneOutResult === "correct" ? "Correct!" : "Wrong!"}</div>}
                    <div className="mt-4 text-slate-400">Score: {oddOneOutScore}</div>
                  </div>
                )}
                
                {(activeGame === "counting-stars" && countingQuestion) && (
                   <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <h3 className="text-xl mb-8">How many stars?</h3>
                    <div className="flex flex-wrap gap-2 justify-center max-w-xs mb-8">
                       {Array.from({ length: countingQuestion.count }).map((_, i) => (
                         <Star key={i} className="w-12 h-12 text-yellow-400 fill-yellow-400" />
                       ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full">
                      {countingQuestion.options.map((opt, i) => (
                        <Button key={i} variant="outline" className="h-20 text-3xl font-bold" onClick={() => handleCountingStarsAnswer(opt)}>{opt}</Button>
                      ))}
                    </div>
                    {countingResult && <div className={cn("mt-8 text-2xl font-bold", countingResult === "correct" ? "text-green-600" : "text-red-600")}>{countingResult === "correct" ? "Correct!" : "Wrong!"}</div>}
                    <div className="mt-4 text-slate-400">Score: {countingScore}</div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

      </div>

      {/* Navigation Tab Bar */}
      <div className="bg-white border-t border-slate-200 px-6 py-4 flex justify-between items-center shadow-lg">
        <NavButton 
          icon={<MessageCircle className="w-6 h-6" />} 
          label="Chat" 
          active={activeTab === "chat"} 
          onClick={() => setActiveTab("chat")} 
        />
        <NavButton 
          icon={<Phone className="w-6 h-6" />} 
          label="Call" 
          active={activeTab === "call"} 
          onClick={() => setActiveTab("call")} 
        />
        <NavButton 
          icon={<MapPin className="w-6 h-6" />} 
          label="Location" 
          active={activeTab === "location"} 
          onClick={() => setActiveTab("location")} 
        />
        <NavButton 
          icon={<Gamepad2 className="w-6 h-6" />} 
          label="Fun" 
          active={activeTab === "fun"} 
          onClick={() => setActiveTab("fun")} 
        />
      </div>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-colors",
        active ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function GameCard({ title, icon, onClick }: { title: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <Card className="cursor-pointer hover:border-blue-500 transition-all hover:shadow-md" onClick={onClick}>
      <CardContent className="flex flex-col items-center justify-center p-6 text-center h-full">
        <div className="mb-3">{icon}</div>
        <div className="font-semibold text-sm">{title}</div>
      </CardContent>
    </Card>
  );
}
