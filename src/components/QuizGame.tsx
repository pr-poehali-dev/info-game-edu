import { useState, useEffect, useCallback } from "react";
import { Category, Question, difficultyLabels, difficultyColors } from "@/data/questions";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Confetti from "@/components/Confetti";

interface QuizGameProps {
  category: Category;
  onBack: () => void;
  onComplete: (score: number, total: number) => void;
  answeredIds: Set<number>;
  onAnswer: (questionId: number, correct: boolean) => void;
}

const QuizGame = ({ category, onBack, onComplete, answeredIds, onAnswer }: QuizGameProps) => {
  const unanswered = category.questions.filter((q) => !answeredIds.has(q.id));
  const sorted = [...unanswered].sort((a, b) => a.difficulty - b.difficulty);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [streak, setStreak] = useState(0);

  const totalInRound = sorted.length;
  const question: Question | undefined = sorted[currentIndex];

  const handleSelect = useCallback(
    (index: number) => {
      if (selected !== null || !question) return;
      setSelected(index);
      const correct = index === question.correctIndex;
      setIsCorrect(correct);
      onAnswer(question.id, correct);

      if (correct) {
        setScore((s) => s + question.difficulty * 10);
        setStreak((s) => s + 1);
        if (streak >= 2) setShowConfetti(true);
      } else {
        setStreak(0);
      }
    },
    [selected, question, onAnswer, streak]
  );

  const handleNext = useCallback(() => {
    setShowConfetti(false);
    if (currentIndex + 1 >= totalInRound) {
      onComplete(score, totalInRound);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setIsCorrect(null);
    }
  }, [currentIndex, totalInRound, onComplete, score]);

  useEffect(() => {
    if (totalInRound === 0) {
      onComplete(0, 0);
    }
  }, [totalInRound, onComplete]);

  if (!question) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">Все вопросы пройдены!</h2>
        <p className="text-muted-foreground mb-6">Ты ответил на все вопросы в этой категории</p>
        <Button onClick={onBack} size="lg" className="bg-primary text-primary-foreground">
          <Icon name="ArrowLeft" size={18} /> Назад к категориям
        </Button>
      </div>
    );
  }

  const progressPct = ((currentIndex + 1) / totalInRound) * 100;

  const optionStyles = (index: number) => {
    const base = "w-full text-left p-4 rounded-xl border-2 font-medium transition-all duration-300 ";
    if (selected === null)
      return base + "border-border hover:border-primary hover:bg-primary/5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer";
    if (index === question.correctIndex)
      return base + "border-emerald-500 bg-emerald-50 text-emerald-800 card-glow-success";
    if (index === selected && !isCorrect)
      return base + "border-red-400 bg-red-50 text-red-700 animate-shake card-glow-error";
    return base + "border-border opacity-50";
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {showConfetti && <Confetti />}

      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="ArrowLeft" size={20} />
          <span className="text-sm font-medium">Назад</span>
        </button>

        <div className="flex items-center gap-3">
          {streak >= 2 && (
            <span className="text-sm font-bold text-amber-500 animate-bounce-in">
              🔥 {streak} подряд!
            </span>
          )}
          <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
            <Icon name="Star" size={16} className="text-primary" />
            <span className="text-sm font-bold text-primary">{score}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            Вопрос {currentIndex + 1} из {totalInRound}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${difficultyColors[question.difficulty]}`}>
            {difficultyLabels[question.difficulty]}
          </span>
        </div>
        <Progress value={progressPct} className="h-2.5" />
      </div>

      <div className="bg-white rounded-2xl p-8 card-glow mb-6 animate-scale-in">
        <div className="text-3xl mb-4">{category.emoji}</div>
        <h2 className="text-xl font-bold text-foreground leading-relaxed">{question.question}</h2>
      </div>

      <div className="grid gap-3 mb-6">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(index)}
            disabled={selected !== null}
            className={optionStyles(index)}
            style={{
              animationDelay: `${index * 80}ms`,
              animationFillMode: "both",
            }}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                {String.fromCharCode(65 + index)}
              </span>
              <span>{option}</span>
              {selected !== null && index === question.correctIndex && (
                <Icon name="Check" size={20} className="ml-auto text-emerald-500 animate-bounce-in" />
              )}
              {selected === index && !isCorrect && (
                <Icon name="X" size={20} className="ml-auto text-red-400 animate-bounce-in" />
              )}
            </div>
          </button>
        ))}
      </div>

      {selected !== null && (
        <div className="animate-slide-up">
          <div className={`rounded-xl p-4 mb-4 ${isCorrect ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
            <p className={`font-semibold ${isCorrect ? "text-emerald-700" : "text-red-700"}`}>
              {isCorrect ? "🎉 Правильно! Отличная работа!" : `😊 Не совсем! Правильный ответ: ${question.options[question.correctIndex]}`}
            </p>
          </div>

          <Button onClick={handleNext} size="lg" className="w-full bg-primary text-primary-foreground text-base font-semibold animate-pulse-glow">
            {currentIndex + 1 >= totalInRound ? "Завершить" : "Следующий вопрос"}
            <Icon name="ArrowRight" size={18} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizGame;
