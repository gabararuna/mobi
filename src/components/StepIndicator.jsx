export default function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isDone   = currentStep > stepNum;
        const isActive = currentStep === stepNum;

        return (
          <div key={stepNum} className="flex items-center gap-2">
            <div
              className="shrink-0 transition-all duration-400"
              style={{
                width:      isActive ? 20 : 6,
                height:     6,
                background: isDone || isActive ? '#00BFA5' : 'rgba(255,255,255,0.12)',
                boxShadow:  isActive ? '0 0 8px rgba(0,191,165,0.5)' : 'none',
                borderRadius: 999,
              }}
            />
            {stepNum < totalSteps && (
              <div
                className="h-px w-5 transition-all duration-500"
                style={{
                  background: isDone
                    ? 'rgba(0,191,165,0.45)'
                    : 'rgba(255,255,255,0.07)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
