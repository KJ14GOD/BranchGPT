/* eslint-disable no-console */
import { buildTypedPlan } from './plan';
import { savePlan, getRun, getBranches, clear } from '../store/memory';

clear();
const question = 'How to compare RAG chunking strategies for legal PDFs?';
const { run, branches } = buildTypedPlan(question, {});
savePlan(run, branches);

console.log('runId:', run.runId);
console.log('branchIds:', branches.map(b => b.branchId));

const fetchedRun = getRun(run.runId);
const fetchedBranches = getBranches(run.runId);
console.log('fetched run?', !!fetchedRun, 'branches:', fetchedBranches.length);