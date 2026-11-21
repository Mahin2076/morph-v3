import assert from "node:assert/strict";
import test from "node:test";
import { isMissingSimulation, retryAfterMissingSimulation } from "./simulation-recovery.js";

const missing = Object.assign(new Error("POST /simulations/x/branches → 404: simulation not found"), { status: 404 });

test("rebuilds a missing simulation and retries the original operation once", async () => {
  let calls = 0;
  let rebuilds = 0;
  const result = await retryAfterMissingSimulation(
    async () => { if (++calls === 1) throw missing; return "new branch"; },
    async () => { rebuilds++; },
  );
  assert.equal(result, "new branch");
  assert.equal(calls, 2);
  assert.equal(rebuilds, 1);
});

test("does not rebuild for an unrelated 404 or server error", async () => {
  for (const error of [
    Object.assign(new Error("route not found"), { status: 404 }),
    Object.assign(new Error("server unavailable"), { status: 503 }),
  ]) {
    let rebuilds = 0;
    await assert.rejects(retryAfterMissingSimulation(
      async () => { throw error; },
      async () => { rebuilds++; },
    ), error);
    assert.equal(rebuilds, 0);
  }
});

test("does not loop when the retry also fails", async () => {
  let calls = 0;
  let rebuilds = 0;
  await assert.rejects(retryAfterMissingSimulation(
    async () => { calls++; throw missing; },
    async () => { rebuilds++; },
  ), missing);
  assert.equal(calls, 2);
  assert.equal(rebuilds, 1);
});

test("recognizes a missing main branch after restart", () => {
  assert.equal(isMissingSimulation(Object.assign(new Error("branch not found"), { status: 404 })), true);
});
