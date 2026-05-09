// ===============================
// Отправка заказа в Google Sheets
// ===============================
async function sendOrderToGoogle(order) {
    const url = "https://script.google.com/macros/s/AKfycbz8xY5eKCGoDzncOtM-v9N5_LIdC86-Jy96dIBH2GX2QUXKn8zr3wuiyE_ol6P3aEaM/exec";

    const body = {
        name: order.name,
        phone: order.phone,
        address: order.address,
        comment: order.comment,
        items: order.items.map(i => `${i.name} — ${i.quantity} шт × ${i.price} ₽`).join("\n"),
        total: order.total
    };

    await fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
}



// ===============================
// Основная логика страницы
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const cart = getCart();
    const list = document.getElementById("checkout-items");
    const totalSpan = document.getElementById("checkout-total-sum");

    if (!cart.length) {
        list.innerHTML = "<p>Корзина пуста</p>";
        totalSpan.textContent = "0";
        return;
    }

    let total = 0;

    let itemsHtml = `
        <div class="checkout-items-header">
            <span>Товар</span>
            <span>Кол-во × цена</span>
            <span>Сумма</span>
        </div>
    `;

    itemsHtml += cart.map(item => {
        const sum = item.price * item.quantity;
        total += sum;

        return `
            <div class="checkout-item">
                <div class="checkout-item-name">${item.name}</div>
                <div class="checkout-item-qty">${item.quantity} × ${item.price} ₽</div>
                <div class="checkout-item-sum">${sum} ₽</div>
            </div>
        `;
    }).join("");

    list.innerHTML = itemsHtml;
    totalSpan.textContent = total;



    // ===============================
    // Маска телефона
    // ===============================
    const phoneInput = document.getElementById("phone");
    if (phoneInput) {
        phoneInput.addEventListener("input", () => {
            let value = phoneInput.value.replace(/\D/g, "");
            if (value.startsWith("7")) value = value.substring(1);

            let formatted = "+7 (";

            if (value.length > 0) formatted += value.substring(0, 3);
            if (value.length >= 3) formatted += ") " + value.substring(3, 6);
            if (value.length >= 6) formatted += "-" + value.substring(6, 8);
            if (value.length >= 8) formatted += "-" + value.substring(8, 10);

            phoneInput.value = formatted;
        });
    }



    // ===============================
    // Отправка формы
    // ===============================
    const form = document.getElementById("checkout-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const order = {
            name: document.getElementById("name").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            address: document.getElementById("address").value.trim(),
            comment: document.getElementById("comment").value.trim(),
            items: cart,
            total: total
        };

        // фиксируем, что купон был использован (если нужно)
        localStorage.setItem("couponApplied", "true");

        // отправляем заказ в Google Sheets
        await sendOrderToGoogle(order);

        // показываем сообщение
        alert("Ваш заказ успешно оформлен! Спасибо ❤️");

        // очищаем корзину
        localStorage.removeItem("cart");

        // переходим на страницу благодарности
        window.location.href = "success.html";
    });
});
