export function parseLineChat(content) {
  const lines = content.split('\n');
  const chatLog = {
    title: '',
    messages: [],
  };

  // 解析標題
  chatLog.title = lines[0].trim();

  let currentDate = '';
  const dateRegex = /^\d{4}\/\d{2}\/\d{2}\(.*\)$/;
  const timeRegex = /^\d{1,2}:\d{2}\t/;
  let messageId = 0;
  let currentMessage = null;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // 檢查是否為日期行
    if (dateRegex.test(line)) {
      currentDate = line.split('(')[0];
      continue;
    }

    // 檢查是否為新訊息
    if (timeRegex.test(line)) {
      // 如果有未完成的訊息，先儲存它
      if (currentMessage) {
        chatLog.messages.push(currentMessage);
      }

      const [time, ...rest] = line.split('\t');
      const content = rest.join('\t');

      let sender, messageContent, isSystem;

      if (rest.length > 1) {
        // 一般訊息
        [sender, messageContent] = [rest[0], rest[1]];
        isSystem = false;
      } else {
        // 系統訊息
        sender = 'System';
        messageContent = content;
        isSystem = true;
      }

      messageId++;
      const timestamp = new Date(`${currentDate} ${time}`);

      currentMessage = {
        id: `msg_${messageId}`,
        date: currentDate,
        time,
        sender,
        content: messageContent,
        isSystem,
        timestamp,
      };
    } else if (currentMessage) {
      // 如果不是新訊息的開始，且有當前訊息，則為多行訊息的延續
      currentMessage.content = currentMessage.content + '\n' + line;
    }
  }

  // 不要忘記加入最後一個訊息
  if (currentMessage) {
    chatLog.messages.push(currentMessage);
  }

  return chatLog;
}

export function generateOutputText(chatLog) {
  let output = chatLog.title + '\n\n';
  let currentDate = '';

  for (const msg of chatLog.messages) {
    if (msg.date !== currentDate) {
      output += `${msg.date}(週四)\n`;
      currentDate = msg.date;
    }

    if (msg.isSystem) {
      output += `${msg.time}\t${msg.content}\n`;
    } else {
      // 處理多行訊息
      const contentLines = msg.content.split('\n');
      output += `${msg.time}\t${msg.sender}\t${contentLines[0]}\n`;
      // 如果有多行，添加後續行
      for (let i = 1; i < contentLines.length; i++) {
        output += `${contentLines[i]}\n`;
      }
    }
  }

  return output;
}
