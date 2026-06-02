const EMOTION_MAP = {
  happy: 9,
  surprise: 7,
  neutral: 5,
  sad: 3,
  fear: 3,
  disgust: 2,
  angry: 2,
};

export const getMoodScoreFromEmotion = (emotion) => {
  if (!emotion) return null;
  return EMOTION_MAP[emotion.toLowerCase()] || null;
};

export const calculateStressLevel = (data) => {
  let stress = 1;

  const sleep = data.sleep_duration;
  const work = data.study_work_duration;
  const breaks = data.downtime_duration;
  const exercise = data.exercise_duration;
  const planned = data.task_planned;
  const completed = data.task_completed;

  if (sleep < 4) {
    stress += 4;
  } else if (sleep < 6) {
    stress += 2;
  } else if (sleep < 7) {
    stress += 1;
  }

  if (work > 12) {
    stress += 3;
  } else if (work > 10) {
    stress += 2;
  } else if (work > 8) {
    stress += 1;
  }

  const completionRatio = completed / planned;
  if (completionRatio < 0.3) {
    stress += 3;
  } else if (completionRatio < 0.5) {
    stress += 2;
  } else if (completionRatio < 0.8) {
    stress += 1;
  }

  if (work > 6 && breaks < 1) {
    stress += 2;
  }

  if (exercise >= 60) {
    stress -= 2;
  } else if (exercise >= 30) {
    stress -= 1;
  }

  return Math.max(1, Math.min(10, Math.round(stress)));
};

export const calculateFocusScore = (data) => {
  let focus = 10;

  const sleep = data.sleep_duration;
  const work = data.study_work_duration;
  const breaks = data.break_duration;
  const exercise = data.exercise_duration;
  const planned = data.task_planned;
  const completed = data.task_completed;

  if (sleep < 4) {
    focus -= 4;
  } else if (sleep < 6) {
    focus -= 2;
  } else if (sleep < 7) {
    focus -= 1;
  } else if (sleep > 9) {
    focus -= 1;
  }

  const completionRatio = completed / planned;
  if (completionRatio < 0.3) {
    focus -= 4;
  } else if (completionRatio < 0.5) {
    focus -= 2;
  } else if (completionRatio < 0.8) {
    focus -= 1;
  }

  if (work > 6 && breaks < 1) {
    focus -= 2;
  }

  if (exercise >= 30) {
    focus += 1;
  }

  return Math.max(1, Math.min(10, Math.round(focus)));
};

export const calculateProductivityScore = (data) => {
  const SLEEP_MAX = 24.0;
  const EXERCISE_MAX = 240.0;

  const sleepDuration = data.sleep_duration;
  const exerciseDuration = data.exercise_duration;
  const downtimeDuration = data.downtime_duration;
  const moodScore = data.mood_score;
  const breakDuration = data.break_duration;
  const completionRatio = data.completion_ratio;
  const stressLevel = data.stress_level;
  const focusScore = data.focus_score;

  let rawScore =
    completionRatio * 0.341 +
    (focusScore / 10.0) * 0.224 +
    (breakDuration / 6.0) * 0.152 +
    (sleepDuration / SLEEP_MAX) * 0.067 +
    ((10 - stressLevel) / 10.0) * 0.064 +
    (1 - downtimeDuration / 24.0) * 0.063 +
    (exerciseDuration / EXERCISE_MAX) * 0.054 +
    (moodScore / 10.0) * 0.034;

  const clippedScore = Math.max(0, Math.min(1, rawScore));

  const finalScore = clippedScore * 100;
  return Number(finalScore.toFixed(2));
};

export const calculateFatigueIndex = (data) => {
  const DOWNTIME_MAX = 11.21;
  const STUDY_MAX = 17.405;
  const STRESS_MAX = 8.0;

  const stress = data.stress_level;
  const downtime = data.downtime_duration;
  const study = data.study_work_duration;

  let rawFatigue =
    (stress / STRESS_MAX) * 40 +
    (downtime / DOWNTIME_MAX) * 30 +
    (study / STUDY_MAX) * 30;

  return Number(Math.max(0, Math.min(100, rawFatigue)).toFixed(2));
};

export const calculateCumulativeFatigue = (
  currentFatigueIndex,
  previousCumulativeFatigue,
) => {
  const DECAY = 0.9;
  const ALPHA = 1.0 - DECAY;

  if (
    previousCumulativeFatigue === null ||
    previousCumulativeFatigue === undefined
  ) {
    return currentFatigueIndex;
  }
  const ema = currentFatigueIndex * ALPHA + previousCumulativeFatigue * DECAY;

  return Number(Math.max(0, Math.min(100, ema)).toFixed(2));
};
