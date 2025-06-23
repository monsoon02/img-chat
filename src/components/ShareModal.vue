<template>
  <a-modal
    v-model:open="visible"
    :footer="null"
    class="share-modal"
    :width="360"
  >
    <!-- 添加标题显示 -->
    <div class="share-title" v-if="title">
      <h3>{{ title }}</h3>
    </div>

    <!-- 添加背景装饰 -->
    <div class="modal-background">
      <div class="background-circles">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </div>

    <!-- 添加宠物动画 -->
    <div class="modal-pet">
      <lottie-player
        :src="currentPet.url"
        background="transparent"
        speed="1"
        style="width: 120px; height: 120px;"
        loop
        autoplay
      ></lottie-player>
    </div>

    <div class="share-content">
      <!-- 图片预览区域 -->
      <div class="preview-section">
        <img
          :src="displayImageUrl"
          class="preview-image"
          alt="分享预览"
          @error="handleImageError"
        />
      </div>

      <!-- 二维码区域 -->
      <div class="qrcode-section">
        <div class="qrcode-wrapper">
          <a-qrcode
            :value="link"
            :size="180"
            :color="'#60c3d5'"
            :bgColor="'#ffffff'"
            :style="{ padding: '8px', background: 'white', borderRadius: '12px' }"
            class="custom-qrcode"
          />
          <div class="qrcode-tip">
            <span>扫码查看详情</span>
          </div>
        </div>
      </div>

      <div class="link-box">
        <span class="link-text" :title="link">{{ shortLink }}</span>
        <a-button type="primary" @click="copyLink" class="copy-button">
          复制链接
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import '@lottiefiles/lottie-player'

interface Props {
  title: string
  link: string
  imageUrl: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '分享图片',
  link: '',
  imageUrl: ''
})

// 是否可见
const visible = ref(false)

// 打开弹窗
const openModal = () => {
  visible.value = true
}

// 关闭弹窗
const closeModal = () => {
  visible.value = false
}

// 复制链接
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.link)
    message.success('链接已复制到剪贴板')
  } catch (err) {
    message.error('复制失败，请手动复制')
  }
}

// 宠物动画列表
const PETS = [
  {
    name: 'celebrating-cat',
    url: 'https://assets5.lottiefiles.com/packages/lf20_syqnfe7c.json'
  },
]

// 随机选择一个宠物
const currentPet = ref(PETS[Math.floor(Math.random() * PETS.length)])

// 处理图片加载错误
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = 'https://pic.imgdb.cn/item/65ced2939f345e8d03633db1.jpg?x-oss-process=style/small' // 使用压缩后的默认图片
}

// 计算缩短的链接
const shortLink = computed(() => {
  if (props.link.length > 30) {
    return props.link.substring(0, 27) + '...'
  }
  return props.link
})

// 计算实际显示的图片URL
const displayImageUrl = computed(() => {
  return props.imageUrl || 'https://pic.imgdb.cn/item/65ced2939f345e8d03633db1.jpg?x-oss-process=style/small'
})

// 暴露函数给父组件
defineExpose({
  openModal,
})
</script>

<style scoped>
.share-modal {
  :deep(.ant-modal-content) {
    background: linear-gradient(135deg, #fff5f0 0%, #fff 100%);
    border-radius: 16px;
    overflow: hidden;
  }

  :deep(.ant-modal-header) {
    background: transparent;
    border-bottom: none;
    padding: 24px 24px 0;
  }

  :deep(.ant-modal-body) {
    padding: 24px;
    position: relative;
  }
}

/* 添加标题样式 */
.share-title {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  h3 {
    margin: 0;
    color: #1a1a1a;
    font-size: 16px;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* 背景装饰 */
.modal-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.background-circles {
  position: relative;
  width: 100%;
  height: 100%;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
}

.circle-1 {
  width: 200px;
  height: 200px;
  background: #ff8e53;
  top: -100px;
  right: -50px;
}

.circle-2 {
  width: 150px;
  height: 150px;
  background: #ff6b6b;
  bottom: -50px;
  left: -50px;
}

.circle-3 {
  width: 100px;
  height: 100px;
  background: #ffb199;
  top: 50%;
  right: 30px;
  transform: translateY(-50%);
}

/* 宠物动画 */
.modal-pet {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 1;
  pointer-events: none;
  transform: scale(0.8);
  opacity: 0.9;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: scale(0.8) translateY(0);
  }
  50% {
    transform: scale(0.8) translateY(-10px);
  }
}

.share-content {
  position: relative;
  z-index: 2;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 图片预览区域 */
.preview-section {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #f8fafc;  /* 添加背景色 */
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;  /* 添加过渡效果 */
}

/* 二维码区域 */
.qrcode-section {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.qrcode-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.8);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(96, 195, 213, 0.15);
  transition: all 0.3s ease;
}

.custom-qrcode {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(96, 195, 213, 0.1);
}

.qrcode-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #60c3d5;
  margin-top: 8px;
  font-weight: 500;
}

.tip-icon {
  font-size: 16px;
  animation: bounce 2s ease infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.link-box {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.8);
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.link-text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #666;
  font-size: 13px;
}

.copy-button {
  flex-shrink: 0;
  height: 28px;
  border-radius: 14px;
  background: linear-gradient(135deg, #ff8e53 0%, #ff6b6b 100%);
  border: none;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(255, 107, 107, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(255, 107, 107, 0.3);
  }

  &:active {
    transform: translateY(1px);
  }
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .share-modal {
    :deep(.ant-modal-content) {
      margin: 12px;
    }
  }

  .preview-section {
    aspect-ratio: 1/1;
    background: #f5f5f5;
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .qrcode-wrapper {
    padding: 16px;
  }

  .custom-qrcode {
    width: 150px !important;
    height: 150px !important;
    box-shadow: 0 2px 6px rgba(96, 195, 213, 0.08);
  }

  .share-section {
    padding: 16px;
  }

  .section-title {
    font-size: 14px;
    margin-bottom: 12px;
  }

  .qrcode-wrapper {
    padding: 16px;
  }

  .qrcode-tip {
    font-size: 13px;
  }
}
</style>
