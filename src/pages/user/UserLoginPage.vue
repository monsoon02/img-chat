<template>
  <div id="userLoginPage">
    <div class="login-container">
      <div class="login-header">
        <h2 class="title">图库</h2>
        <p class="subtitle">欢迎回来</p>
      </div>

      <a-form
        :model="formState"
        name="basic"
        autocomplete="off"
        @finish="handleSubmit"
        class="login-form"
      >
        <!-- 账号输入 -->
        <a-form-item
          name="accountOrEmail"
          :rules="[{ required: true, message: '请输入账号或邮箱' }]"
        >
          <a-input
            v-model:value="formState.accountOrEmail"
            placeholder="请输入账号或邮箱"
            size="large"
            :prefix="h(UserOutlined)"
            class="custom-input"
          />
        </a-form-item>

        <!-- 密码输入 -->
        <a-form-item
          name="userPassword"
          :rules="[
            { required: true, message: '请输入密码' },
            { min: 8, message: '密码长度不能小于 8 位' },
          ]"
        >
          <a-input-password
            v-model:value="formState.userPassword"
            placeholder="请输入密码"
            size="large"
            :prefix="h(LockOutlined)"
            class="custom-input"
          />
        </a-form-item>

        <!-- 验证码 -->
        <a-form-item
          name="verifyCode"
          :rules="[
            { required: true, message: '请输入验证码' },
            { min: 4, message: '验证码长度为 4 位' },
          ]"
        >
          <div class="verify-code-container">
            <a-input-password
              v-model:value="formState.verifyCode"
              placeholder="请输入验证码"
              size="large"
              :prefix="h(SafetyCertificateOutlined)"
              class="custom-input verify-input"
            />
            <div class="code-image" @click="getVerifyCode">
              <img :src="verifyCodeImg" alt="验证码" />
            </div>
          </div>
        </a-form-item>

        <!-- 注册链接 -->
        <div class="register-link">
          还没有账号？
          <RouterLink to="/user/register" class="link-text">立即注册</RouterLink>
          <span class="divider">|</span>
          <RouterLink to="/user/reset-password" class="link-text">忘记密码</RouterLink>
        </div>

        <!-- 登录按钮 -->
        <a-form-item>
          <a-button type="primary" html-type="submit" class="submit-button" size="large">
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted, h } from 'vue'
import { getCodeUsingGet, userLoginUsingPost } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import router from '@/router'
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons-vue'

// 用于接受表单输入的值
const formState = reactive<API.UserLoginRequest>({
  accountOrEmail: '',
  userPassword: '',
  serververifycode: '',
  verifyCode: '',
})

// 获取验证码图片
const verifyCodeImg = ref<string>('')

const loginUserStore = useLoginUserStore()

/**
 * 得到验证码
 */
const getVerifyCode = async () => {
  const res = await getCodeUsingGet()
  if (res.data.code === 0 && res.data.data) {
    verifyCodeImg.value = 'data:image/jpeg;base64,' + res.data.data.base64Captcha
    formState.serververifycode = res.data.data.encryptedCaptcha
  }
}

onMounted(() => {
  getVerifyCode()
})

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  // 将获取到的加密后的验证码添加到传递给后端的参数中
  values.serververifycode = formState.serververifycode
  const res = await userLoginUsingPost(values)
  // 登录成功，把登录态保存到全局状态中
  if (res.data.code === 0 && res.data.data) {
    await loginUserStore.fetchLoginUser()
    message.success('登录成功')
    router.push({
      path: '/home',
      replace: true,
    })
  } else {
    message.error('登录失败，' + res.data.message)
    // 重新获取验证码
    getVerifyCode()
  }
}
</script>

<style scoped>
#userLoginPage {
  max-width: 360px;
  margin: 0 auto;
  padding-top: 40px;
}

.login-container {
  padding: 0 16px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: #64748b;
}

.login-form {
  :deep(.ant-form-item) {
    margin-bottom: 24px;
  }
}

.custom-input {
  :deep(.ant-input) {
    height: 44px;
    border-radius: 12px;
    border-color: #e2e8f0;
    padding: 0 16px 0 44px;
    transition: all 0.3s ease;
    font-size: 15px;

    &:hover {
      border-color: #ff8e53;
    }

    &:focus {
      border-color: #ff8e53;
      box-shadow: 0 0 0 2px rgba(255, 142, 83, 0.1);
    }
  }

  :deep(.ant-input-prefix) {
    margin-right: 12px;
    color: #94a3b8;
    font-size: 18px;
  }
}

.verify-code-container {
  display: flex;
  gap: 12px;
  align-items: center;

  .verify-input {
    flex: 1;
  }

  .code-image {
    width: 120px;
    height: 44px;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(1px);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 2px;
    }
  }
}

.register-link {
  text-align: center;
  margin-bottom: 24px;
  color: #64748b;
  font-size: 14px;

  .divider {
    margin: 0 8px;
    color: #e2e8f0;
  }

  .link-text {
    color: #ff8e53;
    font-weight: 500;
    margin-left: 4px;
    transition: color 0.3s ease;

    &:hover {
      color: #ff7a3d;
    }
  }
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
  #userLoginPage {
    padding-top: 32px;
  }

  .login-container {
    padding: 32px 24px;
    border-radius: 20px;
  }

  .title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 15px;
  }

  .custom-input {
    :deep(.ant-input) {
      height: 42px;
      font-size: 14px;
    }
  }

  .verify-code-container {
    .code-image {
      width: 110px;
      height: 42px;
    }
  }

  .submit-button {
    height: 42px;
    font-size: 15px;
  }
}
</style>
