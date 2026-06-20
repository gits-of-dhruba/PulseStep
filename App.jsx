import { useMemo, useState } from "react";
import {
  HeartPulse,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Users,
  Clock3,
  Wallet,
  MessageCircleHeart,
  CheckCircle2,
  KeyRound,
  Phone,
  CalendarDays,
  NotebookPen,
  BellRing,
  UserRound,
  ClipboardList
} from "lucide-react";
import { questions } from "./data/questions";
import { calculateBarrier } from "./utils/calculateBarrier";
import "./App.css";
import jsPDF from "jspdf";

function App() {
  const [screen, setScreen] = useState("welcome");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [answers, setAnswers] = useState({});
  const [selectedAction, setSelectedAction] = useState("");

  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleMode, setScheduleMode] = useState("Teleconsult");
  const [scheduleSaved, setScheduleSaved] = useState(false);

  const [buddyName, setBuddyName] = useState("");
  const [buddyReminderSent, setBuddyReminderSent] = useState(false);

  const [journalNote, setJournalNote] = useState("");
  const [symptomDuration, setSymptomDuration] = useState("");
  const [fearLevel, setFearLevel] = useState("2");
  const [journalSaved, setJournalSaved] = useState(false);

  const [redFlags, setRedFlags] = useState([]);
  const [emergencyConsent, setEmergencyConsent] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  const resultData = useMemo(() => {
    if (screen !== "result") return null;
    return calculateBarrier(answers, questions);
  }, [screen, answers]);

  const quickActions = [
    {
      id: "anonymous-help",
      icon: <MessageCircleHeart size={18} />,
      title: "Anonymous First Step",
      text: "Begin privately before committing to a consultation.",
      impact: "Mental well-being"
    },
    {
      id: "buddy-support",
      icon: <Users size={18} />,
      title: "Health Buddy Support",
      text: "Involve one trusted person who can support your next step.",
      impact: "Community health"
    },
    {
      id: "schedule-time",
      icon: <Clock3 size={18} />,
      title: "Smart Time Planning",
      text: "Turn hesitation into a simple scheduled action.",
      impact: "Preventive care"
    },
    {
      id: "low-cost-care",
      icon: <Wallet size={18} />,
      title: "Low-Cost Care View",
      text: "Reduce cost anxiety with affordable first-step options.",
      impact: "Early detection"
    }
  ];

  const selectedActionData = quickActions.find(
    (action) => action.id === selectedAction
  );

  const redFlagOptions = [
    "Severe chest pain",
    "Trouble breathing",
    "Fainting or loss of consciousness",
    "Sudden confusion or weakness",
    "Heavy bleeding",
    "Blood in vomit or stool",
    "High fever for several days",
    "Rapid worsening of symptoms"
  ];

  const hasUrgentRisk = redFlags.length > 0;

  const toggleRedFlag = (item) => {
    setEmergencyConsent(false);

    if (redFlags.includes(item)) {
      setRedFlags(redFlags.filter((flag) => flag !== item));
      return;
    }

    setRedFlags([...redFlags, item]);
  };

  const generatePdfReport = () => {
    if (!resultData) return;

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(20);
    doc.text("PulseStep Report", 20, y);
    y += 12;

    doc.setFontSize(11);
    doc.text(`Phone: ${phone || "Not provided"}`, 20, y);
    y += 8;
    doc.text(`Primary Barrier: ${resultData.result.title}`, 20, y);
    y += 8;
    doc.text(
      `Selected Action: ${selectedActionData?.title || "None selected"}`,
      20,
      y
    );
    y += 8;
    doc.text(
      `Impact Area: ${selectedActionData?.impact || "Not selected"}`,
      20,
      y
    );
    y += 8;
    doc.text(
      `Urgent Safety Check: ${hasUrgentRisk ? "Red flags selected" : "No red flags selected"}`,
      20,
      y
    );
    y += 14;

    doc.setFontSize(14);
    doc.text("Barrier Summary", 20, y);
    y += 8;

    doc.setFontSize(11);
    const descriptionLines = doc.splitTextToSize(
      resultData.result.description,
      170
    );
    doc.text(descriptionLines, 20, y);
    y += descriptionLines.length * 6 + 8;

    doc.setFontSize(14);
    doc.text("Recommended Next Steps", 20, y);
    y += 8;

    doc.setFontSize(11);
    resultData.result.steps.forEach((step, index) => {
      const stepLines = doc.splitTextToSize(`${index + 1}. ${step}`, 170);
      doc.text(stepLines, 20, y);
      y += stepLines.length * 6 + 4;
    });

    if (hasUrgentRisk) {
      y += 8;
      doc.setFontSize(14);
      doc.text("Red-Flag Safety Check", 20, y);
      y += 8;
      doc.setFontSize(11);

      redFlags.forEach((flag) => {
        doc.text(`- ${flag}`, 20, y);
        y += 7;
      });

      doc.text(
        `Safety guidance acknowledged: ${emergencyConsent ? "Yes" : "No"}`,
        20,
        y
      );
      y += 8;
    }

    if (scheduleSaved || buddyReminderSent || journalSaved) {
      y += 8;
      doc.setFontSize(14);
      doc.text("Support Tools Used", 20, y);
      y += 8;
      doc.setFontSize(11);

      if (scheduleSaved) {
        doc.text(
          `Scheduled Next Step: ${scheduleMode} on ${scheduleDate}`,
          20,
          y
        );
        y += 7;
      }

      if (buddyReminderSent) {
        doc.text(`Health Buddy: ${buddyName}`, 20, y);
        y += 7;
      }

      if (journalSaved) {
        doc.text(`Symptom Duration: ${symptomDuration}`, 20, y);
        y += 7;
        doc.text(`Fear Level: ${fearLevel}/5`, 20, y);
        y += 7;
      }
    }

    y += 10;
    doc.setFontSize(14);
    doc.text("Barrier Scores", 20, y);
    y += 8;

    doc.setFontSize(11);
    Object.entries(resultData.scores).forEach(([barrier, score]) => {
      doc.text(`${barrier.replaceAll("-", " ")}: ${score}`, 20, y);
      y += 7;
    });

    y += 10;
    doc.setFontSize(10);
    doc.text(
      "Generated by PulseStep - behavior-first healthcare action report",
      20,
      y
    );

    doc.save("pulsestep-report.pdf");
  };

  const handleSendOtp = () => {
    const cleanedPhone = phone.replace(/\D/g, "");

    if (cleanedPhone.length < 10) {
      alert("Please enter a valid mobile number.");
      return;
    }

    setOtpSent(true);
    setScreen("otp");
    alert("Demo OTP sent successfully. Use 123456 to continue.");
  };

  const handleVerifyOtp = () => {
    if (otp.trim() !== "123456") {
      alert("Invalid OTP. For demo, use 123456.");
      return;
    }

    setIsVerified(true);
    setScreen("assessment");
  };

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmitAssessment = () => {
    if (Object.keys(answers).length !== questions.length) {
      alert("Please answer all questions before continuing.");
      return;
    }

    setScreen("result");
  };

  const handleSaveSchedule = () => {
    if (!scheduleDate) {
      alert("Please choose a date for your next health step.");
      return;
    }

    setScheduleSaved(true);
  };

  const handleBuddyReminder = () => {
    if (!buddyName.trim()) {
      alert("Please enter your buddy name.");
      return;
    }

    setBuddyReminderSent(true);
  };

  const handleSaveJournal = () => {
    if (!journalNote.trim() || !symptomDuration.trim()) {
      alert("Please fill in your symptom note and duration.");
      return;
    }

    setJournalSaved(true);
  };

  const handleRestart = () => {
    setScreen("welcome");
    setPhone("");
    setOtp("");
    setOtpSent(false);
    setIsVerified(false);
    setAnswers({});
    setSelectedAction("");

    setScheduleDate("");
    setScheduleMode("Teleconsult");
    setScheduleSaved(false);

    setBuddyName("");
    setBuddyReminderSent(false);

    setJournalNote("");
    setSymptomDuration("");
    setFearLevel("2");
    setJournalSaved(false);

    setRedFlags([]);
    setEmergencyConsent(false);
  };

  const renderSupportPanel = () => {
    if (selectedAction === "anonymous-help") {
      return (
        <div className="selected-panel">
          <h4>Anonymous first-step support</h4>
          <p>
            This path is designed for users who need privacy, emotional safety,
            and a low-pressure start before formal care.
          </p>
          <div className="mini-list">
            <div className="mini-item">Ask a health concern privately</div>
            <div className="mini-item">
              Understand what happens in a first consultation
            </div>
            <div className="mini-item">
              Save your concern and return when ready
            </div>
          </div>
        </div>
      );
    }

    if (selectedAction === "buddy-support") {
      return (
        <div className="selected-panel">
          <h4>Health buddy support</h4>
          <p>
            This path adds community support by making help-seeking feel less
            isolating.
          </p>
          <div className="mini-list">
            <div className="mini-item">
              Choose a trusted friend or family member
            </div>
            <div className="mini-item">
              Share one small action they can remind you about
            </div>
            <div className="mini-item">
              Turn hesitation into shared accountability
            </div>
          </div>
        </div>
      );
    }

    if (selectedAction === "schedule-time") {
      return (
        <div className="selected-panel">
          <h4>Smart time planning</h4>
          <p>
            This path helps users who intend to act, but keep postponing due to
            routine pressure.
          </p>
          <div className="mini-list">
            <div className="mini-item">
              Tonight review your first-step care plan
            </div>
            <div className="mini-item">
              Tomorrow book a short teleconsult slot
            </div>
            <div className="mini-item">
              Weekend visit a clinic if symptoms continue
            </div>
          </div>
        </div>
      );
    }

    if (selectedAction === "low-cost-care") {
      return (
        <div className="selected-panel">
          <h4>Low-cost care guidance</h4>
          <p>
            This path reduces cost-related hesitation by making affordability
            visible early.
          </p>
          <div className="mini-list">
            <div className="mini-item">
              Teleconsult for a lower-cost first step
            </div>
            <div className="mini-item">
              Basic clinic visit for in-person reassurance
            </div>
            <div className="mini-item">
              Early care can reduce later treatment cost
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderRedFlagSafetyCheck = () => (
    <div className="selected-panel">
      <div className="feature-head">
        <div className="section-badge">Red-Flag Safety Check</div>
        <ShieldCheck size={18} />
      </div>

      <h4>Check for urgent warning signs</h4>
      <p>
        Before following a routine action plan, confirm whether any symptoms may
        need urgent medical attention today.
      </p>

      <div className="mini-list">
        {redFlagOptions.map((item) => (
          <button
            key={item}
            type="button"
            className={redFlags.includes(item) ? "option active" : "option"}
            onClick={() => toggleRedFlag(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {!hasUrgentRisk && (
        <div className="impact-summary">
          <h4>No urgent red flags selected</h4>
          <p>
            You can continue with your PulseStep action tools, but monitor your
            symptoms and seek care if anything gets worse.
          </p>
        </div>
      )}

      {hasUrgentRisk && (
        <div className="impact-summary emergency-panel">
          <h4>Urgent attention recommended</h4>
          <p>
            One or more warning signs were selected. This may need urgent
            medical attention, and PulseStep should not be the only next step.
          </p>

          <div className="mini-list">
            {redFlags.map((flag) => (
              <div key={flag} className="mini-item">
                {flag}
              </div>
            ))}
          </div>

          <label className="input-label">Acknowledge safety guidance</label>
          <div className="options">
            <button
              type="button"
              className={emergencyConsent ? "option active" : "option"}
              onClick={() => setEmergencyConsent(true)}
            >
              I understand I should seek urgent care
            </button>
            <button
              type="button"
              className={!emergencyConsent ? "option active" : "option"}
              onClick={() => setEmergencyConsent(false)}
            >
              Review symptoms again
            </button>
          </div>

          {emergencyConsent && (
            <div className="confidence-box">
              <h4>Recommended emergency action</h4>
              <ul>
                <li>Contact a nearby hospital, emergency service, or doctor now.</li>
                <li>Do not wait for a routine consult if symptoms feel severe.</li>
                <li>Ask a trusted person to stay with you or help you travel.</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderWelcomeScreen = () => (
    <div className="layout-grid">
      <div className="info-panel">
        <div className="brand">
          <HeartPulse size={28} />
          <h1>PulseStep</h1>
        </div>

        <p className="tagline">From hesitation to timely care.</p>
        <p className="intro">
          A behavior-first health companion that helps people overcome fear,
          stigma, uncertainty, cost concerns, and time pressure before they
          delay care.
        </p>

        <div className="pillars">
          <div className="pillar">
            <ShieldCheck size={18} />
            <span>Addresses emotional and psychological barriers</span>
          </div>
          <div className="pillar">
            <ShieldCheck size={18} />
            <span>Builds trust, comfort, and confidence</span>
          </div>
          <div className="pillar">
            <ShieldCheck size={18} />
            <span>Drives timely health action</span>
          </div>
        </div>

        <div className="demo-scenario">
          <h4>Demo scenario</h4>
          <p>
            A student notices recurring symptoms but delays action because of
            fear, uncertainty, and lack of time. PulseStep helps them take one
            safe next step.
          </p>
        </div>
      </div>

      <div className="content-panel">
        <div className="auth-card">
          <div className="section-badge">Secure sign-in</div>
          <h2>Continue with mobile number</h2>
          <p className="subtext">
            A simple login flow helps users save progress, access support tools,
            and receive follow-up nudges.
          </p>

          <label className="input-label">Mobile number</label>
          <div className="input-wrap">
            <Phone size={18} />
            <input
              type="tel"
              placeholder="Enter your mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button className="primary-btn full-btn" onClick={handleSendOtp}>
            Send OTP
            <ArrowRight size={18} />
          </button>

          <p className="helper-text">
            Demo note: this is a mock OTP flow for hackathon presentation. Use
            OTP <strong>123456</strong>.
          </p>
        </div>
      </div>
    </div>
  );

  const renderOtpScreen = () => (
    <div className="single-panel-wrap">
      <div className="auth-card compact-card">
        <div className="section-badge">OTP verification</div>
        <h2>Verify your mobile number</h2>
        <p className="subtext">
          We sent a one-time code to <strong>{phone}</strong>. Enter it below to
          continue.
        </p>

        <label className="input-label">Enter OTP</label>
        <div className="input-wrap">
          <KeyRound size={18} />
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>

        <button className="primary-btn full-btn" onClick={handleVerifyOtp}>
          Verify & Continue
          <ArrowRight size={18} />
        </button>

        <button
          className="secondary-btn top-gap"
          onClick={() => setScreen("welcome")}
        >
          Back
        </button>

        <p className="helper-text">
          For demo, enter OTP: <strong>123456</strong>
        </p>
      </div>
    </div>
  );

  const renderAssessmentScreen = () => (
    <div className="single-panel-wrap">
      <div className="quiz-card wide-card">
        <div className="top-row">
          <div>
            <div className="section-badge">Assessment</div>
            <h2>Behavior Check-In</h2>
          </div>
          {isVerified && <div className="verified-chip">Verified user</div>}
        </div>

        <div className="progress-wrap">
          <div className="progress-top">
            <span>Check-in progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <p className="subtext">
          This assessment helps identify the emotional or practical barrier that
          may be delaying your next health step.
        </p>

        {questions.map((question, index) => (
          <div className="question-card" key={question.id}>
            <p className="question-number">Question {index + 1}</p>
            <h3>{question.text}</h3>

            <div className="options">
              {[0, 1, 2, 3].map((value) => (
                <button
                  key={value}
                  className={
                    answers[question.id] === value ? "option active" : "option"
                  }
                  onClick={() => handleAnswer(question.id, value)}
                >
                  {["Not me", "A little", "Often", "Very true"][value]}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button className="primary-btn" onClick={handleSubmitAssessment}>
          View My Action Plan
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );

  const renderResultScreen = () => (
    <div className="single-panel-wrap">
      <div className="result-card wide-card">
        <div className="success-banner">
          <CheckCircle2 size={18} />
          <span>Check-in complete</span>
        </div>

        <h2>Your hesitation pattern</h2>

        <div className="result-box">
          <h3>{resultData.result.title}</h3>
          <p>{resultData.result.description}</p>
        </div>

        <div className="confidence-box">
          <h4>Interpretation</h4>
          <p>
            You may not be avoiding healthcare completely. You may simply need a
            first step that feels safer, simpler, and more manageable.
          </p>
        </div>

        <div className="steps-box">
          <h4>Recommended next steps</h4>
          <ul>
            {resultData.result.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>

        <div className="action-grid">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className={
                selectedAction === action.id
                  ? "action-card active-action"
                  : "action-card"
              }
              onClick={() => setSelectedAction(action.id)}
            >
              <div className="action-icon">{action.icon}</div>
              <div>
                <h4>{action.title}</h4>
                <p>{action.text}</p>
                <span className="impact-tag">{action.impact}</span>
              </div>
            </button>
          ))}
        </div>

        {selectedActionData && (
          <div className="impact-summary">
            <h4>Impact area supported</h4>
            <p>
              This action contributes to:{" "}
              <strong>{selectedActionData.impact}</strong>
            </p>
          </div>
        )}

        {renderSupportPanel()}

        {renderRedFlagSafetyCheck()}

        <div className="feature-stack">
          <div className="selected-panel">
            <div className="feature-head">
              <div className="section-badge">Action Scheduler</div>
              <CalendarDays size={18} />
            </div>
            <h4>Plan your next health step</h4>
            <p>
              Turn hesitation into a time-bound commitment by choosing when and
              how you want to take your next step.
            </p>

            <label className="input-label">Choose date</label>
            <div className="input-wrap">
              <CalendarDays size={18} />
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => {
                  setScheduleDate(e.target.value);
                  setScheduleSaved(false);
                }}
              />
            </div>

            <label className="input-label">Preferred first step</label>
            <div className="options">
              {["Teleconsult", "Clinic visit", "Talk to someone"].map((mode) => (
                <button
                  key={mode}
                  className={scheduleMode === mode ? "option active" : "option"}
                  onClick={() => {
                    setScheduleMode(mode);
                    setScheduleSaved(false);
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button className="primary-btn top-gap" onClick={handleSaveSchedule}>
              Save action plan
              <ArrowRight size={18} />
            </button>

            {scheduleSaved && (
              <div className="impact-summary">
                <h4>Plan saved</h4>
                <p>
                  Your next step is scheduled for{" "}
                  <strong>{scheduleDate}</strong> via{" "}
                  <strong>{scheduleMode}</strong>.
                </p>
              </div>
            )}
          </div>

          <div className="selected-panel">
            <div className="feature-head">
              <div className="section-badge">Buddy Reminder</div>
              <BellRing size={18} />
            </div>
            <h4>Choose one trusted health buddy</h4>
            <p>
              Asking one trusted person to check in can reduce delay, denial,
              and isolation.
            </p>

            <label className="input-label">Buddy name</label>
            <div className="input-wrap">
              <UserRound size={18} />
              <input
                type="text"
                placeholder="Enter your buddy name"
                value={buddyName}
                onChange={(e) => {
                  setBuddyName(e.target.value);
                  setBuddyReminderSent(false);
                }}
              />
            </div>

            <button
              className="primary-btn top-gap"
              onClick={handleBuddyReminder}
            >
              Create buddy reminder
              <ArrowRight size={18} />
            </button>

            {buddyReminderSent && (
              <div className="impact-summary">
                <h4>Reminder ready</h4>
                <p>
                  Message for <strong>{buddyName}</strong>: “Please check whether
                  I took my next health step this week.”
                </p>
              </div>
            )}
          </div>

          <div className="selected-panel">
            <div className="feature-head">
              <div className="section-badge">Private Journal</div>
              <NotebookPen size={18} />
            </div>
            <h4>Log symptoms privately</h4>
            <p>
              A short note can help users express uncertainty, monitor change,
              and feel more prepared before seeking care.
            </p>

            <label className="input-label">Symptom duration</label>
            <div className="input-wrap">
              <ClipboardList size={18} />
              <input
                type="text"
                placeholder="Example: 3 days / 2 weeks"
                value={symptomDuration}
                onChange={(e) => {
                  setSymptomDuration(e.target.value);
                  setJournalSaved(false);
                }}
              />
            </div>

            <label className="input-label">Private note</label>
            <div className="input-wrap textarea-wrap">
              <NotebookPen size={18} />
              <textarea
                placeholder="Write how you have been feeling, what symptoms you noticed, or what worries you most."
                value={journalNote}
                onChange={(e) => {
                  setJournalNote(e.target.value);
                  setJournalSaved(false);
                }}
                rows={4}
              />
            </div>

            <label className="input-label">Fear level</label>
            <div className="options">
              {["1", "2", "3", "4", "5"].map((level) => (
                <button
                  key={level}
                  className={fearLevel === level ? "option active" : "option"}
                  onClick={() => {
                    setFearLevel(level);
                    setJournalSaved(false);
                  }}
                >
                  {level}
                </button>
              ))}
            </div>

            <button className="primary-btn top-gap" onClick={handleSaveJournal}>
              Save private journal
              <ArrowRight size={18} />
            </button>

            {journalSaved && (
              <div className="impact-summary">
                <h4>Journal saved</h4>
                <p>
                  Your note has been saved with symptom duration{" "}
                  <strong>{symptomDuration}</strong> and fear level{" "}
                  <strong>{fearLevel}/5</strong>.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="score-box">
          <h4>Barrier scores</h4>
          {Object.entries(resultData.scores).map(([barrier, score]) => (
            <div key={barrier} className="score-row">
              <span>{barrier.replaceAll("-", " ")}</span>
              <strong>{score}</strong>
            </div>
          ))}
        </div>

        <div className="result-actions">
          <button className="primary-btn top-gap" onClick={generatePdfReport}>
            Download PDF Report
          </button>
          <button className="secondary-btn top-gap" onClick={handleRestart}>
            <RotateCcw size={18} />
            Restart Demo
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      {screen === "welcome" && renderWelcomeScreen()}
      {screen === "otp" && otpSent && renderOtpScreen()}
      {screen === "assessment" && renderAssessmentScreen()}
      {screen === "result" && resultData && renderResultScreen()}
    </div>
  );
}

export default App;