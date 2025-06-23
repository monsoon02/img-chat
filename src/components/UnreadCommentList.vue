<template>
  <div class="unread-comment-list">
    <template v-if="comments && comments.length > 0">
      <div v-for="comment in comments" :key="comment.id || comment.commentId" class="comment-item">
        <!-- 评论者信息 -->
        <div class="comment-header">
          <a-avatar :src="comment.commentUser?.userAvatar" :size="40" />
          <div class="comment-info">
            <div class="user-name">{{ comment.commentUser?.userName || '未知用户' }}</div>
            <div class="comment-time">{{ formatTime(comment.createTime) }}</div>
          </div>
        </div>

        <!-- 评论内容 -->
        <div class="comment-content">{{ comment.content || '' }}</div>

        <!-- 评论目标 -->
        <div
          class="comment-target"
          :class="{ 'clickable': isTargetClickable(comment) }"
          @click="handleTargetClick(comment)"
        >
          <template v-if="comment.targetType === 1">
            <!-- 图片类型 -->
            <div class="target-preview picture-preview">
              <div class="target-type">
                <PictureOutlined />
                <span>{{ isReceived ? '评论了你的图片' : '你评论的图片' }}</span>
              </div>
              <img
                :src="comment.picture?.thumbnailUrl || '/default-image.png'"
                :alt="comment.picture?.name || '图片已失效'"
                @error="handleImageError"
                class="preview-image"
              >
              <div class="target-info">
                <div class="target-title">{{ comment.picture?.name || '图片已失效' }}</div>
                <div v-if="!isTargetClickable(comment)" class="target-status">
                  该图片已被删除或无法访问
                </div>
              </div>
            </div>
          </template>
          <template v-else-if="comment.targetType === 2">
            <!-- 帖子类型 -->
            <div class="target-preview post-preview">
              <div class="target-type">
                <FileTextOutlined />
                <span>{{ isReceived ? '评论了你的帖子' : '你评论的帖子' }}</span>
              </div>
              <div class="target-info">
                <div class="target-title">{{ comment.post?.title || '帖子已失效' }}</div>
                <div class="target-content">
                  {{ comment.post?.content ? stripHtml(comment.post.content) : '' }}
                </div>
                <div v-if="!isTargetClickable(comment)" class="target-status">
                  该帖子已被删除或无法访问
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
    <div v-else class="empty-state">
      <a-empty description="暂无评论记录" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useRouter } from 'vue-router'
import { CommentOutlined, PictureOutlined, FileTextOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

const router = useRouter()

const props = defineProps<{
  comments: any[]
  isReceived?: boolean
}>()

// 格式化时间
const formatTime = (time: string) => {
  try {
    return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
  } catch (error) {
    console.error('时间格式化错误:', error)
    return '-'
  }
}

// 检查目标是否可点击
const isTargetClickable = (comment: any) => {
  if (comment.targetType === 1) {
    return comment.picture && comment.picture.id
  } else if (comment.targetType === 2) {
    return comment.post && comment.post.id
  }
  return false
}

// 处理图片加载错误
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = '/default-image.png'
  img.classList.add('error')
}

// 处理目标点击
const handleTargetClick = (comment: any) => {
  try {
    if (!isTargetClickable(comment)) {
      return
    }

    if (comment.targetType === 1 && comment.picture?.id) {
      router.push(`/picture/${comment.picture.id}`)
    } else if (comment.targetType === 2 && comment.post?.id) {
      router.push(`/post/${comment.post.id}`)
    }
  } catch (error) {
    console.error('点击处理错误:', error)
  }
}

// 去除 HTML 标签
const stripHtml = (html: string) => {
  return html.replace(/<[^>]+>/g, '').slice(0, 100) + '...'
}
</script>

<style scoped>
.unread-comment-list {
  background: white;
  border-radius: 12px;
  padding: 16px;
}

.comment-item {
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

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.comment-info {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #1a1a1a;
  font-size: 14px;
}

.comment-time {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.comment-content {
  font-size: 14px;
  color: #1a1a1a;
  line-height: 1.6;
  margin-bottom: 16px;
  padding: 0 4px;
}

.comment-target {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;

  &.clickable {
    cursor: pointer;

    &:hover {
      background: #f1f5f9;
      border-color: #e2e8f0;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
  }
}

.target-type {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
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
  color: #d4d4d4;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 14px;
  color: #666;
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &.error {
    opacity: 0.5;
    filter: grayscale(100%);
  }
}

.target-status {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
  font-style: italic;
  padding: 4px 8px;
  background: #f8fafc;
  border-radius: 4px;
  border: 1px dashed #e2e8f0;
}

.post-preview {
  .target-info {
    background: #f8fafc;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
    opacity: 1;
    transition: all 0.3s ease;

    &:has(+ .target-status) {
      opacity: 0.6;
      background: #f1f5f9;
    }
  }

  .target-title {
    font-weight: 500;
    color: #1a1a1a;
    margin-bottom: 8px;
    font-size: 15px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .comment-item {
    padding: 16px;
  }

  .comment-target {
    padding: 12px;
  }

  .picture-preview img {
    width: 100px;
    height: 100px;
  }
}
</style>
