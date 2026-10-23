export const asyncHandler = (handler) => (request, response, next) => {
  return Promise.resolve(handler(request, response, next)).catch(next);
};
