<template>
  <a-modal
    class="image-cropper-modal"
    v-model:open="visible"
    title="编辑图片"
    :footer="false"
    @cancel="closeModal"
    :width="800"
  >
    <!-- 比例选择 -->
    <div class="aspect-ratio-selector">
      <a-radio-group v-model:value="aspectRatio" button-style="solid">
        <a-radio-button value="free">自由裁剪</a-radio-button>
        <a-radio-button value="1:1">1:1</a-radio-button>
        <a-radio-button value="4:3">4:3</a-radio-button>
        <a-radio-button value="3:4">3:4</a-radio-button>
        <a-radio-button value="16:9">16:9</a-radio-button>
      </a-radio-group>
    </div>

    <!-- 图片裁切组件 -->
    <div class="cropper-container">
      <vue-cropper
        ref="cropperRef"
        :key="aspectRatio"
        :img="imageUrl"
        :autoCrop="true"
        :fixedBox="false"
        :centerBox="true"
        :canMoveBox="true"
        :info="true"
        outputType="png"
        :fixed="aspectRatio !== 'free'"
        :fixedNumber="currentAspectRatio"
      />
    </div>

    <!-- 协同编辑操作 -->
    <div class="image-cropper-actions" v-if="isTeamSpace">
      <a-space>
        <a-button class="action-button"  v-if="editingUser" disabled>{{ editingUser.userName }} 正在编辑</a-button>
        <a-button class="action-button" v-if="canEnterEdit" type="primary" ghost @click="enterEdit">进入编辑</a-button>
        <a-button class="action-button" v-if="canExitEdit" danger ghost @click="exitEdit">退出编辑</a-button>
      </a-space>
    </div>

    <!-- 图片操作工具栏 -->
    <div class="image-cropper-actions">
      <a-space>
        <a-button class="action-button"  @click="rotateLeft" :disabled="!canEdit">
          <RotateLeftOutlined />
          <span v-if="device === DEVICE_TYPE_ENUM.PC">左旋转</span>
        </a-button>
        <a-button class="action-button" @click="rotateRight" :disabled="!canEdit">
          <RotateRightOutlined />
          <span v-if="device === DEVICE_TYPE_ENUM.PC">右旋转</span>
        </a-button>
        <a-button class="action-button" @click="changeScale(1)" :disabled="!canEdit">
          <FullscreenOutlined />
          <span v-if="device === DEVICE_TYPE_ENUM.PC">放大</span>
        </a-button>
        <a-button class="action-button" @click="changeScale(-1)" :disabled="!canEdit">
          <FullscreenExitOutlined />
          <span v-if="device === DEVICE_TYPE_ENUM.PC">缩小</span>
        </a-button>
        <a-button type="primary" class="confirm-button"  :loading="loading" :disabled="!canEdit" @click="handleConfirm">
          <CheckSquareOutlined />
          <span v-if="device === DEVICE_TYPE_ENUM.PC">确认</span>
        </a-button>
      </a-space>
    </div>

  </a-modal>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed,watchEffect,onUnmounted } from 'vue'
import { uploadPictureUsingPost } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import {
  RotateLeftOutlined,
  RotateRightOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons-vue'
import { getDeviceType } from '@/utils/device.ts'
import { DEVICE_TYPE_ENUM } from '@/constants/device.ts'
import { PICTURE_EDIT_ACTION_ENUM, PICTURE_EDIT_MESSAGE_TYPE_ENUM } from '@/constants/picture.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import PictureEditWebSocket from '@/utils/pictureEditWebSocket.ts'
import { SPACE_TYPE_ENUM } from '@/constants/space.ts'
// 定义用于存储设备类型的响应式变量
const device = ref<string>('')
// 页面加载时获取设备类型并获取数据
onMounted(async () => {
  device.value = await getDeviceType()
})
interface Props {
  imageUrl?: string
  picture?: API.PictureVO
  spaceId?: number
  space?: API.SpaceVO
  onSuccess?: (newPicture: API.PictureVO) => void
}

//获取空间类型

const props = defineProps<Props>()
// 是否为团队空间
const isTeamSpace = computed(() => {
  return props.space?.spaceType === SPACE_TYPE_ENUM.TEAM
})
// 获取图片裁切器的引用
const cropperRef = ref()

// 缩放比例
// 缩放比例，修改此函数以支持对图片尺寸等比例放大/缩小
// 新增：用于存储图片原始尺寸信息的响应式数据
const originalImageSize = ref({ width: 0, height: 0 })
// 缩放比例
const changeScale = (num) => {
  const currentRatio = currentAspectRatio.value;
  if (currentRatio[0]!== 0 && currentRatio[1]!== 0) {
    // 如果是固定比例，按比例缩放图片尺寸
    const scaleFactor = num === 1? 1.1 : 0.9; // 定义缩放因子，放大时为1.1，缩小为0.9，可根据需求调整
    const newWidth = originalImageSize.value.width * scaleFactor;
    const newHeight = originalImageSize.value.height * scaleFactor;
    cropperRef.value.changeImageData({
      width: newWidth,
      height: newHeight,
    });
  } else {
    // 自由比例时，按原逻辑缩放
    cropperRef.value?.changeScale(num);
  }

  if (num > 0) {
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_IN);
  } else {
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT);
  }
};
// 向左旋转
const rotateLeft = () => {
  cropperRef.value.rotateLeft()
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT)
}

// 向右旋转
const rotateRight = () => {
  cropperRef.value.rotateRight()
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT)
}

// 确认裁切
const handleConfirm = () => {
  cropperRef.value.getCropBlob((blob: Blob) => {
    // blob 为已经裁切好的文件
    const fileName = (props.picture?.name || 'image') + '.png'
    const file = new File([blob], fileName, { type: blob.type })
    // 上传图片
    handleUpload({ file })
  })
}

const loading = ref(false)

/**
 * 上传图片
 * @param file
 */
const handleUpload = async ({ file }: any) => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = props.picture ? { id: props.picture.id } : {}
    params.spaceId = props.spaceId
    const res = await uploadPictureUsingPost(params, {}, file)
    if (res.data.code === 0 && res.data.data) {
      // message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
      closeModal()
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    console.error('图片上传失败', error)
    message.error('图片上传失败，' + error.message)
  }
  loading.value = false
}

// 是否可见
const visible = ref(false)

// 打开弹窗
const openModal = () => {
  visible.value = true
}

const aspectRatio = ref('free')

// 计算当前宽高比
const currentAspectRatio = computed(() => {
  if (aspectRatio.value === 'free') return [0, 0]
  const [width, height] = aspectRatio.value.split(':').map(Number)
  return [width, height]
})
// 关闭弹窗
const closeModal = () => {
  visible.value = false
  // 断开 WebSocket 连接
  if (websocket) {
    websocket.disconnect()
  }
  editingUser.value = undefined
}

// 暴露函数给父组件
defineExpose({
  openModal,
})

// --------- 实时编辑 ---------
const loginUserStore = useLoginUserStore()
const loginUser = loginUserStore.loginUser

// 正在编辑的用户
const editingUser = ref<API.UserVO>()
// 当前用户是否可进入编辑
const canEnterEdit = computed(() => {
  return !editingUser.value
})
// 正在编辑的用户是本人，可退出编辑
const canExitEdit = computed(() => {
  return editingUser.value?.id === loginUser.id
})
// 可以点击编辑图片的操作按钮
const canEdit = computed(() => {
  // 不是团队空间，默认就可以编辑
  if (!isTeamSpace.value) {
    return true
  }
  // 团队空间，只有编辑者才能协同编辑
  return editingUser.value?.id === loginUser.id
})


let websocket: PictureEditWebSocket | null

// 初始化 WebSocket 连接，绑定监听事件
const initWebsocket = () => {
  const pictureId = props.picture?.id
  if (!pictureId || !visible.value) {
    return
  }
  // 防止之前的连接未释放
  if (websocket) {
    websocket.disconnect()
  }
  // 创建 websocket 实例
  websocket = new PictureEditWebSocket(pictureId)
  // 建立连接
  websocket.connect()

  // 监听一系列的事件
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.INFO, (msg) => {
    console.log('收到通知消息：', msg)
    message.info(msg.message)
  })

  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ERROR, (msg) => {
    console.log('收到错误通知：', msg)
    message.info(msg.message)
  })

  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT, (msg) => {
    console.log('收到进入编辑状态的消息：', msg)
    message.info(msg.message)
    editingUser.value = msg.user
  })

  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION, (msg) => {
    console.log('收到编辑操作的消息：', msg)
    message.info(msg.message)
    // 根据收到的编辑操作，执行相应的操作
    switch (msg.editAction) {
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT:
        rotateLeft()
        break
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT:
        rotateRight()
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_IN:
        changeScale(1)
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT:
        changeScale(-1)
        break
    }
  })

  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT, (msg) => {
    console.log('收到退出编辑状态的消息：', msg)
    message.info(msg.message)
    editingUser.value = undefined
  })
}

// 监听属性和 visible 变化，初始化 WebSocket 连接
watchEffect(() => {
  // 只有团队空间，才初始化 WebSocket 连接
  if (isTeamSpace.value) {
    initWebsocket()
  }
})

// 组件销毁时，断开 WebSocket 连接
onUnmounted(() => {
  // 断开 WebSocket 连接
  if (websocket) {
    websocket.disconnect()
  }
  editingUser.value = undefined
})

// 进入编辑状态
const enterEdit = () => {
  if (websocket) {
    // 发送进入编辑状态的请求
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT,
    })
  }
}

// 退出编辑状态
const exitEdit = () => {
  if (websocket) {
    // 发送退出编辑状态的请求
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT,
    })
  }
}

// 编辑图片操作
const editAction = (action: string) => {
  if (websocket) {
    // 发送编辑操作的请求
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION,
      editAction: action,
    })
  }
}
</script>

<style scoped>
.image-cropper-modal {
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

.aspect-ratio-selector {
  margin-bottom: 16px;
  text-align: center;
}

:deep(.ant-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

:deep(.ant-radio-button-wrapper) {
  border-radius: 20px;
  height: 32px;
  line-height: 30px;
  padding: 0 16px;
  border-color: #e2e8f0;
  color: #64748b;
}

:deep(.ant-radio-button-wrapper:not(:first-child)::before) {
  display: none;
}

:deep(.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)) {
  border-color: #ff8e53;
  color: #ff8e53;
  box-shadow: none;
}

.cropper-container {
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.vue-cropper {
  height: 500px !important;
  background: #f8fafc;
}

.image-cropper-actions {
  text-align: center;
  padding-top: 8px;
}

.action-button {
  height: 36px;
  padding: 0 16px;
  border-radius: 18px;
  border-color: #e2e8f0;
  color: #64748b;
  transition: all 0.3s ease;
}

.action-button:hover {
  border-color: #ff8e53;
  color: #ff8e53;
}

.action-button .anticon {
  font-size: 16px;
}

.confirm-button {
  height: 36px;
  padding: 0 20px;
  border-radius: 18px;
  background: linear-gradient(135deg, #ff8e53 0%, #ff6b6b 100%);
  border: none;
  color: white;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
  transition: all 0.3s ease;
}

.confirm-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.3);
}

.confirm-button:not(:disabled):active {
  transform: translateY(1px);
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .vue-cropper {
    height: 300px !important;
  }

  :deep(.ant-radio-button-wrapper) {
    height: 28px;
    line-height: 26px;
    padding: 0 12px;
    font-size: 13px;
  }

  .action-button,
  .confirm-button {
    height: 32px;
    padding: 0 12px;
  }

  .action-button .anticon {
    font-size: 14px;
  }
}
</style>
