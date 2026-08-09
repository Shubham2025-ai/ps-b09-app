import { config } from "dotenv";
import path from "path";
config({ path: path.join(process.cwd(), ".env.local") });

async function main() {
  const { classifyCase } = await import("../groqClassify");
  const { evalDataset } = await import("./dataset");

  let correct = 0;
  let truePositive = 0; // predicted URGENT, actually URGENT
  let falsePositive = 0; // predicted URGENT, actually ROUTINE
  let trueNegative = 0; // predicted ROUTINE, actually ROUTINE
  let falseNegative = 0; // predicted ROUTINE, actually URGENT

  const results: any[] = [];

  for (const testCase of evalDataset) {
    const result = await classifyCase(testCase.description, false);
    const isCorrect = result.severity === testCase.expectedSeverity;
    if (isCorrect) correct++;

    if (result.severity === "URGENT" && testCase.expectedSeverity === "URGENT") truePositive++;
    if (result.severity === "URGENT" && testCase.expectedSeverity === "ROUTINE") falsePositive++;
    if (result.severity === "ROUTINE" && testCase.expectedSeverity === "ROUTINE") trueNegative++;
    if (result.severity === "ROUTINE" && testCase.expectedSeverity === "URGENT") falseNegative++;

    results.push({
      description: testCase.description.slice(0, 60) + "...",
      expected: testCase.expectedSeverity,
      predicted: result.severity,
      correct: isCorrect,
      note: testCase.note,
    });
  }

  const total = evalDataset.length;
  const accuracy = (correct / total) * 100;
  const precision = truePositive / (truePositive + falsePositive) || 0;
  const recall = truePositive / (truePositive + falseNegative) || 0;
  const f1 = (2 * precision * recall) / (precision + recall) || 0;

  console.log("\n=== Classification Evaluation Report ===\n");
  console.table(results);
  console.log(`\nTotal cases: ${total}`);
  console.log(`Correct: ${correct}`);
  console.log(`Accuracy: ${accuracy.toFixed(1)}%`);
  console.log(`\nConfusion Matrix:`);
  console.log(`                 Predicted URGENT   Predicted ROUTINE`);
  console.log(`Actual URGENT    ${truePositive}                  ${falseNegative}`);
  console.log(`Actual ROUTINE   ${falsePositive}                  ${trueNegative}`);
  console.log(`\nPrecision (URGENT): ${(precision * 100).toFixed(1)}%`);
  console.log(`Recall (URGENT): ${(recall * 100).toFixed(1)}%`);
  console.log(`F1 Score: ${(f1 * 100).toFixed(1)}%`);
  console.log(`\nFalse negatives (missed urgent cases) are the most safety-critical failure mode.`);
}

main().then(() => process.exit(0));