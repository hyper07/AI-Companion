export async function __vfTrack(
  tracking: Record<string, { input?: any; output?: any; error?: string }>,
  nodeId: string,
  nodeLabel: string,
  input: any,
  fn: () => Promise<any>
): Promise<any> {
  const inputStr = JSON.stringify(input);
  try {
    const result = await fn();
    const outputStr = JSON.stringify(result);
    tracking[nodeId] = { input, output: result };
    return result;
  } catch (error) {
    const errorStr = error instanceof Error ? error.message : String(error);
    tracking[nodeId] = { input, error: errorStr };
    throw error;
  }
}

export function __vfTrackSync(
  tracking: Record<string, { input?: any; output?: any; error?: string }>,
  nodeId: string,
  nodeLabel: string,
  input: any,
  output: any
): void {
  const inputStr = JSON.stringify(input);
  const outputStr = JSON.stringify(output);
  tracking[nodeId] = { input, output };
}

export function createTracking(): Record<string, { input?: any; output?: any; error?: string }> {
  return {};
}