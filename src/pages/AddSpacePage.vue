<template>
  <div id="addSpacePage">
    <h2 class="page-title">
      {{ route.query?.id ? '修改' : '创建' }} {{ SPACE_TYPE_MAP[spaceType] }}
    </h2>
    <!-- 空间信息表单 -->
    <a-form
      name="spaceForm"
      layout="vertical"
      :model="spaceForm"
      @finish="handleSubmit"
      class="space-form"
    >
      <a-form-item name="spaceName" label="空间名称">
        <a-input
          v-model:value="spaceForm.spaceName"
          placeholder="请输入空间名称"
          allow-clear
          class="custom-input"
        />
      </a-form-item>
      <a-form-item name="spaceLevel" label="空间级别">
        <a-select
          v-model:value="spaceForm.spaceLevel"
          class="custom-select"
          placeholder="请选择空间级别"
          :options="filteredSpaceLevelOptions"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="loading" class="submit-button">
          <template #icon><SaveOutlined /></template>
          提交
        </a-button>
      </a-form-item>
    </a-form>
    <!-- 空间级别介绍 -->
    <a-card title="空间级别介绍" class="info-card">
      <template #title>
        <div class="card-title">
          <InfoCircleOutlined />
          <span>空间级别介绍</span>
        </div>
      </template>
      <a-typography-paragraph>
        * 目前仅支持开通普通版，如需升级空间，请联系
        <a href="http://my.lumenglover.com" target="_blank" class="link">鹿梦</a>
      </a-typography-paragraph>
      <a-typography-paragraph v-for="spaceLevel in spaceLevelList" class="level-item">
        {{ spaceLevel.text }}：大小 {{ formatSize(spaceLevel.maxSize) }}，数量
        {{ spaceLevel.maxCount }} 张
      </a-typography-paragraph>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  addSpaceUsingPost,
  getSpaceVoByIdUsingGet,
  listSpaceLevelUsingGet,
  updateSpaceUsingPost,
} from '@/api/spaceController.ts'
import { useRoute, useRouter } from 'vue-router'
import { SPACE_LEVEL_OPTIONS, SPACE_LEVEL_ENUM, SPACE_TYPE_ENUM, SPACE_TYPE_MAP } from '@/constants/space.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { formatSize } from '../utils'
import { SaveOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'

const loginUserStore = useLoginUserStore()
const isAdmin = computed(() => loginUserStore.loginUser?.userRole === 'admin')

// 根据用户角色过滤空间级别选项
const filteredSpaceLevelOptions = computed(() => {
  if (isAdmin.value) {
    return SPACE_LEVEL_OPTIONS
  }
  return SPACE_LEVEL_OPTIONS.filter(option => option.value === SPACE_LEVEL_ENUM.COMMON)
})

// 空间类别，默认为私有空间
const spaceType = computed(() => {
  if (route.query?.type) {
    return Number(route.query.type)
  } else {
    return SPACE_TYPE_ENUM.PRIVATE
  }
})

const space = ref<API.SpaceVO>()
const spaceForm = reactive<API.SpaceAddRequest | API.SpaceEditRequest>({})
const loading = ref(false)

const spaceLevelList = ref<API.SpaceLevel[]>([])

// 获取空间级别
const fetchSpaceLevelList = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  } else {
    message.error('获取空间级别失败，' + res.data.message)
  }
}

onMounted(() => {
  fetchSpaceLevelList()
})

const router = useRouter()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  const spaceId = space.value?.id
  loading.value = true
  let res
  if (spaceId) {
    // 更新
    res = await updateSpaceUsingPost({
      id: spaceId,
      ...spaceForm,
    })
  } else {
    // 创建
    res = await addSpaceUsingPost({
      ...spaceForm,
      spaceType: spaceType.value,
    })
  }
  // 操作成功
  if (res.data.code === 0 && res.data.data) {
    message.success('操作成功')
    // 跳转到空间详情页
    router.push({
      path: `/space/${res.data.data}`,
    })
  } else {
    message.error('操作失败，' + res.data.message)
  }
  loading.value = false
}


const route = useRoute()

// 获取老数据
const getOldSpace = async () => {
  // 获取到 id
  const id = route.query?.id
  if (id) {
    const res = await getSpaceVoByIdUsingGet({
      id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      space.value = data
      // 填充表单
      spaceForm.spaceName = data.spaceName
      spaceForm.spaceLevel = data.spaceLevel
    }
  }
}

onMounted(() => {
  getOldSpace()
})
</script>

<style scoped>
#addSpacePage {
  max-width: 720px;
  margin: 0 auto;
  padding: 32px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.page-title {
  color: #262626;
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 32px;
  text-align: center;
  background: linear-gradient(135deg, #ff8e53 0%, #ff6b6b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.space-form {
  :deep(.ant-form-item) {
    margin-bottom: 24px;
  }

  :deep(.ant-form-item-label) {
    padding-bottom: 8px;
  }

  :deep(.ant-form-item-label > label) {
    color: #262626;
    font-size: 14px;
    font-weight: 500;
    height: 28px;
    display: flex;
    align-items: center;
  }

  :deep(.ant-form-item-explain-error) {
    font-size: 13px;
    margin-top: 4px;
  }
}

.custom-input {
  :deep(.ant-input) {
    height: 42px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    padding: 0 16px;
    font-size: 14px;
    transition: all 0.3s ease;
    background: #fff;

    &::placeholder {
      color: #94a3b8;
    }

    &:hover {
      border-color: #ff8e53;
    }

    &:focus {
      border-color: #ff8e53;
      box-shadow: 0 0 0 2px rgba(255, 142, 83, 0.1);
    }
  }
}

.custom-input-number {
  width: 100%;

  :deep(.ant-input-number) {
    width: 100%;
    height: 42px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;

    &:hover {
      border-color: #ff8e53;
    }

    &:focus, &-focused {
      border-color: #ff8e53;
      box-shadow: 0 0 0 2px rgba(255, 142, 83, 0.1);
    }
  }

  :deep(.ant-input-number-input) {
    height: 40px;
    font-size: 14px;
    padding: 0 16px;
  }

  :deep(.ant-input-number-handler-wrap) {
    border-radius: 0 8px 8px 0;
    background: #f8fafc;
  }
}

.custom-select {
  :deep(.ant-select-selector) {
    min-height: 42px !important;
    border-radius: 8px !important;
    border: 1px solid #e2e8f0 !important;
    padding: 4px 16px !important;
    transition: all 0.3s ease !important;

    &:hover {
      border-color: #ff8e53 !important;
    }
  }

  :deep(.ant-select-focused .ant-select-selector) {
    border-color: #ff8e53 !important;
    box-shadow: 0 0 0 2px rgba(255, 142, 83, 0.1) !important;
  }

  :deep(.ant-select-selection-placeholder) {
    color: #94a3b8;
    font-size: 14px;
    line-height: 34px;
  }

  :deep(.ant-select-selection-item) {
    font-size: 14px;
    line-height: 34px;
  }

  :deep(.ant-select-selection-search) {
    margin-inline-start: 0;
  }
}

.submit-button {
  width: 100%;
  height: 44px;
  border-radius: 22px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #ff8e53 0%, #ff6b6b 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
  transition: all 0.3s ease;
  margin-top: 8px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(255, 107, 107, 0.3);
    background: linear-gradient(135deg, #ff9b69 0%, #ff7c7c 100%);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.2);
  }

  &:disabled {
    background: #e2e8f0;
    box-shadow: none;
  }
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  #addSpacePage {
    padding: 20px 16px;
    border-radius: 0;
    box-shadow: none;
    background: transparent;
  }

  .page-title {
    font-size: 20px;
    margin-bottom: 24px;
  }

  .space-form {
    :deep(.ant-form-item) {
      margin-bottom: 20px;
    }

    :deep(.ant-form-item-label > label) {
      font-size: 13px;
    }
  }

  .custom-input,
  .custom-input-number :deep(.ant-input-number),
  .custom-select :deep(.ant-select-selector) {
    height: 40px !important;
  }

  .submit-button {
    height: 40px;
    font-size: 15px;
    border-radius: 20px;
  }
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  #addSpacePage {
    background: #1a1a1a;
  }

  .page-title {
    color: #fff;
  }

  .space-form :deep(.ant-form-item-label > label) {
    color: #e5e7eb;
  }

  .custom-input :deep(.ant-input),
  .custom-input-number :deep(.ant-input-number),
  .custom-select :deep(.ant-select-selector) {
    background: #262626;
    border-color: #404040;
    color: #e5e7eb;

    &::placeholder {
      color: #6b7280;
    }
  }

  .custom-input-number :deep(.ant-input-number-handler-wrap) {
    background: #333;
    border-color: #404040;
  }
}

/* 信息卡片样式 */
.info-card {
  border-radius: 12px;
  overflow: hidden;
}

.info-card :deep(.ant-card-head) {
  border-bottom: 1px solid #f0f0f0;
  min-height: 48px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #262626;
  font-weight: 500;
}

.card-title .anticon {
  color: #ff9837;
}

.level-item {
  color: #595959;
  line-height: 1.8;
  margin-bottom: 8px;
}

.link {
  color: #ff9837;
  text-decoration: none;
  transition: all 0.3s ease;
}

.link:hover {
  color: #ffa940;
  text-decoration: underline;
}
</style>
