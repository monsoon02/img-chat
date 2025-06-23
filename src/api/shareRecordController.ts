// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** doShare POST /api/share/do */
export async function doShareUsingPost(body: API.ShareRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean_>('/api/share/do', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getShareHistory POST /api/share/history */
export async function getShareHistoryUsingPost(
  body: API.ShareQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageShareRecordVO_>('/api/share/history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getMyShareHistory POST /api/share/my/history */
export async function getMyShareHistoryUsingPost(
  body: API.ShareQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageShareRecordVO_>('/api/share/my/history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getShareStatus GET /api/share/status/${param1}/${param0} */
export async function getShareStatusUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getShareStatusUsingGETParams,
  options?: { [key: string]: any }
) {
  const { targetId: param0, targetType: param1, ...queryParams } = params
  return request<API.BaseResponseBoolean_>(`/api/share/status/${param1}/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** getUnreadShares GET /api/share/unread */
export async function getUnreadSharesUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListShareRecordVO_>('/api/share/unread', {
    method: 'GET',
    ...(options || {}),
  })
}

/** getUnreadSharesCount GET /api/share/unread/count */
export async function getUnreadSharesCountUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseLong_>('/api/share/unread/count', {
    method: 'GET',
    ...(options || {}),
  })
}
