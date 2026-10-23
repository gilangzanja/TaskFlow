import test from 'node:test';
import assert from 'node:assert/strict';

import { validateTaskInput } from '../server/taskValidation.js';

test('normalizes a valid task and applies defaults when creating', () => {
  assert.deepEqual(
    validateTaskInput({
      title: '  Plan launch ',
      dueDate: '2026-11-01',
    }),
    {
      data: {
        title: 'Plan launch',
        description: '',
        category: 'General',
        status: 'Todo',
        priority: 'Medium',
        dueDate: '2026-11-01',
      },
      error: null,
    },
  );
});

test('rejects an empty title', () => {
  assert.equal(validateTaskInput({ title: ' ', dueDate: '2026-11-01' }).error, 'Enter a task title.');
});

test('rejects invalid calendar dates', () => {
  assert.equal(
    validateTaskInput({ title: 'Plan launch', dueDate: '2026-02-30' }).error,
    'Enter a valid due date.',
  );
});

test('rejects unsupported status and priority values', () => {
  assert.equal(
    validateTaskInput({
      title: 'Plan launch',
      dueDate: '2026-11-01',
      status: 'Done-ish',
    }).error,
    'Choose a valid task status.',
  );
});

test('rejects attempts to set ownership fields in task updates', () => {
  assert.equal(
    validateTaskInput({ userId: 'another-user' }, { partial: true }).error,
    'Task contains unsupported fields.',
  );
});
