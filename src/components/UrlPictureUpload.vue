<template>
  <div class="url-upload-container">
    <div class="preview-area" v-if="previewUrl">
      <img :src="previewUrl" class="preview-image" />
      <div class="preview-mask" @click="clearPreview">
        <p class="change-text">点击更换图片</p>
      </div>
    </div>
    <div v-else class="url-input-box">
      <div class="input-wrapper">
        <a-input
          v-model:value="url"
          placeholder="请输入图片URL"
          class="custom-input"
          :disabled="loading"
        >
          <template #prefix>
            <LinkOutlined class="url-icon" />
          </template>
        </a-input>
      </div>
      <a-button
        type="primary"
        class="submit-button"
        :loading="loading"
        @click="handlePreview"
        :disabled="!url"
      >
        预览图片
      </a-button>
    </div>
    <div class="tip-text">支持 http/https 链接的图片地址</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureByUrlUsingPost } from '@/api/pictureController.ts'
import { LinkOutlined } from '@ant-design/icons-vue'

interface Props {
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()
const url = ref<string>()
const loading = ref<boolean>(false)
const previewUrl = ref<string>('')

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

/**
 * 上传图片
 * @param file
 */
const handleSubmit = async () => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = { fileUrl: url.value }
    params.spaceId = props.spaceId
    if (props.picture) {
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      // message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
    } else {
      // message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    console.error('图片上传失败', error)
    // message.error('图片上传失败，' + error.message)
  }
  loading.value = false
}

// 预览图片
const handlePreview = async () => {
  if (!url.value) return

  try {
    // 创建一个 Image 对象来验证URL是否有效
    const img = new Image()
    img.src = url.value

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    })

    previewUrl.value = url.value
    // 自动开始上传
    handleSubmit()
  } catch (error) {
    message.error('无效的图片地址')
  }
}

// 清除预览
const clearPreview = () => {
  previewUrl.value = ''
  url.value = ''
}
</script>

<style scoped>
.url-upload-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.url-input-box {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.input-wrapper {
  flex: 1;
}

:deep(.custom-input) {
  border-radius: 12px;
  border-color: #e2e8f0;
  height: 44px;
  transition: all 0.3s ease;
}

:deep(.custom-input:hover) {
  border-color: #ff8e53;
}

:deep(.custom-input:focus) {
  border-color: #ff8e53;
  box-shadow: 0 0 0 2px rgba(255, 142, 83, 0.1);
}

:deep(.url-icon) {
  color: #94a3b8;
  transition: color 0.3s ease;
}

:deep(.custom-input:hover .url-icon),
:deep(.custom-input:focus .url-icon) {
  color: #ff8e53;
}

.submit-button {
  height: 44px;
  padding: 0 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  background: linear-gradient(135deg, #ff8e53 0%, #ff6b6b 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
  transition: all 0.3s ease;
}

.submit-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.3);
}

.submit-button:not(:disabled):active {
  transform: translateY(1px);
}

.submit-button:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  box-shadow: none;
}

.tip-text {
  font-size: 13px;
  color: #94a3b8;
  text-align: center;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .url-upload-container {
    padding: 16px;
  }

  .url-input-box {
    flex-direction: column;
    gap: 8px;
  }

  .submit-button {
    width: 100%;
  }

  .preview-area {
    min-height: 200px;
  }
}

.preview-area {
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 8px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.preview-image {
  width: 100%;
  display: block;
  max-height: 500px;
  object-fit: contain;
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
  cursor: pointer;
}

.preview-area:hover .preview-mask {
  opacity: 1;
}

.change-text {
  color: white;
  font-size: 15px;
  font-weight: 500;
}
</style>
