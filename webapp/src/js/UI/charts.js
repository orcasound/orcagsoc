window.Apex = {
    chart: {
        zoom: {
            enabled: false,
        },
        toolbar: {
            show: false,
        },
    },
    title: {
        align: 'center',
        style: {
            fontSize: '16px',
            fontWeight: 'normal',
            fontFamily: 'roboto',
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
    title: {
        text: 'Accuracy',
    },
    colors: ['#5d99c6', '#C3fDFF'],
    series: [],
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
            click: function (_0, _1, config) {
                console.log(config.seriesIndex, config.dataPointIndex)
            },
        },
    },
    colors: ['#B704D6'],
    title: {
        text: 'Confusion Matrix',
    },
    series: [],
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
    title: {
        text: 'Sounds Validated',
    },
    colors: ['#FF6699'],
    series: [],
    xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    },
}
const validationsChart = new ApexCharts(
    document.getElementById('validationsChart'),
    validationsOptions
)
validationsChart.render()

// --------------------------------------------
export { accuracyChart, confusionMatrix, validationsChart }
