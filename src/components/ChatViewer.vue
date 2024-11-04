<template>
  <div class="container mx-auto my-auto p-4">
    <h1 class="text-2xl font-bold mb-4">{{ title || '聊天記錄查看器' }}</h1>

    <!-- 檔案上傳 -->
    <label class="block mb-4">
      <span
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
      >
        選擇檔案
      </span>
      <input
        type="file"
        accept=".txt"
        @change="handleFileUpload"
        class="hidden"
      />
    </label>

    <!-- 日期選擇器 -->
    <div v-if="messages.length" class="mb-4 flex gap-4 items-center">
      <select v-model="selectedDate" class="border p-2 rounded">
        <option value="">全部日期</option>
        <option v-for="date in availableDates" :key="date" :value="date">
          {{ date }}
        </option>
      </select>

      <button
        v-if="selectedDate"
        @click="handleSaveSelectedDate"
        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        儲存當前日期訊息
      </button>
    </div>

    <!-- 聊天記錄顯示區 -->
    <div v-if="messages.length" class="space-y-8">
      <div v-for="(messages, date) in displayedMessages" :key="date">
        <!-- 日期標題 -->
        <div
          class="bg-gray-100 p-2 rounded sticky top-0 text-center font-bold mb-4 z-10"
        >
          {{ date }}
        </div>

        <!-- 訊息列表 -->
        <div class="space-y-4">
          <div
            v-for="message in messages"
            :key="message.id"
            :class="[
              'group px-4 py-2',
              message.isSystem
                ? 'flex justify-center'
                : 'flex items-start gap-4',
            ]"
          >
            <!-- 系統訊息 -->
            <div
              v-if="message.isSystem"
              class="bg-gray-50 px-4 py-2 rounded-lg text-gray-600 italic text-sm"
            >
              {{ message.content }}
            </div>

            <!-- 一般訊息 -->
            <template v-else>
              <div class="flex-1 max-w-2xl">
                <div
                  class="bg-white shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <!-- 發送者資訊 -->
                  <div class="flex items-center gap-2 mb-2">
                    <div
                      class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 overflow-hidden"
                    >
                      <span class="text-lg">{{
                        generateAvatar(message.sender)
                      }}</span>
                    </div>
                    <div class="font-medium">{{ message.sender }}</div>
                  </div>

                  <!-- 訊息內容 -->
                  <div class="text-gray-700 whitespace-pre-wrap break-words">
                    {{ message.content }}
                  </div>

                  <!-- 時間戳記 -->
                  <div class="text-gray-400 text-sm mt-2">
                    {{ message.time }}
                  </div>
                </div>
              </div>

              <!-- 刪除按鈕 -->
              <button
                @click="deleteMessage(message.id)"
                class="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 self-center transition-opacity"
                title="刪除訊息"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 全部儲存按鈕 -->
    <div class="fixed bottom-4 right-4">
      <button
        v-if="messages.length"
        @click="handleSave"
        class="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all"
      >
        儲存所有修改
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useChatStore } from '../stores/chat';

const store = useChatStore();
const { title, messages, groupedMessages } = storeToRefs(store);

// 日期選擇相關
const selectedDate = ref('');
const availableDates = computed(() => Object.keys(groupedMessages.value));

// 根據選擇的日期過濾顯示的訊息
const displayedMessages = computed(() => {
  if (!selectedDate.value) {
    return groupedMessages.value;
  }
  return {
    [selectedDate.value]: groupedMessages.value[selectedDate.value],
  };
});

// 生成頭像顯示文字
const generateAvatar = name => {
  if (!name) return '#';

  // 直接返回第一個字符（包括 emoji）
  return Array.from(name)[0];
  /*
  // 處理 emoji 和特殊字符
  const firstChar = Array.from(name)[0];

  // 如果是 emoji 或其他特殊字符，返回一個默認字符
  if (firstChar.length > 2 || /[\uD800-\uDFFF]/.test(firstChar)) {
    return '★';
  }

  return firstChar;*/
};

const handleFileUpload = async event => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    await store.uploadFile(file);
    event.target.value = ''; // 重置檔案輸入
  } catch (error) {
    alert('檔案上傳失敗: ' + error.message);
  }
};

const deleteMessage = messageId => {
  store.deleteMessage(messageId);
};

const handleSave = async () => {
  try {
    await store.saveChat();
  } catch (error) {
    alert('儲存失敗: ' + error.message);
  }
};

const handleSaveSelectedDate = async () => {
  if (!selectedDate.value) return;

  try {
    const selectedMessages = {
      title: title.value,
      messages: messages.value.filter(msg => msg.date === selectedDate.value),
    };
    await store.saveChat(selectedMessages);
  } catch (error) {
    alert('儲存特定日期訊息失敗: ' + error.message);
  }
};
</script>
