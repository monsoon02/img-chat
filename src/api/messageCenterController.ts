// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** markAllAsRead POST /api/message/read/all */
export async function markAllAsReadUsingPost(options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean_>('/api/message/read/all', {
    method: 'POST',
    ...(options || {}),
  })
}

/** getUnreadCount GET /api/message/unread/count */
export async function getUnreadCountUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseMessageCenterVO_>('/api/message/unread/count', {
    method: 'GET',
    ...(options || {}),
  })
}
