function normalizeRates(data) {
  const result = {};

  data.forEach((item) => {
    result[item.cc] = {
      rate: item.rate,
      date: item.exchangedate,
    };
  });

  return result;
}

function renderTopCurrencies(rates) {
  const blocks = document.querySelectorAll('.block-one__currency');

  blocks.forEach((block) => {
    const currency = block.dataset.currency;
    const currencyData = rates[currency];

    if (!currencyData) return;

    const valueEl = block.querySelector('p');
    const dateEl = block.querySelector('.date');

    valueEl.textContent = currencyData.rate.toFixed(2);
    dateEl.textContent = `(${currencyData.date})`;
  });
}

async function getCurrencies() {
  const res = await fetch(
    'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json',
  );
  const data = await res.json();

  const rates = normalizeRates(data);

  renderTopCurrencies(rates);
  setupConverter(rates);
}

getCurrencies();

function convert(amount, from, to, rates) {
  if (from === to) return amount;

  const rateFrom = from === 'UAH' ? 1 : rates[from].rate;
  const rateTo = to === 'UAH' ? 1 : rates[to].rate;

  return amount * (rateFrom / rateTo);
}

const fromAmountEl = document.querySelector('#from-amount');
const toAmountEl = document.querySelector('#to-amount');

const fromCurrencyEl = document.querySelector('#from-currency');
const toCurrencyEl = document.querySelector('#to-currency');

function setupConverter(rates) {
  function update(isDirect) {
    const sourceInput = isDirect ? fromAmountEl : toAmountEl;
    const targetInput = isDirect ? toAmountEl : fromAmountEl;

    const fromCurrency = isDirect ? fromCurrencyEl.value : toCurrencyEl.value;
    const toCurrency = isDirect ? toCurrencyEl.value : fromCurrencyEl.value;

    const amount = parseFloat(sourceInput.value);

    if (isNaN(amount)) {
      targetInput.value = '';
      return;
    }

    const result = convert(amount, fromCurrency, toCurrency, rates);
    targetInput.value = result.toFixed(2);
  }

  fromAmountEl.addEventListener('input', () => update(true));

  toAmountEl.addEventListener('input', () => update(false));

  fromCurrencyEl.addEventListener('change', () => update(true));
  toCurrencyEl.addEventListener('change', () => update(true));
}
