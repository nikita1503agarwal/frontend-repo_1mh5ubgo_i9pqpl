import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowRight, Compass, Zap, AlertCircle } from 'lucide-react';
import Spline from '@splinetool/react-spline';

function App() {
  // Global flow state
  const [gate, setGate] = useState('oath'); // oath | fund | app
  const [screen, setScreen] = useState('landing'); // landing | assessment | results | atlas

  // Dev helpers: allow URL params to jump to stages quickly
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const dev = params.get('dev');
      const stage = params.get('stage'); // oath | fund | app
      const view = params.get('screen'); // landing | assessment | results | atlas

      if (stage === 'oath' || stage === 'fund' || stage === 'app') {
        setGate(stage);
      } else if (dev === '1' || dev === 'true') {
        setGate('app');
      }

      if (view === 'landing' || view === 'assessment' || view === 'results' || view === 'atlas') {
        setScreen(view);
      }
    } catch {}
  }, []);

  // Assessment state
  const [answers, setAnswers] = useState([]);
  const [clarityScore, setClarityScore] = useState(0);
  const [archetype, setArchetype] = useState({});

  // Atlas state
  const [atlasConversation, setAtlasConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Track variations to avoid repeating same response
  const atlasCycleRef = useRef({}); // key -> next index
  const lastInteractionRef = useRef(Date.now());

  // Logo fallback handling
  const [logoOk, setLogoOk] = useState(true);
  const logoSrc = useMemo(() => '/Tellios Logo Dark Updated.png', []);

  const questions = [
    {
      id: 1,
      text: 'When do you feel most alive?',
      options: [
        { text: 'Building something from nothing', value: 'A' },
        { text: 'Protecting or serving others', value: 'B' },
        { text: 'Sharing knowledge or guiding', value: 'C' },
        { text: 'Alone in deep reflection', value: 'D' },
      ],
    },
    {
      id: 2,
      text: 'A close friend calls in crisis. Your first instinct?',
      options: [
        { text: 'Help them create a plan to solve it', value: 'A' },
        { text: 'Drop everything and be there physically', value: 'B' },
        { text: 'Listen deeply and help them find their answer', value: 'C' },
        { text: 'Give them space but offer resources', value: 'D' },
      ],
    },
    {
      id: 3,
      text: 'How would you want to be remembered?',
      options: [
        { text: 'He built something that outlasted him', value: 'A' },
        { text: 'He showed up when it mattered—protected and served', value: 'B' },
        { text: 'He changed lives through wisdom', value: 'C' },
        { text: 'He lived with complete authenticity', value: 'D' },
      ],
    },
    {
      id: 4,
      text: 'Which challenge excites you most?',
      options: [
        { text: 'Starting a business or creating something new', value: 'A' },
        { text: 'Mastering a difficult physical or tactical skill', value: 'B' },
        { text: 'Understanding complex topics deeply', value: 'C' },
        { text: 'Exploring philosophical or existential questions', value: 'D' },
      ],
    },
    {
      id: 5,
      text: 'What frustrates you most about the world?',
      options: [
        { text: 'Inefficiency and broken systems', value: 'A' },
        { text: 'Injustice and weakness being exploited', value: 'B' },
        { text: 'Ignorance and people staying stuck', value: 'C' },
        { text: 'Superficiality and inauthenticity', value: 'D' },
      ],
    },
    {
      id: 6,
      text: "With 6 months free, you'd spend most time...",
      options: [
        { text: 'Building a project, business, or creative work', value: 'A' },
        { text: 'Training, traveling to challenging environments', value: 'B' },
        { text: 'Learning deeply and mentoring others', value: 'C' },
        { text: 'Reflecting, writing, exploring ideas', value: 'D' },
      ],
    },
    {
      id: 7,
      text: 'In a team working on a hard problem, you...',
      options: [
        { text: 'Design the strategy others miss', value: 'A' },
        { text: 'Take the hardest task and execute relentlessly', value: 'B' },
        { text: 'Ensure everyone understands and mentor them', value: 'C' },
        { text: "Ask if we're solving the right problem", value: 'D' },
      ],
    },
    {
      id: 8,
      text: 'What drives you more than anything?',
      options: [
        { text: 'Turning vision into tangible reality', value: 'A' },
        { text: 'Being someone others can count on', value: 'B' },
        { text: 'Helping others see truth they missed', value: 'C' },
        { text: 'Living in complete alignment with my values', value: 'D' },
      ],
    },
    {
      id: 9,
      text: 'Which secretly scares you most?',
      options: [
        { text: 'Dying without building something meaningful', value: 'A' },
        { text: 'Being weak when someone needs me', value: 'B' },
        { text: 'Staying mentally stagnant', value: 'C' },
        { text: "Living a life that isn't truly mine", value: 'D' },
      ],
    },
    {
      id: 10,
      text: 'Right now, which project would you start today?',
      options: [
        { text: 'Launch a business or creative venture', value: 'A' },
        { text: 'Train for something physically demanding', value: 'B' },
        { text: 'Create a course or start teaching', value: 'C' },
        { text: "None of these—I'm still searching", value: 'D' },
      ],
    },
  ];

  const calculateScore = (responses) => {
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    responses.forEach((r) => (counts[r]++));

    const total = counts.A + counts.B + counts.C;
    const builderPct = total > 0 ? Math.round((counts.A / total) * 100) : 0;
    const warriorPct = total > 0 ? Math.round((counts.B / total) * 100) : 0;
    const teacherPct = total > 0 ? Math.round((counts.C / total) * 100) : 0;

    const clarity = Math.round(
      (Math.max(counts.A, counts.B, counts.C) / 10) * 40 +
        (responses[2] !== 'D' && responses[7] !== 'D' && responses[8] !== 'D' ? 30 : 15) +
        (responses[9] !== 'D' ? 30 : 10)
    );

    return {
      clarity: Math.min(clarity, 100),
      builder: builderPct,
      warrior: warriorPct,
      teacher: teacherPct,
      primary:
        counts.A > counts.B && counts.A > counts.C
          ? 'Builder'
          : counts.B > counts.A && counts.B > counts.C
          ? 'Warrior'
          : 'Teacher',
    };
  };

  // Handle selecting an answer and moving forward
  const handleAnswer = (value) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (newAnswers.length >= 10) {
      const result = calculateScore(newAnswers);
      setClarityScore(result.clarity);
      setArchetype({
        builder: result.builder,
        warrior: result.warrior,
        teacher: result.teacher,
        primary: result.primary,
      });
      // Small delay for UX polish then show results
      setTimeout(() => setScreen('results'), 150);
    }
  };

  // Atlas response bank with variants
  const atlasBank = {
    default: [
      "That's a real question. Let's dig deeper. What's driving this?",
      'Slow down. Name the tension in one sentence.',
      'Be specific. What outcome do you actually want?',
    ],
    purpose: [
      "Purpose isn't found—it's built. What's your next concrete action?",
      'Your purpose hides in your patterns. Where do you consistently show up strong?',
      'Purpose requires constraint. What will you stop doing this week?',
    ],
    fear: [
      'Fear points to what matters. Name it precisely.',
      "You don't beat fear by thinking—by moving. What is the smallest step? ",
      'Courage is commitment to action under uncertainty. What will you do today?',
    ],
    quit: [
      'Are you quitting the grind or the goal? Those are different. Which is it?',
      'If you pause, what will you do with the energy you get back?',
      'Before stopping, define your finish line. What would “done” look like?',
    ],
    build: [
      "Good. Define step one so small it's embarrassing.",
      "Block 45 minutes on your calendar now. What will you build in that time?",
      "Who can hold you accountable for this week's target?",
    ],
    navigate: [
      'I can take you there. Want to go to the main interface now?',
      'Ready to move? I can guide you to the interface.',
      "Let's jump into the app. Do you want the main screen?",
    ],
  };

  const nextVariant = (key) => {
    const list = atlasBank[key] || atlasBank.default;
    const cur = atlasCycleRef.current[key] || 0;
    const text = list[cur % list.length];
    atlasCycleRef.current[key] = (cur + 1) % list.length;
    return text;
  };

  const decideAtlasKey = (text) => {
    const t = text.toLowerCase();
    if (/(home|main|interface|dashboard|go back)/.test(t)) return 'navigate';
    if (/(purpose|meaning|mission)/.test(t)) return 'purpose';
    if (/(fear|afraid|scared|anxious|doubt)/.test(t)) return 'fear';
    if (/(quit|leave|give up|stop)/.test(t)) return 'quit';
    if (/(build|start|begin|launch|create)/.test(t)) return 'build';
    return 'default';
  };

  const handleAtlasMessage = () => {
    const text = userInput.trim();
    if (!text) return;

    lastInteractionRef.current = Date.now();

    const key = decideAtlasKey(text);
    const response = nextVariant(key);

    const newConversation = [
      ...atlasConversation,
      { role: 'user', text },
      { role: 'atlas', text: response },
    ];
    setAtlasConversation(newConversation);

    // If user asks to navigate, immediately offer quick actions and move
    if (key === 'navigate') {
      setTimeout(() => {
        setAtlasConversation((prev) => [
          ...prev,
          { role: 'atlas', text: 'Taking you to the main interface. You can always come back to chat.' },
        ]);
        setScreen('landing');
        setGate('app');
      }, 300);
    }

    setUserInput('');
  };

  // Auto guidance: when arriving in ATLAS, seed tailored guidance and optionally route to main interface
  useEffect(() => {
    if (gate === 'app' && screen === 'atlas' && currentUser && atlasConversation.length === 0) {
      const intro = `Your clarity score: ${currentUser.clarity}%. Primary: ${currentUser.archetype}.`;

      const guideByArchetype = {
        Builder: "You execute through creation. Let's get you building—start with the first small step.",
        Warrior: 'Discipline is your edge. Channel it into a concrete target this week.',
        Teacher: 'Your leverage is insight. Turn one idea into a system someone else can follow.',
      };

      const tailored = guideByArchetype[currentUser.archetype] || "Let's get aligned and moving.";
      const cta = currentUser.clarity >= 80
        ? "You're ready. I'll take you to the main interface now."
        : 'Want me to take you to the main interface to continue?';

      setAtlasConversation([
        { role: 'atlas', text: intro },
        { role: 'atlas', text: tailored },
        { role: 'atlas', text: cta },
      ]);

      // Auto-route for high clarity if user doesn\'t interact quickly
      if (currentUser.clarity >= 80) {
        const start = Date.now();
        setTimeout(() => {
          const inactive = Date.now() - Math.max(lastInteractionRef.current, start) > 1000;
          if (inactive && gate === 'app' && screen === 'atlas') {
            setScreen('landing');
            setGate('app');
          }
        }, 1500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gate, screen, currentUser]);

  // Elegant wrapper + background
  const Background = ({ children }) => (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 opacity-[0.35]" style={{
        background:
          'radial-gradient(1200px 1200px at 50% 0%, rgba(124,58,237,0.15), transparent 60%), radial-gradient(900px 900px at 100% 0%, rgba(14,165,233,0.12), transparent 55%), radial-gradient(900px 900px at 0% 10%, rgba(251,191,36,0.10), transparent 50%)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background:
          'radial-gradient(700px 700px at 50% 50%, rgba(234,179,8,0.06), transparent 60%)',
      }} />
      <div className="relative z-10">{children}</div>
    </div>
  );

  // Header with logo and brand (fallback if logo missing)
  const Header = () => (
    <header className="pt-10 pb-4">
      <div className="max-w-6xl mx-auto px-6 flex items-center gap-4">
        {logoOk ? (
          <img
            src={logoSrc}
            alt="TELIOS"
            className="h-10 w-auto object-contain"
            onError={() => setLogoOk(false)}
          />
        ) : (
          <div className="text-white/90 font-['Playfair Display',serif] text-2xl tracking-wide">TELIOS</div>
        )}
        <span className="ml-auto text-xs text-slate-400 tracking-widest">PURPOSE • CLARITY • DISCIPLINE</span>
      </div>
    </header>
  );

  // OATH GATE
  if (gate === 'oath') {
    return (
      <Background>
        <Header />
        <main className="max-w-3xl mx-auto px-6 pb-24">
          <section className="relative rounded-3xl border border-amber-500/20 bg-slate-900/40 backdrop-blur-md p-8 md:p-12 shadow-[0_0_40px_rgba(234,179,8,0.08)]">
            <div className="absolute inset-x-0 -top-28 h-64 pointer-events-none">
              <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
            </div>

            <div className="text-center mt-40 space-y-2">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white/95 font-['Playfair Display',serif]">The TELIOS Oath</h1>
              <p className="text-slate-300">Read carefully. This is a commitment to yourself.</p>
            </div>

            <div className="mt-8 space-y-6 text-slate-200 leading-relaxed">
              <p>I declare that I am responsible for my life, my actions, and my outcomes.</p>
              <p>I choose to live with purpose, clarity, and discipline.</p>
              <p>I commit to confronting my weaknesses with honesty and courage.</p>
              <p>I commit to the daily actions required to become the man I am meant to be.</p>
              <p>I agree to be accountable to myself, my commitments, and my path.</p>
              <p>I understand that excuses are the enemy of my potential.</p>
              <p>I accept the guidance of ATLAS with openness and integrity.</p>
              <p>I step forward as a man who aligns action with purpose.</p>
              <p>From this moment on, I live in accordance with the principles of TELIOS.</p>
              <p className="font-medium text-amber-300">I accept this oath.</p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => setGate('fund')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold py-3 px-6 rounded-lg transition shadow-sm"
              >
                I Accept
              </button>
              <button
                onClick={() => setGate('stopped')}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg border border-slate-700 transition"
              >
                I Do Not Accept
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => setGate('app')}
                className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
                aria-label="Skip for now and go to the app"
              >
                Skip for now → Go to the app
              </button>
            </div>

            <p className="mt-8 text-xs text-slate-400 border-t border-slate-800 pt-6">
              Nothing in the TELIOS Oath or Commitment Fund constitutes a legal contract or financial investment. The Oath is a personal declaration. The Commitment Fund is a voluntary behavioral tool, fully refundable, and may be withdrawn by the user at any time. TELIOS does not assume liability for personal decisions, financial choices, or emotional outcomes. This platform offers guidance, structure, and support — not medical, legal, financial, or psychological treatment.
            </p>
          </section>
        </main>
      </Background>
    );
  }

  if (gate === 'stopped') {
    return (
      <Background>
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <p className="text-slate-300">Access denied. You must accept the Oath to proceed.</p>
        </div>
      </Background>
    );
  }

  // Commitment Fund step
  if (gate === 'fund') {
    return (
      <Background>
        <Header />
        <main className="max-w-3xl mx-auto px-6 pb-24">
          <section className="rounded-3xl border border-amber-500/20 bg-slate-900/40 backdrop-blur-md p-8 md:p-12 shadow-[0_0_40px_rgba(234,179,8,0.08)]">
            <div className="flex items-center gap-3 mb-6 text-amber-300">
              <Zap className="w-5 h-5" />
              <span className="tracking-wide text-sm">TELIOS Commitment Fund</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-semibold text-white/95 mb-4 font-['Playfair Display',serif]">Skin in the Game</h2>
            <p className="text-slate-300 leading-relaxed">
              To strengthen your commitment, TELIOS uses the Commitment Fund. You contribute $100. This contribution is fully refundable. You earn back the full amount through daily consistency, weekly completion, and monthly alignment. Your fund is held in your TELIOS Account and can be withdrawn at any time.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              If you choose, you may allocate any portion of your fund to: your personal refund, future commitment cycles, the TELIOS Solidarity Fund (supporting men who cannot afford the program), or a cause aligned with your values. This system is not a penalty. It is a reinforcement mechanism. It ensures you have skin in the game, and that your commitment holds weight.
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => setGate('app')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold py-3 px-6 rounded-lg transition shadow-sm"
              >
                I Understand. Proceed
              </button>
              <button
                onClick={() => setGate('stopped')}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg border border-slate-700 transition"
              >
                Cancel
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => setGate('app')}
                className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
                aria-label="Skip for now and go to the app"
              >
                Skip for now → Go to the app
              </button>
            </div>

            <p className="mt-8 text-xs text-slate-400 border-t border-slate-800 pt-6">
              Nothing in the TELIOS Oath or Commitment Fund constitutes a legal contract or financial investment. The Oath is a personal declaration. The Commitment Fund is a voluntary behavioral tool, fully refundable, and may be withdrawn by the user at any time. TELIOS does not assume liability for personal decisions, financial choices, or emotional outcomes. This platform offers guidance, structure, and support — not medical, legal, financial, or psychological treatment.
            </p>
          </section>
        </main>
      </Background>
    );
  }

  // Once commitment acknowledged, proceed to main app
  if (gate === 'app' && screen === 'landing') {
    return (
      <Background>
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1 space-y-8">
            <div className="inline-flex items-center gap-2 text-amber-300/90">
              <Compass className="w-5 h-5" />
              <span className="tracking-wide text-sm">The Purpose Operating System for Men</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-semibold leading-tight font-['Playfair Display',serif]">
              TELIOS
            </h1>
            <p className="text-lg text-slate-300 max-w-prose">
              You don't have a discipline problem. You have a purpose problem. Discover your mission. Live it daily.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: '🔨', title: 'Builder', desc: 'Create systems and businesses' },
                { icon: '⚔️', title: 'Warrior', desc: 'Protect, serve, and lead' },
                { icon: '📚', title: 'Teacher', desc: 'Guide and illuminate' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-slate-900/50 backdrop-blur border border-amber-500/10 rounded-xl p-5 text-center hover:border-amber-400/40 transition"
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h4 className="font-semibold mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>

            <div>
              <button
                onClick={() => setScreen('assessment')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold py-4 px-8 rounded-lg inline-flex items-center gap-2 text-lg transition shadow-sm"
              >
                Discover Your Purpose <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-slate-400 text-sm mt-3">3 minutes to clarity</p>
            </div>

            <div className="bg-slate-900/50 border border-amber-500/10 rounded-xl p-6 space-y-3">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium">The Problem</p>
                  <p className="text-slate-400 text-sm">
                    Most men work jobs that drain them. Chase goals society gave them. Feel successful on paper but empty inside. You know you're capable of more—you just don't know what or why.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 min-h-[420px] relative">
            <div className="absolute inset-0 rounded-3xl overflow-hidden border border-amber-500/20 bg-slate-900/40 backdrop-blur shadow-[0_0_40px_rgba(234,179,8,0.08)]">
              <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>
      </Background>
    );
  }

  // Assessment Screen
  if (gate === 'app' && screen === 'assessment') {
    const currentQ = questions[answers.length];
    const progress = Math.round((answers.length / 10) * 100);

    return (
      <Background>
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <p className="text-slate-400">Question {answers.length + 1} of 10</p>
              <p className="font-semibold text-amber-400">{progress}%</p>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-slate-900/50 backdrop-blur p-8 space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-center font-['Playfair Display',serif]">{currentQ.text}</h2>

            <div className="space-y-3">
              {currentQ.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full text-left p-4 rounded-lg border border-slate-700 hover:border-amber-400/50 hover:bg-slate-800 transition font-medium"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Background>
    );
  }

  // Results Screen
  if (gate === 'app' && screen === 'results') {
    const messages = {
      high: 'You know your direction. Time for execution.',
      medium: "You're close. Some refinement needed.",
      low: "You're searching—and that's where discovery begins.",
      verylow: "You're in the wilderness. Let's find your North Star.",
    };

    const messageLevel =
      clarityScore >= 85 ? 'high' : clarityScore >= 60 ? 'medium' : clarityScore >= 40 ? 'low' : 'verylow';
    const message = messages[messageLevel];

    return (
      <Background>
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-semibold font-['Playfair Display',serif]">Your Purpose Profile</h2>

            <div className="rounded-2xl border border-amber-500/20 bg-slate-900/50 backdrop-blur p-8 space-y-2">
              <p className="text-slate-400 tracking-wide">PURPOSE CLARITY SCORE</p>
              <p className="text-6xl font-bold text-amber-400">{clarityScore}%</p>
              <p className="text-slate-300 pt-2">{message}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-slate-900/50 backdrop-blur p-8 space-y-6">
            <h3 className="text-xl font-semibold">Your Archetype Profile</h3>

            {[
              { icon: '🔨', name: 'Builder', score: archetype.builder },
              { icon: '⚔️', name: 'Warrior', score: archetype.warrior },
              { icon: '📚', name: 'Teacher', score: archetype.teacher },
            ].map((arch, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{arch.icon} {arch.name}</span>
                  <span className="text-amber-400">{arch.score}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${arch.score}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-slate-900/50 backdrop-blur p-6 space-y-3">
            <p className="text-sm text-slate-300">
              <strong>Primary:</strong> {archetype.primary}
            </p>
            <p className="text-slate-400 text-sm">
              Most men are hybrids. Your results show where your strengths lie—not a box you're locked into.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setScreen('atlas');
                setCurrentUser({ archetype: archetype.primary, clarity: clarityScore });
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold py-4 rounded-lg transition"
            >
              Meet ATLAS - Your AI Mentor
            </button>
            <button
              onClick={() => {
                setScreen('landing');
                setAnswers([]);
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-4 rounded-lg border border-slate-700 transition"
            >
              Start Over
            </button>
          </div>
        </div>
      </Background>
    );
  }

  // ATLAS Mentor Screen
  if (gate === 'app' && screen === 'atlas' && currentUser) {
    return (
      <Background>
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-7 h-7 text-amber-400" />
            <h2 className="text-2xl font-semibold tracking-tight">ATLAS</h2>
            <p className="text-slate-400 ml-auto text-sm">Your Purpose Mentor</p>
          </div>

          {atlasConversation.length === 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-slate-900/50 backdrop-blur p-8 text-center space-y-3">
              <p className="text-lg">
                Your clarity score: <span className="font-bold text-amber-400">{currentUser.clarity}%</span>
              </p>
              <p className="text-slate-400">
                {currentUser.clarity >= 80
                  ? "You're ready. Execute. What's your first move?"
                  : currentUser.clarity >= 60
                  ? "You're on the path. What question are you wrestling with?"
                  : "You're searching. What feels most unclear right now?"}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-amber-500/20 bg-slate-900/50 backdrop-blur p-6 space-y-4 max-h-96 overflow-y-auto">
            {atlasConversation.map((msg, i) => (
              <div key={i} className={`space-y-2 ${msg.role === 'atlas' ? '' : 'text-right'}`}>
                <p className={`text-xs font-semibold ${msg.role === 'atlas' ? 'text-amber-400' : 'text-slate-400'}`}>
                  {msg.role === 'atlas' ? 'ATLAS' : 'You'}
                </p>
                <p className={`p-3 rounded-lg ${msg.role === 'atlas' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-slate-800 border border-slate-700'}`}>
                  {msg.text}
                </p>
              </div>
            ))}
          </div>

          {/* Quick actions to lead user to main interface and features */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => { setGate('app'); setScreen('landing'); }}
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg py-2"
            >
              Main Interface
            </button>
            <button
              onClick={() => setScreen('assessment')}
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg py-2"
            >
              Start Assessment
            </button>
            <button
              onClick={() => setScreen('results')}
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg py-2"
            >
              View Results
            </button>
            <button
              onClick={() => { setAtlasConversation([]); setUserInput(''); }}
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg py-2"
            >
              Clear Chat
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => { setUserInput(e.target.value); lastInteractionRef.current = Date.now(); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { lastInteractionRef.current = Date.now(); handleAtlasMessage(); } }}
              placeholder="Ask ATLAS... (try: home, build, purpose, fear, quit)"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={() => { lastInteractionRef.current = Date.now(); handleAtlasMessage(); }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-6 rounded-lg transition"
            >
              Send
            </button>
          </div>

          <button
            onClick={() => {
              setScreen('landing');
              setAnswers([]);
              setAtlasConversation([]);
            }}
            className="w-full text-slate-400 hover:text-white py-2 transition text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </Background>
    );
  }

  return null;
}

export default App;
