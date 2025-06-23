<template>
  <div class="unread-share-list">
    <div v-for="share in (shares || [])" :key="share.id" class="share-item">
      <!-- 分享者信息 -->
      <div class="share-header">
        <a-avatar :src="share.user.userAvatar" :size="40" />
        <div class="share-info">
          <div class="user-name">{{ share.user.userName }}</div>
          <div class="share-time">{{ formatTime(share.shareTime) }}</div>
        </div>
      </div>

      <!-- 分享目标 -->
      <div class="share-target" @click="handleTargetClick(share)">
        <template v-if="share.targetType === 1">
          <!-- 图片类型 -->
          <div class="target-preview picture-preview">
            <div class="target-type">
              <PictureOutlined />
              <span>{{ isReceived ? '分享了你的图片' : '你分享的图片' }}</span>
            </div>
            <img :src="share.target.thumbnailUrl" :alt="share.target.name">
            <div class="target-info">
              <div class="target-title">{{ share.target.name }}</div>

            </div>
          </div>
        </template>
        <template v-else-if="share.targetType === 2">
          <!-- 帖子类型 -->
          <div class="target-preview post-preview">
            <div class="target-type">
              <FileTextOutlined />
              <span>{{ isReceived ? '分享了你的帖子' : '你分享的帖子' }}</span>
            </div>
            <div class="target-info">
              <div class="target-title">{{ share.target.title }}</div>
              <div class="target-content">{{ stripHtml(share.target.content) }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!(shares || []).length" class="empty-state">
      <ShareAltOutlined class="empty-icon" />
      <p>暂无未读分享</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useRouter } from 'vue-router'
import { ShareAltOutlined, PictureOutlined, FileTextOutlined } from '@ant-design/icons-vue'

const router = useRouter()

const props = withDefaults(defineProps<{
  shares?: any[]
  isReceived?: boolean
}>(), {
  shares: () => [],
  isReceived: false
})

// 格式化时间
const formatTime = (time: string) => {
  return formatDistanceToNow(new Date(time), { addSuffix: true, locale: zhCN })
}

// 处理目标点击
const handleTargetClick = (share: any) => {
  if (share.targetType === 1) {
    // 跳转到图片详情
    router.push(`/picture/${share.target.id}`)
  } else if (share.targetType === 2) {
    // 跳转到帖子详情
    router.push(`/post/${share.target.id}`)
  }
}

// 去除 HTML 标签
const stripHtml = (html: string) => {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, '').slice(0, 100) + '...'
}
</script>

<style scoped>
.unread-share-list {
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.share-item {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;

  &:last-child {
    border-bottom: none;
  }


}

.share-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.share-info {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #1a1a1a;
  font-size: 14px;
}

.share-time {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.share-target {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  margin-left: 52px;

  &:hover {
    background: #f1f5f9;
    border-color: #e2e8f0;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
}

.target-type {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #60c3d5;
  font-size: 13px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e2e8f0;

  .anticon {
    font-size: 16px;
  }
}

.target-preview {
  display: flex;
  flex-direction: column;
}

.picture-preview {
  img {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
}

.target-info {
  flex: 1;
  overflow: hidden;
}

.target-title {
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 8px;
  font-size: 15px;
}

.target-stats {
  display: flex;
  gap: 16px;
  color: #666;
  font-size: 13px;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

.target-content {
  font-size: 13px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.6;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: #94a3b8;
  border-radius: 12px;
}

.empty-icon {
  font-size: 48px;
  color: #60c3d5;
  margin-bottom: 16px;
  opacity: 0.5;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.empty-state p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .share-item {
    padding: 16px;
  }

  .share-target {
    padding: 12px;
    margin-left: 0;
  }

  .picture-preview img {
    width: 100px;
    height: 100px;
  }

  .target-stats {
    gap: 12px;
    font-size: 12px;
  }

  .empty-state {
    margin: 0 -16px;
    border-radius: 0;
  }
}
</style>
