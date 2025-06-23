<template>
  <a-modal
    class="image-out-painting-modal"
    v-model:visible="visible"
    title="AI 扩图"
    :footer="false"
    @cancel="closeModal"
    :width="800"
  >
    <div class="out-painting-container">
      <!-- PC端，左右布局 -->
      <template v-if="device === DEVICE_TYPE_ENUM.PC">
        <div class="image-comparison">
          <div class="image-section original">
            <div class="section-title">原始图片</div>
            <div class="image-wrapper">
              <img :src="picture?.url" :alt="picture?.name" />
            </div>
          </div>
          <div v-if="resultImageUrl" class="image-section result">
            <div class="section-title">扩图结果</div>
            <div class="image-wrapper">
              <img :src="resultImageUrl" :alt="picture?.name" />
            </div>
          </div>
        </div>
      </template>

      <!-- 移动端，上下布局 -->
      <template v-else>
        <div class="image-comparison mobile">
          <div class="image-section original">
            <div class="section-title">原始图片</div>
            <div class="image-wrapper">
              <img :src="picture?.url" :alt="picture?.name" />
            </div>
          </div>
          <div v-if="resultImageUrl" class="image-section result">
            <div class="section-title">扩图结果</div>
            <div class="image-wrapper">
              <img :src="resultImageUrl" :alt="picture?.name" />
            </div>
          </div>
        </div>
      </template>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-space>
          <a-button
            class="generate-button"
            type="primary"
            ghost
            :loading="!!taskId"
            @click="createTask"
          >
            <template #icon><ThunderboltOutlined /></template>
            生成图片
          </a-button>
          <a-button
            v-if="resultImageUrl"
            type="primary"
            class="apply-button"
            :loading="uploadLoading"
            @click="handleUpload"
          >
            <template #icon><CheckOutlined /></template>
            应用结果
          </a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import {
  createPictureOutPaintingTaskUsingPost,
  getPictureOutPaintingTaskUsingGet,
  uploadPictureByUrlUsingPost,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { getDeviceType } from '@/utils/device.ts'
import { DEVICE_TYPE_ENUM } from '@/constants/device.ts'
import { ThunderboltOutlined, CheckOutlined } from '@ant-design/icons-vue'
// 定义用于存储设备类型的响应式变量
const device = ref<string>('')
// 页面加载时获取设备类型并获取数据
onMounted(async () => {
  device.value = await getDeviceType()
})
interface Props {
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()

const resultImageUrl = ref<string>('')

// 任务 id
const taskId = ref<string>()

/**
 * 创建任务
 */
const createTask = async () => {
  if (!props.picture?.id) {
    return
  }
  const res = await createPictureOutPaintingTaskUsingPost({
    pictureId: props.picture.id,
    // 根据需要设置扩图参数
    parameters: {
      xScale: 2,
      yScale: 2,
    },
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建任务成功，请耐心等待，不要退出界面')
    // console.log(res.data.data.output.taskId)
    taskId.value = res.data.data.output.taskId
    // 开启轮询
    startPolling()
  } else {
    message.error('图片任务失败，' + res.data.message)
  }
}

// 轮询定时器
let pollingTimer: NodeJS.Timeout = null

// 开始轮询
const startPolling = () => {
  if (!taskId.value) {
    return
  }

  pollingTimer = setInterval(async () => {
    try {
      const res = await getPictureOutPaintingTaskUsingGet({
        taskId: taskId.value,
      })
      if (res.data.code === 0 && res.data.data) {
        const taskResult = res.data.data.output
        if (taskResult.taskStatus === 'SUCCEEDED') {
          message.success('扩图任务执行成功')
          resultImageUrl.value = taskResult.outputImageUrl
          // 清理轮询
          clearPolling()
        } else if (taskResult.taskStatus === 'FAILED') {
          message.error('扩图任务执行失败')
          // 清理轮询
          clearPolling()
        }
      }
    } catch (error) {
      console.error('扩图任务轮询失败', error)
      message.error('扩图任务轮询失败，' + error.message)
      // 清理轮询
      clearPolling()
    }
  }, 3000) // 每 3 秒轮询一次
}

// 清理轮询
const clearPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
    taskId.value = null
  }
}

// 是否正在上传
const uploadLoading = ref(false)

/**
 * 上传图片
 * @param file
 */
const handleUpload = async () => {
  uploadLoading.value = true
  try {
    const params: API.PictureUploadRequest = {
      fileUrl: resultImageUrl.value,
      spaceId: props.spaceId,
    }
    if (props.picture) {
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
      // 关闭弹窗
      closeModal()
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    console.error('图片上传失败', error)
    message.error('图片上传失败，' + error.message)
  }
  uploadLoading.value = false
}

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

// 暴露函数给父组件
defineExpose({
  openModal,
})
</script>

<style scoped>
.image-out-painting-modal {
  :deep(.ant-modal-content) {
    padding: 0;
    border-radius: 16px;
    overflow: hidden;
  }

  :deep(.ant-modal-header) {
    padding: 16px 24px;
    margin: 0;
    border-bottom: 1px solid #f0f0f0;
  }

  :deep(.ant-modal-body) {
    padding: 24px;
  }

  :deep(.ant-modal-close) {
    top: 16px;
  }
}

.out-painting-container {
  text-align: center;
}

.image-comparison {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  min-height: 400px;

  &.mobile {
    flex-direction: column;
    gap: 16px;
    min-height: auto;
  }
}

.image-section {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 15px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 12px;
}

.image-wrapper {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    max-width: 100%;
    max-height: 400px;
    border-radius: 8px;
    display: block;
    margin: 0 auto;
    object-fit: contain;
  }
}

.action-buttons {
  margin-top: 24px;
}

.generate-button {
  height: 36px;
  padding: 0 20px;
  border-radius: 18px;
  border-color: #ff8e53;
  color: #ff8e53;
  transition: all 0.3s ease;

  &:hover {
    color: #ff6b6b;
    border-color: #ff6b6b;
  }
}

.apply-button {
  height: 36px;
  padding: 0 20px;
  border-radius: 18px;
  background: linear-gradient(135deg, #ff8e53 0%, #ff6b6b 100%);
  border: none;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(255, 107, 107, 0.3);
  }

  &:active {
    transform: translateY(1px);
  }
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .image-wrapper {
    padding: 12px;

    img {
      max-height: 300px;
    }
  }

  .section-title {
    font-size: 14px;
    margin-bottom: 8px;
  }

  .action-buttons {
    margin-top: 16px;
  }

  .generate-button,
  .apply-button {
    height: 32px;
    padding: 0 16px;
    font-size: 13px;
  }
}
</style>
