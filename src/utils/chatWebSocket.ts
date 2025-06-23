import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { message } from 'ant-design-vue'

// 添加类型定义
interface EventHandler {
  (data?: any): void
}

interface EventHandlers {
  [key: string]: EventHandler[]
}

interface WebSocketParams {
  pictureId?: number | string
  spaceId?: number | string
  privateChatId?: number | string
  type: 'chat' | 'space' | 'private'
}

export default class ChatWebSocket {
  private params: {
    pictureId?: string
    spaceId?: string
    privateChatId?: string
    type: 'chat' | 'space' | 'private'
  }
  private socket: WebSocket | null
  private eventHandlers: EventHandlers

  constructor(params: WebSocketParams) {
    this.params = {
      ...params,
      pictureId: params.pictureId?.toString(),
      spaceId: params.spaceId?.toString(),
      privateChatId: params.privateChatId?.toString(),
      type: params.type
    }
    this.socket = null
    this.eventHandlers = {}
  }

  /**
   * 初始化 WebSocket 连接
   */
  connect() {
    let url = '/api/ws/chat?'
    if (this.params.pictureId) {
      url += `pictureId=${this.params.pictureId}&type=${this.params.type}`
    } else if (this.params.spaceId) {
      url += `spaceId=${this.params.spaceId}&type=${this.params.type}`
    } else if (this.params.privateChatId) {
      url += `privateChatId=${this.params.privateChatId}&type=${this.params.type}`
    }

    url += `&t=${new Date().getTime()}`

    // 使用环境变量中配置的 WebSocket 地址
    const wsHost = import.meta.env.VITE_WS_URL
    this.socket = new WebSocket(`${wsHost}${url}`)
    this.socket.binaryType = 'blob'

    this.socket.onopen = () => {
      this.triggerEvent('open')
      this.sendMessage({
        type: 'getOnlineUsers'
      })
    }

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        this.triggerEvent('message', message)
      } catch (error) {
        // 错误处理
      }
    }

    this.socket.onclose = (event) => {
      this.triggerEvent('close', event)
      this.socket = null
    }

    this.socket.onerror = (error) => {
      this.triggerEvent('error', error)
    }
  }

  /**
   * 关闭 WebSocket 连接
   */
  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }
  }

  /**
   * 发送消息
   */
  sendMessage(message: object) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false
    }

    try {
      // 确保消息类型是数字
      const msgToSend = {
        ...message,
        type: typeof message.type === 'string' && message.type !== 'loadMore' && message.type !== 'getOnlineUsers'
          ? Number(message.type)
          : message.type
      }
      const messageStr = JSON.stringify(msgToSend)
      this.socket.send(messageStr)

      // 立即触发本地消息事件，不等待服务器响应
      if (msgToSend.type === 1 && msgToSend.content) {  // 私聊消息且有内容
        this.triggerEvent('message', {
          type: 'message',
          message: {
            ...msgToSend,
            id: Date.now().toString(),  // 临时ID
            sender: useLoginUserStore().loginUser
          }
        })
      }
      return true
    } catch (error) {
      console.error('发送消息失败:', error)
      return false
    }
  }

  /**
   * 添加事件监听
   */
  on(type: string, handler: EventHandler): void {
    if (!this.eventHandlers[type]) {
      this.eventHandlers[type] = []
    }
    this.eventHandlers[type].push(handler)
  }

  /**
   * 触发事件
   */
  private triggerEvent(type: string, data?: any): void {
    const handlers = this.eventHandlers[type]
    if (handlers) {
      handlers.forEach((handler: EventHandler) => handler(data))
    }
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }
}
