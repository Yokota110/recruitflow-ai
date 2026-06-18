'use client';

interface MatchScoreGaugeProps {
  score: number;
  size?: number;
}

export function MatchScoreGauge({ score, size = 140 }: MatchScoreGaugeProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;

  const color = score >= 80 ? '#2D8A6E' : score >= 65 ? '#C4A35A' : score >= 50 ? '#E8653A' : '#C45C5C';
  const bgColor = score >= 80 ? '#EBF7F3' : score >= 65 ? '#FBF5E8' : score >= 50 ? '#FDF0EB' : '#FBEEEE';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold tabular-nums" style={{ color }}>
          {score}
        </span>
        <span className="text-[10px] font-semibold text-[#9C958A] uppercase tracking-wider">Match</span>
      </div>
    </div>
  );
}
