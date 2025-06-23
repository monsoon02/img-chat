<template>
  <div id="spaceUserManagePage">
    <!-- PC端展示 -->
    <template v-if="device === DEVICE_TYPE_ENUM.PC">
      <!-- 标题区域 -->
      <a-flex justify="space-between" class="header-section">
        <h2 class="page-title">空间成员管理</h2>
      </a-flex>

      <!-- 成员状态标签 -->
      <div class="status-tabs">
        <a-tabs v-model:activeKey="activeStatus" @change="handleStatusChange">
          <a-tab-pane key="1">
            <template #tab>
              <span class="tab-label">
                已通过
                <a-badge
                  :count="statusCounts[1]"
                  class="custom-badge"
                  :style="{ backgroundColor: activeStatus === '1' ? '#ff8e53' : '#8c8c8c' }"
                  :showZero="true"
                />
              </span>
            </template>
          </a-tab-pane>
          <a-tab-pane key="0">
            <template #tab>
              <span class="tab-label">
                待审核
                <a-badge
                  :count="statusCounts[0]"
                  class="custom-badge"
                  :style="{ backgroundColor: activeStatus === '0' ? '#ff8e53' : '#8c8c8c' }"
                  :showZero="true"
                />
              </span>
            </template>
          </a-tab-pane>
          <a-tab-pane key="2">
            <template #tab>
              <span class="tab-label">
                已拒绝
                <a-badge
                  :count="statusCounts[2]"
                  class="custom-badge"
                  :style="{ backgroundColor: activeStatus === '2' ? '#ff8e53' : '#8c8c8c' }"
                  :showZero="true"
                />
              </span>
            </template>
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 搜索和添加表单 -->
      <div class="search-form">
        <a-form layout="inline" :model="formData" @finish="handleSubmit">
          <a-form-item label="用户 ID">
            <a-input
              v-model:value="formData.userId"
              placeholder="请输入用户 ID"
              allow-clear
              class="search-input"
            />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit" class="submit-button">
              <UserAddOutlined />添加成员
            </a-button>
          </a-form-item>
        </a-form>
      </div>

      <!-- PC端表格 -->
      <a-table :columns="columns" :data-source="dataList" class="member-table">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'userInfo'">
            <a-space>
              <a-avatar
                :src="record.user?.userAvatar"
                class="clickable-avatar"
                @click="goToUserPage(record.user?.id)"
              />
              {{ record.user?.userName }}
            </a-space>
          </template>
          <template v-if="column.dataIndex === 'spaceRole'">
            <a-select
              v-model:value="record.spaceRole"
              :options="SPACE_ROLE_OPTIONS"
              @change="(value) => editSpaceRole(value, record)"
              :disabled="record.user?.id === loginUserStore.loginUser?.id"
            />
          </template>
          <template v-else-if="column.dataIndex === 'createTime'">
            {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space wrap>
              <template v-if="activeStatus !== '1' && record.user?.id !== loginUserStore.loginUser?.id">
                <a-button
                  type="primary"
                  @click="handleAudit(record, 1)"
                  style="background-color: #35cb6a"
                >
                  通过
                </a-button>
              </template>
              <template v-if="activeStatus !== '2' && record.user?.id !== loginUserStore.loginUser?.id">
                <a-button
                  type="primary"
                  danger
                  @click="handleAudit(record, 2)"
                >
                  拒绝
                </a-button>
              </template>
              <a-button
                type="link"
                danger
                @click="showDeleteConfirm(record)"
                :disabled="record.user?.id === loginUserStore.loginUser?.id"
              >
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </template>

    <!-- 移动端展示 -->
    <template v-else>
      <!-- 移动端状态切换 -->
      <van-tabs v-model:active="activeStatus" @change="handleStatusChange">
        <van-tab title="已通过" name="1">
          <template #title>
            <span>已通过</span>
            <van-badge :content="statusCounts[1]" />
          </template>
        </van-tab>
        <van-tab title="待审核" name="0">
          <template #title>
            <span>待审核</span>
            <van-badge :content="statusCounts[0]" color="#ff8e53" />
          </template>
        </van-tab>
        <van-tab title="已拒绝" name="2">
          <template #title>
            <span>已拒绝</span>
            <van-badge :content="statusCounts[2]" color="#ff4d4f" />
          </template>
        </van-tab>
      </van-tabs>

      <!-- 移动端搜索栏 -->
      <div class="mobile-search">
        <van-search
          v-model="formData.userId"
          placeholder="请输入用户 ID"
          shape="round"
          class="search-input"
        >
          <template #right-icon>
            <van-button type="primary" size="small" @click="handleSubmit" class="add-button">
              添加
            </van-button>
          </template>
        </van-search>
      </div>

      <!-- 移动端成员列表 -->
      <div class="member-list">
        <van-card v-for="member in dataList" :key="member.id" class="member-card">
          <template #title>
            <div class="member-info">
              <van-image
                :src="member.user?.userAvatar"
                round
                width="40"
                height="40"
                class="clickable-avatar"
                @click="goToUserPage(member.user?.id)"
              />
              <span class="username">{{ member.user?.userName }}</span>
            </div>
          </template>
          <template #desc>
            <div class="member-meta">
              <span class="join-time">
                加入时间：{{ dayjs(member.createTime).format('YYYY-MM-DD') }}
              </span>
              <div class="member-actions">
                <van-dropdown-menu class="role-dropdown">
                  <van-dropdown-item
                    v-model="member.spaceRole"
                    :options="mobileRoleOptions"
                    @change="(value) => editSpaceRole(value, member)"
                    :disabled="member.user?.id === loginUserStore.loginUser?.id"
                  />
                </van-dropdown-menu>
                <template v-if="activeStatus !== '1' && member.user?.id !== loginUserStore.loginUser?.id">
                  <van-button
                    size="small"
                    type="primary"
                    color="#35cb6a"
                    @click="handleAudit(member, 1)"
                    class="audit-btn"
                  >
                    通过
                  </van-button>
                </template>
                <template v-if="activeStatus !== '2' && member.user?.id !== loginUserStore.loginUser?.id">
                  <van-button
                    size="small"
                    type="danger"
                    @click="handleAudit(member, 2)"
                    class="audit-btn"
                  >
                    拒绝
                  </van-button>
                </template>
                <van-button
                  size="small"
                  type="danger"
                  @click="showDeleteConfirm(member)"
                  class="delete-btn"
                  :disabled="member.user?.id === loginUserStore.loginUser?.id"
                >
                  删除
                </van-button>
              </div>
            </div>
          </template>
        </van-card>
      </div>
    </template>

    <!-- 删除确认弹框 -->
    <a-modal
      v-model:open="deleteConfirmVisible"
      :title="null"
      :footer="null"
      :width="400"
      class="delete-confirm-modal"
    >
      <div class="delete-confirm-content">
        <div class="warning-icon">
          <ExclamationCircleFilled style="color: #ff6b6b;" />
        </div>
        <h3 class="confirm-title">确认移除该成员？</h3>
        <p class="confirm-desc">
          用户名称：{{ selectedMember?.user?.userName || '未设置' }}<br>
          用户账号：{{ selectedMember?.user?.userAccount }}
        </p>
        <div class="confirm-actions">
          <a-button class="cancel-button" @click="deleteConfirmVisible = false">取消</a-button>
          <a-button class="confirm-button" danger @click="confirmDelete">
            确认移除
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { SPACE_ROLE_OPTIONS } from '../../constants/space.ts'
import {
  addSpaceUserUsingPost,
  deleteSpaceUserUsingPost,
  editSpaceUserUsingPost,
  listSpaceUserUsingPost,
  auditSpaceUserUsingPost,
} from '@/api/spaceUserController.ts'
import dayjs from 'dayjs'
import { UserAddOutlined, ExclamationCircleFilled } from '@ant-design/icons-vue'
import { getDeviceType } from '@/utils/device.ts'
import { DEVICE_TYPE_ENUM } from '@/constants/device.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { useRouter } from 'vue-router'

const router = useRouter()

// 添加设备类型状态
const device = ref<string>('')

// 页面加载时获取设备类型
onMounted(async () => {
  device.value = await getDeviceType()
})

interface Props {
  id: string
}

const props = defineProps<Props>()

const columns = [
  {
    title: '用户',
    dataIndex: 'userInfo',
  },
  {
    title: '角色',
    dataIndex: 'spaceRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 定义数据
const dataList = ref<API.SpaceUserVO[]>([])

// 添加状态计数
const statusCounts = ref({
  0: 0, // 待审核
  1: 0, // 已通过
  2: 0  // 已拒绝
})

// 获取各状态的成员数量
const fetchStatusCounts = async () => {
  const spaceId = props.id
  if (!spaceId) return

  try {
    const promises = [0, 1, 2].map(status =>
      listSpaceUserUsingPost({
        spaceId: spaceId.toString(), // 使用字符串避免精度丢失
        status
      })
    )

    const results = await Promise.all(promises)
    results.forEach((res, index) => {
      if (res.data?.code === 0) {
        statusCounts.value[index] = res.data.data?.length || 0
      }
    })
  } catch (error) {
    console.error('获取成员数量失败:', error)
  }
}

// 获取数据
const fetchData = async () => {
  const spaceId = props.id
  if (!spaceId) {
    return
  }
  const res = await listSpaceUserUsingPost({
    spaceId: spaceId.toString(), // 使用字符串避免精度丢失
    status: Number(activeStatus.value),
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data ?? []
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

// 页面加载时获取数据，请求一次
onMounted(() => {
  fetchData()
  fetchStatusCounts()
})

// 添加成员表单
const formData = reactive<API.SpaceUserAddRequest>({})

// 创建成员
const handleSubmit = async () => {
  const spaceId = props.id
  if (!spaceId) {
    return
  }
  const res = await addSpaceUserUsingPost({
    spaceId,
    ...formData,
  })
  if (res.data.code === 0) {
    // message.success('添加成功')
    // 刷新数据
    fetchData()
  } else {
    message.error('添加失败，' + res.data.message)
  }
}

// 编辑成员角色
const editSpaceRole = async (value, record) => {
  const res = await editSpaceUserUsingPost({
    id: record.id,
    spaceRole: value,
  })
  if (res.data.code === 0) {
    message.success('修改成功')
  } else {
    message.error('修改失败，' + res.data.message)
  }
}

// 删除确认相关的状态
const deleteConfirmVisible = ref(false)
const selectedMember = ref<API.SpaceUserVO | null>(null)

// 显示删除确认框
const showDeleteConfirm = (member: API.SpaceUserVO) => {
  selectedMember.value = member
  deleteConfirmVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!selectedMember.value?.id) return

  try {
    const res = await deleteSpaceUserUsingPost({ id: selectedMember.value.id })
    if (res.data.code === 0) {
      message.success('移除成功')
      deleteConfirmVisible.value = false
      // 刷新数据
      fetchData()
    } else {
      message.error('移除失败：' + res.data.message)
    }
  } catch (error) {
    message.error('移除失败，请稍后重试')
  }
}

// 获取当前登录用户
const loginUserStore = useLoginUserStore()

// 添加移动端角色选项（添加标签前缀）
const mobileRoleOptions = SPACE_ROLE_OPTIONS.map((option) => ({
  ...option,
  text: `角色：${option.label}`,
  value: option.value,
}))

// 处理状态切换
const activeStatus = ref('1')
const handleStatusChange = (status: string) => {
  activeStatus.value = status
  fetchData()
}

// 处理审核
const handleAudit = async (record: API.SpaceUserVO, status: number) => {
  try {
    const res = await auditSpaceUserUsingPost({
      spaceId: props.id.toString(), // 使用字符串避免精度丢失
      userId: record.userId,
      status,
    })
    if (res.data?.code === 0) {
      message.success(status === 1 ? '已通过申请' : '已拒绝申请')
      fetchData()
      fetchStatusCounts() // 更新状态计数
    }
  } catch (error) {
    message.error('操作失败')
  }
}

// 跳转到用户主页
const goToUserPage = (userId?: number) => {
  if (userId) {
    router.push(`/user/${userId}`)
  }
}
</script>

<style scoped>
/* PC端样式 */
.header-section {
  margin-bottom: 24px;
}

.page-title {
  color: #1a1a1a;
  font-size: 24px;
  margin: 0;
}

.search-form {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-input {
  width: 240px;
  border-radius: 8px;

  :deep(.ant-input) {
    border-color: #e2e8f0;

    &:hover,
    &:focus {
      border-color: #ff8e53;
    }
  }
}

.submit-button {
  background: linear-gradient(135deg, #ff8e53 0%, #ff6b6b 100%);
  border: none;
  border-radius: 8px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  }
}

.member-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  :deep(.ant-table-thead > tr > th) {
    background: #fafafa;
    font-weight: 500;
  }

  :deep(.ant-select-selector) {
    border-radius: 6px !important;

    &:hover {
      border-color: #ff8e53 !important;
    }
  }

  :deep(.ant-select-focused .ant-select-selector) {
    border-color: #ff8e53 !important;
    box-shadow: 0 0 0 2px rgba(255, 142, 83, 0.1) !important;
  }
}

/* 移动端样式 */
.mobile-search {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  padding: 12px;
  margin: -12px 0 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 8px;

  .search-input {
    margin: 0;
    flex: 1;

    :deep(.van-search__content) {
      background: #f8fafc;
    }
  }

  .add-button {
    height: 32px;
    padding: 0 16px;
    border-radius: 16px;
    background: linear-gradient(135deg, #ff8e53 0%, #ff6b6b 100%);
    border: none;
    color: white;
    font-size: 14px;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(255, 142, 83, 0.2);

    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }
}

.member-list {
  padding: 0;
}

.member-card {
  margin-bottom: 12px;
  margin-left: 12px;
  margin-right: 12px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .member-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .username {
    font-size: 16px;
    font-weight: 500;
    color: #1a1a1a;
  }

  .member-meta {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .member-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 4px;
  }

  :deep(.role-dropdown) {
    flex: 1;

    .van-dropdown-menu__bar {
      height: 32px;
      background: #f8fafc;
      box-shadow: none;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
    }

    .van-dropdown-menu__title {
      font-size: 13px;
      color: #1a1a1a;
    }

    .van-dropdown-menu__title::after {
      border-color: transparent transparent #ff8e53 #ff8e53;
    }
  }

  .delete-btn {
    height: 32px;
    padding: 0 16px;
    border-radius: 16px;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
    border: none;
    color: white;
    font-size: 13px;
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.15);

    &:active {
      opacity: 0.9;
      transform: scale(0.98);
    }
  }

  /* 下拉菜单选项样式 */
  :deep(.van-dropdown-item__content) {
    .van-cell {
      padding: 10px 16px;
      font-size: 14px;
    }

    .van-dropdown-item__option--active {
      .van-cell__title {
        color: #ff8e53;
      }

      .van-dropdown-item__icon {
        color: #ff8e53;
      }
    }
  }

  .join-time {
    color: #64748b;
    font-size: 13px;
  }
}

/* 移动端搜索框样式优化 */
:deep(.van-search) {
  padding: 0;
  background: transparent;

  .van-cell {
    align-items: center;
    height: 36px;
    padding: 0 12px;
    background: #f8fafc;
    border-radius: 18px;
  }

  .van-field__left-icon {
    margin-right: 8px;
  }

  .van-field__control {
    height: 36px;
    font-size: 14px;
    color: #1a1a1a;

    &::placeholder {
      color: #94a3b8;
    }
  }
}

.delete-btn {
  &:disabled {
    opacity: 0.5;
    background: #94a3b8;
    box-shadow: none;
    cursor: not-allowed;
  }
}

/* 删除确认弹框样式 */
:deep(.delete-confirm-modal) {
  .ant-modal-content {
    padding: 0;
    border-radius: 16px;
    overflow: hidden;
  }

  .ant-modal-body {
    padding: 0;
  }
}

.delete-confirm-content {
  padding: 32px 24px;
  text-align: center;
}

.warning-icon {
  font-size: 48px;
  margin-bottom: 16px;

  .anticon {
    animation: pulse 2s infinite;
  }
}

.confirm-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.confirm-desc {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.cancel-button {
  min-width: 100px;
  height: 38px;
  border-radius: 19px;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    color: #1a1a1a;
    border-color: #94a3b8;
    background: #f8fafc;
  }
}

.confirm-button {
  min-width: 100px;
  height: 38px;
  border-radius: 19px;
  background: #ff6b6b;
  border: none;
  color: white;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: #ff5252;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
  }

  &:active {
    transform: translateY(1px);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .delete-confirm-content {
    padding: 24px 16px;
  }

  .warning-icon {
    font-size: 40px;
  }

  .confirm-title {
    font-size: 16px;
  }

  .confirm-desc {
    font-size: 13px;
  }

  .confirm-actions {
    gap: 8px;
  }

  .cancel-button,
  .confirm-button {
    min-width: 90px;
    height: 36px;
    font-size: 13px;
  }
}

.clickable-avatar {
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.audit-btn {
  margin-right: 8px;
}

/* 状态标签样式 */
.status-tabs {
  margin-bottom: 16px;
  background: white;
  padding: 0 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  :deep(.ant-tabs-nav) {
    margin-bottom: 0;
    padding: 0 8px;
  }

  :deep(.ant-tabs-tab) {
    padding: 16px;
    transition: all 0.3s ease;
    margin: 0 8px !important;

    &:hover {
      color: #ff8e53;
    }
  }

  :deep(.ant-tabs-tab-active) {
    .ant-tabs-tab-btn {
      color: #ff8e53;
      font-weight: 500;
    }
  }

  :deep(.ant-tabs-ink-bar) {
    background: #ff8e53;
    height: 3px;
    border-radius: 3px;
  }
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  position: relative;
  padding-right: 8px;
}

.custom-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: normal;
  line-height: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  :deep(.ant-badge-count) {
    background: transparent;
    color: white;
    box-shadow: none;
    height: auto;
    transform: scale(0.9);
    min-width: 20px;
    padding: 0 6px;
    font-size: 12px;
    font-weight: normal;
  }
}

/* 激活状态下的徽标动画 */
.ant-tabs-tab-active {
  .custom-badge {
    transform: scale(1.1);

    :deep(.ant-badge-count) {
      font-weight: 500;
    }
  }
}

/* 移动端徽章样式 */
:deep(.van-badge) {
  margin-left: 4px;
  transform: scale(0.8);
  transform-origin: left center;
}

:deep(.ant-select-disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

:deep(.van-dropdown-menu__item--disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
