chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ globalCart: [], mode: 'manual' });
  });
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'addToGlobalCart') {
      chrome.storage.sync.get('globalCart', (data) => {
        const globalCart = data.globalCart || [];
        globalCart.push(request.item);
        chrome.storage.sync.set({ globalCart }, () => {
          sendResponse({ success: true });
        });
      });
      return true;
    }
  });
  