// 提取网页内容的核心函数
function extractContent() {
  try {
    // 创建文档副本以避免修改原始DOM
    const documentClone = document.cloneNode(true);
    
    // 使用Readability库解析内容
    const article = new Readability(documentClone).parse();
    
    if (!article) {
      return {
        success: false,
        title: document.title,
        content: "无法提取内容，请尝试在不同页面使用。",
        url: window.location.href
      };
    }
    
    // 构建结构化返回
    return {
      success: true,
      title: article.title || document.title,
      content: article.textContent.replace(/\s+/g, ' ').trim(),
      excerpt: article.excerpt,
      url: window.location.href,
      siteName: article.siteName || new URL(window.location.href).hostname,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("内容提取错误:", error);
    return {
      success: false,
      title: document.title,
      content: "提取过程中发生错误: " + error.message,
      url: window.location.href
    };
  }
}

// 监听来自popup或background的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractContent") {
    const extractedData = extractContent();
    sendResponse(extractedData);
  }
  return true; // 保持消息通道开放以进行异步响应
});
