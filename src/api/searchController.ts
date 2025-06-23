// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** searchAll POST /api/search/all */
export async function searchAllUsingPost(
  body: API.SearchRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageObject_>('/api/search/all', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getHotSearchKeywords GET /api/search/hot */
export async function getHotSearchKeywordsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getHotSearchKeywordsUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListString_>('/api/search/hot', {
    method: 'GET',
    params: {
      // size has a default value: 9
      size: '9',
      ...params,
    },
    ...(options || {}),
  })
}
