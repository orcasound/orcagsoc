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
    yaxis: {
        decimalsInFloat: 2,
    }
}

// --------------------------------------------
const accuracyOptions = {
    chart: {
        type: 'line',
    },
    colors: ['#5d99c6', '#C3fDFF'],
    series: [] as ApexAxisChartSeries,
}
const accuracyChart = new ApexCharts(
    document.getElementById('accuracyChart'),
    accuracyOptions
)
accuracyChart.render()

// --------------------------------------------
const lossOptions = {
    chart: {
        type: 'line',
    },
    colors: ['#5d99c6', '#C3fDFF'],
    series: [] as ApexAxisChartSeries,
}
const lossChart = new ApexCharts(
    document.getElementById('lossChart'),
    lossOptions
)
lossChart.render()

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
            decimalsInFloat: 2,
        },
        {
            opposite: true,
            title: {
                text: 'ML Model Accuracy',
                style: {
                    fontWeight: 'normal',
                },
            },
            decimalsInFloat: 2,
        },
    ],
}
const validationsChart = new ApexCharts(
    document.getElementById('validationsChart'),
    validationsOptions
)
validationsChart.render()

// --------------------------------------------
export { accuracyChart, confusionMatrix, validationsChart, lossChart }
