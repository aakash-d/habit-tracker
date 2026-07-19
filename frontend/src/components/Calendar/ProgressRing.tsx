"use client";

interface ProgressRingProps {
    done: number;
    total: number;
    size?: number;
    strokeWidth?: number;
    dimmed?: boolean;
}

export function ProgressRing({
    done,
    total,
    size = 26,
    strokeWidth = 3,
    dimmed = false,
}: ProgressRingProps) {
    if(total === 0) return null;

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = Math.min(done / total, 1);
    const offset = circumference * (1 - pct);
    const complete = done >= total;

    return (
        <svg
            width={size}
            height={size}
            className={dimmed ? "opacity-40" : ""}
            viewBox={`0 0 ${size} ${size}`}
        >
            {/* Track */}
            <circle 
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={strokeWidth}
                className="stroke-gray-200 dark:stroke-gray-700"
            />
            {/* Progress */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className={complete ? "stroke-green-500" : "stroke-blue-500"}
                style={{
                transform: "rotate(-90deg)",
                transformOrigin: "50% 50%",
                transition: "stroke-dashoffset 0.3s ease",
                }}
            />
            {/* Center label when complete */}
            {complete && (
                <text
                    x="50%"
                    y="50%"
                    dominantBaseline="central"
                    textAnchor="middle"
                    className="fill-green-500"
                    fontSize={size * 0.42}
                    fontWeight="bold"
                >
                    ✓
                </text>
            )}
        </svg>
    );
}