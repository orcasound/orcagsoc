// -~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~-~
import '../sass/index.scss'
import { accuracyChart, confusionMatrix, validationsChart } from './UI/charts'
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

        // Update the charts
        const [[TN, FP], [FN, TP]] = json.confusionMatrix

        accuracyChart.updateSeries([
            {
                name: 'train',
                data: json.accuracy.train,
            },
            {
                name: 'test',
                data: json.accuracy.test,
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
                data: json.validationHistory,
            },
            {
                name: 'accuracy',
                data: json.modelAccuracy,
            },
        ])
    }

    getStatistics()
        .then(() => console.log('Successs fetching data!'))
        .catch((error) => console.error('Fetch Error!', error))
})
