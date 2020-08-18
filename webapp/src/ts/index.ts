// -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~
import '../sass/index.scss'
import {
    accuracyChart,
    confusionMatrix,
    validationsChart,
    lossChart,
} from './UI/charts'
// -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~

const ready = (callback: () => void) => {
    if (document.readyState != 'loading') callback()
    else document.addEventListener('DOMContentLoaded', callback)
}

ready(() => {
    // --------------------------------------------
    async function getStatistics() {
        // Get ML statistics and validation history from the backend using Fetch
        const response = await fetch(`${process.env.API_URL}/statistics`)
        const json = await response.json()

        // Update the training progress
        document.getElementById(
            'retrain-progress'
        ).textContent = `${json.retrain.progress}/${json.retrain.goal}`

        // If training then show training element
        if (json.training) {
            document.getElementById('training').style.display = 'block'
            document.querySelector('nav').style.height = '28rem'
        } else {
            document.getElementById('training').style.display = 'none'
            document.querySelector('nav').style.height = '24rem'
        }

        // Update the charts
        const [TN, FP, FN, TP] = json.confusionMatrix

        accuracyChart.updateSeries([
            {
                name: 'train',
                data: json.accuracy.train,
            },
            {
                name: 'validation',
                data: json.accuracy.validation,
            },
        ])

        lossChart.updateSeries([
            {
                name: 'train',
                data: json.loss.train,
            },
            {
                name: 'validation',
                data: json.loss.validation,
            },
        ])

        confusionMatrix.updateSeries([
            {
                name: 'Actual Yes',
                data: [
                    {
                        x: 'Predicted No',
                        y: FN,
                    },
                    {
                        x: 'Predicted Yes',
                        y: TP,
                    },
                ],
            },
            {
                name: 'Actual No',
                data: [
                    {
                        x: 'Predicted No',
                        y: TN,
                    },
                    {
                        x: 'Predicted Yes',
                        y: FP,
                    },
                ],
            },
        ])
        validationsChart.updateSeries([
            {
                name: 'sounds',
                data: json.accuracyVLabels.labels,
            },
            {
                name: 'accuracy',
                data: json.accuracyVLabels.accuracies,
            },
        ])
        validationsChart.updateOptions({
            xaxis: {
                categories: json.accuracyVLabels.dates,
            },
        })
    }

    getStatistics()
        .then(() => console.log('Successs fetching data!'))
        .catch((error) => console.error('Fetch Error!', error))
})
