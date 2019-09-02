// const config = require('../config');

(function(){
  let chartData = [];

  const chart = c3.generate({
    bindto: '#chart',
    data: {
      type: getChartTypeDisplay(),
      columns: [],
    },
    axis: {
        x: {
          show: false,
        }
      }
  });

  function getChartTypeDisplay() {
    return document.querySelector('.chart-type').value;
  };

  function getDatasetsToDisplay() {
    return document.querySelectorAll('.data-dropdown');
  };

  function getRequestType() {
    return document.querySelector('.request-dropdown').value;
  };

  function getDisplayTotal() {
    return document.querySelector('input[name="total"]').checked;
  }

  function getData(year, requestType) {
    return fetch(`/soda/${year}/${requestType}`)
      .then(res => res.json())
      .then(data => { chartData.push(...data); })
      .catch(err => { console.error('Fetch Error :-S', err); });
  };

  function getTotal(year, requestType) {
    return fetch(`/soda/${year}/${requestType}/total`)
      .then(res => res.json())
      .then(data => { chartData.push(data); })
      .catch(err => { console.error('Fetch Error :-S', err); })
  };

  function buildChart() {
    const requestType = getRequestType();
    const chartType = getChartTypeDisplay();
    const displayTotal = getDisplayTotal();
    const datasets = [...getDatasetsToDisplay()]
                      .map(dataset => {
                        const { value } = dataset;
                        if (!displayTotal) return getData(value, requestType);
                        else return getTotal(value, requestType);
                      });

    Promise.all(datasets)
      // .then(() => { renderChart(chartData, chartType); })
      .then(() => { renderMarkers(chartData, chartType); })
      .catch(err => { console.error('Render Error :-S', err)});
   };

  function renderChart(columns, type) {
    chart.load({ columns, type });
  };

  function renderMarkers(chartData, chartType) {
    chartData.forEach(marker => {
      const ignore = [
        'location',
        'suffix',
        'assignto',
        'housenumber',
        'BOS',
        'approximateaddress',
        'tbmrow',
        'tbmpage',
        'tbmcolumn',
        'streetname',
        'policeprecinct',
        'apc',
      ];
      const { longitude, latitude } = marker.location;
      const content = Object.entries(marker)
        .map(entry => {
          if (ignore.includes(entry[0])) return;
          return `<div>${entry.join(': ')}</div>`
        })
        .join('')

      const markerInfo = {
        lngLat: [latitude, longitude],
        content,
      };
      const pin = L.marker(markerInfo.lngLat).addTo(mymap);
      pin.bindPopup(markerInfo.content).openPopup();
    })
  }

  const mymap = L.map('mapid').setView([34.0173157, -118.2497254], 10);

  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1Ijoiam9zaHVhbWFyeCIsImEiOiJjazAxb3NiNmMweXR2M2NzY2F0dXk4MGduIn0.8b_04D-em34ScpYyrnRECQ',
  }).addTo(mymap);

  document.querySelector('button').onclick = e => {
    e.preventDefault();
    chart.unload();
    chartData = [];
    buildChart();
  };

  buildChart();
})();
