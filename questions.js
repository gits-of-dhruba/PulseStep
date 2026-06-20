export const questions = [
    {
      id: "q1",
      text: "If I go for a checkup, I might hear something scary.",
      barrierWeights: { fear_of_diagnosis: 2, denial_uncertainty: 1 }
    },
    {
      id: "q2",
      text: "I worry about what others may think if I seek help.",
      barrierWeights: { social_stigma: 2, masculinity_norms: 2 }
    },
    {
      id: "q3",
      text: "I delay care because I think it may be too expensive.",
      barrierWeights: { cost_concerns: 3 }
    },
    {
      id: "q4",
      text: "I keep postponing health checkups because I am too busy.",
      barrierWeights: { lack_of_time: 3 }
    },
    {
      id: "q5",
      text: "I am not sure whether my symptoms are serious enough.",
      barrierWeights: { denial_uncertainty: 2, fear_of_diagnosis: 1 }
    },
    {
      id: "q6",
      text: "I would prefer exploring support privately before talking to anyone.",
      barrierWeights: { social_stigma: 1, fear_of_diagnosis: 1 }
    }
  ];