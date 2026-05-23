import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Brain, 
  User, 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  Activity, 
  Sparkles, 
  Timer, 
  RefreshCw, 
  Sliders, 
  Download, 
  AlertCircle, 
  Trash2, 
  Users, 
  Award, 
  CheckCircle,
  HelpCircle,
  PenTool,
  Clock,
  Watch,
  Smile,
  LogOut,
  Moon,
  Compass,
  Repeat,
  RotateCcw,
  BookOpen,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EvaluationType, Patient, DrawingPath, QuestionProgress, TestSession } from "./types";
import { DEFAULT_QUESTIONS_BY_TYPE, getCognitiveStatusDescription } from "./questions";
import { DrawingCanvas } from "./components/DrawingCanvas";

// Initial sample patient registers
const INITIAL_PATIENTS: Patient[] = [
  { 
    id: "p1", 
    name: "陳大文", 
    age: 76, 
    gender: "男", 
    education: "國小畢業", 
    notes: "近期經常忘東忘西，對日常約會時間偶有混淆，自述睡眠品質不佳。" 
  },
  { 
    id: "p2", 
    name: "林桂香阿嬤", 
    age: 82, 
    gender: "女", 
    education: "未上學", 
    notes: "方向感衰退明顯，曾在常走的菜市場路口迷航，平日愛打麻將，有些微重複發問情事。" 
  },
  { 
    id: "p3", 
    name: "王國華大哥", 
    age: 68, 
    gender: "男", 
    education: "專科畢業", 
    notes: "退休兩年，近期自覺注意力不易集中，閱讀報紙速度變慢，家屬預約早期篩檢。" 
  }
];

export default function App() {
  // --- STATE DECLARATIONS ---
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem("cognitive_patients");
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    return patients[0]?.id || "";
  });

  const [sessions, setSessions] = useState<TestSession[]>(() => {
    const saved = localStorage.getItem("cognitive_sessions");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeSession, setActiveSession] = useState<TestSession | null>(null);
  
  // View mode for workstation: "split" (both), "subject" (subject only), "assessor" (assessor only)
  const [viewPerspective, setViewPerspective] = useState<"split" | "subject" | "assessor">("split");
  
  // Selected tab for main navigation
  const [activeTab, setActiveTab] = useState<"assess" | "history" | "patients">("assess");
  const [selectedTestType, setSelectedTestType] = useState<EvaluationType>(EvaluationType.MMSE);

  // New patient form modal/controls
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientAge, setNewPatientAge] = useState<number>(75);
  const [newPatientGender, setNewPatientGender] = useState<"男" | "女" | "其他">("男");
  const [newPatientEducation, setNewPatientEducation] = useState("國中畢業");
  const [newPatientNotes, setNewPatientNotes] = useState("");

  //计时器状态 (Animal list 1 minute stopwatch)
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerIsActive, setTimerIsActive] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Interactive Game: Connect-the-dots for Trail Making (MoCA Item 1)
  const [trailConnections, setTrailConnections] = useState<string[]>([]);
  const [trailError, setTrailError] = useState(false);

  // AI Report Generation States
  const [aiReportLoading, setAiReportLoading] = useState(false);
  const [generatedAiReport, setGeneratedAiReport] = useState<string>("");
  const [aiReportError, setAiReportError] = useState<string>("");

  // Find active patient details
  const activePatient = useMemo(() => {
    return patients.find(p => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("cognitive_patients", JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    // Retry Vercount initialization
    const checkVercount = setInterval(() => {
      if ((window as any).vercount && typeof (window as any).vercount.fetch === 'function') {
        (window as any).vercount.fetch();
        clearInterval(checkVercount);
      }
    }, 500);
    return () => clearInterval(checkVercount);
  }, []);

  useEffect(() => {
    localStorage.setItem("cognitive_sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Trail-making node descriptions
  const trailNodes = useMemo(() => [
    { id: "1", label: "1", x: "20%", y: "15%" },
    { id: "ㄅ", label: "ㄅ", x: "48%", y: "22%" },
    { id: "2", label: "2", x: "78%", y: "18%" },
    { id: "ㄆ", label: "ㄆ", x: "32%", y: "48%" },
    { id: "3", label: "3", x: "65%", y: "45%" },
    { id: "ㄇ", label: "ㄇ", x: "18%", y: "78%" },
    { id: "4", label: "4", x: "48%", y: "82%" },
    { id: "ㄈ", label: "ㄈ", x: "76%", y: "76%" },
    { id: "5", label: "5", x: "48%", y: "52%" },
  ], []);

  const correctTrailOrder = ["1", "ㄅ", "2", "ㄆ", "3", "ㄇ", "4", "ㄈ", "5"];

  // Handle dot connection click
  const handleTrailNodeClick = (nodeId: string) => {
    const nextExpectedIndex = trailConnections.length;
    const expectedNode = correctTrailOrder[nextExpectedIndex];

    if (nodeId === expectedNode) {
      const newConnections = [...trailConnections, nodeId];
      setTrailConnections(newConnections);
      setTrailError(false);

      // If finished, auto-evaluate the scoring checklist of MoCA task 1
      if (newConnections.length === correctTrailOrder.length) {
        handleScoreUpdate(true, 0); // Check first checkpoint (usually there is 1 in MoCA Item 1)
      }
    } else {
      setTrailError(true);
      setTimeout(() => setTrailError(false), 800);
    }
  };

  const resetTrailConnections = () => {
    setTrailConnections([]);
    setTrailError(false);
  };

  // --- ANIMAL STOPWATCH TIMERS ---
  const startStopwatch = () => {
    if (timerIsActive) return;
    setTimerIsActive(true);
    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          setTimerIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseStopwatch = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setTimerIsActive(false);
  };

  const resetStopwatch = () => {
    pauseStopwatch();
    setTimerSeconds(60);
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Initialize a new test session
  const handleStartNewSession = (type: EvaluationType) => {
    if (!activePatient) return;
    
    // Copy the default questions lists
    const defaultQuestions = DEFAULT_QUESTIONS_BY_TYPE[type];
    const clonedQuestions: QuestionProgress[] = defaultQuestions.map((q) => ({
      ...q,
      checkedPoints: q.checkedPoints.map((cp) => ({ ...cp, checked: false })),
      canvasDrawing: [],
      score: 0,
      subjectAnswerText: ""
    }));

    const newSession: TestSession = {
      id: `session_${Date.now()}`,
      patientId: activePatient.id,
      testType: type,
      date: new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" }),
      progressIndex: 0,
      questions: clonedQuestions,
      isCompleted: false
    };

    setActiveSession(newSession);
    setViewPerspective("split");
    setTimerSeconds(60);
    setTimerIsActive(false);
    setTrailConnections([]);
    setGeneratedAiReport("");
    setAiReportError("");
  };

  const handleScoreUpdate = (isChecked: boolean, checkpointIndex: number) => {
    if (!activeSession) return;
    
    const currentQuestion = activeSession.questions[activeSession.progressIndex];
    const updatedCheckpoints = [...currentQuestion.checkedPoints];
    updatedCheckpoints[checkpointIndex].checked = isChecked;

    // Calculate sum of checked items score (each item yields its specified scoreContribution)
    let newScore = 0;
    updatedCheckpoints.forEach((cp) => {
      if (cp.checked) {
        newScore += cp.scoreContribution;
      }
    });

    // Constrain score to maximum score
    if (newScore > currentQuestion.maxScore) {
      newScore = currentQuestion.maxScore;
    }

    const updatedQuestions = [...activeSession.questions];
    updatedQuestions[activeSession.progressIndex] = {
      ...currentQuestion,
      checkedPoints: updatedCheckpoints,
      score: newScore
    };

    setActiveSession({
      ...activeSession,
      questions: updatedQuestions
    });
  };

  const handleCanvasDrawingChange = (paths: DrawingPath[]) => {
    if (!activeSession) return;
    const currentQuestion = activeSession.questions[activeSession.progressIndex];
    const updatedQuestions = [...activeSession.questions];
    updatedQuestions[activeSession.progressIndex] = {
      ...currentQuestion,
      canvasDrawing: paths
    };

    setActiveSession({
      ...activeSession,
      questions: updatedQuestions
    });
  };

  const handleSubjectAnswerTextChange = (text: string) => {
    if (!activeSession) return;
    const currentQuestion = activeSession.questions[activeSession.progressIndex];
    const updatedQuestions = [...activeSession.questions];
    updatedQuestions[activeSession.progressIndex] = {
      ...currentQuestion,
      subjectAnswerText: text
    };

    setActiveSession({
      ...activeSession,
      questions: updatedQuestions
    });
  };

  const handleAssessorNotesChange = (text: string) => {
    if (!activeSession) return;
    const currentQuestion = activeSession.questions[activeSession.progressIndex];
    const updatedQuestions = [...activeSession.questions];
    updatedQuestions[activeSession.progressIndex] = {
      ...currentQuestion,
      assessorNotes: text
    };

    setActiveSession({
      ...activeSession,
      questions: updatedQuestions
    });
  };

  // Navigating session steps
  const handleNextStep = () => {
    if (!activeSession) return;
    
    // Pause stopwatch if running
    pauseStopwatch();

    if (activeSession.progressIndex < activeSession.questions.length - 1) {
      setActiveSession({
        ...activeSession,
        progressIndex: activeSession.progressIndex + 1
      });
      // Reset game states
      setTimerSeconds(60);
    } else {
      // Test Complete! Calculate aggregates and complete session
      let totalAccumulated = 0;
      let totalMax = 0;
      
      activeSession.questions.forEach((q) => {
        totalAccumulated += q.score;
        totalMax += q.maxScore;
      });

      const finalStatus = getCognitiveStatusDescription(activeSession.testType, totalAccumulated);

      const completedSession: TestSession = {
        ...activeSession,
        isCompleted: true,
        scoreSummary: {
          total: totalAccumulated,
          max: totalMax,
          cognitiveStatus: finalStatus
        }
      };

      setSessions((prev) => [completedSession, ...prev]);
      setActiveSession(completedSession);
    }
  };

  const handlePrevStep = () => {
    if (!activeSession) return;
    if (activeSession.progressIndex > 0) {
      setActiveSession({
        ...activeSession,
        progressIndex: activeSession.progressIndex - 1
      });
      setTimerSeconds(60);
      pauseStopwatch();
    }
  };

  // Patient registration CRUD
  const handleAddPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    const newPatient: Patient = {
      id: `patient_${Date.now()}`,
      name: newPatientName,
      age: newPatientAge,
      gender: newPatientGender,
      education: newPatientEducation,
      notes: newPatientNotes.trim()
    };

    setPatients((prev) => [...prev, newPatient]);
    setSelectedPatientId(newPatient.id);
    
    // Reset inputs
    setNewPatientName("");
    setNewPatientAge(75);
    setNewPatientGender("男");
    setNewPatientEducation("國中畢業");
    setNewPatientNotes("");
    setShowAddPatient(false);
  };

  const handleDeletePatient = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (patients.length <= 1) {
      alert("系統必須保留至少一位受測者檔案。");
      return;
    }
    const confirmed = window.confirm("確定要刪除此位長輩的個人資料及所有的篩檢歷程嗎？刪除後將無法還原。");
    if (confirmed) {
      const updated = patients.filter(p => p.id !== id);
      setPatients(updated);
      setSessions(prev => prev.filter(s => s.patientId !== id));
      if (selectedPatientId === id) {
        setSelectedPatientId(updated[0]?.id || "");
      }
    }
  };

  const handleDeleteSession = (id: string) => {
    const confirmed = window.confirm("確定要移除這筆篩檢記錄嗎？");
    if (confirmed) {
      setSessions(prev => prev.filter(s => s.id !== id));
      if (activeSession && activeSession.id === id) {
        setActiveSession(null);
      }
    }
  };

  // --- GEMINI ARTIFICIAL INTELLIGENCE REPORT SYNTHESIS ---
  const handleGenerateAiReport = async () => {
    if (!activeSession || !activeSession.isCompleted) return;
    setAiReportLoading(true);
    setAiReportError("");
    setGeneratedAiReport("");

    try {
      const scoreCollection: Record<string, any> = {
        [activeSession.testType]: {
          score: activeSession.scoreSummary?.total,
          total: activeSession.scoreSummary?.max,
          status: activeSession.scoreSummary?.cognitiveStatus,
        }
      };

      // Extract simplified test notes & answers for qualitative report
      const assessmentData = activeSession.questions.map((q) => ({
        題名: q.title,
        類別: q.category,
        得分: `${q.score} / ${q.maxScore}`,
        受測試者自述或答案: q.subjectAnswerText || "無書寫輸入答案",
        手繪歷史記錄: (q.canvasDrawing && q.canvasDrawing.length > 0) ? "已手繪圖案" : "無手寫筆記",
        醫護人員評估備註: q.assessorNotes || "無額外註記",
        檢查要點達成狀況: q.checkedPoints.map((cp) => `${cp.label}: ${cp.checked ? '符合 (得' + cp.scoreContribution + '分)' : '不符合'}`)
      }));

      const res = await fetch("/api/report-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient: {
            name: activePatient.name,
            age: activePatient.age,
            education: activePatient.education,
            notes: activePatient.notes
          },
          scores: scoreCollection,
          assessmentData: assessmentData
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "生成失敗。");
      }

      setGeneratedAiReport(data.report);
      
      // Save it into the history record so it is cached!
      setSessions((prev) => 
        prev.map((s) => {
          if (s.id === activeSession.id) {
            return {
              ...s,
              scoreSummary: {
                ...s.scoreSummary!,
                aiReportHtml: data.report
              }
            };
          }
          return s;
        })
      );
    } catch (err: any) {
      console.error(err);
      setAiReportError(err.message || "連線至 Gemini API 時可能發生錯誤。請確認環境變數 GEMINI_API_KEY 已填寫（Settings > Secrets）。");
    } finally {
      setAiReportLoading(false);
    }
  };

  // Pre-load report mock or cache if available
  useEffect(() => {
    if (activeSession && activeSession.isCompleted && activeSession.scoreSummary?.aiReportHtml) {
      setGeneratedAiReport(activeSession.scoreSummary.aiReportHtml);
    } else {
      setGeneratedAiReport("");
    }
  }, [activeSession]);

  return (
    <div className="min-h-screen bg-[#F9F8F6] font-sans text-[#333333] flex flex-col antialiased">
      {/* 1. APP TOP BAR */}
      <header className="bg-white border-b border-[#E5E2D9] px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#5C6E58] flex items-center justify-center text-white text-lg font-bold shadow-sm">
            <Brain className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#2D2A26] flex items-center gap-2">
              認知功能評估與輔助篩檢系統
              <span className="text-xs bg-[#F0EEE8] text-[#5C6E58] font-semibold px-2 py-0.5 rounded-full border border-[#D9D5CB]">
                臨床輔照專業版
              </span>
            </h1>
            <p className="text-xs text-[#8C887D]">整合台灣本土情境常規評量 (MMSE • MoCA • CDT • CASI)</p>
          </div>
        </div>

        {/* Top Controls & Navigation Switchers */}
        <div className="flex items-center gap-4">
          <div className="text-[10px] text-[#8C887D] text-right">
            <span id="vercount_value_site_pv">--</span> PV / <span id="vercount_value_site_uv">--</span> UV
          </div>
          <button 
            onClick={() => { setActiveTab("assess"); setActiveSession(null); }}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
              activeTab === "assess" 
                ? "bg-[#5C6E58] text-white shadow-sm" 
                : "text-gray-600 hover:bg-[#F0EEE8] hover:text-[#5C6E58]"
            }`}
          >
            新篩檢評估
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
              activeTab === "history" 
                ? "bg-[#5C6E58] text-white shadow-sm" 
                : "text-gray-600 hover:bg-[#F0EEE8] hover:text-[#5C6E58]"
            }`}
          >
            篩檢歷程報告 ({sessions.length})
          </button>
          <button 
            onClick={() => setActiveTab("patients")}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
              activeTab === "patients" 
                ? "bg-[#5C6E58] text-white shadow-sm"
                : "text-gray-600 hover:bg-[#F0EEE8] hover:text-[#5C6E58]"
            }`}
          >
            受測長輩名冊 ({patients.length})
          </button>
        </div>
      </header>

      {/* 2. SUB-HEADER BAR (Currently Selected Patient) */}
      <div className="bg-[#F0EEE8] border-b border-[#E5E2D9] px-6 py-2.5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#8C887D] uppercase tracking-wider">
              當前對象：
            </span>
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#5C6E58]" />
              <span className="text-sm font-semibold text-[#2D2A26]">
                {activePatient.name} 
                <span className="text-gray-500 font-normal ml-1">
                  ({activePatient.gender}, {activePatient.age}歲)
                </span>
              </span>
              <span className="text-xs bg-[#E5E2D9] text-[#2D2A26] px-2 py-0.5 rounded ml-1">
                {activePatient.education}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#8C887D] uppercase tracking-wider">
              日常特徵主訴：
            </span>
            <span className="text-xs text-gray-600 max-w-md truncate" title={activePatient.notes}>
              {activePatient.notes || "無特定異常主訴"}
            </span>
          </div>
        </div>

        {/* Change Patient Widget */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#8C887D]">切換長輩:</span>
          <select 
            value={selectedPatientId} 
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              // Terminate potential session if switching
              if (activeSession) {
                if (window.confirm("切換受測對象將會中斷正在進行的測試，已填寫資料將會流失。是否確認？")) {
                  setActiveSession(null);
                }
              }
            }}
            className="text-xs bg-white border border-[#D9D5CB] rounded px-2.5 py-1 text-[#2D2A26] focus:outline-none focus:ring-1 focus:ring-[#5C6E58]"
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.age}歲)</option>
            ))}
          </select>
          <button 
            onClick={() => setShowAddPatient(true)}
            className="p-1 rounded bg-[#5C6E58] text-white hover:bg-[#485645] transition-colors"
            title="新增長輩個案"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-6 flex flex-col gap-6">

        {/* --- PATIENT ADDITION MODAL OVERLAY --- */}
        {showAddPatient && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-[#E5E2D9] max-w-lg w-full overflow-hidden shadow-2xl"
            >
              <div className="bg-[#5C6E58] px-6 py-4 text-white">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <User className="w-5 h-5" /> 註冊受測長輩個人檔案
                </h3>
                <p className="text-xs text-[#E5E2D9] mt-1">填寫受測長輩基本資訊以便在評估報告進行年齡與學歷常模比對。</p>
              </div>
              <form onSubmit={handleAddPatientSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">姓名 <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="例如：王小明" 
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                      className="w-full bg-[#F9F8F6] border border-[#D9D5CB] p-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5C6E58]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">生理性別</label>
                    <div className="flex gap-2">
                      {(["男", "女", "其他"] as const).map((gender) => (
                        <button
                          key={gender}
                          type="button"
                          onClick={() => setNewPatientGender(gender)}
                          className={`flex-1 py-1.5 text-xs font-medium border rounded-lg transition ${
                            newPatientGender === gender 
                              ? "bg-[#5C6E58] text-white border-[#5C6E58]" 
                              : "bg-[#F9F8F6] text-gray-600 border-[#D9D5CB] hover:bg-[#F0EEE8]"
                          }`}
                        >
                          {gender}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">年齡 (歲)</label>
                    <input 
                      type="number" 
                      min={10}
                      max={120}
                      required
                      value={newPatientAge}
                      onChange={(e) => setNewPatientAge(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#F9F8F6] border border-[#D9D5CB] p-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5C6E58]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">教育程度</label>
                    <select 
                      value={newPatientEducation}
                      onChange={(e) => setNewPatientEducation(e.target.value)}
                      className="w-full bg-[#F9F8F6] border border-[#D9D5CB] p-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5C6E58]"
                    >
                      <option value="未上學">未上學 (識字有限)</option>
                      <option value="未上學但識字">未上學 (但生活自學讀寫)</option>
                      <option value="國小畢業">國小畢業</option>
                      <option value="國中畢業">國中畢業</option>
                      <option value="高中職畢業">高中職畢業</option>
                      <option value="專科/大學畢業">專科/大學畢業</option>
                      <option value="研究所及以上">研究所及以上</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    主訴狀況 / 家屬關切與生活備忘錄
                  </label>
                  <textarea 
                    placeholder="請簡述長輩近期的忘東忘西表現、日常生活困難，例如：常找不到鑰匙、容易忘記吃藥、方向感等，提供 AI 結合診斷諮詢建議。"
                    rows={3}
                    value={newPatientNotes}
                    onChange={(e) => setNewPatientNotes(e.target.value)}
                    className="w-full bg-[#F9F8F6] border border-[#D9D5CB] p-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5C6E58] resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPatient(false)}
                    className="px-4 py-2 border border-[#D9D5CB] text-gray-600 rounded-xl text-xs font-medium hover:bg-[#F0EEE8]"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#5C6E58] text-white rounded-xl text-xs font-bold hover:bg-[#485645] transition"
                  >
                    完成登記
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* --- SCREEN VIEW 1: ACTIVE TEST SCREEN (WORKSTATION) --- */}
        {activeTab === "assess" && (
          <div className="flex flex-col gap-6">

            {/* If no test session is initiated: Show Test Toolkit Selector */}
            {!activeSession ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-4">
                <div className="md:col-span-4 max-w-2xl">
                  <h2 className="text-2xl font-serif text-[#2D2A26] italic font-bold">選擇專業篩檢工具</h2>
                  <p className="text-sm text-[#8C887D] mt-1">請為受測長輩選擇一個最合適其教育程度或臨床需求的心智測驗量表：</p>
                </div>

                {/* MMSE */}
                <div className="bg-white border border-[#E5E2D9] rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#5C6E58]/10 text-[#5C6E58] flex items-center justify-center font-bold mb-4">
                      M1
                    </div>
                    <h3 className="text-lg font-bold text-[#2D2A26]">MMSE (簡易心智量表)</h3>
                    <p className="text-xs text-[#8C887D] mt-1">最經典的「守門員」測驗</p>
                    <ul className="text-xs text-gray-600 space-y-2 mt-4 border-t border-[#F0EEE8] pt-4 leading-relaxed">
                      <li>• 滿分：<strong>30 分</strong></li>
                      <li>• 關鍵考核項目：時空定向、注意力與減算、短期物件詞記憶、語言指物、三段複合指令</li>
                      <li>• 特點：著重基礎功能與定向，早期失智或受教育低長輩之基礎檢視。</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => handleStartNewSession(EvaluationType.MMSE)}
                    className="w-full bg-[#5C6E58] hover:bg-[#4a5947] text-white py-2 rounded-xl text-xs font-bold transition mt-6"
                  >
                    開始 MMSE 篩檢
                  </button>
                </div>

                {/* MoCA */}
                <div className="bg-white border border-[#E5E2D9] rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#5C6E58]/10 text-[#5C6E58] flex items-center justify-center font-bold mb-4">
                      M2
                    </div>
                    <h3 className="text-lg font-bold text-[#2D2A26]">MoCA (蒙特利爾評估)</h3>
                    <p className="text-xs text-[#8C887D] mt-1">「高難度」早期失智殺手級篩檢</p>
                    <ul className="text-xs text-gray-600 space-y-2 mt-4 border-t border-[#F0EEE8] pt-4 leading-relaxed">
                      <li>• 滿分：<strong>30 分</strong></li>
                      <li>• 關鍵包括：1-ㄅ-2-ㄆ 交錯軌跡連線、立體箱仿畫、精準畫鐘、一分鐘動物名稱流暢列舉</li>
                      <li>• 特點：敏感度極高，對抓出「輕度認知功能障礙 (MCI)」非常有效。</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => handleStartNewSession(EvaluationType.MOCA)}
                    className="w-full bg-[#5C6E58] hover:bg-[#4a5947] text-white py-2 rounded-xl text-xs font-bold transition mt-6"
                  >
                    開始 MoCA 評估
                  </button>
                </div>

                {/* CDT */}
                <div className="bg-white border border-[#E5E2D9] rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#5C6E58]/10 text-[#5C6E58] flex items-center justify-center font-bold mb-4">
                      M3
                    </div>
                    <h3 className="text-lg font-bold text-[#2D2A26]">CDT 畫鐘測驗</h3>
                    <p className="text-xs text-[#8C887D] mt-1">一分鐘經典大腦頂葉空間診斷</p>
                    <ul className="text-xs text-gray-600 space-y-2 mt-4 border-t border-[#F0EEE8] pt-4 leading-relaxed">
                      <li>• 滿分：<strong>3 分</strong></li>
                      <li>• 關鍵包括：在白紙上獨立畫出鐘面大圓、填入 1~12 個數字、精準定位「11點10分」的長短針</li>
                      <li>• 特點：快速無負擔。透析額葉規畫與頂葉空間感的核心病灶。</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => handleStartNewSession(EvaluationType.CDT)}
                    className="w-full bg-[#5C6E58] hover:bg-[#4a5947] text-white py-2 rounded-xl text-xs font-bold transition mt-6"
                  >
                    開始 1分鐘畫鐘
                  </button>
                </div>

                {/* CASI */}
                <div className="bg-white border border-[#E5E2D9] rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#5C6E58]/10 text-[#5C6E58] flex items-center justify-center font-bold mb-4">
                      M4
                    </div>
                    <h3 className="text-lg font-bold text-[#2D2A26]">CASI (認知障礙篩檢)</h3>
                    <p className="text-xs text-[#8C887D] mt-1">最在地本土化的智慧門診指標</p>
                    <ul className="text-xs text-gray-600 space-y-2 mt-4 border-t border-[#F0EEE8] pt-4 leading-relaxed">
                      <li>• 滿分：<strong>100 分</strong></li>
                      <li>• 項目：台灣三大節、撿信封常識理解、10分一分鐘水果、畫三角正四方形重合、吃水果拜樹頭口語覆述</li>
                      <li>• 特點：充分考慮台灣民俗、語言流暢，是本土醫院診斷失智極普遍的評量。</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => handleStartNewSession(EvaluationType.CASI)}
                    className="w-full bg-[#5C6E58] hover:bg-[#4a5947] text-white py-2 rounded-xl text-xs font-bold transition mt-6"
                  >
                    開始 CASI 量表
                  </button>
                </div>
              </div>
            ) : (

              // Active screen WORK AREA (when session is active!)
              <div className="flex flex-col gap-4">
                
                {/* 2.1 View Perspective Toggles & Diagnostic Meta Headers */}
                <div className="bg-white p-3 rounded-xl border border-[#E5E2D9] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500">當前測量：</span>
                    <span className="px-3 py-1 rounded bg-[#5C6E58] text-white text-xs font-bold tracking-wider">
                      {activeSession.testType}
                    </span>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs font-semibold text-gray-600">
                      進度項目： {String(activeSession.progressIndex + 1).padStart(2, "0")} / {String(activeSession.questions.length).padStart(2, "0")}
                    </span>

                    {/* Progress tracking micro spots */}
                    <div className="hidden lg:flex items-center gap-1.5 ml-2">
                      {activeSession.questions.map((q, idx) => (
                        <div 
                          key={q.id}
                          className={`w-2.5 h-2.5 rounded-full border transition ${
                            idx === activeSession.progressIndex 
                              ? "bg-amber-500 border-amber-600" 
                              : q.score > 0 
                                ? "bg-[#5C6E58] border-[#5C6E58]" 
                                : "bg-gray-100 border-gray-300"
                          }`}
                          title={`${q.title}: ${q.score}/${q.maxScore}分`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Perspective selectors */}
                  <div className="flex items-center gap-1 bg-[#F0EEE8] p-1 rounded-lg border border-[#D9D5CB]">
                    <button 
                      onClick={() => setViewPerspective("split")}
                      className={`px-3 py-1 text-xs rounded transition flex items-center gap-1 ${
                        viewPerspective === "split" 
                          ? "bg-white text-[#5C6E58] font-bold shadow-xs" 
                          : "text-gray-600 hover:text-[#5C6E58]"
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" /> 雙螢幕並排檢視
                    </button>
                    <button 
                      onClick={() => setViewPerspective("subject")}
                      className={`px-3 py-1 text-xs rounded transition flex items-center gap-1 ${
                        viewPerspective === "subject" 
                          ? "bg-white text-[#5C6E58] font-bold shadow-xs" 
                          : "text-gray-600 hover:text-[#5C6E58]"
                      }`}
                    >
                      <Smile className="w-3.5 h-3.5" /> 僅受測者畫面
                    </button>
                    <button 
                      onClick={() => setViewPerspective("assessor")}
                      className={`px-3 py-1 text-xs rounded transition flex items-center gap-1 ${
                        viewPerspective === "assessor" 
                          ? "bg-white text-[#5C6E58] font-bold shadow-xs" 
                          : "text-gray-600 hover:text-[#5C6E58]"
                      }`}
                    >
                      <User className="w-3.5 h-3.5" /> 僅評估者畫面
                    </button>
                  </div>
                </div>

                {/* 2.2 BOTH VIEWS GRID CONTAINER */}
                {/* Completed Report view */}
                {activeSession.isCompleted ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    {/* Left Column: Local scoring summary and Radar Breakdown */}
                    <div className="bg-white border border-[#E5E2D9] rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-[#F0EEE8] pb-4">
                          <h3 className="text-lg font-bold text-[#2D2A26] flex items-center gap-2">
                            <Award className="w-5 h-5 text-[#5C6E58]" /> 篩檢結論分數
                          </h3>
                          <span className="text-xs text-[#8C887D] font-mono">{activeSession.date}</span>
                        </div>

                        {/* Centered Score Badge */}
                        <div className="py-8 flex flex-col items-center justify-center text-center">
                          <span className="text-xs uppercase tracking-wider text-[#8C887D] font-bold">總分</span>
                          <h4 className="text-6.5xl font-serif text-[#5C6E58] font-bold tracking-tight">
                            {activeSession.scoreSummary?.total}
                            <span className="text-xl text-gray-400 font-normal"> / {activeSession.scoreSummary?.max}</span>
                          </h4>
                          <div className="mt-3 bg-[#5C6E58]/10 text-[#5C6E58] px-4 py-1.5 rounded-full text-sm font-bold border border-[#5C6E58]/30">
                            {activeSession.scoreSummary?.cognitiveStatus}
                          </div>
                        </div>

                        {/* Test category breakdown progress bars */}
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase text-[#8C887D] tracking-wider border-b border-gray-100 pb-2">細項指標評級</h4>
                          {activeSession.questions.map((q) => (
                            <div key={q.id} className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-gray-700">{q.title} <span className="text-[#8C887D] font-normal">({q.category})</span></span>
                                <span className="font-mono text-gray-900 font-bold">{q.score} / {q.maxScore}分</span>
                              </div>
                              <div className="w-full h-2.5 bg-[#F0EEE8] rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[#5C6E58]" 
                                  style={{ width: `${(q.score / (q.maxScore || 1)) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Exit or clear tests buttons */}
                      <div className="border-t border-[#F0EEE8] pt-4 flex gap-2">
                        <button 
                          onClick={() => setActiveSession(null)}
                          className="flex-1 text-center py-2.5 rounded-xl border border-[#D9D5CB] text-gray-700 text-xs font-medium hover:bg-[#F0EEE8]"
                        >
                          返回量表主頁
                        </button>
                        <button 
                          onClick={() => handleStartNewSession(activeSession.testType)}
                          className="flex-1 text-center py-2.5 rounded-xl bg-[#5C6E58] text-white text-xs font-bold hover:bg-[#485645] transition flex items-center justify-center gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> 重新受測
                        </button>
                      </div>
                    </div>

                    {/* Right Column: AI Smart Diagnostic Report Panel */}
                    <div className="lg:col-span-2 bg-white border border-[#E5E2D9] rounded-2xl overflow-hidden shadow-sm flex flex-col">
                      <div className="bg-[#5C6E58] px-6 py-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-amber-300" />
                          <h3 className="text-md font-bold">Gemini AI 臨床神經心理輔照綜合報告</h3>
                        </div>
                        <span className="text-xs text-[#E5E2D9]">由先進 Gemini-3.5-Flash 深熱智學生成</span>
                      </div>

                      <div className="p-6 flex-1 overflow-y-auto space-y-4 max-h-[600px]">
                        {!generatedAiReport && !aiReportLoading && (
                          <div className="min-h-[250px] flex flex-col justify-center items-center text-center p-6 space-y-4">
                            <Brain className="w-16 h-16 text-[#5C6E58]/20" />
                            <div className="max-w-md">
                              <h4 className="text-md font-bold text-[#2D2A26]">尚未生成 AI 評估報告</h4>
                              <p className="text-xs text-[#8C887D] mt-1.5 leading-relaxed">
                                點擊下方按鈕，系統將彙整受測長輩的量化得分、日常狀態主訴，並依據臨床判斷準則，撰寫溫暖適地化、融合回憶、飲食、社交與安全照護的繁體中文分析與醫學轉介建議。
                              </p>
                            </div>
                            <button
                              onClick={handleGenerateAiReport}
                              className="px-6 py-3 bg-[#5C6E58] hover:bg-[#4a5947] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                            >
                              <Sparkles className="w-4 h-4 text-amber-300" /> 生成 AI 智慧臨床照護輔導報告
                            </button>
                          </div>
                        )}

                        {aiReportLoading && (
                          <div className="min-h-[300px] flex flex-col justify-center items-center p-6 space-y-4">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-[#5C6E58] animate-spin" />
                              <Sparkles className="w-5 h-5 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-semibold text-[#5C6E58]">Gemini AI 正在深入剖析長輩大腦區域表徵...</p>
                              <p className="text-[11px] text-[#8C887D] mt-1">預估需要 10 ~ 15 秒，請稍候。</p>
                            </div>
                          </div>
                        )}

                        {aiReportError && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold">分析報告生成失敗</p>
                              <p className="mt-1">{aiReportError}</p>
                              <p className="text-[11px] text-gray-500 mt-2">
                                💡 請至上方 Settings &gt; Secrets 設置您的 <strong>GEMINI_API_KEY</strong>。
                              </p>
                              <button
                                onClick={handleGenerateAiReport}
                                className="mt-3 px-3 py-1.5 bg-[#5C6E58] text-white rounded text-[11px] font-bold hover:bg-[#485645]"
                              >
                                再次嘗試生成
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Finished markdown rendering styling */}
                        {generatedAiReport && (
                          <div className="prose prose-stone max-w-none text-sm text-[#333333] leading-relaxed space-y-6">
                            <div className="p-4 bg-[#F2F4F2] border border-[#D9D5CB] rounded-xl flex items-center justify-between text-xs text-[#5C6E58]">
                              <span className="flex items-center gap-1.5 font-semibold">
                                <CheckCircle className="w-4 h-4 text-green-600" /> 分析成功生成。建議家屬下載保留或列印成 A4 前往醫院神經內科。
                              </span>
                              <button 
                                onClick={() => {
                                  window.print();
                                }}
                                className="px-2.5 py-1 bg-white hover:bg-gray-100 text-[#5C6E58] border border-[#D9D5CB] rounded font-bold"
                              >
                                列印 A4 報告
                              </button>
                            </div>

                            {/* Self rendered custom breakdown block instead of parsing react-markdown with risks */}
                            <div className="space-y-4">
                              {generatedAiReport.split("\n\n").map((para, i) => {
                                if (para.startsWith("# ")) {
                                  return <h1 key={i} className="text-xl font-serif font-bold text-[#2D2A26] border-b border-[#E5E2D9] pb-2 pt-4">{para.replace("# ", "")}</h1>;
                                }
                                if (para.startsWith("## ")) {
                                  return <h2 key={i} className="text-md font-bold text-[#5C6E58] border-l-4 border-[#5C6E58] pl-2 pt-2">{para.replace("## ", "")}</h2>;
                                }
                                if (para.startsWith("- ") || para.startsWith("* ")) {
                                  return (
                                    <ul key={i} className="list-disc pl-5 space-y-1">
                                      {para.split("\n").map((li, idx) => (
                                        <li key={idx} className="text-xs text-gray-700 py-0.5">
                                          {li.replace(/^[\s*-]+/, "")}
                                        </li>
                                      ))}
                                    </ul>
                                  );
                                }
                                return <p key={i} className="text-xs text-gray-700 leading-relaxed">{para}</p>;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // Active interactive question steps
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                    
                    {/* --- LEFT VIEW: SUBJECT PERSPECTIVE PANEL --- */}
                    {(viewPerspective === "split" || viewPerspective === "subject") && (
                      <motion.div 
                        layout
                        className="bg-white border border-[#E5E2D9] rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-sm min-h-[500px]"
                      >
                        {/* Subject instruction card */}
                        <div className="space-y-6">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <span className="text-[10px] font-bold text-[#8C887D] tracking-widest uppercase bg-[#F0EEE8] px-2.5 py-1 rounded">
                              受測者畫面 (長輩視角)
                            </span>
                            <span className="text-xs text-gray-400">大字體 • 簡潔布局</span>
                          </div>

                          <div className="space-y-4">
                            <span className="text-xs font-semibold text-[#5C6E58] tracking-wider uppercase block">
                              類別：{activeSession.questions[activeSession.progressIndex].category}
                            </span>
                            
                            {/* BIG PROMPT FOR ELDERLY */}
                            <h2 className="text-2.5xl font-serif text-[#2D2A26] leading-snug font-medium border-l-4 border-amber-500 pl-4 py-1">
                              {activeSession.questions[activeSession.progressIndex].prompt}
                            </h2>
                          </div>

                          {/* DYNAMIC INTERACTION WIDGET EMBED */}
                          <div className="bg-[#F9F8F6] p-4 rounded-xl border border-[#E5E2D9] min-h-[220px] flex flex-col justify-center">
                            
                            {/* A. WidgetType: Drawing (CDT/Intersect Pentagons) */}
                            {activeSession.questions[activeSession.progressIndex].widgetType === "drawing" && (
                              <div className="space-y-3">
                                <p className="text-xs text-[#8C887D] flex items-center gap-1">
                                  <Info className="w-3.5 h-3.5" /> 請使用滑鼠、不發抖的手指或手寫筆在下方繪製圖案：
                                </p>
                                <DrawingCanvas 
                                  paths={activeSession.questions[activeSession.progressIndex].canvasDrawing || []}
                                  onChange={handleCanvasDrawingChange}
                                  height={260}
                                  guideType={
                                    activeSession.questions[activeSession.progressIndex].id.includes("cdt") 
                                      ? "circle" 
                                      : activeSession.questions[activeSession.progressIndex].id.includes("cube") ? "cube" : "none"
                                  }
                                />
                              </div>
                            )}

                            {/* B. WidgetType: Recall card reminders */}
                            {activeSession.questions[activeSession.progressIndex].widgetType === "recall_words" && (
                              <div className="text-center p-4 space-y-4">
                                <p className="text-xs text-[#8C887D]">請跟著唸出聲，並將大腦專注記住這幾個物品：</p>
                                <div className="flex flex-wrap justify-center gap-4">
                                  {activeSession.questions[activeSession.progressIndex].wordsToRemember?.map((word, wIdx) => {
                                    // Custom visual indicators so matching names looks stunning
                                    let emoji = "📦";
                                    if (word === "蘋果") emoji = "🍎";
                                    else if (word === "桌子") emoji = "🪑";
                                    else if (word === "銅板") emoji = "🪙";
                                    else if (word === "紅包") emoji = "🧧";
                                    else if (word === "火車") emoji = "🚂";
                                    else if (word === "茉莉") emoji = "🌸";
                                    else if (word === "絲綢") emoji = "🧣";
                                    else if (word === "紅色") emoji = "🔴";
                                    else if (word === "玉山") emoji = "🏔️";
                                    else if (word === "公車") emoji = "🚌";
                                    else if (word === "報紙") emoji = "📰";

                                    return (
                                      <div 
                                        key={wIdx} 
                                        className="bg-white border-2 border-[#5C6E58] px-6 py-4 rounded-xl shadow-xs flex flex-col items-center justify-center min-w-[110px]"
                                      >
                                        <span className="text-3xl mb-1.5 select-none">{emoji}</span>
                                        <span className="text-lg font-bold text-[#2D2A26] tracking-wider">{word}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* C. WidgetType: Trail-making connect dots */}
                            {activeSession.questions[activeSession.progressIndex].widgetType === "serial_trail" && (
                              <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs text-[#8C887D]">
                                  <span>請依序點擊連線：1 ➔ ㄅ ➔ 2 ➔ ㄆ ➔ 3 ➔ ㄇ ➔ 4 ➔ ㄈ ➔ 5</span>
                                  <button 
                                    onClick={resetTrailConnections}
                                    className="px-2 py-1 bg-white border rounded text-gray-600 hover:bg-gray-100"
                                  >
                                    重試連線
                                  </button>
                                </div>

                                <div className="relative h-[250px] bg-white rounded-xl border border-[#E5E2D9] overflow-hidden">
                                  {/* Draw SVG connections */}
                                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    {trailConnections.slice(0, trailConnections.length - 1).map((nodeId, idx) => {
                                      const fromNode = trailNodes.find((tn) => tn.id === nodeId);
                                      const toNode = trailNodes.find((tn) => tn.id === trailConnections[idx + 1]);
                                      if (!fromNode || !toNode) return null;
                                      return (
                                        <line 
                                          key={idx}
                                          x1={fromNode.x}
                                          y1={fromNode.y}
                                          x2={toNode.x}
                                          y2={toNode.y}
                                          stroke="#5C6E58"
                                          strokeWidth="4"
                                          strokeLinecap="round"
                                        />
                                      );
                                    })}
                                  </svg>

                                  {/* Draw dots */}
                                  {trailNodes.map((node) => {
                                    const isConnected = trailConnections.includes(node.id);
                                    const nextExpectedNode = correctTrailOrder[trailConnections.length];
                                    const isNext = node.id === nextExpectedNode;

                                    return (
                                      <button
                                        key={node.id}
                                        onClick={() => handleTrailNodeClick(node.id)}
                                        style={{ left: node.x, top: node.y }}
                                        className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all focus:outline-none ${
                                          isConnected 
                                            ? "bg-[#5C6E58] text-white border-[#5C6E58] scale-105" 
                                            : isNext 
                                              ? "bg-amber-500 text-white border-amber-600 animate-pulse" 
                                              : trailError && isNext 
                                                ? "bg-red-500 text-white border-red-600" 
                                                : "bg-[#F3F4F6] text-gray-700 border-gray-300 hover:border-gray-500"
                                        }`}
                                      >
                                        {node.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* D. Special WidgetType: Naming visual helper indicators */}
                            {activeSession.questions[activeSession.progressIndex].widgetType === "naming" && (
                              <div className="flex flex-col items-center justify-center p-3 text-center space-y-4">
                                <p className="text-xs text-[#8C887D]">請大聲向醫師唸出下方指涉物件的名字：</p>
                                <div className="flex flex-wrap justify-center gap-6">
                                  {/* MMSE objects */}
                                  {activeSession.questions[activeSession.progressIndex].id.includes("mmse") && (
                                    <>
                                      <div className="bg-white border p-4 rounded-xl shadow-xs flex flex-col items-center w-28">
                                        <div className="w-12 h-12 rounded bg-amber-50 flex items-center justify-center text-[#5C6E58] mb-2 font-bold text-lg border">✏️</div>
                                        <span className="text-xs text-[#8C887D]">物件其一</span>
                                      </div>
                                      <div className="bg-white border p-4 rounded-xl shadow-xs flex flex-col items-center w-28">
                                        <div className="w-12 h-12 rounded bg-blue-50 flex items-center justify-center text-[#5C6E58] mb-2 font-bold text-lg border">⌚</div>
                                        <span className="text-xs text-[#8C887D]">物件其二</span>
                                      </div>
                                    </>
                                  )}

                                  {/* MoCA animals */}
                                  {activeSession.questions[activeSession.progressIndex].id.includes("moca") && (
                                    <>
                                      <div className="bg-white border p-4 rounded-xl shadow-xs flex flex-col items-center w-24">
                                        <span className="text-3xl mb-1 filter grayscale contrast-125">🦁</span>
                                        <span className="text-xs text-[#8C887D]">動物 1</span>
                                      </div>
                                      <div className="bg-white border p-4 rounded-xl shadow-xs flex flex-col items-center w-24">
                                        <span className="text-3xl mb-1 filter grayscale contrast-125">🦏</span>
                                        <span className="text-xs text-[#8C887D]">動物 2</span>
                                      </div>
                                      <div className="bg-white border p-4 rounded-xl shadow-xs flex flex-col items-center w-24">
                                        <span className="text-3xl mb-1 filter grayscale contrast-125">🐫</span>
                                        <span className="text-xs text-[#8C887D]">動物 3</span>
                                      </div>
                                    </>
                                  )}

                                  {/* CASI objects */}
                                  {activeSession.questions[activeSession.progressIndex].id.includes("casi") && (
                                    <>
                                      <div className="bg-white border p-4 rounded-xl shadow-xs flex flex-col items-center w-24">
                                        <span className="text-2xl mb-1">🖊️</span>
                                        <span className="text-[10px] text-gray-500">物件 A</span>
                                      </div>
                                      <div className="bg-white border p-4 rounded-xl shadow-xs flex flex-col items-center w-24">
                                        <span className="text-2xl mb-1">🍵</span>
                                        <span className="text-[10px] text-gray-500">物件 B</span>
                                      </div>
                                      <div className="bg-white border p-4 rounded-xl shadow-xs flex flex-col items-center w-24">
                                        <span className="text-2xl mb-1">✂️</span>
                                        <span className="text-[10px] text-gray-500">物件 C</span>
                                      </div>
                                    </>
                                  )}

                                </div>
                              </div>
                            )}

                            {/* E. WidgetType: Calculation input pad */}
                            {activeSession.questions[activeSession.progressIndex].widgetType === "calculation" && (
                              <div className="space-y-3 p-2">
                                <label className="block text-xs font-semibold text-[#8C887D]">長輩心算過程輸入記錄 (非評分板，備忘用)：</label>
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="填寫長輩說出的算式或結果 (如: 93 - 86)"
                                    value={activeSession.questions[activeSession.progressIndex].subjectAnswerText || ""}
                                    onChange={(e) => handleSubjectAnswerTextChange(e.target.value)}
                                    className="flex-1 bg-white border border-[#D9D5CB] p-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#5C6E58]"
                                  />
                                  <button 
                                    className="px-3 bg-[#E5E2D9] hover:bg-[#D9D5CB] text-[#2D2A26] rounded-lg text-xs"
                                    onClick={() => handleSubjectAnswerTextChange("")}
                                  >
                                    重設
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* F. WidgetType: Standard text entry */}
                            {(!activeSession.questions[activeSession.progressIndex].widgetType || activeSession.questions[activeSession.progressIndex].widgetType === "standard_checklist") && (
                              <div className="p-2 space-y-3">
                                <label className="block text-xs font-semibold text-[#8C887D]">長輩答覆細節字眼備份 (錄入後將納入 AI 定性分析)：</label>
                                <textarea
                                  placeholder="在此記錄長輩作答自述字句（例如：長輩回答「今天是民國115年...不對，應該是113年」）"
                                  rows={2}
                                  value={activeSession.questions[activeSession.progressIndex].subjectAnswerText || ""}
                                  onChange={(e) => handleSubjectAnswerTextChange(e.target.value)}
                                  className="w-full bg-white border border-[#D9D5CB] p-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#5C6E58] resize-none"
                                />
                              </div>
                            )}

                          </div>
                        </div>

                        {/* Bottom tip for subject screen */}
                        <div className="border-t border-gray-100 pt-4 mt-6 flex justify-between items-center text-[11px] text-[#8C887D]">
                          <span>請受測者保持情緒輕鬆平穩。</span>
                          <span>醫護人員配合右側專用主控台施測。</span>
                        </div>
                      </motion.div>
                    )}

                    {/* --- RIGHT VIEW: ASSESSOR CONSOLE CONTROL PANEL --- */}
                    {(viewPerspective === "split" || viewPerspective === "assessor") && (
                      <motion.div 
                        layout
                        className="bg-[#F4F1EA] border border-[#E5E2D9] rounded-2xl p-6 flex flex-col justify-between shadow-sm min-h-[500px]"
                      >
                        <div className="space-y-5">
                          
                          {/* Assessor console metadata */}
                          <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
                            <span className="text-[10px] font-bold text-[#8C887D] tracking-widest uppercase bg-white px-2.5 py-1 rounded border border-[#E5E2D9]">
                              評估者醫護主控台
                            </span>
                            <span className="text-xs bg-[#5C6E58]/10 text-[#5C6E58] font-bold px-2 py-0.5 rounded">
                              配分權重：{activeSession.questions[activeSession.progressIndex].maxScore} 分
                            </span>
                          </div>

                          {/* Dynamic 1-Minute Chronograph (Timer) for assessor (especially Animal Fluency / naming) */}
                          {activeSession.questions[activeSession.progressIndex].category.includes("語言流暢") && (
                            <div className="bg-white p-3.5 rounded-xl border border-[#D9D5CB] shadow-xs space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-[#5C6E58] flex items-center gap-1">
                                  <Timer className="w-3.5 h-3.5" /> 1 分鐘列舉列數精準計時碼表
                                </span>
                                <span className={`text-sm font-mono font-bold ${timerSeconds <= 10 ? "text-red-500 animate-pulse font-extrabold" : "text-gray-900"}`}>
                                  {timerSeconds} 秒
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-1000 ${timerSeconds <= 10 ? "bg-red-500" : "bg-[#5C6E58]"}`}
                                  style={{ width: `${(timerSeconds / 60) * 100}%` }}
                                />
                              </div>
                              <div className="flex justify-end gap-1.5 pt-1">
                                <button 
                                  onClick={startStopwatch}
                                  disabled={timerIsActive || timerSeconds === 0}
                                  className="px-2.5 py-1 bg-[#5C6E58] hover:bg-[#485645] text-white rounded text-[10px] font-bold disabled:opacity-40"
                                >
                                  啟動計時
                                </button>
                                <button 
                                  onClick={pauseStopwatch}
                                  disabled={!timerIsActive}
                                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-bold disabled:opacity-40"
                                >
                                  暫停
                                </button>
                                <button 
                                  onClick={resetStopwatch}
                                  className="px-2.5 py-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-[10px] font-bold"
                                >
                                  重置 60秒
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Standard Instruction Prompt (施測重點與指導語) */}
                          <div className="bg-white p-4 rounded-xl border border-[#D9D5CB] shadow-xs space-y-2">
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8C887D] flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-[#5C6E58]" /> 施測步驟與指導重點：
                            </h4>
                            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {activeSession.questions[activeSession.progressIndex].testerAdvice}
                            </p>
                          </div>

                          {/* Checklist & Score Counter */}
                          <div className="space-y-2.5">
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#8C887D]">
                              臨床檢視評分標準 (總計：{activeSession.questions[activeSession.progressIndex].score} 分)
                            </h4>

                            <div className="space-y-2">
                              {activeSession.questions[activeSession.progressIndex].checkedPoints.map((cp, idx) => (
                                <label 
                                  key={idx}
                                  className={`flex items-start gap-3 p-3 bg-white rounded-xl border border-[#D9D5CB] cursor-pointer hover:bg-[#F9F8F6] transition select-none ${
                                    cp.checked ? "border-[#5C6E58] bg-[#F2F4F2]" : ""
                                  }`}
                                >
                                  <input 
                                    type="checkbox"
                                    checked={cp.checked}
                                    onChange={(e) => handleScoreUpdate(e.target.checked, idx)}
                                    className="w-4 h-4 rounded text-[#5C6E58] accent-[#5C6E58] mt-0.5 shrink-0"
                                  />
                                  <span className="text-xs text-[#2D2A26] leading-snug">
                                    {cp.label}
                                  </span>
                                </label>
                              ))}

                              {activeSession.questions[activeSession.progressIndex].checkedPoints.length === 0 && (
                                <div className="text-center p-3 bg-white border rounded text-xs text-gray-400">
                                  此步驟為登錄記憶特徵，不予在當前題目獨立計分。(分數比重為0)
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Optional: Notes for Clinical assessment context */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-[#8C887D] tracking-wider uppercase">
                              醫事紀錄與評估備註 (非必填)：
                            </label>
                            <input 
                              type="text"
                              placeholder="例如：長輩手部關節炎不便握筆、重複回答、發音稍不流暢等"
                              value={activeSession.questions[activeSession.progressIndex].assessorNotes || ""}
                              onChange={(e) => handleAssessorNotesChange(e.target.value)}
                              className="w-full bg-white border border-[#D9D5CB] p-2 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#5C6E58]"
                            />
                          </div>

                        </div>

                        {/* Controls (Prev / Next & Complete Buttons) */}
                        <div className="border-t border-[#E5E2D9] pt-4 mt-6 flex items-center justify-between">
                          <button 
                            type="button"
                            onClick={handlePrevStep}
                            disabled={activeSession.progressIndex === 0}
                            className="px-4 py-2 bg-white text-gray-700 border border-[#D9D5CB] rounded-xl text-xs font-bold hover:bg-gray-100 transition disabled:opacity-40 flex items-center gap-1"
                          >
                            <ChevronLeft className="w-4 h-4" /> 上一步
                          </button>

                          <button 
                            type="button"
                            onClick={handleNextStep}
                            className="px-5 py-2.5 bg-[#5C6E58] hover:bg-[#485645] text-white rounded-xl text-xs font-extrabold transition shadow-sm flex items-center gap-1"
                          >
                            {activeSession.progressIndex < activeSession.questions.length - 1 ? (
                              <>
                                下一步 ({activeSession.progressIndex + 2}/{activeSession.questions.length}) <ChevronRight className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                結束評估，輸出診斷總分 <CheckCircle className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}

                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* --- SCREEN VIEW 2: HISTORICAL SESSIONS REPORT --- */}
        {activeTab === "history" && (
          <div className="bg-white border border-[#E5E2D9] rounded-2xl p-6 shadow-sm min-h-[500px]">
            <div className="flex items-center justify-between border-b border-[#F0EEE8] pb-4 mb-4">
              <div>
                <h3 className="text-xl font-serif text-[#2D2A26] italic font-bold">歷史測試歷程報告冊</h3>
                <p className="text-xs text-[#8C887D]">記錄受測長輩於量表評估所獲得的分數與認知衰退指標軌跡</p>
              </div>
              <span className="text-xs bg-[#F0EEE8] text-[#5C6E58] font-bold px-3 py-1 rounded-full border border-[#D9D5CB]">
                合計：{sessions.length} 筆篩檢資料
              </span>
            </div>

            {sessions.length === 0 ? (
              <div className="py-20 flex flex-col justify-center items-center text-center text-gray-400 space-y-4">
                <Brain className="w-16 h-16 text-gray-200" />
                <div className="max-w-sm">
                  <h4 className="text-md font-bold text-gray-800">目前尚無篩檢歷程</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    在第一個分頁上選擇一個量表開始為長輩評分吧！系統將本機持久存放篩檢分數，輔助分析衰退趨向。
                  </p>
                  <button 
                    onClick={() => setActiveTab("assess")}
                    className="mt-4 px-4 py-2 bg-[#5C6E58] hover:bg-[#4a5947] text-white rounded-xl text-xs font-semibold"
                  >
                    立即去施測
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Score Log List Sidebar */}
                <div className="md:col-span-1 space-y-3 max-h-[560px] overflow-y-auto pr-2">
                  {sessions.map((session) => {
                    const sessionPatient = patients.find(p => p.id === session.patientId) || { name: "未知長輩", age: 0 };
                    const isActive = activeSession && activeSession.id === session.id;

                    return (
                      <div 
                        key={session.id}
                        onClick={() => {
                          setActiveSession(session);
                          // Clear report state and show if cached in the newly selected session
                          setGeneratedAiReport(session.scoreSummary?.aiReportHtml || "");
                        }}
                        className={`p-4 rounded-xl border cursor-pointer text-left transition relative overflow-hidden ${
                          isActive 
                            ? "border-[#5C6E58] bg-[#F2F4F2]" 
                            : "border-[#E5E2D9] bg-[#F9F8F6] hover:bg-[#F0EEE8]"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="px-2 py-0.5 rounded bg-white border border-[#D9D5CB] text-[10px] font-mono font-bold text-[#5C6E58] tracking-wider uppercase">
                              {session.testType} 量表
                            </span>
                            <h4 className="text-sm font-bold text-[#2D2A26] mt-2">
                              受測長輩：{sessionPatient.name} 
                              <span className="text-xs text-gray-500 font-normal"> ({sessionPatient.age}歲)</span>
                            </h4>
                            <p className="text-[11px] text-[#8C887D] mt-1">
                              施測日期：{session.date}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-[#8C887D] block mb-1">評級得分</span>
                            <span className="text-xl font-serif text-[#5C6E58] font-bold">
                              {session.scoreSummary?.total}
                              <span className="text-xs text-gray-400 font-normal">/{session.scoreSummary?.max}</span>
                            </span>
                          </div>
                        </div>

                        {/* Status badge and delete session */}
                        <div className="flex justify-between items-center mt-3 border-t border-dashed border-[#E5E2D9] pt-2">
                          <span className="text-[10px] bg-[#5C6E58]/10 text-[#5C6E58] font-bold px-2 py-0.5 rounded">
                            {session.scoreSummary?.cognitiveStatus}
                          </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(session.id);
                            }}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="刪除此紀錄"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Session Details Panel */}
                <div className="md:col-span-2 bg-[#F9F8F6] rounded-xl border border-[#D9D5CB] p-6 space-y-6 flex flex-col justify-between">
                  {activeSession ? (
                    <div className="space-y-6">
                      
                      {/* Session Top Header */}
                      <div className="flex items-center justify-between border-b border-[#D9D5CB] pb-3">
                        <div>
                          <h4 className="text-[#2D2A26] text-lg font-bold">
                            受測報告詳情 — {activeSession.testType}
                          </h4>
                          <p className="text-xs text-gray-500">
                            施測對象：{patients.find(p => p.id === activeSession.patientId)?.name || "未知"} 
                            | 日期：{activeSession.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase text-gray-400 block">診斷總分</span>
                          <span className="text-2.5xl font-serif text-[#5C6E58] font-bold">
                            {activeSession.scoreSummary?.total} / {activeSession.scoreSummary?.max}
                          </span>
                        </div>
                      </div>

                      {/* AI generated cached or triggers */}
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl border border-[#E5E2D9] space-y-3 shadow-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-[#5C6E58] flex items-center gap-1">
                              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> 診學診斷與照顧方針
                            </span>
                            <span className="text-[10px] text-gray-400">大腦各分區綜合剖析</span>
                          </div>

                          {generatedAiReport ? (
                            <div className="max-h-[300px] overflow-y-auto text-xs text-gray-700 leading-relaxed space-y-3 pr-2">
                              {generatedAiReport.split("\n\n").map((para, idx) => {
                                if (para.startsWith("# ")) {
                                  return <h4 key={idx} className="text-sm font-bold text-[#2D2A26] mt-2 border-b pb-1">{para.replace("# ", "")}</h4>;
                                }
                                if (para.startsWith("## ")) {
                                  return <h5 key={idx} className="font-bold text-[#5C6E58] mt-2">{para.replace("## ", "")}</h5>;
                                }
                                if (para.startsWith("- ") || para.startsWith("* ")) {
                                  return (
                                    <ul key={idx} className="list-disc pl-4 space-y-0.5">
                                      {para.split("\n").map((li, liIdx) => (
                                        <li key={liIdx}>{li.replace(/^[\s*-]+/, "")}</li>
                                      ))}
                                    </ul>
                                  );
                                }
                                return <p key={idx}>{para}</p>;
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-xs text-[#8C887D] mb-3">這筆歷史記錄尚未產出 AI 神經心理關懷建議報告。</p>
                              <button 
                                onClick={handleGenerateAiReport}
                                disabled={aiReportLoading}
                                className="px-4 py-2 bg-[#5C6E58] hover:bg-[#4a5947] text-white text-xs font-medium rounded-lg disabled:opacity-40"
                              >
                                {aiReportLoading ? "正在連線 AI 生成中..." : "立即產出智慧診斷與個案照護方針 (10秒)"}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Detailed question scoring tables */}
                        <div className="bg-white p-4 rounded-xl border border-[#E5E2D9] shadow-xs space-y-3">
                          <h5 className="text-xs font-bold text-gray-700">各評測題目得分與要點：</h5>
                          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-2">
                            {activeSession.questions.map((q) => (
                              <div key={q.id} className="flex justify-between items-start text-xs border-b border-gray-150 pb-2">
                                <div className="space-y-1">
                                  <span className="font-semibold text-gray-800">{q.title} <span className="text-[#8C887D] font-normal">({q.category})</span></span>
                                  {q.subjectAnswerText && (
                                    <p className="text-[11px] text-amber-700">✍️ 紀錄：{q.subjectAnswerText}</p>
                                  )}
                                  {q.assessorNotes && (
                                    <p className="text-[11px] text-[#8C887D]">📋 醫事註解：{q.assessorNotes}</p>
                                  )}
                                </div>
                                <span className="font-mono text-gray-600 font-bold shrink-0">{q.score} / {q.maxScore}分</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                    </div>
                  ) : (
                    <div className="h-[400px] flex flex-col justify-center items-center text-center text-[#8C887D] p-6 space-y-3">
                      <Brain className="w-12 h-12 text-[#5C6E58]/20" />
                      <p className="text-xs">請點擊左側歷史篩檢紀錄，檢視細部的答對率、題目要點與醫療照護輔導報告。</p>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

        {/* --- SCREEN VIEW 3: PATIENT RECORDS BOOK --- */}
        {activeTab === "patients" && (
          <div className="bg-white border border-[#E5E2D9] rounded-2xl p-6 shadow-sm min-h-[500px]">
            <div className="flex items-center justify-between border-b border-[#F0EEE8] pb-4 mb-4">
              <div>
                <h3 className="text-xl font-serif text-[#2D2A26] italic font-bold font-serif">受測長輩個案資料名冊</h3>
                <p className="text-xs text-[#8C887D]">新增、編輯或管理在本系統紀錄進行認知缺陷評估之個案名單</p>
              </div>
              <button 
                onClick={() => setShowAddPatient(true)}
                className="px-4 py-2 bg-[#5C6E58] hover:bg-[#4a5947] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" /> 新增長輩檔案
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {patients.map((p) => {
                const patientSessions = sessions.filter(s => s.patientId === p.id);
                const averageScoreMMSE = patientSessions.filter(s => s.testType === EvaluationType.MMSE).map(s => s.scoreSummary?.total || 0);
                const cdtHistories = patientSessions.filter(s => s.testType === EvaluationType.CDT).map(s => s.scoreSummary?.total || 0);

                return (
                  <div 
                    key={p.id}
                    onClick={() => {
                      setSelectedPatientId(p.id);
                      setActiveTab("assess");
                    }}
                    className={`p-5 rounded-2xl border bg-[#F9F8F6] text-left transition relative flex flex-col justify-between hover:border-[#5C6E58] hover:shadow-xs cursor-pointer ${
                      selectedPatientId === p.id ? "border-[#5C6E58]/60 ring-1 ring-[#5C6E58]/20 bg-[#F2F4F2]" : "border-[#E5E2D9]"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-[#5C6E58] text-white flex items-center justify-center font-bold font-mono">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-md font-bold text-[#2D2A26]">{p.name}</h4>
                            <p className="text-[11px] text-gray-500">{p.gender} • {p.age} 歲</p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-white border border-[#D9D5CB] px-2 py-0.5 rounded text-[#5C6E58] font-semibold">
                          {p.education}
                        </span>
                      </div>

                      <div className="mt-4 space-y-2 text-xs text-gray-600 border-t border-[#E5E2D9] pt-4">
                        <p><strong className="text-gray-700">日常描述特徵：</strong></p>
                        <p className="text-[#8C887D] leading-relaxed italic bg-white p-2.5 rounded-lg border border-[#F0EEE8] text-[11px] line-clamp-3">
                          {p.notes || "尚未紀錄長輩的日常反常特質或主要原因。您可於建立檔案時備戴。"}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] bg-white p-2 rounded-lg border border-[#E5E2D9]">
                        <div>
                          <span className="text-[#8C887D] block">歷史測試數</span>
                          <strong className="text-sm font-semibold text-[#2D2A26]">{patientSessions.length} 次</strong>
                        </div>
                        <div>
                          <span className="text-[#8C887D] block">最近評量分數</span>
                          <strong className="text-sm font-semibold text-[#5C6E58]">
                            {patientSessions[0] ? `${patientSessions[0].scoreSummary?.total || 0}分` : "無"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#E5E2D9] mt-5 pt-3">
                      <span className="text-[11px] text-[#5C6E58] font-bold">點選以切換並開始測試 ➔</span>
                      <button 
                        onClick={(e) => handleDeletePatient(p.id, e)}
                        className="p-1 px-2 border border-red-100 rounded text-red-500 hover:bg-red-50 text-[10px]"
                        title="徹底刪除受測者"
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-auto bg-[#2D2A26] text-white py-6 px-6 border-t border-[#1C1A18]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#5C6E58] text-white flex items-center justify-center font-bold">C</div>
            <span className="text-[#8C887D]">認知功能評估與篩檢輔助系統 • 專業臨床管理版 v1.3</span>
          </div>

          <div className="flex gap-4 text-[#8C887D]">
            <span>臨床指引：心智簡易篩檢守門員 (MMSE與MoCA常模標準)</span>
            <span>•</span>
            <span>支援觸控式電子手寫筆劃鐘測驗 (CDT)</span>
          </div>

          <div className="flex items-center gap-2 text-[#8C887D]">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> 本地安全沙盒持久儲存
          </div>
        </div>
      </footer>
    </div>
  );
}
