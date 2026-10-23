import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createTaskRepository,
  mapTaskFromDatabase,
  mapTaskPatchToDatabase,
  mapTaskToDatabase,
} from '../assets/js/data/taskRepository.js';

test('maps a new task to its PostgreSQL columns and authenticated owner', () => {
  assert.deepEqual(
    mapTaskToDatabase(
      {
        title: '  Finish report ',
        description: 'Quarterly summary',
        category: 'Work',
        status: 'In Progress',
        priority: 'High',
        dueDate: '2026-11-01',
      },
      'user-123',
    ),
    {
      user_id: 'user-123',
      title: 'Finish report',
      description: 'Quarterly summary',
      category: 'Work',
      status: 'In Progress',
      priority: 'High',
      due_date: '2026-11-01',
    },
  );
});

test('maps a database task into the shape expected by the dashboard', () => {
  assert.deepEqual(
    mapTaskFromDatabase({
      id: 'task-123',
      user_id: 'user-123',
      title: 'Finish report',
      description: 'Quarterly summary',
      category: 'Work',
      status: 'Todo',
      priority: 'Medium',
      due_date: '2026-11-01',
    }),
    {
      id: 'task-123',
      userId: 'user-123',
      title: 'Finish report',
      description: 'Quarterly summary',
      category: 'Work',
      status: 'Todo',
      priority: 'Medium',
      dueDate: '2026-11-01',
    },
  );
});

test('maps only supplied editable fields to database column names', () => {
  assert.deepEqual(
    mapTaskPatchToDatabase({ dueDate: '2026-11-15', priority: 'Low' }),
    {
      due_date: '2026-11-15',
      priority: 'Low',
    },
  );
});

test('loads tasks through the same-origin API without sending auth tokens', async () => {
  const originalFetch = globalThis.fetch;
  let request;
  globalThis.fetch = async (path, options) => {
    request = { path, options };
    return new Response(JSON.stringify({ tasks: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const repository = createTaskRepository();
    assert.deepEqual(await repository.listForUser(), []);
    assert.equal(request.path, '/api/tasks');
    assert.equal(request.options.credentials, 'same-origin');
    assert.equal(request.options.headers.Authorization, undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('surfaces API errors instead of returning success-shaped task data', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ error: 'The request could not be processed.' }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });

  try {
    const repository = createTaskRepository();
    await assert.rejects(
      repository.listForUser(),
      /The request could not be processed/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
