// Получаем ID товара из URL
const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get("id"));

// Ищем товар в catalog.js
const product = catalog.find(item => item.id === productId);

if (!product) {
    document.body.innerHTML = "<h2>Товар не найден</h2>";
} else {

    // ===== 1. Базовая информация =====
    const imgEl = document.getElementById("product-image");
    const titleEl = document.getElementById("product-title");
    const oldPriceEl = document.getElementById("product-oldprice");
    const newPriceEl = document.getElementById("product-price");

    imgEl.src = product.image;
    imgEl.alt = product.name;
    titleEl.textContent = product.name;

    // Базовая цена
    if (product.oldPrice) {
        oldPriceEl.textContent = product.oldPrice + " ₽";
    } else {
        oldPriceEl.style.display = "none";
    }
    newPriceEl.textContent = product.price + " ₽";

// Определяем категорию
const isBedding = product.category === "Постельное бельё";

const sizeBlock = document.getElementById("size-block");
const colorBlock = document.getElementById("color-block");

// Скрываем блоки сразу
if (sizeBlock) sizeBlock.style.display = "none";
if (colorBlock) colorBlock.style.display = "none";

// ===== 2. Логика для постельного белья =====
if (isBedding) {
    if (sizeBlock) sizeBlock.style.display = "block";
    if (colorBlock) colorBlock.style.display = "block";

    sizePrices = {
        "1.5-спальный": { price: product.price, old: product.oldPrice },
        "2-спальный": { price: product.price + 400, old: product.oldPrice ? product.oldPrice + 400 : null },
        "евро": { price: product.price + 800, old: product.oldPrice ? product.oldPrice + 800 : null }
    };

    function updatePrice(size) {
        const p = sizePrices[size];
        if (p.old) {
            oldPriceEl.textContent = p.old + " ₽";
            oldPriceEl.style.display = "inline-block";
        } else {
            oldPriceEl.style.display = "none";
        }
        newPriceEl.textContent = p.price + " ₽";
    }

    updatePrice("1.5-спальный");

    const sizeButtons = document.querySelectorAll("#size-selector button");
    sizeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            sizeButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            updatePrice(btn.dataset.size);
        });
    });
    if (sizeButtons[0]) sizeButtons[0].classList.add("active");

    const colorSelector = document.getElementById("color-selector");
    const colors = [
        { name: "Основной", value: "#e8e4dc" },
        { name: "Песочный", value: "#d8c7a1" },
        { name: "Дымчато‑серый", value: "#b7b7b7" }
    ];

    colors.forEach((color, index) => {
        const swatch = document.createElement("div");
        swatch.className = "color-swatch";
        swatch.style.backgroundColor = color.value;
        swatch.dataset.color = color.name;

        swatch.addEventListener("click", () => {
            document.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("active"));
            swatch.classList.add("active");
        });

        if (index === 0) swatch.classList.add("active");
        colorSelector.appendChild(swatch);
    });
}

    
    else {
        // ===== 3. Для остальных категорий =====
        if (sizeBlock) sizeBlock.style.display = "none";
        if (colorBlock) colorBlock.style.display = "none";
    }

    // ===== 4. Добавление в корзину =====
    const addBtn = document.getElementById("add-to-cart-btn");

    addBtn.addEventListener("click", () => {
        let finalPrice = product.price;
        let name = product.name;
        let selectedOldPrice = product.oldPrice;

        let selectedSize = null;

        if (isBedding && sizePrices) {
            const activeSizeBtn = document.querySelector("#size-selector .active");
            selectedSize = activeSizeBtn ? activeSizeBtn.dataset.size : "1.5-спальный";

            finalPrice = sizePrices[selectedSize].price;
            selectedOldPrice = sizePrices[selectedSize].old;

            name = `${product.name} (${selectedSize})`;
        }

        addToCart({
            id: isBedding ? `${product.id}-${selectedSize}` : String(product.id),
            name: name,
            price: finalPrice,
            img: product.image,
            oldPrice: selectedOldPrice
        });

        const toast = document.getElementById("cart-toast");
        if (toast) {
            toast.classList.add("visible");
            setTimeout(() => toast.classList.remove("visible"), 2000);
        }
    });


    // ===== 5. Вкладки: Описание / Уход / Гарантия =====
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = {
        desc: document.getElementById("tab-desc"),
        care: document.getElementById("tab-care"),
        warranty: document.getElementById("tab-warranty")
    };

    // Подставляем данные
    tabContents.desc.textContent = product.description || "Описание отсутствует.";
    tabContents.care.textContent = product.care || "Информация по уходу отсутствует.";
    tabContents.warranty.textContent = product.warranty || "Гарантия отсутствует.";

    // Переключение вкладок
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            Object.keys(tabContents).forEach(key => {
                tabContents[key].classList.remove("active");
            });

            const tab = btn.dataset.tab;
            tabContents[tab].classList.add("active");
        });
    });
}

// ===== Хлебные крошки =====
const bcCategoryLink = document.getElementById("breadcrumb-category-link");
const bcTitle = document.getElementById("breadcrumb-title");

if (bcCategoryLink && product) {
    bcCategoryLink.textContent = product.category;

    const categorySlug = convertCategory(product.category);
    bcCategoryLink.href = `catalog.html?category=${categorySlug}`;
}

if (bcTitle && product) bcTitle.textContent = product.name;

// ---------- ИЗБРАННОЕ НА СТРАНИЦЕ ТОВАРА ----------
document.addEventListener('DOMContentLoaded', function() {
    const favBtn = document.querySelector('.product-fav');

    if (favBtn && product) {
        const id = String(product.id); // ← ВАЖНО: используем id товара из catalog

        favBtn.dataset.id = id;

        if (getFavorites().includes(id)) {
            favBtn.classList.add('active');
        }

        favBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();

            toggleFavorite(id);
            favBtn.classList.toggle('active');
            updateFavoritesCount();
        });
    }
});


