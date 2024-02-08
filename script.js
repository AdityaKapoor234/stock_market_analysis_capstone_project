let myChart; // Declare myChart globally
let timeDataArry = []; // X-Axis Values for Dates
let priceArry = []; // Y-Axis Values for Stock Price
let currentStock = 'AAPL'; // Stock Information currently being displayed on screen
// List of Stocks
const Stocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'PYPL', 'TSLA', 'JPM', 'NVDA', 'NFLX', 'DIS'];

// Function to Get Stock Chart Information
async function getData() {
  try {
    let res = await fetch("https://stocks3.onrender.com/api/stocks/getstocksdata");
    let response = await res.json();
    return response;
  } catch (err) {
    console.error(err);
  }
}

// Function to Get Stock Chart Summary Information
async function getSummary() {
  try {
    let res = await fetch("https://stocks3.onrender.com/api/stocks/getstocksprofiledata");
    let response = await res.json();
    return response;
  } catch (err) {
    console.error(err);
  }
}

// Function to Get Stock Chart Book Value & Profit Information
async function getProfitAndLoss() {
  try {
    let res = await fetch("https://stocks3.onrender.com/api/stocks/getstockstatsdata");
    let response = await res.json();
    return response;
  } catch (err) {
    console.error(err);
  }
}

// Function to display Stock Chart & Stock Summary information on Screen
async function displayData(timePeriod) {
  try {
    // Get Stock Chart Information
    const data = await getData();
    let stockInfo = data.stocksData[0][currentStock];
    let timeRange = stockInfo[timePeriod].timeStamp;
    let price = stockInfo[timePeriod].value;
    priceArry = [];
    timeDataArry = [];
    // Minimum Stock Price
    let min= price[0];
    // Maximum Stock Price
    let max= price[0];
    for (let p of price) {
      priceArry.push(p.toFixed(2));
      
      if (min > p) {
        min = p;
      }
      if (max < p) {
        max = p;
      }
    }

    for (let timeData of timeRange) {
      let date = new Date(timeData * 1000).toLocaleDateString();
      timeDataArry.push(date);
    }

    // After fetching data, update the chart
    updateChart();

    // Get Stock Summary Information
    const summaryData = await getSummary();
    document.getElementById('summaryInfo').textContent = summaryData.stocksProfileData[0][currentStock].summary;

    // Setting Minimum & Maximum Stock Value Information
    document.getElementById('stockChartValue').innerHTML = `
    Value of ${currentStock} Stock Over
    ${timePeriod === '1mo' ?
      "1 Month" :
      timePeriod === '3mo' ?
      "3 Month" :
      timePeriod === '1y' ?
      "1 Year" :
      "5 Year"
    }
    Time Period:<br />
    <span style="color: red">Minimum Value: $${(min).toFixed(2)}</span><br />
    <span style="color: green">Maximum Value: $${(max).toFixed(2)}</span>
    `
  } catch (err) {
    console.error(err);
  }
}

// Function to Update the Stock Chart
function updateChart() {
  const ctx = document.getElementById('myChart').getContext('2d');

  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timeDataArry,
      datasets: [
        {
          data: priceArry,
          label: `${currentStock} $`,
          backgroundColor: ["#31dc1a"],
          borderColor: ["#31dc1a"],
          borderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          enabled: true,
          backgroundColor: "#0ef",
          titleColor: "black",
          bodyColor: "#254589",
        },
        legend: {
          display: false,
        },
        animation: {
          duration: 8000,
        },
      },
      scales: {
        y: {
          ticks: {
            display: false
          }
        },
        x: {
          ticks: {
            display: false
          }
        }
      },
    },
  });
}

// Function to Fetch data According to Mentioned Time Period
function fetchData(timePeriod) {
  displayData(timePeriod);
}

fetchData("1mo");

// Function to Get Information of Selected Stock
async function updateStock(stockName) {
  currentStock = stockName;
  displayData('1mo');
  const data = await getProfitAndLoss();
  for (let i of Stocks) {
    if (i === stockName) {
      document.getElementById('name').textContent = i;
      document.getElementById('profit').innerHTML = `<span style="color: ${data.stocksStatsData[0][i].profit.toFixed(2) > 0 ? 'green' : 'red'}">${data.stocksStatsData[0][i].profit}%</span>`
      document.getElementById('bookValue').textContent = `$${data.stocksStatsData[0][i].bookValue.toFixed(3)}`
    }
  }
}

// Function to Display List of Stocks with Profit & Book Value in Side Bar
async function displaySideBarData() {
  try {
    const data = await getProfitAndLoss();
    let stockList = document.getElementById('stock-list');
    let stocks = '';

    for (let i of Stocks) {
      stocks += `
        <tr>
          <td>
            <button class="stockButton" value="${i}" onclick="updateStock('${i}')">${i}</button>
          </td>
          <td class="stockPad">
            <span>$${data.stocksStatsData[0][i].bookValue.toFixed(3)}</span>
          </td>
          <td>
            <span style="color: ${data.stocksStatsData[0][i].profit.toFixed(2) > 0 ? '#90EE90' : 'red'} ">${data.stocksStatsData[0][i].profit.toFixed(2)}%</span>
          </td>
        </tr>
      `;

      if (i === currentStock) {
        document.getElementById('name').textContent = i;
        document.getElementById('profit').innerHTML = `<span style="color: ${data.stocksStatsData[0][i].profit.toFixed(2) > 0 ? 'green' : 'red'}">${data.stocksStatsData[0][i].profit}%</span>`
        document.getElementById('bookValue').textContent = `$${data.stocksStatsData[0][i].bookValue.toFixed(3)}`
      }
    }

    stockList.innerHTML = stocks;
  } catch (err) {
    console.error(err);
  }
}

displaySideBarData();


