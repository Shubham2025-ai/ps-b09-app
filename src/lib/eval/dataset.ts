export type EvalCase = {
  description: string;
  expectedSeverity: "URGENT" | "ROUTINE";
  note: string;
};

export const evalDataset: EvalCase[] = [
  // Clear ROUTINE cases
  { description: "A coworker made an inappropriate joke about my appearance during a team meeting last week.", expectedSeverity: "ROUTINE", note: "verbal, no threat" },
  { description: "My manager keeps assigning me menial tasks that are not part of my job description, seemingly to embarrass me in front of others.", expectedSeverity: "ROUTINE", note: "discrimination pattern" },
  { description: "A colleague sends unwanted messages on the work chat outside of hours asking personal questions.", expectedSeverity: "ROUTINE", note: "harassment, no danger" },
  { description: "I was passed over for a promotion I was qualified for, and I believe it is because I rejected advances from a senior colleague months ago.", expectedSeverity: "ROUTINE", note: "retaliation-adjacent but not physical" },
  { description: "During a work trip, a colleague made repeated comments about my body that made me uncomfortable.", expectedSeverity: "ROUTINE", note: "verbal harassment" },
  { description: "My supervisor excludes me from meetings and takes credit for my work in front of leadership.", expectedSeverity: "ROUTINE", note: "professional undermining" },
  { description: "A coworker keeps making comments about my religion that feel targeted and demeaning.", expectedSeverity: "ROUTINE", note: "discrimination" },
  { description: "I received an inappropriate text message from a colleague after a work event.", expectedSeverity: "ROUTINE", note: "isolated incident" },

  // Clear URGENT cases
  { description: "My supervisor cornered me in the stockroom yesterday and grabbed my arm when I tried to leave. I am scared to be alone with him again.", expectedSeverity: "URGENT", note: "physical contact + fear" },
  { description: "A coworker has been following me to my car after shifts for the past week and I am afraid of what he might do.", expectedSeverity: "URGENT", note: "stalking pattern" },
  { description: "My manager threatened to hurt me if I reported his behavior to HR.", expectedSeverity: "URGENT", note: "explicit threat" },
  { description: "A colleague grabbed me forcefully during an argument in the parking lot last night.", expectedSeverity: "URGENT", note: "physical assault" },
  { description: "Someone left a note at my desk saying they know where I live and I should watch my back.", expectedSeverity: "URGENT", note: "implied threat to safety" },
  { description: "My coworker has weapons in his car and mentioned them during an argument with me this morning.", expectedSeverity: "URGENT", note: "weapon mention" },

  // Ambiguous / edge cases (harder, worth tracking separately)
  { description: "A colleague has been increasingly aggressive in meetings, raising his voice and slamming his hand on the table when disagreeing with me.", expectedSeverity: "ROUTINE", note: "aggressive but not a direct threat - edge case" },
  { description: "My manager said if I don't stop complaining he'll make sure I regret it.", expectedSeverity: "URGENT", note: "vague but menacing threat - edge case" },
];