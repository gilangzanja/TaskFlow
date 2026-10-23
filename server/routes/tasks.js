import { Router } from 'express';

import { mapTaskFromDatabase, mapTaskPatchToDatabase, mapTaskToDatabase } from '../../assets/js/data/taskRepository.js';
import { asyncHandler } from '../asyncHandler.js';
import { requireAuth } from '../authMiddleware.js';
import { validateTaskInput } from '../taskValidation.js';

const taskIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const invalidTaskId = (response) => {
  response.status(422).json({ error: 'Task ID is invalid.' });
};

export const createTasksRouter = (config) => {
  const router = Router();
  router.use(requireAuth(config));

  router.get(
    '/',
    asyncHandler(async (request, response) => {
      const { data, error } = await request.taskClient
        .from('tasks')
        .select('*')
        .eq('user_id', request.user.id)
        .order('due_date', { ascending: true });

      if (error) {
        throw error;
      }

      response.json({ tasks: data.map(mapTaskFromDatabase) });
    }),
  );

  router.post(
    '/',
    asyncHandler(async (request, response) => {
      const { data: taskInput, error: validationError } = validateTaskInput(request.body);

      if (validationError) {
        response.status(422).json({ error: validationError });
        return;
      }

      const { data, error } = await request.taskClient
        .from('tasks')
        .insert(mapTaskToDatabase(taskInput, request.user.id))
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      response.status(201).json({ task: mapTaskFromDatabase(data) });
    }),
  );

  router.patch(
    '/:id',
    asyncHandler(async (request, response) => {
      if (!taskIdPattern.test(request.params.id)) {
        invalidTaskId(response);
        return;
      }

      const { data: taskPatch, error: validationError } = validateTaskInput(request.body, {
        partial: true,
      });

      if (validationError) {
        response.status(422).json({ error: validationError });
        return;
      }

      const { data, error } = await request.taskClient
        .from('tasks')
        .update(mapTaskPatchToDatabase(taskPatch))
        .eq('id', request.params.id)
        .eq('user_id', request.user.id)
        .select('*')
        .single();

      if (error) {
        throw error;
      }

      response.json({ task: mapTaskFromDatabase(data) });
    }),
  );

  router.delete(
    '/:id',
    asyncHandler(async (request, response) => {
      if (!taskIdPattern.test(request.params.id)) {
        invalidTaskId(response);
        return;
      }

      const { data, error } = await request.taskClient
        .from('tasks')
        .delete()
        .eq('id', request.params.id)
        .eq('user_id', request.user.id)
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      response.json({ deletedId: data.id });
    }),
  );

  return router;
};
