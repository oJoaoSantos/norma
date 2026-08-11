"use client";

export interface StepperItem {
  title: string;
}

export function Stepper({
  steps,
  currentIndex,
  onStepClick,
}: {
  /** Inclui o passo final (ex: "Revisão") como último item. */
  steps: StepperItem[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center">
        {steps.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          const clickable = done && !!onStepClick;

          return (
            <div key={step.title} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick?.(i)}
                title={step.title}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors ${
                  done
                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                    : active
                      ? "border-black text-black dark:border-white dark:text-white"
                      : "border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-600"
                } ${clickable ? "cursor-pointer" : "cursor-default"}`}
              >
                {done ? "✓" : i + 1}
              </button>
              {i < steps.length - 1 && (
                <div
                  className={`h-px flex-1 ${
                    done ? "bg-black dark:bg-white" : "bg-zinc-200 dark:bg-zinc-800"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        Passo {currentIndex + 1} de {steps.length} — {steps[currentIndex]?.title}
      </p>
    </div>
  );
}
