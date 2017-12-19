import utils from '@bigcommerce/stencil-utils';
import CartUtils from './cart/CartUtils';
import ShippingCalculator from './cart/ShippingCalculator';
import CouponCodes from './cart/CouponCodes';
import GiftCertificates from './cart/GiftCertificates';
import GiftWrapping from './cart/GiftWrapping';
import Loading from 'bc-loading';
import QuantityWidget from './components/QuantityWidget';
import CartEditOptions from './cart/CartEditOptions';

export default class Cart {
  constructor(context) {
    this.context = context;

    this.quantityControl = new QuantityWidget({scope: '[data-cart-content]'});
    this.cartEditOptions = new CartEditOptions(this.context);

    new GiftWrapping({scope: '[data-cart-content]', context: this.context});

    const loadingOptions = {
      loadingMarkup: '<div class="loading"><span class="loading-spinner"></span></div>',
      visibleClass: 'visible',
      scrollLockClass: 'scroll-locked',
    };

    const cartContentOverlay = new Loading(loadingOptions, true, '[data-cart-content]');
    const cartTotalsOverlay = new Loading(loadingOptions, true, '[data-cart-totals]');

    this.ShippingCalculator = new ShippingCalculator({
      visibleClass: 'visible',
      // callbacks: {
      //   willUpdate: () => {},
      //   didUpdate: () => {},
      // },
    });

    this.CouponCodes = new CouponCodes({
      context: this.context,
      visibleClass: 'visible',
      // callbacks: {
      //   willUpdate: () => {},
      //   didUpdate: () => {},
      // },
    });

    this.GiftCertificates = new GiftCertificates({
      context: this.context,
      visibleClass: 'visible',
      // callbacks: {
      //   willUpdate: () => {},
      //   didUpdate: () => {},
      // },
    });

    this.CartUtils = new CartUtils({
      // callbacks: {
      //   willUpdate: () => {},
      //   didUpdate: () => {},
      // },
    });

    // brute-force apple-pay bodyclass in local environment
    if (window.ApplePaySession && $('.dev-environment').length) {
      $(document.body).addClass('apple-pay-supported');
    }
  }

  unload() {
    //remove all event handlers
  }
}
