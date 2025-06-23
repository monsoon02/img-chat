import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getLoginUserUsingGet } from '@/api/userController.ts';

/**
 * 存储登录用户信息的状态
 */
export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser = ref<API.LoginUserVO>({
    userName: '未登录'
  });

  /**
   * 远程获取登录用户信息
   */
  async function fetchLoginUser() {
    const res = await getLoginUserUsingGet();
    if (res.data.code === 0 && res.data.data) {
      loginUser.value = res.data.data;
    }
  }

  /**
   * 设置登录用户
   * @param newLoginUser
   */
  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser;
  }

  /**
   * 清除登录态的方法
   */
  function logout() {
    // 1. 清除Pinia仓库中存储的用户信息数据，将其恢复到初始状态
    loginUser.value = {
      userName: '未登录',
    };

    // 2. 清除可能存在的本地存储中的登录凭证等相关信息
    localStorage.removeItem('token'); // 假设使用localStorage存储了token作为登录凭证，根据实际情况调整键名
  }

  return { loginUser, fetchLoginUser, setLoginUser, logout };
});
