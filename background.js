// 初始化扩展
chrome.runtime.onInstalled.addListener(() => {
  console.log("PageContenter 扩展已安装");
});

// 监听扩展图标点击事件
chrome.action.onClicked.addListener((tab) => {
  // 这部分代码在使用popup.html时不会触发，保留用于直接点击图标时的行为
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["Readability.js", "content.js"]
  }).then(() => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        const extractedData = extractContent();
        console.log("提取的内容:", extractedData);
      }
    });
  }).catch(err => console.error("执行脚本错误:", err));
});

// 处理来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "contentExtracted") {
    // 可以在这里处理提取到的内容，例如保存到存储
    chrome.storage.local.set({ lastExtracted: message.data });
  }
});
