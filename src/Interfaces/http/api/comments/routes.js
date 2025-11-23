const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{threadId}/comments',
    handler: (requst, h) => handler.postCommentHandler(requst, h),
    options: {
      auth: 'forumapi_jwt',
    },
  },
]);

module.exports = routes;
