<template>
  <div class="unread-like-list">
    <div v-for="like in likes" :key="like.id" class="like-item">
      <!-- 点赞者信息 -->
      <div class="like-header">
        <a-avatar :src="like.user.userAvatar" :size="40" />
        <div class="like-info">
          <div class="user-name">{{ like.user.userName }}</div>
          <div class="like-time">{{ formatTime(like.lastLikeTime) }}</div>
        </div>
      </div>

      <!-- 点赞目标 -->
      <div class="like-target" @click="handleTargetClick(like)">
        <template v-if="like.targetType === 1">
          <!-- 图片类型 -->
          <div class="target-preview picture-preview">
            <div class="target-type">
              <PictureOutlined />
              <span>{{ isReceived ? '赞了你的图片' : '你赞过的图片' }}</span>
            </div>
            <img :src="like.target.thumbnailUrl" :alt="like.target.name">
            <div class="target-info">
              <div class="target-title">{{ like.target.name }}</div>
            </div>
          </div>
        </template>
        <template v-else-if="like.targetType === 2">
          <!-- 帖子类型 -->
          <div class="target-preview post-preview">
            <div class="target-type">
              <FileTextOutlined />
              <span>{{ isReceived ? '赞了你的帖子' : '你赞过的帖子' }}</span>
            </div>
            <div class="target-info">
              <div class="target-title">{{ like.target.title }}</div>
              <div class="target-content">{{ stripHtml(like.target.content) }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!likes.length" class="empty-state">
      <LikeOutlined class="empty-icon" />
      <p>暂无未读点赞</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useRouter } from 'vue-router'
import { LikeOutlined, PictureOutlined, FileTextOutlined } from '@ant-design/icons-vue'

const router = useRouter()

const props = defineProps<{
  likes: any[]
  isReceived?: boolean
}>()

// 格式化时间
const formatTime = (time: string) => {
  return formatDistanceToNow(new Date(time), { addSuffix: true, locale: zhCN })
}

// 处理目标点击
const handleTargetClick = (like: any) => {
  if (like.targetType === 1) {
    // 跳转到图片详情
    router.push(`/picture/${like.target.id}`)
  } else if (like.targetType === 2) {
    // 跳转到帖子详情
    router.push(`/post/${like.target.id}`)
  }
}

// 去除 HTML 标签
const stripHtml = (html: string) => {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, '').slice(0, 100) + '...'
}
</script>

<style scoped>
.unread-like-list {
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.like-item {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8fafc;
  }
}

.like-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.like-info {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #1a1a1a;
  font-size: 14px;
}

.like-time {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.like-target {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;

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
  color: #ff6b6b;
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
  text-align: center;
  padding: 48px 0;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  color: #ff6b6b;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 14px;
  color: #666;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .like-item {
    padding: 16px;
  }

  .like-target {
    padding: 12px;
  }

  .picture-preview img {
    width: 100px;
    height: 100px;
  }

  .target-stats {
    gap: 12px;
    font-size: 12px;
  }
}
</style>
