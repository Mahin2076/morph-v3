export function isMissingSimulation(error) {
  return error?.status === 404 && /(?:simulation|branch) not found/i.test(error.message || "");
}

// A Fly restart drops in-memory simulations while an open tab still holds its ID.
// Rebuild only for that exact error, then retry the original operation once.
export async function retryAfterMissingSimulation(operation, rebuild) {
  try {
    return await operation();
  } catch (error) {
    if (!isMissingSimulation(error)) throw error;
    await rebuild();
    return operation();
  }
}
