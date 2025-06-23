// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** addComment POST /api/comments/add */
export async function addCommentUsingPost(
  body: API.CommentsAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/comments/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getCommentedHistory POST /api/comments/commented/history */
export async function getCommentedHistoryUsingPost(
  body: API.CommentsQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageCommentsVO_>('/api/comments/commented/history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** deleteComment POST /api/comments/delete */
export async function deleteCommentUsingPost(
  body: API.CommentsDeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/comments/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** likeComment POST /api/comments/like */
export async function likeCommentUsingPost(
  body: API.CommentsLikeRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/comments/like', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getMyCommentHistory POST /api/comments/my/history */
export async function getMyCommentHistoryUsingPost(
  body: API.CommentsQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageCommentsVO_>('/api/comments/my/history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** queryComment POST /api/comments/query */
export async function queryCommentUsingPost(
  body: API.CommentsQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageCommentsVO_>('/api/comments/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getUnreadComments GET /api/comments/unread */
export async function getUnreadCommentsUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListCommentsVO_>('/api/comments/unread', {
    method: 'GET',
    ...(options || {}),
  })
}

/** getUnreadCommentsCount GET /api/comments/unread/count */
export async function getUnreadCommentsCountUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseLong_>('/api/comments/unread/count', {
    method: 'GET',
    ...(options || {}),
  })
}
