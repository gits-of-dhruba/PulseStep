import { recommendations } from "../data/recommendations";

const allBarriers = Object.keys(recommendations);

export function calculateBarrier(answers, questions) {
  const scores = {};
  allBarriers.forEach((barrier) => {
    scores[barrier] = 0;
  });

  questions.forEach((question) => {
    const answerValue = answers[question.id] || 0;
    Object.entries(question.barrierWeights).forEach(([barrier, weight]) => {
      scores[barrier] += answerValue * weight;
    });
  });

  const primaryBarrier = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

  return {
    scores,
    primaryBarrier,
    result: recommendations[primaryBarrier]
  };
}