// components/dashboard.js
import {OperationService} from "../services/operation-service.js";
import {CategoryService} from "../services/category-service";
import Chart from "chart.js/auto";

export class Dashboard {
    constructor() {
        this.tabs = document.querySelectorAll(".main__content-tabs .tab.btn");
        this.intervalFrom = document.querySelector(".interval-from");
        this.intervalTo = document.querySelector(".interval-to");

        this.incomeCanvas = document.getElementById("incomePie");
        this.expenseCanvas = document.getElementById("expensePie");

        this.currentFilter = "all"; // поменял "today" на "all", чтобы подгружал данные за 2022 год.
        this.operations = [];

        // ДОБАВИЛ: мапы категорий как в operations.js
        this.incomeCategoriesMap = {};
        this.expenseCategoriesMap = {};

        // ДОБАВИЛ: инстансы графиков, чтобы destroy() перед перерисовкой
        this.incomeChart = null;
        this.expenseChart = null;

        this.init();
    }

    async init() {
        this.initFilters();

        // ДОБАВИЛ: грузим категории один раз, чтобы уметь мапить category_id -> title
        await this.loadCategories();

        await this.reload();
    }

    initFilters() {
        this.tabs.forEach((tab) => {
            tab.addEventListener("click", async () => {
                const filter = tab.dataset.filter;
                if (!filter) return;

                this.currentFilter = filter;
                this.setActiveTab(filter);

                await this.reload();
            });
        });

        const onIntervalChange = async () => {
            this.currentFilter = "interval";
            this.setActiveTab("interval");
            await this.reload();
        };

        this.intervalFrom?.addEventListener("change", onIntervalChange);
        this.intervalTo?.addEventListener("change", onIntervalChange);
    }

    setActiveTab(activeFilter) {
        this.tabs.forEach((t) => {
            const isActive = t.dataset.filter === activeFilter;
            t.classList.toggle("btn-secondary", isActive);
            t.classList.toggle("btn-outline-secondary", !isActive);
        });
    }

    getServerFilterParams() {
        if (this.currentFilter === "interval") {
            return {
                period: "interval",
                dateFrom: this.intervalFrom?.value || undefined,
                dateTo: this.intervalTo?.value || undefined,
            };
        }
        return {period: this.currentFilter};
    }

    async reload() {
        await this.loadOperations();
        this.renderCharts();
    }

    async loadOperations() {
        const params = this.getServerFilterParams();
        const data = await OperationService.getOperationsWithFilter(params);
        this.operations = data || [];
    }

    // ДОБАВИЛ: загрузка категорий (как в operations.js)
    async loadCategories() {
        try {
            const [incomeCats, expenseCats] = await Promise.all([
                CategoryService.getIncomeCategories(),
                CategoryService.getExpenseCategories(),
            ]);

            this.incomeCategoriesMap = {};
            incomeCats.forEach((cat) => {
                this.incomeCategoriesMap[String(cat.id)] = cat.title;
            });

            this.expenseCategoriesMap = {};
            expenseCats.forEach((cat) => {
                this.expenseCategoriesMap[String(cat.id)] = cat.title;
            });
        } catch (e) {
            // Не ломаем дашборд: графики просто могут быть "Без категории"
            console.error("Ошибка загрузки категорий для Dashboard:", e.message);
        }
    }

    // ДОБАВИЛ: единый метод получения названия категории (как в operations.js)
    getCategoryTitle(op) {
        if (!op) return "Без категории";

        if (typeof op.category === "string" && op.category.trim() !== "") {
            return op.category.trim();
        }

        const id = op.category_id != null ? String(op.category_id) : null;
        if (!id) return "Без категории";

        if (op.type === "income") return this.incomeCategoriesMap[id] || "Без категории";
        if (op.type === "expense") return this.expenseCategoriesMap[id] || "Без категории";

        return "Без категории";
    }

    buildCategoryTotals(type) {
        const map = new Map();

        this.operations
            .filter((op) => op.type === type)
            .forEach((op) => {
                // ИСПРАВИЛ: теперь категория вычисляется корректно и для category_id тоже
                const title = this.getCategoryTitle(op);
                const prev = map.get(title) || 0;
                map.set(title, prev + Number(op.amount || 0));
            });

        return {
            labels: Array.from(map.keys()),
            values: Array.from(map.values()),
        };
    }

    getColors(count) {
        const palette = [
            "#DC3545",
            "#FD7E14",
            "#FFC107",
            "#198754",
            "#0D6EFD",
            "#6F42C1",
            "#20C997",
            "#6C757D",
        ];
        return Array.from({length: count}, (_, i) => palette[i % palette.length]);
    }

    destroyChartsIfExist() {
        // ВАЖНО: перед перерисовкой уничтожаем старый график
        if (this.incomeChart) {
            this.incomeChart.destroy();
            this.incomeChart = null;
        }
        if (this.expenseChart) {
            this.expenseChart.destroy();
            this.expenseChart = null;
        }
    }

    renderCharts() {
        if (!this.incomeCanvas || !this.expenseCanvas) return;

        this.destroyChartsIfExist();

        const income = this.buildCategoryTotals("income");
        const expense = this.buildCategoryTotals("expense");

        this.incomeChart = this.renderPie(this.incomeCanvas, {
            title: "Доходы",
            labels: income.labels,
            values: income.values,
        });

        this.expenseChart = this.renderPie(this.expenseCanvas, {
            title: "Расходы",
            labels: expense.labels,
            values: expense.values,
        });
    }

    renderPie(canvas, {title, labels, values}) {
        const hasData = values.some((v) => Number(v) > 0);

        const finalLabels = hasData ? labels : ["Нет данных"];
        const finalValues = hasData ? values : [1];

        return new Chart(canvas, {
            type: "pie",
            data: {
                labels: finalLabels,
                datasets: [
                    {
                        label: title,
                        data: finalValues,
                        backgroundColor: this.getColors(finalLabels.length),
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: "top"
                    },
                    tooltip: {
                        enabled: hasData
                    },
                },
            },
        });
    }
}
