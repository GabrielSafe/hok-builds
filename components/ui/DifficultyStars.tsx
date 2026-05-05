interface Props {
  value: number;
  max?: number;
}

export default function DifficultyStars({ value, max = 5 }: Props) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i < value ? "bg-gold-400" : "bg-dark-500"}`}
        />
      ))}
    </div>
  );
}
