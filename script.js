let globalSelectedSize = "1.5-спальный";

// === ГЛАВНАЯ КАРУСЕЛЬ: переключение слайдов, точки, автопрокрутка ===
const carousel = document.querySelector('.carousel-container');

if (carousel) {
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('carouselDots');

    let currentIndex = 0;
    let autoSlideInterval;
    const slideIntervalTime = 5000;

    function createDots() {
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === currentIndex) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        });
    }

    function goToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;

        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        document.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        currentIndex = index;
    }

    function nextSlide() { goToSlide(currentIndex + 1); }
    function prevSlide() { goToSlide(currentIndex - 1); }

    function startAutoSlide() {
        if (autoSlideInterval) clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(nextSlide, slideIntervalTime);
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); stopAutoSlide(); startAutoSlide(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); stopAutoSlide(); startAutoSlide(); });

    carousel.addEventListener('mouseenter', stopAutoSlide);
    carousel.addEventListener('mouseleave', startAutoSlide);

    createDots();
    startAutoSlide();
}

// === БУРГЕР-МЕНЮ: открытие, закрытие, блокировка прокрутки, клик вне меню ===
document.addEventListener('DOMContentLoaded', function() {
    const burger = document.querySelector('.burger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    const body = document.body;

    if (burger && mobileNav) {
        burger.addEventListener('click', function(e) {
            e.stopPropagation();
            burger.classList.toggle('active');
            mobileNav.classList.toggle('active');
            body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });

        const mobileLinks = mobileNav.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                mobileNav.classList.remove('active');
                body.style.overflow = '';
            });
        });

        document.addEventListener('click', function(event) {
            if (mobileNav.classList.contains('active') && 
                !mobileNav.contains(event.target) && 
                !burger.contains(event.target)) {
                burger.classList.remove('active');
                mobileNav.classList.remove('active');
                body.style.overflow = '';
            }
        });
    }
});

// === ПРЕОБРАЗОВАНИЕ РУССКИХ КАТЕГОРИЙ В АНГЛИЙСКИЕ SLUG-И ДЛЯ URL ===
function convertCategory(cat) {
    if (cat === "Постельное бельё") return "bedding";
    if (cat === "Одеяла и подушки") return "blankets";
    if (cat === "Постельные принадлежности") return "accessories";
    if (cat === "Покрывала и пледы") return "throws";
    if (cat === "Банные принадлежности") return "bath";
    if (cat === "Для детей") return "kids";
    return "";
}

// === ЛОГИКА ПОКАЗА И СКРЫТИЯ ФИЛЬТРА РАЗМЕРОВ ДЛЯ ПОСТЕЛЬНОГО БЕЛЬЯ ===
document.addEventListener("DOMContentLoaded", () => {
    const sizeBlock = document.getElementById("size-filter");
    const sidebar = document.querySelector(".catalog-sidebar");

    if (!sizeBlock || !sidebar) return;

    sizeBlock.style.display = "none";

    function updateSizeFilterVisibility() {
        const params = new URLSearchParams(window.location.search);
        const categorySlug = params.get("category");

        const beddingChecked = sidebar.querySelector(
            'input[type="checkbox"][value="Постельное бельё"]'
        )?.checked;

        // 🔥 ТЕПЕРЬ: только если пришли по ссылке ?category=bedding
        if (categorySlug === "bedding") {
            sizeBlock.style.display = "block";
        } else {
            sizeBlock.style.display = "none";
        }
    }

    updateSizeFilterVisibility();

    sidebar.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener("change", () => {
            if (cb.closest("#size-filter")) return;
            updateSizeFilterVisibility();
        });
    });
});


// === АВТОМАТИЧЕСКАЯ ОТМЕТКА КАТЕГОРИИ ПРИ ПЕРЕХОДЕ ПО ССЫЛКЕ (category=bedding) ===
document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const categorySlug = params.get("category"); // bedding / blankets / ...

    if (!categorySlug) return;

    // Соответствие slug → русское название
    const map = {
        bedding: "Постельное бельё",
        blankets: "Одеяла и подушки",
        accessories: "Постельные принадлежности",
        throws: "Покрывала и пледы",
        bath: "Банные принадлежности",
        kids: "Для детей"
    };

    const russianName = map[categorySlug];
    if (!russianName) return;

    const checkbox = document.querySelector(
        `.catalog-sidebar input[value="${russianName}"]`
    );

    if (checkbox) {
        checkbox.checked = true;
    }
    // После автоматической отметки категории — перерендер каталога
    renderCatalog(catalog);

    // Автоматически применяем фильтр после рендера
const applyBtnAuto = document.querySelector(".filter-reset");
applyBtnAuto?.click();


});


// === ГЕНЕРАЦИЯ КАРТОЧЕК КАТАЛОГА И ПОДКЛЮЧЕНИЕ ЛОГИКИ КНОПОК ===
document.addEventListener("DOMContentLoaded", function () {
    const grid = document.getElementById("catalog-grid");

    if (grid && typeof catalog !== "undefined") {
        grid.innerHTML = catalog.map(item => `
            <div class="product-card" data-category="${convertCategory(item.category)}"
                onclick="window.location.href='product.html?id=${item.id}'">

                <div class="product-img">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="favorite-btn" data-id="${item.id}"></div>
                </div>

                <div class="product-info">
                    <div class="product-title">${item.name}</div>
                    <div class="product-desc">${item.shortDescription}</div>

                    <div class="product-price">
                        ${item.oldPrice ? `<span class="old-price">${item.oldPrice} ₽</span>` : ""}
                        <span class="new-price">${item.price} ₽</span>
                    </div>

                    <button class="btn-card add-to-cart"
                        data-id="${item.id}"
                        data-name="${item.name}"
                        data-price="${item.price}"
                        data-oldprice="${item.oldPrice || ""}"
                        data-baseprice="${item.price}"
                        data-baseold="${item.oldPrice || ""}"
                        data-img="${item.image}">
                        В корзину
                    </button>
                </div>
            </div>
        `).join("");

        initAddToCartButtons();
        initAutoDiscountBadges();
    }
});

// === ФИЛЬТРАЦИЯ КАТАЛОГА ПО ПАРАМЕТРУ category ИЗ URL ===
document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");

    if (category) {
        const filtered = catalog.filter(
            item => convertCategory(item.category) === category
        );

        const grid = document.getElementById("catalog-grid");
        if (grid) {
            grid.innerHTML = filtered.map(item => `
                <div class="product-card" data-category="${convertCategory(item.category)}"
                    onclick="window.location.href='product.html?id=${item.id}'">

                    <div class="product-img">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="favorite-btn" data-id="${item.id}"></div>
                    </div>

                    <div class="product-info">
                        <div class="product-title">${item.name}</div>
                        <div class="product-desc">${item.shortDescription}</div>

                        <div class="product-price">
                            ${item.oldPrice ? `<span class="old-price">${item.oldPrice} ₽</span>` : ""}
                            <span class="new-price">${item.price} ₽</span>
                        </div>

                        <button class="btn-card add-to-cart"
                            data-id="${item.id}"
                            data-name="${item.name}"
                            data-price="${item.price}"
                            data-oldprice="${item.oldPrice || ""}"
                            data-baseprice="${item.price}"
                            data-baseold="${item.oldPrice || ""}"
                            data-img="${item.image}">
                            В корзину
                        </button>
                    </div>
                </div>
            `).join("");

            initAddToCartButtons();
            initAutoDiscountBadges();
            initFavorites();
        }
    }
});


// === ГЕНЕРАЦИЯ НОВИНОК НА ГЛАВНОЙ СТРАНИЦЕ (new-products) ===
document.addEventListener("DOMContentLoaded", function () {
    const newGrid = document.getElementById("new-products");

    if (newGrid && typeof catalog !== "undefined") {
        newGrid.innerHTML = catalog
            .filter(item => item.isNew)
            .map(item => `
                <div class="product-card"
                    data-category="${convertCategory(item.category)}"
                    onclick="window.location.href='product.html?id=${item.id}'">

                    <div class="product-img">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="favorite-btn" data-id="${item.id}"></div>
                    </div>

                    <div class="product-info">
                        <div class="product-title">${item.name}</div>
                        <div class="product-desc">${item.shortDescription}</div>

                        <div class="product-price">
                            ${item.oldPrice ? `<span class="old-price">${item.oldPrice} ₽</span>` : ""}
                            <span class="new-price">${item.price} ₽</span>
                        </div>

                        <button class="btn-card add-to-cart"
                            data-id="${item.id}"
                            data-name="${item.name}"
                            data-price="${item.price}"
                            data-oldprice="${item.oldPrice || ""}"
                            data-baseprice="${item.price}"
                            data-baseold="${item.oldPrice || ""}"
                            data-img="${item.image}">
                            В корзину
                        </button>
                    </div>
                </div>
            `).join("");

        // Подключаем кнопки корзины
        initAddToCartButtons();

        // Подключаем скидочные бейджи
        initAutoDiscountBadges();
    }
});

// === ИЗБРАННОЕ: ЧТЕНИЕ, СОХРАНЕНИЕ, ПЕРЕКЛЮЧЕНИЕ СЕРДЕЧЕК, СЧЁТЧИК ===

// Получаем список избранных товаров (массив id)
function getFavorites() {
    return (JSON.parse(localStorage.getItem("favorites")) || []).map(String);
}


// Сохраняем список избранных товаров
function saveFavorites(list) {
    localStorage.setItem('favorites', JSON.stringify(list));
    updateFavoritesCount();
}

// Переключаем состояние избранного для товара по id
function toggleFavorite(id) {
    id = String(id); // ← ВСЕГДА строка

    let favorites = getFavorites().map(String); // ← ВСЕ ВСЕГДА строки

    if (favorites.includes(id)) {
        favorites = favorites.filter(f => f !== id);
    } else {
        favorites.push(id);
    }

    saveFavorites(favorites);
}


// Обновляем счётчик избранного в шапке
function updateFavoritesCount() {
    const count = getFavorites().length;
    const badge = document.getElementById('favorites-count');

    if (!badge) return;

    if (count === 0) {
        badge.style.display = 'none';
    } else {
        badge.style.display = 'flex';
        badge.textContent = count;
    }
}
// === КОРЗИНА: ДОБАВЛЕНИЕ ТОВАРОВ, СЧЁТЧИК, УВЕДОМЛЕНИЯ, РАБОТА С localStorage ===
// ---------- КОРЗИНА: СЧЁТЧИК В ШАПКЕ ----------
function updateCartCount() {
    // читаем корзину из localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // считаем общее количество товаров
    const total = cart.reduce((sum, item) => {
        return sum + (item.quantity || 1);
    }, 0);

    // ищем кружок в шапке
    const badge = document.getElementById('cart-count');
    if (!badge) return;

    // если пусто — скрываем, если есть — показываем число
    if (total === 0) {
        badge.style.display = 'none';
    } else {
        badge.style.display = 'flex';
        badge.textContent = total;
    }
}

// ---------- КОРЗИНА: ДОБАВЛЕНИЕ ТОВАРОВ ----------
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        existing.quantity += 1;
    } else {
        product.quantity = 1;
        cart.push(product);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
}

// ---------- УВЕДОМЛЕНИЕ О ДОБАВЛЕНИИ ----------
function showCartToast(message) {
    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// ---------- КНОПКИ "В КОРЗИНУ" ----------
function initAddToCartButtons() {
    const buttons = document.querySelectorAll(".add-to-cart");

    buttons.forEach(btn => {
        btn.addEventListener("click", (event) => {
            event.stopPropagation();
            event.preventDefault();

            // Приводим ID к числу
            const id = Number(btn.dataset.id);

            // Ищем товар по числовому ID
            const item = catalog.find(p => p.id === id);

            if (!item) return;

            // --- Если это постельное бельё ---
            if (item.category === "Постельное бельё") {

                // Безопасно берём размер:
                // если globalSelectedSize есть и не пустой — используем его,
                // если переменной нет или она пустая — берём "1.5-спальный"
                let size = "1.5-спальный";
                if (typeof globalSelectedSize !== "undefined" && globalSelectedSize) {
                    size = globalSelectedSize;
                }

                const currentPrice = parseInt(btn.dataset.price);
                let currentOld = parseInt(btn.dataset.oldprice);
                if (isNaN(currentOld)) currentOld = null;

                addToCart({
                    id: `${id}-${size}`,
                    name: `${item.name} (${size})`,
                    price: currentPrice,
                    img: item.image,
                    oldPrice: currentOld
                });

            } else {

                // --- Все остальные категории ---
                addToCart({
                    id: String(id),
                    name: item.name,
                    price: item.price,
                    img: item.image,
                    oldPrice: item.oldPrice || null
                });

            }

            showCartToast("Товар добавлен в корзину");
        });
    });
}


// === СКИДОЧНЫЕ БЕЙДЖИ: АВТОМАТИЧЕСКИЙ РАСЧЁТ И ДОБАВЛЕНИЕ НА КАРТОЧКИ ===
function initAutoDiscountBadges() {
    const cards = document.querySelectorAll('.product-card');

    cards.forEach(card => {
        const btn = card.querySelector('.btn-card');
        if (!btn) return;

        const price = parseInt(btn.dataset.price);
        const old = parseInt(btn.dataset.oldprice);

        if (!old || !price || old <= price) return;

        const discount = Math.round((1 - price / old) * 100);
        const imgBox = card.querySelector('.product-img');
        if (!imgBox) return;

        const existing = imgBox.querySelector('.discount-badge');
        if (existing) existing.remove();

        const badge = document.createElement('div');
        badge.className = 'discount-badge';
        badge.textContent = `–${discount}%`;
        imgBox.appendChild(badge);
    });
}

document.addEventListener('DOMContentLoaded', initAutoDiscountBadges);

function normalize(str) {
    return str.toLowerCase().replace(/ё/g, "е");
}

// === ПОИСК: ОТКРЫТИЕ МОДАЛКИ, ЗАКРЫТИЕ, LIVE-ПОИСК ПО КАТАЛОГУ ===

document.querySelector('.search-icon')?.addEventListener('click', () => {
    document.getElementById('searchModal').classList.add('active');
    document.getElementById('searchInput').focus();
});

document.querySelector('.search-close')?.addEventListener('click', () => {
    document.getElementById('searchModal').classList.remove('active');
    document.getElementById('searchInput').value = "";
    document.getElementById('searchResults').innerHTML = "";
});

document.getElementById('searchModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'searchModal') {
        document.getElementById('searchModal').classList.remove('active');
        document.getElementById('searchInput').value = "";
        document.getElementById('searchResults').innerHTML = "";
    }
});

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', function() {

        const query = this.value.toLowerCase().trim();
        const resultsContainer = document.getElementById('searchResults');

        if (!query) {
            resultsContainer.innerHTML = "";
            return;
        }

        const results = catalog.filter(item =>
            normalize(item.name).includes(normalize(query)) ||
            normalize(item.category).includes(normalize(query))
        );

        if (results.length === 0) {
            resultsContainer.innerHTML = "<p>Ничего не найдено</p>";
            return;
        }

        resultsContainer.innerHTML = results.map(item => `
            <div class="search-item" onclick="window.location.href='product.html?id=${item.id}'">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <div class="search-item-title">${item.name}</div>
                    <div class="search-item-price">${item.price} ₽</div>
                </div>
            </div>
        `).join("");
    });
}
// ---------- СЕРДЕЧКИ В КАТАЛОГЕ И НОВИНКАХ ----------
document.addEventListener("DOMContentLoaded", function () {
    const favorites = getFavorites(); // читаем список избранного из localStorage

    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const id = btn.dataset.id;

        // при загрузке страницы подсвечиваем те, что уже в избранном
        if (favorites.includes(id)) {
            btn.classList.add('active');
        }

        // обработчик клика
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();

            toggleFavorite(id);
            btn.classList.toggle('active');
        });
    });
});

// ---------- СЕРДЕЧКО В КАРТОЧКЕ ТОВАРА ----------
document.addEventListener("DOMContentLoaded", function () {
    const favBtn = document.querySelector(".product-fav");
    if (!favBtn) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    favBtn.dataset.id = id;

    console.log("ID в карточке товара:", id);

    // подсвечиваем, если товар уже в избранном
    if (getFavorites().includes(id)) {
        favBtn.classList.add("active");
    }

    favBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();

        toggleFavorite(id);
        favBtn.classList.toggle("active");
    });
});

// === РЕНДЕР КАТАЛОГА: СОЗДАНИЕ КАРТОЧЕК ПО МАССИВУ ТОВАРОВ ===

function renderCatalog(items) {
    const grid = document.getElementById("catalog-grid");
    if (!grid) return;

    grid.innerHTML = items.map(item => `
        <div class="product-card" data-category="${convertCategory(item.category)}"
            onclick="window.location.href='product.html?id=${item.id}'">

            <div class="product-img">
                <img src="${item.image}" alt="${item.name}">
                <div class="favorite-btn" data-id="${item.id}"></div>
            </div>

            <div class="product-info">
                <div class="product-title">${item.name}</div>
                <div class="product-desc">${item.shortDescription}</div>

                <div class="product-price">
                    ${item.oldPrice ? `<span class="old-price">${item.oldPrice} ₽</span>` : ""}
                    <span class="new-price">${item.price} ₽</span>
                </div>

                <button class="btn-card add-to-cart"
                    data-id="${item.id}"
                    data-name="${item.name}"
                    data-price="${item.price}"
                    data-oldprice="${item.oldPrice || ""}"
                    data-baseprice="${item.price}"
                    data-baseold="${item.oldPrice || ""}"
                    data-img="${item.image}">
                    В корзину
                </button>
            </div>
        </div>
    `).join("");

    initAddToCartButtons();
    initAutoDiscountBadges();
    initFavorites();
}
// === ВЫБОР РАЗМЕРА И АВТОМАТИЧЕСКИЙ ПЕРЕСЧЁТ ЦЕН В КАТАЛОГЕ ===
// ===================== СИНХРОНИЗАЦИЯ ЦЕНЫ =====================
document.addEventListener("DOMContentLoaded", () => {
    const minInput = document.getElementById("price-min");
    const maxInput = document.getElementById("price-max");
    const range = document.getElementById("price-range");

    if (!minInput || !maxInput || !range) return;

    // Ползунок → поле "до"
    range.addEventListener("input", () => {
        maxInput.value = range.value;
    });

    // Поле "до" → ползунок
    maxInput.addEventListener("input", () => {
        if (maxInput.value !== "") {
            range.value = maxInput.value;
        }
    });
});

// === ПОЛНАЯ ФИЛЬТРАЦИЯ КАТАЛОГА: КАТЕГОРИИ, МАТЕРИАЛЫ, РАЗМЕРЫ, ЦЕНА ===
// ===================== ФИЛЬТРАЦИЯ =====================
document.addEventListener("DOMContentLoaded", () => {
    const applyBtn = document.querySelector(".filter-reset");
    const sidebar = document.querySelector(".catalog-sidebar");
    const sizeBlock = document.getElementById("size-filter");

    if (!applyBtn || !sidebar) return;

    applyBtn.addEventListener("click", () => {
        const checked = Array.from(
            sidebar.querySelectorAll("input[type='checkbox']:checked")
        ).map(cb => cb.value);

        const categories = [
            "Постельное бельё",
            "Одеяла и подушки",
            "Постельные принадлежности",
            "Покрывала и пледы",
            "Банные принадлежности",
            "Для детей"
        ];

        const selectedCategories = checked.filter(v => categories.includes(v));
        const sizes = ["1.5", "2", "euro"];

        const selectedMaterials = checked.filter(
            v => !categories.includes(v) && !sizes.includes(v)
        );

        // 🔥 Показываем размеры ВСЕГДА, если выбрана категория постельного белья
        if (selectedCategories.includes("Постельное бельё")) {
            sizeBlock.style.display = "block";
        } else {
            sizeBlock.style.display = "none";
        }


        let filtered = catalog;

        if (selectedCategories.length > 0) {
            filtered = filtered.filter(item => selectedCategories.includes(item.category));
        }

        // --- Фильтр по материалам ---
        if (selectedMaterials.length > 0) {
            filtered = filtered.filter(item =>
                item.material && selectedMaterials.includes(item.material)
            );
        }

        // --- Фильтр по размерам ---
        const selectedSizes = Array.from(
            sidebar.querySelectorAll('#size-filter input[type="checkbox"]:checked')
        ).map(cb => cb.value);

        // 🔥 Обновляем глобальный выбранный размер
        if (selectedSizes.length > 0) {
            if (selectedSizes.includes("1.5")) globalSelectedSize = "1.5-спальный";
            if (selectedSizes.includes("2")) globalSelectedSize = "2-спальный";
            if (selectedSizes.includes("euro")) globalSelectedSize = "евро";
        } else {
            globalSelectedSize = "1.5-спальный"; // значение по умолчанию
        }


        // --- Фильтр по цене ---
        const minPrice = parseInt(document.getElementById("price-min").value) || 0;
        const maxPrice = parseInt(document.getElementById("price-max").value) || Infinity;

        filtered = filtered.filter(item =>
            item.price >= minPrice && item.price <= maxPrice
        );

        renderCatalog(filtered);
        updateCatalogPrices();
    });
});


// === СБРОС ФИЛЬТРОВ ===
document.querySelector(".filter-reset-btn").addEventListener("click", () => {
    // снимаем все чекбоксы
    document.querySelectorAll(".catalog-sidebar input[type='checkbox']").forEach(cb => cb.checked = false);

    // сбрасываем цену
    document.getElementById("price-min").value = "";
    document.getElementById("price-max").value = "";

    // сбрасываем глобальный размер
    globalSelectedSize = "1.5-спальный";

    // показываем весь каталог
    renderCatalog(catalog);
    if (selectedSizes.length > 0) {
        updateCatalogPrices();
    }

});


// --- Обновление цен в каталоге при выборе размера ---
function updateCatalogPrices() {
    const cards = document.querySelectorAll(".product-card");

    cards.forEach(card => {
        const priceEl = card.querySelector(".new-price");
        const oldPriceEl = card.querySelector(".old-price");
        const btn = card.querySelector(".add-to-cart");

        if (!priceEl || !btn) return;

        const basePrice = parseInt(btn.dataset.baseprice);
        let baseOld = parseInt(btn.dataset.baseold);
        if (isNaN(baseOld)) baseOld = null;

        const sizePrices = {
            "1.5-спальный": { price: basePrice, old: baseOld },
            "2-спальный":   { price: basePrice + 400, old: baseOld ? baseOld + 400 : null },
            "евро":          { price: basePrice + 800, old: baseOld ? baseOld + 800 : null }
        };

        const selected = sizePrices[globalSelectedSize];


        priceEl.textContent = selected.price + " ₽";

        if (oldPriceEl) {
            if (selected.old) {
                oldPriceEl.textContent = selected.old + " ₽";
                oldPriceEl.style.display = "inline-block";
            } else {
                oldPriceEl.style.display = "none";
            }
        }

        // 🔥 ключевой момент — обновляем данные для корзины
        btn.dataset.price = selected.price;
        btn.dataset.oldprice = selected.old || "";
    });
}


// === ОБРАБОТКА ВЫБОРА РАЗМЕРА: ОДИН РАЗМЕР, ОБНОВЛЕНИЕ ГЛОБАЛЬНОЙ ПЕРЕМЕННОЙ, ПЕРЕСЧЁТ ЦЕН ===

document.addEventListener("DOMContentLoaded", () => {
    const sizeCheckboxes = document.querySelectorAll('#size-filter input[type="checkbox"]');

    if (!sizeCheckboxes.length) return;

    sizeCheckboxes.forEach(cb => {
        cb.addEventListener("change", () => {

            // Разрешаем выбирать только один размер
            sizeCheckboxes.forEach(x => {
                if (x !== cb) x.checked = false;
            });

            // Устанавливаем глобальный размер
            if (cb.checked) {
                if (cb.value === "1.5") globalSelectedSize = "1.5-спальный";
                if (cb.value === "2") globalSelectedSize = "2-спальный";
                if (cb.value === "euro") globalSelectedSize = "евро";
            } else {
                globalSelectedSize = "1.5-спальный";
            }

            // Обновляем цены в каталоге
            updateCatalogPrices();
        });
    });
});


// === ИНИЦИАЛИЗАЦИЯ ИЗБРАННОГО: ПОДСВЕТКА СЕРДЕЧЕК И ПОДКЛЮЧЕНИЕ ЛОГИКИ ===
function initFavorites() {
    const favorites = getFavorites();

    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const id = btn.dataset.id;

        if (favorites.includes(id)) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            toggleFavorite(id);
            btn.classList.toggle('active');
        });
    });
}






