<template>
  <div id="userResetPasswordPage">
    <div class="reset-container">
      <div class="reset-header">
        <h2 class="title">重置密码</h2>
        <p class="subtitle">请输入您的注册邮箱</p>
      </div>

      <a-form
        :model="formState"
        name="basic"
        autocomplete="off"
        @finish="handleSubmit"
        class="reset-form"
      >
        <!-- 邮箱输入 -->
        <a-form-item
          name="email"
          :rules="[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入正确的邮箱格式' }
          ]"
        >
          <a-input
            v-model:value="formState.email"
            placeholder="请输入邮箱"
            size="large"
            :prefix="h(MailOutlined)"
            class="custom-input"
          />
        </a-form-item>

        <!-- 邮箱验证码 -->
        <a-form-item
          name="code"
          :rules="[
            { required: true, message: '请输入验证码' },
            { len: 6, message: '验证码长度为 6 位' },
            { pattern: /^\d+$/, message: '验证码必须是数字' }
          ]"
        >
          <div class="verify-code-container">
            <a-input
              v-model:value="formState.code"
              placeholder="请输入邮箱验证码"
              size="large"
              :prefix="h(SafetyCertificateOutlined)"
              class="custom-input verify-input"
              maxlength="6"
            />
            <a-button
              class="send-code-btn"
              :disabled="!!countdown || !formState.email"
              @click="sendEmailCode"
              size="large"
            >
              {{ countdown ? `${countdown}s后重试` : '获取验证码' }}
            </a-button>
          </div>
        </a-form-item>

        <!-- 新密码输入 -->
        <a-form-item
          name="newPassword"
          :rules="[
            { required: true, message: '请输入新密码' },
            { min: 8, message: '密码长度不能小于 8 位' },
          ]"
        >
          <a-input-password
            v-model:value="formState.newPassword"
            placeholder="请输入新密码"
            size="large"
            :prefix="h(LockOutlined)"
            class="custom-input"
          />
        </a-form-item>

        <!-- 确认密码 -->
        <a-form-item
          name="checkPassword"
          :rules="[{ required: true, message: '请确认密码' }, { validator: validatePassword }]"
        >
          <a-input-password
            v-model:value="formState.checkPassword"
            placeholder="请确认密码"
            size="large"
            :prefix="h(CheckOutlined)"
            class="custom-input"
          />
        </a-form-item>

        <!-- 返回登录 -->
        <div class="login-link">
          记起密码了？
          <RouterLink to="/user/login" class="link-text">返回登录</RouterLink>
        </div>

        <!-- 提交按钮 -->
        <a-form-item>
          <a-button type="primary" html-type="submit" class="submit-button" size="large">
            重置密码
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, h, onBeforeUnmount } from 'vue'
import { resetPasswordUsingPost, getEmailCodeUsingPost } from '@/api/userController'
import { message } from 'ant-design-vue'
import router from '@/router'
import {
  MailOutlined,
  LockOutlined,
  CheckOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons-vue'

// 表单数据
const formState = reactive<API.UserResetPasswordRequest>({
  email: '',
  newPassword: '',
  checkPassword: '',
  code: '',
})

// 倒计时
const countdown = ref<number>(0)
let timer: NodeJS.Timeout | null = null

// 发送邮箱验证码
const sendEmailCode = async () => {
  try {
    const res = await getEmailCodeUsingPost({
      email: formState.email,
      type: 'resetPassword'
    })
    if (res.data.code === 0) {
      message.success('验证码已发送')
      countdown.value = 60
      timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer!)
          timer = null
        }
      }, 1000)
    } else {
      message.error(res.data.message || '发送失败')
    }
  } catch (error: any) {
    if (error.response?.data) {
      message.error(error.response.data.message || '发送失败')
    } else {
      message.error('网络错误，请稍后重试')
    }
  }
}

// 验证两次密码是否一致
const validatePassword = async (_rule: any, value: string) => {
  if (value !== formState.newPassword) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

// 提交表单
const handleSubmit = async (values: any) => {
  try {
    const res = await resetPasswordUsingPost(values)
    if (res.data.code === 0) {
      message.success('密码重置成功')
      await router.push('/user/login')
    } else {
      message.error(res.data.message || '重置失败')
    }
  } catch (error: any) {
    if (error.response?.data) {
      message.error(error.response.data.message || '重置失败')
    } else {
      message.error('网络错误，请稍后重试')
    }
  }
}

// 组件卸载时清除定时器
onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped>
#userResetPasswordPage {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.reset-container {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.reset-header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #ff8e53 0%, #ff6b6b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 14px;
  color: #64748b;
}

.verify-code-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.verify-input {
  flex: 1;
}

.send-code-btn {
  min-width: 120px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff8e53 0%, #ff6b6b 100%);
  border: none;
  color: white;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.send-code-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
}

.send-code-btn:active:not(:disabled) {
  transform: translateY(1px);
}

.send-code-btn:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-bottom: 24px;
  color: #64748b;
  font-size: 14px;
}

.login-link .link-text {
  color: #ff8e53;
  font-weight: 500;
  margin-left: 4px;
  transition: color 0.3s ease;
}

.login-link .link-text:hover {
  color: #ff7a3d;
}

.submit-button {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff8e53 0%, #ff6b6b 100%);
  border: none;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
  transition: all 0.3s ease;
}

.submit-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.3);
}

.submit-button:active {
  transform: translateY(1px);
}

.custom-input :deep(.ant-input) {
  height: 44px;
  border-radius: 12px;
  border-color: #e2e8f0;
  padding: 0 16px 0 44px;
  transition: all 0.3s ease;
  font-size: 15px;
}

.custom-input :deep(.ant-input):hover {
  border-color: #ff8e53;
}

.custom-input :deep(.ant-input):focus {
  border-color: #ff8e53;
  box-shadow: 0 0 0 2px rgba(255, 142, 83, 0.1);
}

.custom-input :deep(.ant-input-prefix) {
  margin-right: 12px;
  color: #94a3b8;
  font-size: 18px;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  #userResetPasswordPage {
    padding: 0;
    align-items: flex-start;
  }

  .reset-container {
    max-width: 100%;
    padding: 32px 24px;
    border-radius: 0;
    box-shadow: none;
    min-height: 100vh;
  }

  .reset-header {
    margin-top: 40px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 15px;
  }

  .custom-input :deep(.ant-input) {
    height: 42px;
    font-size: 14px;
  }

  .send-code-btn {
    min-width: 100px;
    height: 42px;
    font-size: 13px;
  }

  .submit-button {
    height: 42px;
    font-size: 15px;
  }
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .reset-container {
    background: #1a1a1a;
  }

  .title {
    background: linear-gradient(135deg, #ff8e53 0%, #ff6b6b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .subtitle {
    color: #94a3b8;
  }

  .custom-input :deep(.ant-input) {
    background: #262626;
    border-color: #404040;
    color: #e5e7eb;
  }

  .custom-input :deep(.ant-input):hover {
    border-color: #ff8e53;
  }

  .custom-input :deep(.ant-input):focus {
    border-color: #ff8e53;
    box-shadow: 0 0 0 2px rgba(255, 142, 83, 0.1);
  }

  .custom-input :deep(.ant-input-prefix) {
    color: #64748b;
  }

  .login-link {
    color: #94a3b8;
  }
}
</style>
