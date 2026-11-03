// Pure, strict grading shared by the player and imported-session validation.
const finite = value => typeof value === 'number' && Number.isFinite(value);
const near = (a, b, tolerance = 0) => finite(a) && finite(b) && finite(tolerance) && tolerance >= 0 && Math.abs(a-b) <= tolerance + Number.EPSILON * Math.max(1, Math.abs(a), Math.abs(b)) * 4;

export function evaluateStep(step, value) {
  if (!step || typeof step !== 'object') return false;
  if (step.kind === 'story') return value === true;
  if (step.kind === 'number') return near(value, step.expected, step.tolerance ?? 0);
  if (step.kind === 'match' || step.kind === 'order') {
    const count = step.kind === 'match' ? step.pairs?.length : step.items?.length;
    return Array.isArray(value) && Array.isArray(step.solution) && value.length === count && value.length === step.solution.length && new Set(value).size === value.length && value.every((item, i) => item === step.solution[i]);
  }
  if (step.kind !== 'tune' || !Array.isArray(step.controls) || !value || typeof value !== 'object' || Array.isArray(value)) return false;
  if (Object.keys(value).length !== step.controls.length || !step.controls.every(c => Object.hasOwn(value,c.id) && finite(value[c.id]) && value[c.id] >= c.min && value[c.id] <= c.max)) return false;
  const rule = step.rule;
  if (rule?.kind === 'values') return Object.entries(rule.target).every(([id,target]) => near(value[id],target,rule.tolerance ?? 0));
  if (rule?.kind === 'line-mse' && Array.isArray(rule.samples) && rule.samples.length && finite(value.slope) && finite(value.intercept)) {
    const error = rule.samples.reduce((sum,[x,y]) => sum + (value.slope*x+value.intercept-y)**2,0) / rule.samples.length;
    return near(error,0,rule.maxError);
  }
  return false;
}

export function solutionFor(step) {
  if (step?.kind === 'story') return true;
  if (step?.kind === 'number') return step.expected;
  if (step?.solution !== undefined) return structuredClone(step.solution);
  return undefined;
}
