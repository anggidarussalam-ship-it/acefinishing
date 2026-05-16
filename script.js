async function loadCSV() {

    const response = await fetch('./data/template_produksi_mei2026.csv');

    const csvText = await response.text();

    console.log(csvText);

}

loadCSV();
