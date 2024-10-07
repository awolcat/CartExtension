// content.js
function detectAddToCart() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const addedNodes = mutation.addedNodes;
          addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              checkForAddToCartButtons(node);
            }
          });
        }
      });
    });
  
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Check for existing buttons on page load
    checkForAddToCartButtons(document.body);
  }
  
  function checkForAddToCartButtons(node) {
    // Amazon-specific selector
    const amazonButtons = node.querySelectorAll('input[name="submit.addToCart"], input[name="submit.add-to-cart"]');
    
    // Generic selectors for other e-commerce sites
    const genericButtons = node.querySelectorAll('button, input[type="submit"]');
    
    amazonButtons.forEach(button => {
      if (!button.dataset.globalCartListener) {
        button.addEventListener('click', handleAmazonAddToCart);
        button.dataset.globalCartListener = 'true';
      }
    });
  
    genericButtons.forEach(button => {
      if (!button.dataset.globalCartListener && 
          (button.textContent.toLowerCase().includes('add to cart') || 
           button.value.toLowerCase().includes('add to cart') ||
           button.id.toLowerCase().includes('add-to-cart'))) {
        button.addEventListener('click', handleGenericAddToCart);
        button.dataset.globalCartListener = 'true';
      }
    });
  }
  
  function handleAmazonAddToCart(event) {
    event.preventDefault();
    
    const productElement = event.target.closest('.a-tab-container');
    if (!productElement) {
      console.error('Unable to find product element');
      event.target.click();
      return;
    }
  
    const productName = productElement.querySelector('h2 span, h2 a').textContent.trim();
    const productPrice = productElement.querySelector('.a-price .a-offscreen').textContent.trim();
    const productImage = productElement.querySelector('img').src;
  
    const item = { name: productName, price: productPrice, image: productImage };
  
    addToGlobalCartWithMode(item);
  
    // Continue with the original add to cart action
    setTimeout(() => {
      event.target.click();
    }, 100);
  }
  
  function handleGenericAddToCart(event) {
    event.preventDefault();
    
    const productName = document.querySelector('h1, .product-title').textContent.trim();
    const productPrice = document.querySelector('.price, .product-price').textContent.trim();
    const productImage = document.querySelector('img[itemprop="image"], .product-image img').src;
  
    const item = { name: productName, price: productPrice, image: productImage };
  
    addToGlobalCartWithMode(item);
  
    // Continue with the original add to cart action
    setTimeout(() => {
      event.target.click();
    }, 100);
  }
  
  function addToGlobalCartWithMode(item) {
    chrome.storage.sync.get('mode', (data) => {
      if (data.mode === 'auto') {
        addToGlobalCart(item);
      } else {
        showManualAddPrompt(item);
      }
    });
  }
  
  function addToGlobalCart(item) {
    chrome.runtime.sendMessage({ action: 'addToGlobalCart', item }, (response) => {
      if (response && response.success) {
        showNotification('Item added to Global Cart');
      }
    });
  }
  
  function showManualAddPrompt(item) {
    const prompt = document.createElement('div');
    prompt.style.position = 'fixed';
    prompt.style.top = '10px';
    prompt.style.right = '10px';
    prompt.style.padding = '10px';
    prompt.style.backgroundColor = '#f0f0f0';
    prompt.style.border = '1px solid #ccc';
    prompt.style.borderRadius = '5px';
    prompt.style.zIndex = '9999';
  
    prompt.innerHTML = `
      <p>Add "${item.name}" to Global Cart?</p>
      <button id="globalCartYes">Yes</button>
      <button id="globalCartNo">No</button>
    `;
  
    document.body.appendChild(prompt);
  
    document.getElementById('globalCartYes').addEventListener('click', () => {
      addToGlobalCart(item);
      prompt.remove();
    });
  
    document.getElementById('globalCartNo').addEventListener('click', () => {
      prompt.remove();
    });
  }
  
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.right = '10px';
    notification.style.padding = '10px';
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '9999';
  
    document.body.appendChild(notification);
  
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
  detectAddToCart();