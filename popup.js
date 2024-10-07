document.addEventListener('DOMContentLoaded', () => {
    const cartItemsDiv = document.getElementById('cartItems');
    const modeRadios = document.querySelectorAll('input[name="mode"]');
  
    function updateCart() {
      chrome.storage.sync.get('globalCart', (data) => {
        const globalCart = data.globalCart || [];
        cartItemsDiv.innerHTML = '';
        if (globalCart.length === 0) {
          cartItemsDiv.innerHTML = '<p>Your global cart is empty.</p>';
        } else {
          globalCart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.innerHTML = `
              <img src="${item.image}" alt="${item.name}">
              <div class="item-details">
                <p>${item.name}</p>
                <p>${item.price}</p>
              </div>
            `;
            cartItemsDiv.appendChild(itemDiv);
          });
        }
      });
    }
  
    updateCart();
  
    chrome.storage.sync.get('mode', (data) => {
      const currentMode = data.mode || 'manual';
      document.querySelector(`input[value="${currentMode}"]`).checked = true;
    });
  
    modeRadios.forEach(radio => {
      radio.addEventListener('change', (event) => {
        chrome.storage.sync.set({ mode: event.target.value });
      });
    });
  
    // Listen for changes to the global cart and update the popup
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.globalCart) {
        updateCart();
      }
    });
  });