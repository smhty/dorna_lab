google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
var data = google.visualization.arrayToDataTable([
  ['Year', 'Sales'],
  ['0',  1000],
  ['20',  1170],
  ['50',  660],
  ['90',  1030]
]);

var options = {
    curveType: 'function',
    legend: 'none',
    vAxis: {
      textPosition: 'none',
    },
    hAxis: {
      textPosition: 'none',
    },
    chartArea:{left:0,right:0, width:"100%"},       
};

var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

chart.draw(data, options);
}
