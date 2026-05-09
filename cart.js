// ---------- КОРЗИНА: ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ С АНИМАЦИЯМИ, БЕЙДЖАМИ И МИНИ-КОРЗИНОЙ ----------

// Получить корзину из localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Сохранить корзину
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderMiniCart();

    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    }
}

// Добавить товар в корзину
function addToCart(product) {
    let cart = getCart();
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            img: product.img,
            oldPrice: product.oldPrice || null,
            quantity: 1
        });
    }

    saveCart(cart);
    showCartToast("Товар добавлен в корзину");
}

// Обновить счётчик товаров в шапке
function updateCartCount() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountSpan = document.getElementById('cart-count');

    if (cartCountSpan) {
        if (totalCount === 0) {
            cartCountSpan.style.display = 'none';
        } else {
            cartCountSpan.style.display = 'flex';
            cartCountSpan.innerText = totalCount;
        }
    }
}

// Удалить товар
function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
}

// Изменить количество
function changeQuantity(id, delta) {
    let cart = getCart();
    const item = cart.find(item => item.id === id);

    if (item) {
        item.quantity += delta;

        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }

        saveCart(cart);
        animateCartItem(id);
    }
}

// Анимация при изменении количества
function animateCartItem(id) {
    const el = document.querySelector(`.cart-item[data-id="${id}"]`);
    if (!el) return;
    el.classList.add('cart-item-animate');
    setTimeout(() => el.classList.remove('cart-item-animate'), 250);
}

// Всплывающее уведомление
function showCartToast(message) {
    const toast = document.getElementById('cart-toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('visible');

    setTimeout(() => toast.classList.remove('visible'), 1800);
}

// Мини‑корзина рядом с иконкой
function renderMiniCart() {
    const cart = getCart();
    const mini = document.getElementById('mini-cart');
    if (!mini) return;

    if (cart.length === 0) {
        mini.innerHTML = `
            <div class="mini-cart-list">
                <div class="mini-cart-empty">Корзина пуста</div>
            </div>
        `;
        return;
    }

    const totalSum = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    mini.innerHTML = `
        <div class="mini-cart-list">
            ${cart
                .map(
                    item => `
                    <div class="mini-cart-item">
                        <img src="${item.img}" alt="${item.name}">
                        <div>
                            <div class="mini-cart-name">${item.name}</div>
                            <div class="mini-cart-line">${item.quantity} × ${item.price} ₽</div>
                        </div>
                    </div>
                `
                )
                .join('')}

            <div class="mini-cart-total">
                <span>Итого:</span>
                <span class="mini-cart-total-sum">${totalSum} ₽</span>
            </div>

            <a href="cart.html" class="mini-cart-btn">Перейти в корзину</a>
        </div>
    `;
}

// Рендер корзины
function renderCartPage() {
    const cart = getCart();
    const container = document.getElementById('cart-items-container');

    const subtotalSpan = document.getElementById('cart-old-total');
    const savingsSpan = document.getElementById('cart-savings');
    const finalTotalSpan = document.getElementById('cart-total');

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p>Корзина пуста. Перейдите в <a href="catalog.html">каталог</a>.</p>';
        if (subtotalSpan) subtotalSpan.innerText = '0';
        if (savingsSpan) savingsSpan.innerText = '0';
        if (finalTotalSpan) finalTotalSpan.innerText = '0';
        return;
    }

    let subtotal = 0;
    let totalDiscount = 0;
    let html = '';

    cart.forEach(item => {
        const originalPrice = item.oldPrice ? item.oldPrice : item.price;
        const itemOriginalTotal = originalPrice * item.quantity;
        const itemCurrentTotal = item.price * item.quantity;
        const itemDiscount = itemOriginalTotal - itemCurrentTotal;

        subtotal += itemOriginalTotal;
        totalDiscount += itemDiscount;

        let discountBadgeHtml = '';

        if (item.oldPrice) {
            if (item.isCoupon) {
                // 🔥 Промокод — всегда –15%
                discountBadgeHtml = `<span class="cart-discount-badge">Промокод –15%</span>`;
            } else {
                // 🔥 Акция — всегда –20%
                discountBadgeHtml = `<span class="cart-discount-badge">–20%</span>`;
            }
        }


        html += `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.img}" alt="${item.name}" width="80" class="cart-item-img">

                <div class="cart-item-info">
                    <div class="cart-item-header">
                        <h4>${item.name}</h4>
                        ${discountBadgeHtml}
                    </div>

                    <div class="cart-item-price">
                        ${
                            item.oldPrice
                                ? `
                                    <span class="old-price">${item.oldPrice} ₽</span>
                                    <span class="new-price">${item.price} ₽</span>
                                  `
                                : `
                                    <span class="new-price">${item.price} ₽</span>
                                  `
                        }
                    </div>

                    ${
                        item.oldPrice
                            ? `<div class="cart-item-saving">Вы экономите: ${itemDiscount} ₽</div>`
                            : ''
                    }

                    <div class="cart-item-actions">
                        <button class="cart-qty-minus" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="cart-qty-plus" data-id="${item.id}">+</button>
                        <button class="cart-remove" data-id="${item.id}">Удалить</button>
                    </div>
                </div>

                <div class="cart-item-total">
                    ${
                        item.oldPrice
                            ? `
                                <span class="old-price">${itemOriginalTotal} ₽</span>
                                <span class="new-price">${itemCurrentTotal} ₽</span>
                              `
                            : `
                                <span class="new-price">${itemCurrentTotal} ₽</span>
                              `
                    }
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Итоги
    if (subtotalSpan) subtotalSpan.innerText = subtotal;
    if (savingsSpan) savingsSpan.innerText = totalDiscount;

    if (finalTotalSpan) {
        const finalTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        finalTotalSpan.innerText = finalTotal;
    }

    attachCartEvents();
    initTitlePreview();
}


// Привязка событий
function attachCartEvents() {
    document.querySelectorAll('.cart-qty-minus').forEach(btn => {
        btn.onclick = () => changeQuantity(btn.dataset.id, -1);
    });

    document.querySelectorAll('.cart-qty-plus').forEach(btn => {
        btn.onclick = () => changeQuantity(btn.dataset.id, 1);
    });

    document.querySelectorAll('.cart-remove').forEach(btn => {
        btn.onclick = () => removeFromCart(btn.dataset.id);
    });
}

// Мини‑превью при наведении на название
function initTitlePreview() {
    const items = document.querySelectorAll('.cart-item');

    items.forEach(item => {
        const title = item.querySelector('h4');
        const img = item.querySelector('.cart-item-img');
        if (!title || !img) return;

        let preview;

        title.addEventListener('mouseenter', () => {
            preview = document.createElement('div');
            preview.className = 'cart-preview';
            preview.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
            document.body.appendChild(preview);

            const rect = title.getBoundingClientRect();
            preview.style.top = rect.bottom + 8 + 'px';
            preview.style.left = rect.left + 'px';
        });

        title.addEventListener('mouseleave', () => {
            if (preview) {
                preview.remove();
                preview = null;
            }
        });
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {



    updateCartCount();
    renderMiniCart();

    if (document.getElementById('cart-items-container')) {
        renderCartPage();
    }
});

// ===== КУПОН WELCOME =====

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("coupon-input");
    const btn = document.getElementById("apply-coupon-btn");
    const msg = document.getElementById("coupon-message");

    if (!input || !btn) return;

    btn.addEventListener("click", () => {
        const code = input.value.trim().toUpperCase();

        if (code !== "WELCOME") {
            msg.textContent = "Неверный купон";
            msg.style.color = "red";
            return;
        }

        // Проверяем, использовал ли клиент купон после оформления заказа
        const used = localStorage.getItem("couponUsed");
        if (used === "true") {
            msg.textContent = "Купон уже был использован";
            msg.style.color = "red";
            return;
        }

        // Получаем корзину
        const cart = getCart();

        // Проверяем, есть ли товары без акции
        const nonPromoItems = cart.filter(item => !item.oldPrice);

        if (nonPromoItems.length === 0) {
            msg.textContent = "Купон действует только на товары без акции";
            msg.style.color = "red";
            return;
        }

        // Применяем купон
        applyWelcomeCoupon();

        msg.textContent = "Купон применён!";
        msg.style.color = "green";
    });
});


function applyWelcomeCoupon() {
    let cart = getCart();

    cart = cart.map(item => {
        // Если товар акционный — скидку НЕ даём
        if (item.oldPrice) return item;

        // Применяем скидку 15%
        const discounted = Math.round(item.price * 0.85);

        return {
            ...item,
            oldPrice: item.price,   // показываем старую цену
            price: discounted,      // новая цена
            isCoupon: true          // 🔥 пометка, что это промокод
        };
    });

    saveCart(cart);
}



