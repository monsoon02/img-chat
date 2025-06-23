<template>
  <div class="emoji-picker">
    <!-- 表情分类 -->
    <div class="emoji-categories">
      <div
        v-for="category in categories"
        :key="category.name"
        class="category-item"
        :class="{ active: currentCategory === category.name }"
        @click="currentCategory = category.name"
      >
        {{ category.icon }}
      </div>
    </div>

    <!-- 表情列表 -->
    <div class="emoji-list">
      <div class="category-name">{{ getCurrentCategoryLabel }}</div>
      <div class="emoji-grid">
        <div
          v-for="emoji in getCurrentCategoryEmojis"
          :key="emoji"
          class="emoji-item"
          @click="selectEmoji(emoji)"
        >
          {{ emoji }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 定义属性
const props = defineProps<{
  i18n?: Record<string, string>
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'select', emoji: string): void
}>()

// 表情分类和对应的表情
const emojiData = {
  smileys: [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍',
    '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎',
    '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩',
    '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰',
    '🥹', '🫣', '🫡', '🫢', '🤭', '🫠', '🤗', '🫂', '🤤', '🥴', '😵‍💫', '🤐', '🥱', '😴',
    '😮‍💨', '😶‍🌫️', '😶', '🫥', '😦', '😧', '🙄', '😬', '😑', '🫨', '🫤', '😐', '🤥', '🤫'
  ],
  gestures: [
    '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈',
    '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐',
    '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀',
    '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸', '🔥', '✨', '💫', '💥', '💢',
    '🫰', '🤌', '🫳', '🫴', '🫱', '🫲', '🫸', '🫷', '🤏', '��', '👐', '🙌', '🫱‍🫲',
    '💅', '🤳', '✍️', '🙆', '🙅', '🤷', '🙋', '🧏', '🙇', '🫡', '🤦', '🧎', '🧍', '💆'
  ],
  hearts: [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❤️‍🔥', '❤️‍🩹', '💝',
    '💞', '💓', '💗', '💖', '💘', '💕', '💌', '💟', '❣️', '💋', '💯', '💢', '💥', '💫', '💦',
    '💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔', '❤️‍🔥', '❤️‍🩹', '💋', '💯',
    '♥️', '♡', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💌', '💘', '💋', '💄'
  ],
  animals: [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸',
    '🐵', '🙈', '🙉', '🙊', '🐒', '🦍', '🦧', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉',
    '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲',
    '🦭', '🐋', '🐳', '🐬', '🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🪸', '🪼', '🦀', '🦞',
    '🦐', '🦑', '🐌', '🦋', '🐛', '🪲', '🐜', '🐝', '🪰', '🪱', '🦗', '🪳', '🕷️', '🕸️'
  ],
  flowers: [
    '🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴',
    '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🪹', '🪺', '🍄', '🌰', '🦀', '🐚'
  ],
  food: [
    '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍',
    '🥥', '🥝', '🍅', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🥕', '🧄', '🧅', '🥔', '🍠',
    '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗',
    '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥠', '🥡',
    '🦪', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮'
  ],
  objects: [
    '⌚️', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀',
    '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️',
    '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛️', '⏳', '📡', '🔋', '🔌', '💡', '🔦',
    '🎮', '🕹️', '🎲', '♟️', '🎭', '🎨', '🎼', '🎵', '🎶', '🎤', '🎧', '🎷', '🎸', '🎹',
    '🎺', '🎻', '🪘', '🥁', '🪗', '🎯', '🎱', '🎳', '🎮', '🎰', '🎲', '🎪', '🎭'
  ],
  weather: [
    '☀️', '🌤️', '⛅️', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄️', '🌬️',
    '💨', '🌪️', '🌫️', '🌊', '💧', '💦', '☔️', '⚡️', '❄️', '🌡️', '🌈', '🌞', '🌝', '🌚'
  ]
}

// 表情分类
const categories = [
  { name: 'smileys', icon: '😊', label: '表情符号' },
  { name: 'gestures', icon: '👋', label: '手势动作' },
  { name: 'hearts', icon: '❤️', label: '爱心符号' },
  { name: 'animals', icon: '🐶', label: '动物萌宠' },
  { name: 'flowers', icon: '🌸', label: '花草植物' },
  { name: 'food', icon: '🍔', label: '美食佳肴' },
  { name: 'objects', icon: '💡', label: '日常物品' },
  { name: 'weather', icon: '🌤️', label: '天气自然' }
]

const currentCategory = ref('smileys')

// 获取当前分类标签
const getCurrentCategoryLabel = computed(() => {
  const category = categories.find(c => c.name === currentCategory.value)
  return props.i18n?.[category.name] || category?.label || ''
})

// 获取当前分类的表情
const getCurrentCategoryEmojis = computed(() => {
  return emojiData[currentCategory.value as keyof typeof emojiData] || []
})

// 选择表情
const selectEmoji = (emoji: string) => {
  emit('select', emoji)
}
</script>

<style scoped>
.emoji-picker {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 320px;
  height: 360px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.emoji-categories {
  display: flex;
  padding: 8px;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
  flex-shrink: 0;
}

.category-item {
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.category-item:hover {
  background: #f1f5f9;
}

.category-item.active {
  background: #fff6f3;
}

.emoji-list {
  padding: 12px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.category-name {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  padding-left: 4px;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
  padding: 8px;
}

.emoji-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 22px;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: #fff;
}

.emoji-item:hover {
  background: #fff6f3;
  transform: scale(1.1);
}

/* 自定义滚动条样式 */
.emoji-list::-webkit-scrollbar {
  width: 6px;
}

.emoji-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.emoji-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.emoji-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .emoji-picker {
    width: 100%;
    height: 320px;
  }

  .emoji-grid {
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .emoji-item {
    font-size: 20px;
  }
}
</style>
