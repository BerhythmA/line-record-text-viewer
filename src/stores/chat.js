import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { parseLineChat, generateOutputText } from '../utils/parser';

export const useChatStore = defineStore('chat', () => {
  const title = ref('');
  const messages = ref([]);

  const groupedMessages = computed(() => {
    const grouped = {};
    messages.value.forEach(msg => {
      if (!grouped[msg.date]) {
        grouped[msg.date] = [];
      }
      grouped[msg.date].push(msg);
    });
    return grouped;
  });

  const uploadFile = async file => {
    const text = await file.text();
    const chatLog = parseLineChat(text);
    title.value = chatLog.title;
    messages.value = chatLog.messages;
  };

  const deleteMessage = messageId => {
    messages.value = messages.value.filter(msg => msg.id !== messageId);
  };

  const saveChat = async (selectedData = null) => {
    const dataToSave = selectedData || {
      title: title.value,
      messages: messages.value,
    };
    const output = generateOutputText(dataToSave);

    // 建立並下載文件
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat_edited.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    title,
    messages,
    groupedMessages,
    uploadFile,
    deleteMessage,
    saveChat,
  };
});
