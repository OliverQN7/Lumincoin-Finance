// components/dashboard.js
import {OperationService} from "../services/operation-service";
import {CategoryService} from "../services/category-service";
import Chart from "chart.js/auto";
import type {OperationFilterParamsType, OperationTypeItem, PeriodType} from "../types/operation.types";
import type {CategoryMapType, CategoryTypeItem} from "../types/category.types";

export class Dashboard {
    private readonly tabs: NodeListOf<HTMLButtonElement>;
    private readonly intervalFrom: HTMLInputElement | null;
    private readonly intervalTo: HTMLInputElement | null;

    private readonly incomeCanvas: HTMLCanvasElement | null;
    private readonly expenseCanvas: HTMLCanvasElement | null;

    private currentFilter: PeriodType = "all";
    private operations: OperationTypeItem[] = [];

    private incomeCategoriesMap: CategoryMapType;
    private expenseCategoriesMap: CategoryMapType;

    private incomeChart: Chart | null;
    private expenseChart: Chart | null;


    constructor() {
        this.tabs = document.querySelectorAll(".main__content-tabs .tab.btn") as NodeListOf<HTMLButtonElement>;
        this.intervalFrom = document.querySelector(".interval-from") as HTMLInputElement | null;
        this.intervalTo = document.querySelector(".interval-to") as HTMLInputElement | null;


        const incomeEl = document.getElementById("incomePie");
        this.incomeCanvas = incomeEl instanceof HTMLCanvasElement ? incomeEl : null;

        const expenseEl = document.getElementById("expensePie");
        this.expenseCanvas = expenseEl instanceof HTMLCanvasElement ? expenseEl : null;

        this.currentFilter = "all"; // поменял "today" на "all", чтобы подгружал данные за 2022 год.
        this.operations = [];

        // ДОБАВИЛ: мапы категорий как в operations.ts
        this.incomeCategoriesMap = {};
        this.expenseCategoriesMap = {};

        // ДОБАВИЛ: инстансы графиков, чтобы destroy() перед перерисовкой
        this.incomeChart = null;
        this.expenseChart = null;

        void this.init();
    }

    private async init(): Promise<void> {
        this.initFilters();
        await this.loadCategories();
        await this.reload();
    }

    private initFilters(): void {
        this.tabs.forEach((tab) => {
            tab.addEventListener("click", async () => {
                const filter = tab.dataset.filter as PeriodType | undefined;
                if (!filter) return;

                this.currentFilter = filter;
                this.setActiveTab(filter);
                void this.reload();
            });
        });

        const onIntervalChange = (): void => {
            this.currentFilter = "interval";
            this.setActiveTab("interval");
            void this.reload();
        };

        this.intervalFrom?.addEventListener("change", onIntervalChange);
        this.intervalTo?.addEventListener("change", onIntervalChange);
    }

    private setActiveTab(activeFilter: PeriodType): void {
        this.tabs.forEach((t) => {
            const isActive = t.dataset.filter === activeFilter;
            t.classList.toggle("btn-secondary", isActive);
            t.classList.toggle("btn-outline-secondary", !isActive);
        });
    }

    private getServerFilterParams(): OperationFilterParamsType {
        if (this.currentFilter === "interval") {
            const dateFrom = this.intervalFrom?.value || "";
            const dateTo = this.intervalTo?.value || "";

            return {
                period: "interval",
                ...(dateFrom && dateTo ? {dateFrom, dateTo} : {}),
            };
        }
        return {period: this.currentFilter};
    }

    private async reload(): Promise<void> {
        await this.loadOperations();
        this.renderCharts();
    }

    private async loadOperations(): Promise<void> {
        const params: OperationFilterParamsType = this.getServerFilterParams();
        const data = await OperationService.getOperationsWithFilter(params);
        this.operations = Array.isArray(data) ? (data as OperationTypeItem[]) : [];
    }

    async loadCategories(): Promise<void> {
        try {
            const [incomeCats, expenseCats] = await Promise.all([
                CategoryService.getIncomeCategories(),
                CategoryService.getExpenseCategories(),
            ]) as [CategoryTypeItem[], CategoryTypeItem[]];

            this.incomeCategoriesMap = {};
            incomeCats.forEach((cat) => {
                this.incomeCategoriesMap[String(cat.id)] = cat.title;
            });

            this.expenseCategoriesMap = {};
            expenseCats.forEach((cat) => {
                this.expenseCategoriesMap[String(cat.id)] = cat.title;
            });
        } catch (e) {
            console.error("Ошибка загрузки категорий для Dashboard:", e);
        }
    }

    // ДОБАВИЛ: единый метод получения названия категории (как в operations.ts)
    private getCategoryTitle(op: OperationTypeItem | null): string {
        if (!op) return "Без категории";

        if (typeof op.category === "string" && op.category.trim()) {
            return op.category.trim();
        }

        const id = op.category_id != null ? String(op.category_id) : null;
        if (!id) return "Без категории";

        const map = op.type === "income" ? this.incomeCategoriesMap : this.expenseCategoriesMap;
        return map[id] || "Без категории";
    }

    private buildCategoryTotals(type: "income" | "expense") {
        const map = new Map<string, number>();

        this.operations
            .filter((op) => op.type === type)
            .forEach((op) => {
                const title = this.getCategoryTitle(op);
                const prev = map.get(title) || 0;
                map.set(title, prev + Number(op.amount || 0));
            });

        return {
            labels: Array.from(map.keys()),
            values: Array.from(map.values()),
        };
    }

    private getColors(count: number): string[] {
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
        return Array.from({length: count}, (_, i) => {
            const color = palette[i % palette.length];
            return color ?? "#6C757D";
        });
    }

    private destroyChartsIfExist(): void {
        [this.incomeChart, this.expenseChart].forEach(chart => {
            chart?.destroy();
        });
        this.incomeChart = null;
        this.expenseChart = null;

    }

    private renderCharts(): void {
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

    private renderPie(canvas: HTMLCanvasElement, {title, labels, values}: {title: string; labels: string[], values: number[]}) {
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
