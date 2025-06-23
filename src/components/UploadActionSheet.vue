<template>
  <Teleport to="body" :disabled="!modelValue">
    <div id="uploadActionSheet" class="custom-action-sheet" v-show="modelValue">
      <div class="action-sheet-overlay" @click="$emit('update:modelValue', false)"></div>
      <div class="action-sheet-wrapper">
        <div class="action-sheet-content">
          <div class="action-sheet-pet">
            <lottie-player
              src="https://assets5.lottiefiles.com/packages/lf20_syqnfe7c.json"
              background="transparent"
              speed="1"
              style="width: 150px; height: 150px;"
              loop
              autoplay
            ></lottie-player>
          </div>
          <div class="action-sheet-items">
            <div
              v-for="action in actions"
              :key="action.name"
              class="action-sheet-item"
              @click="onSelect(action)"
            >
              <van-icon :name="action.icon" />
              <div class="item-content">
                <div class="item-name">{{ action.name }}</div>
                <div class="item-subname">{{ action.subname }}</div>
              </div>
            </div>
          </div>
          <div class="action-sheet-cancel" @click="$emit('update:modelValue', false)">
            取消
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { listSpaceVoByPageUsingPost } from '@/api/spaceController'
import { message } from 'ant-design-vue'
import '@lottiefiles/lottie-player'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const loginUserStore = useLoginUserStore()

// 动作面板选项
const actions = [
  {
    name: '发布帖子',
    color: '#ff8e53',
    subname: '分享您的想法和图片',
    icon: 'edit',
    path: '/post/edit'
  },
  {
    name: '上传到公共图库',
    color: '#ff8e53',
    subname: '您的图片将在审核通过后展示给所有用户',
    icon: 'photo-o',
    path: '/add_picture'
  },
  {
    name: '上传到个人空间',
    color: '#ff6b6b',
    subname: '仅您自己可以查看和管理',
    icon: 'user-o',
    path: '/add_picture',
    needSpace: true
  },
]

// 处理选项选择
const onSelect = async (action: any) => {
  emit('update:modelValue', false)  // 先关闭弹框
  if (action.needSpace) {
    try {
      // 获取用户的第一个空间
      const res = await listSpaceVoByPageUsingPost({
        userId: loginUserStore.loginUser.id,
        current: 1,
        pageSize: 1,
      })
      if (res.data?.code === 0) {
        // 如果有空间，则进入上传页面
        if (res.data.data?.records?.length > 0) {
          const space = res.data.data.records[0]
          await router.push({
            path: action.path,
            query: {
              spaceId: space.id,
            },
          })
        } else {
          // 如果没有空间，则跳转到创建空间页面
          await router.push('/add_space')
          message.warn('请先创建空间')
        }
      } else {
        message.error('加载我的空间失败，' + res.data.message)
      }
    } catch (error: any) {
      console.error('获取空间信息失败：', error)
      message.error('获取空间信息失败，请稍后重试')
    }
  } else {
    try {
      await router.push(action.path)
    } catch (error) {
      console.error('路由跳转失败:', error)
      message.error('页面跳转失败，请稍后重试')
    }
  }
}
</script>

<style scoped>
.custom-action-sheet {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2147483647;
}

.action-sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  z-index: 2147483647;
}

.action-sheet-wrapper {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translateX(-50%);
  width: min(92vw, 560px);
  transform: translate(-50%, -50%);
  z-index: 2147483647;
}

.action-sheet-content {
  background: linear-gradient(to bottom, #fff9f6, #fff);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  position: relative;
  animation: popIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
}

.action-sheet-items {
  margin: 32px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-sheet-item {
  display: flex;
  align-items: center;
  padding: 24px;
  padding-left: 32px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.action-sheet-item:hover {
  background: rgba(255, 142, 83, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 142, 83, 0.15);
}

.action-sheet-item .van-icon {
  font-size: 32px;
  color: #ff8e53;
}

.item-content {
  margin-left: 24px;
  flex: 1;
}

.item-name {
  font-size: 20px;
  font-weight: 500;
  color: var(--color-primary, #ff8e53);
  margin-bottom: 6px;
}

.item-subname {
  font-size: 15px;
  color: #64748b;
  line-height: 1.5;
}

.action-sheet-cancel {
  margin-top: 16px;
  padding: 20px;
  text-align: center;
  font-size: 16px;
  color: #64748b;
  background: #fff;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
  font-weight: 500;
}

.action-sheet-cancel:hover {
  background: #f8f9fa;
  color: #ff6b6b;
}

/* 宠物动画样式 */
.action-sheet-pet {
  position: absolute;
  top: -85px;
  right: -45px;
  z-index: 1;
  pointer-events: none;
  animation: dogBounce 2s ease-in-out infinite;
}

@keyframes dogBounce {
  0%, 100% {
    transform: translateY(0) rotate(3deg);
  }
  50% {
    transform: translateY(-8px) rotate(-3deg);
  }
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .action-sheet-pet {
    top: -75px;
    right: -35px;
    transform: scale(0.7);
  }

  .action-sheet-content {
    padding: 32px 24px;
  }

  .action-sheet-item {
    padding: 20px;
    padding-left: 24px;
  }

  .item-name {
    font-size: 18px;
  }

  .item-subname {
    font-size: 14px;
  }
}
</style>
