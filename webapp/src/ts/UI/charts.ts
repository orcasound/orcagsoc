import * as ApexCharts from 'apexcharts'

window.Apex = {
    chart: {
        zoom: {
            enabled: false,
        },
        toolbar: {
            show: false,
        },
    },
    noData: {
        text: 'Loading...',
    },
    dataLabels: {
        enabled: false,
    },
    theme: {
        mode: 'dark',
        palette: 'palette10',
    },
}

// --------------------------------------------
const accuracyOptions = {
    chart: {
        type: 'line',
    },
    colors: ['#5d99c6', '#C3fDFF'],
    series: [] as ApexAxisChartSeries,
    xaxis: {
        categories: [0, 10, 20, 30, 40, 50, 60, 70, 80],
    },
}
const accuracyChart = new ApexCharts(
    document.getElementById('accuracyChart'),
    accuracyOptions
)
accuracyChart.render()

// --------------------------------------------
const confusionOptions = {
    chart: {
        type: 'heatmap',
        events: {
            dataPointSelection: function ({}, {}, config: any) {
                console.log(config.seriesIndex, config.dataPointIndex)
            },
        },
    },
    colors: ['#B704D6'],
    series: [] as ApexAxisChartSeries,
    xaxis: {
        position: 'top',
    },
}
const confusionMatrix = new ApexCharts(
    document.getElementById('confusionMatrix'),
    confusionOptions
)
confusionMatrix.render()

// --------------------------------------------
const validationsOptions = {
    chart: {
        type: 'line',
    },
    colors: ['#FF6699', '#5d99c6'],
    series: [] as ApexAxisChartSeries,
    xaxis: {
        type: 'datetime',
    },
    yaxis: [
        {
            title: {
                text: 'Sounds Validated',
                style: {
                    fontWeight: 'normal',
                },
            },
        },
        {
            opposite: true,
            title: {
                text: 'ML Model Accuracy',
                style: {
                    fontWeight: 'normal',
                },
            },
        },
    ],
}
const validationsChart = new ApexCharts(
    document.getElementById('validationsChart'),
    validationsOptions
)
validationsChart.render()

// --------------------------------------------
export { accuracyChart, confusionMatrix, validationsChart }
