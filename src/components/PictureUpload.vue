<template>
  <div class="upload-container">
    <div class="upload-box" @click="handleClick" @drop.prevent="handleDrop" @dragover.prevent>
      <div v-if="!previewUrl" class="upload-content">
        <CloudUploadOutlined class="upload-icon" />
        <div class="upload-text">
          <p class="primary-text">
            {{ isMobile ? '点击上传' : '点击或拖拽上传' }}
          </p>
          <p class="secondary-text">支持 JPG/PNG/GIF 格式</p>
        </div>
      </div>
      <div v-else class="preview-content">
        <img :src="previewUrl" class="preview-image" />
        <div class="preview-mask">
          <p class="change-text">点击更换图片</p>
        </div>
      </div>
      <input
        type="file"
        ref="fileInput"
        style="display: none"
        accept="image/*"
        @change="handleFileChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { CloudUploadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/pictureController'

interface Props {
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
  onUploadStart?: () => void
  onUploadProgress?: (progress: number) => void
}

const props = defineProps<Props>()
const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string>('')

// 检测是否为移动设备
const isMobile = ref(false)

// 监听 picture 属性的变化
watch(
  () => props.picture,
  (newPicture) => {
    if (newPicture?.url) {
      previewUrl.value = newPicture.url
    }
  },
  { immediate: true }, // 立即执行一次
)

onMounted(() => {
  // 检查是否为移动设备
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  )
})

// 点击上传区域时触发文件选择
const handleClick = () => {
  fileInput.value?.click()
}

// 处理文件拖放 (仅在非移动设备上启用)
const handleDrop = (e: DragEvent) => {
  if (isMobile.value) return

  e.preventDefault()
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    // 创建预览URL
    previewUrl.value = URL.createObjectURL(files[0])
    handleUpload(files[0])
  }
}

// 处理文件选择变化
const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (files && files.length > 0) {
    // 创建预览URL
    previewUrl.value = URL.createObjectURL(files[0])
    handleUpload(files[0])
  }
}

// 处理文件上传
const handleUpload = async (file: File) => {
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    message.error('请选择图片文件')
    return
  }

  // 检查文件大小（例如限制为5MB）
  if (file.size > 5 * 1024 * 1024) {
    message.error('图片大小不能超过5MB')
    return
  }

  props.onUploadStart?.()

  try {
    const formData = new FormData()
    formData.append('file', file)
    if (props.spaceId) {
      formData.append('spaceId', props.spaceId.toString())
    }
    if (props.picture?.id) {
      formData.append('id', props.picture.id.toString())
    }

    const res = await uploadPictureUsingPost(
      {
        spaceId: props.spaceId,
        id: props.picture?.id,
      },
      {},
      file,
      {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total ?? 100)
          )
          props.onUploadProgress?.(progress)
        },
      }
    )

    if (res.data.code === 0 && res.data.data) {
      // message.success('图片上传成功')
      props.onSuccess?.(res.data.data)
    } else {
      message.error('图片上传失败：' + (res.data?.message || '请检查图片格式和大小'))
    }
  } catch (error: any) {
    console.error('图片上传异常：', error)
    message.error('上传失败：' + (error.response?.data?.message || '请稍后重试'))
  } finally {
    // 清空文件输入框，允许重复上传同一文件
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}
</script>

<style scoped>
.upload-container {
  padding: 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-box {
  background: white;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  min-height: 400px; /* PC端增加最小高度 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-box:hover {
  border-color: #ff8e53;
  background: rgba(255, 142, 83, 0.02);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%; /* 确保内容宽度占满 */
}

.upload-icon {
  font-size: 48px;
  color: #ff8e53;
  transition: transform 0.3s ease;
}

.upload-box:hover .upload-icon {
  transform: translateY(-4px);
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.primary-text {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}

.secondary-text {
  font-size: 14px;
  color: #94a3b8;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .upload-container {
    padding: 16px;
  }

  .upload-box {
    padding: 24px;
    min-height: 200px; /* 移动端减小最小高度 */
    border-style: solid;
  }

  .upload-icon {
    font-size: 40px;
  }

  .primary-text {
    font-size: 15px;
  }

  .secondary-text {
    font-size: 13px;
  }
}

.preview-content {
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}

.preview-image {
  width: 100%;
  display: block;
  max-height: 500px; /* 设置最大高度，防止图片过大 */
  object-fit: contain; /* 改为 contain 以保持图片比例 */
}

.preview-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.preview-content:hover .preview-mask {
  opacity: 1;
}

.change-text {
  color: white;
  font-size: 15px;
  font-weight: 500;
}
</style>
