
export default class CurrencySelector {
  constructor(el) {
    this.$el = $(el);
    this.$currencySelector = this.$el.find('select');

    this._bindEvents();
  }

  _bindEvents() {
    this.$currencySelector.on('change', (event) => {
      this._updateCurrency(event);
    });
  }

  _updateCurrency(event) {
    window.location = $(event.currentTarget).val();
  }

  unload() {
    //remove all event handlers
  }
}
