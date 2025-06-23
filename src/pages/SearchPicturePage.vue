<template>
  <div id="searchPicturePage">
    <div class="search-header">
      <h2 class="page-title">以图搜图</h2>
      <div class="source-image-section">
        <h3 class="section-title">原图</h3>
        <a-card hoverable class="source-image-card">
          <template #cover>
            <img
              :alt="picture.name"
              :src="picture.thumbnailUrl ?? picture.url"
              class="source-image"
            />
          </template>
        </a-card>
      </div>
    </div>
    
    <div class="results-section">
      <div class="results-header">
        <h3 class="section-title">识图结果</h3>
        <span class="result-count">找到 {{ dataList.length }} 张相似图片</span>
      </div>

    <!-- 图片结果列表 -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item class="result-item">
          <a :href="picture.fromUrl" target="_blank">
            <!-- 单张图片 -->
            <a-card hoverable class="result-card">
              <template #cover>
                <img
                  :alt="picture.name"
                  :src="picture.thumbUrl"
                  class="result-image"
                />
              </template>
              <template #actions>
                <a-tooltip title="查看原图">
                  <EyeOutlined key="view" />
                </a-tooltip>
                <a-tooltip :title="picture.fromUrl">
                  <LinkOutlined key="link" />
                </a-tooltip>
              </template>
            </a-card>
          </a>
        </a-list-item>
      </template>
    </a-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  getPictureVoByIdUsingGet,
  searchPictureByPictureUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useRoute } from 'vue-router'
import { EyeOutlined, LinkOutlined } from '@ant-design/icons-vue'

const route = useRoute()

const pictureId = computed(() => {
  return route.query?.pictureId
})
const picture = ref<API.PictureVO>({})

// 获取图片详情
const fetchPictureDetail = async () => {
  try {
    const res = await getPictureVoByIdUsingGet({
      id: pictureId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取图片详情失败：' + e.message)
  }
}

onMounted(() => {
  fetchPictureDetail()
})

// 以图搜图结果
const dataList = ref<API.ImageSearchResult[]>([])
const loading = ref<boolean>(true)
// 获取搜图结果
const fetchResultData = async () => {
  loading.value = true
  try {
    const res = await searchPictureByPictureUsingPost({
      pictureId: pictureId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data ?? []
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取数据失败，' + e.message)
  }
  loading.value = false
}

// 页面加载时请求一次
onMounted(() => {
  fetchResultData()
})
</script>

<style scoped>
#searchPicturePage {
  margin-bottom: 16px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  color: #345750;
  margin-bottom: 16px;
}

.source-image-section {
  max-width: 300px;
}

.source-image-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}

.source-image {
  height: 220px;
  object-fit: cover;
  width: 100%;
}

.results-section {
  margin-top: 32px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.result-count {
  color: #64748b;
  font-size: 14px;
}

.result-item {
  padding: 0;
  margin-bottom: 16px;
}

.result-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
}

.result-image {
  height: 180px;
  object-fit: cover;
  width: 100%;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  #searchPicturePage {
    padding: 16px;
  }

  .page-title {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 16px;
  }

  .source-image {
    height: 180px;
  }

  .result-image {
    height: 160px;
  }
}
</style>
