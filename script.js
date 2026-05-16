async function loadCSV() {

    const response = await fetch('./template_produksi_mei2026.csv');

    const csvText = await response.text();

    console.log(csvText);

}

loadCSV();

function createChart() {

    const ctx = document.getElementById('productionChart');

    new Chart(ctx, {
        type: 'line',

        data: {
            labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum'],

            datasets: [{
                label: 'Produksi',

                data: [120, 190, 300, 250, 400],

                borderWidth: 3,

                tension: 0.3
            }]
        },

        options: {
            responsive: true
        }
    });
}

createChart();
