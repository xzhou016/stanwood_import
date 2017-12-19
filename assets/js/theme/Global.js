import CurrencySelector from './components/CurrencySelector';
import SelectWrapper from './components/SelectWrapper';
import FormValidator from './utils/FormValidator';
import formSelectedValue from './core/formSelectedValue';
import MiniCart from './cart/MiniCart';
import Navigation from './components/Navigation';
import QuickSearch from './components/QuickSearch';
import Dropdown from './utils/Dropdown';
import QuickView from './listing/QuickView';
import dismissable from './core/alertDismissable';

// global scope jQuery plugins
/* eslint-disable no-unused-vars */
import validetta from 'validetta';

export default class Global {
  constructor(context) {
    this.context = context;
    new CurrencySelector('[data-currency-selector]');

    const $select = $('select');
    if ($select.length) {
      $select.each((i, el) => {
        new SelectWrapper(el);
      });
    }

    new Navigation();
    new MiniCart();
    new QuickSearch();
    new Dropdown();

    // bind click on dismissable alerts
    dismissable();

    formSelectedValue();

    // global form validation
    this.validator = new FormValidator(this.context);
    this.validator.initGlobal();

    // QuickView
    if ($('[data-quick-view]').length) {
      new QuickView(this.context);
    }
  }

  unload() {
    //remove all event handlers
  }
}
