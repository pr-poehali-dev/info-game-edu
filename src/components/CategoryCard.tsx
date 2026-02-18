import { Category } from "@/data/questions";

interface CategoryCardProps {
  category: Category;
  progress: number;
  onSelect: () => void;
  delay: number;
}

const CategoryCard = ({ category, progress, onSelect, delay }: CategoryCardProps) => {
  const total = category.questions.length;
  const pct = Math.round((progress / total) * 100);

  return (
    <button
      onClick={onSelect}
      className="group relative w-full text-left rounded-2xl bg-white p-6 card-glow 
        hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 animate-slide-up overflow-hidden"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 
        group-hover:opacity-[0.06] transition-opacity duration-300`} />

      <div className="relative z-10">
        <div className="text-4xl mb-3 group-hover:animate-bounce-in transition-transform">
          {category.emoji}
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">{category.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{category.description}</p>

        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${category.color} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {progress} из {total} вопросов • {pct}%
        </p>
      </div>
    </button>
  );
};

export default CategoryCard;
