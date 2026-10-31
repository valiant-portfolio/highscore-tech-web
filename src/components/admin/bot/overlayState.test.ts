import test from 'node:test';
import assert from 'node:assert/strict';
import { overlayNeedsRebuild } from './overlayState.ts';

test('rebuilds when an active position closes', () => {
  assert.equal(overlayNeedsRebuild('active', 'monitoring'), true);
});
test('rebuilds when a pending order fills', () => {
  assert.equal(overlayNeedsRebuild('ready', 'active'), true);
});
test('leaves a pending order alone when it is cancelled', () => {
  assert.equal(overlayNeedsRebuild('ready', 'monitoring'), false);
});
test('does nothing while a position stays open', () => {
  assert.equal(overlayNeedsRebuild('active', 'active'), false);
});
test('rebuilds when the first state seen is active', () => {
  assert.equal(overlayNeedsRebuild(null, 'active'), true);
});
test('does nothing when the first state seen is not active', () => {
  assert.equal(overlayNeedsRebuild(null, 'monitoring'), false);
});
test('rebuilds when the state of an active position disappears', () => {
  assert.equal(overlayNeedsRebuild('active', null), true);
});