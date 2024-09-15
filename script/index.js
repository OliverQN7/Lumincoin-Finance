import {Chart} from './chart.min.js';

const ctx = document.getElementById("income-chart");

const myChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ["Red", "Orange", "Yellow", "Green", "Blue"],
        datasets: [{
            label: 'Доходы',
            data: [50, 70, 40, 30, 20],
            backgroundColor: [
                'rgb(218,53,69)',
                'rgb(251,125,20)',
                "rgb(253,192,7)",
                "rgb(32,200,150)",
                "rgb(13,109,251)"
            ],
            hoverOffset: 4
        }]
    }
});

myChart()

