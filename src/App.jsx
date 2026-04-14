import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Welcome from './components/steps/Welcome';
import Step1Habitos from './components/steps/Step1Habitos';
import Step2Modais from './components/steps/Step2Modais';
import Step3Custos from './components/steps/Step3Custos';
import Step4Resultado from './components/steps/Step4Resultado';
import StepIndicator from './components/StepIndicator';

const TOTAL_STEPS = 4;
const STEP_LABELS = ['Hábitos', 'Modais', 'Parâmetros', 'Resultado'];

const pageVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 60 : -60,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction < 0 ? 60 : -60,
  }),
};

const pageTransition = {
  duration: 0.35,
  ease: [0.25, 0.46, 0.45, 0.94],
};

export default function App() {
  const [step, setStep] = useState(0); // 0 = welcome, 1-4 = steps
  const [direction, setDirection] = useState(1);

  const [data, setData] = useState({
    kmMensal: 650,
    cenarios: [],
  });

  const goTo = (nextStep) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  const next = (updates = {}) => {
    setData(prev => ({ ...prev, ...updates }));
    goTo(step + 1);
  };

  const back = () => goTo(step - 1);

  const reset = () => {
    setData({ kmMensal: 650, cenarios: [] });
    goTo(0);
  };

  const isWelcome = step === 0;

  const steps = [
    <Welcome key="welcome" onStart={() => goTo(1)} />,
    <Step1Habitos key="step1" data={data} onNext={(u) => next(u)} onBack={back} />,
    <Step2Modais key="step2" data={data} onNext={(u) => next(u)} onBack={back} />,
    <Step3Custos key="step3" data={data} onNext={(u) => next(u)} onBack={back} />,
    <Step4Resultado key="step4" data={data} onBack={back} onReset={reset} />,
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {!isWelcome && (
        <div
          className="fixed top-0 left-0 right-0 z-50 pt-4 pb-3 px-6"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, transparent 100%)' }}
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs text-white/25 font-light">Mobi</span>
            <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />
            <span className="text-xs text-white/25 font-light">
              {STEP_LABELS[step - 1]}
            </span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={pageTransition}
          className="w-full"
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
