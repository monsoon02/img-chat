<template>
  <div id="MyTeamsPage">
    <!-- 标题区域 -->
    <div class="page-header">
      <h2 class="title">我的团队</h2>
      <div class="stats">
        <a-tooltip :title="`共加入 ${teamSpaceList.length} 个团队`">
          <a-progress
            type="circle"
            :size="device === DEVICE_TYPE_ENUM.PC ? 32 : 42"
            :percent="100"
            :stroke-color="{
              '0%': '#ff8e53',
              '100%': '#ff6b6b'
            }"
          />
        </a-tooltip>
      </div>
    </div>

    <div class="action-bar">
      <a-button type="primary" @click="handleAddTeam" class="add-team-button">
        <PlusOutlined /> 创建团队
      </a-button>
    </div>

    <!-- 团队列表 -->
    <div class="teams-container">
      <a-list :data-source="teamSpaceList" :loading="loading" item-layout="horizontal">
        <template #renderItem="{ item }">
          <a-list-item class="team-item" @click="handleTeamClick(item)">
            <a-list-item-meta>
              <template #title>
                <span class="team-name">
                  {{ item.space?.spaceName }}
                  <span v-if="item.space?.userId === loginUserStore.loginUser.id" class="owner-tag">
                    创建者
                  </span>
                </span>
              </template>
              <template #description>
                <div class="team-info">
                  <span class="role-tag">{{ SPACE_ROLE_MAP[item.spaceRole] }}</span>
                  <span class="date">{{ formatDate(item.createTime) }}</span>
                </div>
              </template>
            </a-list-item-meta>
            <RightOutlined class="arrow-icon" />
          </a-list-item>
        </template>
      </a-list>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PlusOutlined, RightOutlined } from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { SPACE_TYPE_ENUM, SPACE_ROLE_MAP } from '@/constants/space'
import dayjs from 'dayjs'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController.ts'
import { DEVICE_TYPE_ENUM } from '@/constants/device.ts'
import { getDeviceType } from '@/utils/device.ts'
const router = useRouter()
const loginUserStore = useLoginUserStore()
const teamSpaceList = ref<API.SpaceUserVO[]>([])
const loading = ref(false)

// 定义用于存储设备类型的响应式变量
const device = ref<string>('')
// 页面加载时获取设备类型并获取数据
onMounted(async () => {
  device.value = await getDeviceType()
})
// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 处理添加团队
const handleAddTeam = () => {
  router.push('/add_space?type=' + SPACE_TYPE_ENUM.TEAM)
}

// 处理团队点击
const handleTeamClick = (team: API.SpaceUserVO) => {
  // console.log('team:', team.space)
  router.push(`/space/${team.spaceId}`)
}

// 获取团队列表
onMounted(async () => {
  loading.value = true
  try {
    const res = await listMyTeamSpaceUsingPost({})
    // console.log('获取团队列表成功:', res)
    if (res.data.code === 0) {
      teamSpaceList.value = res.data.data ?? []
      // console.log('teamSpaceList:', teamSpaceList.value)
    }
  } catch (error) {
    console.error('获取团队列表失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
#MyTeamsPage {
  margin-top: -20px;
  margin-left: -6px;
  margin-right: -6px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 6px 6px 24px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  background: linear-gradient(135deg, #ff8e53, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.action-bar {
  margin-bottom: 24px;
}

.add-team-button {
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, #ff8e53 0%, #ff6b6b 100%);
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
  transition: all 0.3s ease;
}

.add-team-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.3);
}

.teams-container {
  margin: 0 -16px;
}

.team-item {
  padding: 16px 20px;
  margin: 0 16px 12px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.team-item:hover {
  background: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #ff8e53;
}

.team-name {
  font-size: 16px;
  color: #1a1a1a;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.owner-tag {
  color: #ff8e53;
  font-size: 12px;
  background: #fff6f3;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: normal;
}

.team-info {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 4px;
}

.role-tag {
  color: #64748b;
  font-size: 13px;
  background: #f8fafc;
  padding: 2px 8px;
  border-radius: 4px;
}

.date {
  color: #94a3b8;
  font-size: 13px;
}

.arrow-icon {
  color: #cbd5e1;
  font-size: 16px;
  transition: all 0.3s ease;
}

.team-item:hover .arrow-icon {
  color: #ff8e53;
  transform: translateX(4px);
}

:deep(.ant-list-item-meta-title) {
  margin-bottom: 4px !important;
}

:deep(.ant-list-item-meta-description) {
  font-size: 13px;
}

/* 进度条样式 */
:deep(.ant-progress-circle .ant-progress-text) {
  color: #ff8e53 !important;
  font-size: 12px;
}

/* 加载状态样式 */
:deep(.ant-spin-dot-item) {
  background-color: #ff8e53 !important;
}

/* 空状态样式 */
:deep(.ant-empty-description) {
  color: #64748b;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {

  .title {
    font-size: 20px;
  }

  .team-item {
    padding: 12px 16px;
    margin: 0 12px 8px;
  }

  .team-name {
    font-size: 15px;
  }
}
</style>
