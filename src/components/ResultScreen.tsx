import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import Confetti from "@/components/Confetti";

interface ResultScreenProps {
  score: number;
  total: number;
  categoryTitle: string;
  categoryEmoji: string;
  onBack: () => void;
  onRetry: () => void;
}

const getGrade = (pct: number) => {
  if (pct === 100) return { emoji: "🏆", title: "Превосходно!", subtitle: "Все ответы правильные — ты настоящий гений!" };
  if (pct >= 70) return { emoji: "🌟", title: "Отлично!", subtitle: "Ты отлично разбираешься в теме!" };
  if (pct >= 40) return { emoji: "💪", title: "Хороший результат!", subtitle: "Продолжай учиться, и станет ещё лучше!" };
  return { emoji: "📚", title: "Есть куда расти!", subtitle: "Попробуй ещё раз — практика делает мастером!" };
};

const ResultScreen = ({ score, total, categoryTitle, categoryEmoji, onBack, onRetry }: ResultScreenProps) => {
  const correctCount = Math.round(score / 10);
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const grade = getGrade(pct);

  return (
    <div className="max-w-md mx-auto text-center animate-fade-in py-8">
      {pct >= 70 && <Confetti />}

      <div className="text-7xl mb-4 animate-bounce-in">{grade.emoji}</div>
      <h2 className="text-3xl font-extrabold text-foreground mb-2">{grade.title}</h2>
      <p className="text-muted-foreground mb-8">{grade.subtitle}</p>

      <div className="bg-white rounded-2xl p-6 card-glow mb-8 animate-scale-in" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
        <div className="text-3xl mb-2">{categoryEmoji}</div>
        <p className="text-sm text-muted-foreground mb-4">{categoryTitle}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary/5 rounded-xl p-4">
            <p className="text-3xl font-extrabold text-primary">{score}</p>
            <p className="text-xs text-muted-foreground mt-1">Очков</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="text-3xl font-extrabold text-emerald-600">{pct}%</p>
            <p className="text-xs text-muted-foreground mt-1">Правильных</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 animate-slide-up" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
        <Button onClick={onRetry} size="lg" className="w-full bg-primary text-primary-foreground text-base font-semibold">
          <Icon name="RotateCcw" size={18} />
          Пройти заново
        </Button>
        <Button onClick={onBack} variant="outline" size="lg" className="w-full text-base">
          <Icon name="ArrowLeft" size={18} />
          К категориям
        </Button>
      </div>
    </div>
  );
};

export default ResultScreen;
