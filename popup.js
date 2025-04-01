document.addEventListener('DOMContentLoaded', function() {
  const extractBtn = document.getElementById('extractBtn');
  const copyBtn = document.getElementById('copyBtn');
  const formatBtn = document.getElementById('formatBtn');
  const outputField = document.getElementById('output');
  const copyBadge = document.getElementById('copyBadge');
  const charCount = document.getElementById('charCount');
  const wordCount = document.getElementById('wordCount');
  const loadingIndicator = document.getElementById('loadingIndicator');
  
  let extractedData = null;
  
  // 更新统计信息
  function updateStats(text) {
    if (text) {
      charCount.textContent = `${text.length} 字符`;
      const words = text.trim().split(/\s+/).length;
      wordCount.textContent = `~${words} 词`;
    } else {
      charCount.textContent = '0 字符';
      wordCount.textContent = '0 词';
    }
  }
  
  // 提取内容
  extractBtn.addEventListener('click', () => {
    loadingIndicator.style.display = 'flex';
    outputField.value = '';
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const activeTab = tabs[0];
      
      chrome.scripting.executeScript({
        target: {tabId: activeTab.id},
        files: ['Readability.js']
      }).then(() => {
        chrome.tabs.sendMessage(activeTab.id, {action: "extractContent"}, (response) => {
          loadingIndicator.style.display = 'none';
          
          if (chrome.runtime.lastError) {
            outputField.value = `错误: ${chrome.runtime.lastError.message}\n尝试重新加载页面后重试。`;
            return;
          }
          
          if (response && response.success) {
            extractedData = response;
            const formattedContent = `# ${response.title}\n\n${response.content}\n\n来源: ${response.url}`;
            outputField.value = formattedContent;
          } else if (response) {
            outputField.value = `提取失败: ${response.content}`;
          } else {
            outputField.value = "无响应，页面可能不兼容或需要重新加载。";
          }
          
          updateStats(outputField.value);
        });
      }).catch(err => {
        loadingIndicator.style.display = 'none';
        outputField.value = `脚本执行错误: ${err.message}`;
      });
    });
  });
  
  // 复制到剪贴板
  copyBtn.addEventListener('click', () => {
    outputField.select();
    document.execCommand('copy');
    
    copyBadge.style.display = 'block';
    setTimeout(() => {
      copyBadge.style.display = 'none';
    }, 2000);
  });
  
  // 格式化内容
  formatBtn.addEventListener('click', () => {
    if (!extractedData) return;
    
    // 切换格式
    if (outputField.value.startsWith('# ')) {
      // 转为纯文本
      outputField.value = extractedData.content;
    } else {
      // 转为Markdown
      outputField.value = `# ${extractedData.title}\n\n${extractedData.content}\n\n\n---------\n\n来源: ${extractedData.url}`;
    }
    
    updateStats(outputField.value);
  });
  
  // 监听文本变化
  outputField.addEventListener('input', () => {
    updateStats(outputField.value);
  });
});
