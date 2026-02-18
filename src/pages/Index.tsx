import { useState, useCallback } from "react";
import { categories } from "@/data/questions";
import CategoryCard from "@/components/CategoryCard";
import QuizGame from "@/components/QuizGame";
import ResultScreen from "@/components/ResultScreen";
import Icon from "@/components/ui/icon";

type Screen = "home" | "quiz" | "result";

interface GameState {
  answeredByCategory: Record<string, Set<number>>;
  totalScore: number;
}

const loadState = (): GameState => {
  try {
    const raw = localStorage.getItem("info-quiz-state");
    if (!raw) return { answeredByCategory: {}, totalScore: 0 };
    const parsed = JSON.parse(raw);
    const answeredByCategory: Record<string, Set<number>> = {};
    for (const [key, val] of Object.entries(parsed.answeredByCategory || {})) {
      answeredByCategory[key] = new Set(val as number[]);
    }
    return { answeredByCategory, totalScore: parsed.totalScore || 0 };
  } catch {
    return { answeredByCategory: {}, totalScore: 0 };
  }
};

const saveState = (state: GameState) => {
  const serializable: Record<string, number[]> = {};
  for (const [key, val] of Object.entries(state.answeredByCategory)) {
    serializable[key] = Array.from(val);
  }
  localStorage.setItem(
    "info-quiz-state",
    JSON.stringify({ answeredByCategory: serializable, totalScore: state.totalScore })
  );
};

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(loadState);
  const [screen, setScreen] = useState<Screen>("home");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("");
  const [lastScore, setLastScore] = useState(0);
  const [lastTotal, setLastTotal] = useState(0);

  const activeCategory = categories.find((c) => c.id === activeCategoryId);
  const totalAnswered = Object.values(gameState.answeredByCategory).reduce((sum, s) => sum + s.size, 0);
  const totalQuestions = categories.reduce((sum, c) => sum + c.questions.length, 0);

  const handleSelectCategory = (id: string) => {
    setActiveCategoryId(id);
    setScreen("quiz");
  };

  const handleAnswer = useCallback(
    (questionId: number, _correct: boolean) => {
      setGameState((prev) => {
        const catSet = new Set(prev.answeredByCategory[activeCategoryId] || []);
        catSet.add(questionId);
        const next = {
          ...prev,
          answeredByCategory: { ...prev.answeredByCategory, [activeCategoryId]: catSet },
        };
        saveState(next);
        return next;
      });
    },
    [activeCategoryId]
  );

  const handleComplete = useCallback(
    (score: number, total: number) => {
      setLastScore(score);
      setLastTotal(total);
      setGameState((prev) => {
        const next = { ...prev, totalScore: prev.totalScore + score };
        saveState(next);
        return next;
      });
      setScreen("result");
    },
    []
  );

  const handleRetry = () => {
    setGameState((prev) => {
      const next = {
        ...prev,
        answeredByCategory: { ...prev.answeredByCategory, [activeCategoryId]: new Set<number>() },
      };
      saveState(next);
      return next;
    });
    setScreen("quiz");
  };

  const handleResetAll = () => {
    const fresh: GameState = { answeredByCategory: {}, totalScore: 0 };
    setGameState(fresh);
    saveState(fresh);
  };

  if (screen === "quiz" && activeCategory) {
    return (
      <div className="min-h-screen bg-game-gradient px-4 py-8">
        <QuizGame
          category={activeCategory}
          onBack={() => setScreen("home")}
          onComplete={handleComplete}
          answeredIds={gameState.answeredByCategory[activeCategoryId] || new Set()}
          onAnswer={handleAnswer}
        />
      </div>
    );
  }

  if (screen === "result" && activeCategory) {
    return (
      <div className="min-h-screen bg-game-gradient px-4 py-8">
        <ResultScreen
          score={lastScore}
          total={lastTotal}
          categoryTitle={activeCategory.title}
          categoryEmoji={activeCategory.emoji}
          onBack={() => setScreen("home")}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-gradient">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <header className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 card-glow">
            <Icon name="Rocket" size={18} className="text-primary" />
            <span className="text-sm font-semibold text-primary">Игра-викторина</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">
            <span className="text-gradient">Информатика</span>
            <br />
            <span className="text-foreground">для 5–6 классов</span>
          </h1>

          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Выбери тему и проверь свои знания! Вопросы идут от простого к сложному
          </p>
        </header>

        <div className="flex items-center justify-between mb-6 animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl card-glow">
              <Icon name="Star" size={16} className="text-amber-500" />
              <span className="text-sm font-bold">{gameState.totalScore} очков</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl card-glow">
              <Icon name="CheckCircle" size={16} className="text-emerald-500" />
              <span className="text-sm font-bold">{totalAnswered}/{totalQuestions}</span>
            </div>
          </div>

          {totalAnswered > 0 && (
            <button
              onClick={handleResetAll}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
            >
              <Icon name="RotateCcw" size={14} />
              Сбросить
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {categories.map((cat, i) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              progress={(gameState.answeredByCategory[cat.id] || new Set()).size}
              onSelect={() => handleSelectCategory(cat.id)}
              delay={i * 100}
            />
          ))}
        </div>

        <footer className="text-center mt-12 animate-fade-in" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
          <p className="text-sm text-muted-foreground">
            🚀 36 вопросов • 4 темы • 3 уровня сложности
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
