import utils from '@bigcommerce/stencil-utils'
import Loading from 'bc-loading';
import debounce from 'just-debounce';
import QuantityWidget from '../components/QuantityWidget';
import 'jquery-revealer';

export default class MiniCart {
  constructor() {
    this.$body = $('body');
    this.$pageWrap = $('.page-wrap');
    this.$cartPreviewContainer = $('[data-minicart-overlay]');
    this.$cartPreviewCount = $('[data-minicart-count]');
    this.$cartToggle = $('[data-minicart-toggle]');
    this.$MiniCart = $('[data-minicart]');
    this.$overlay = $('[data-minicart-overlay]');
    this.$closeButton = $('[data-minicart-close]');

    this.cartChangeHooks = [
      'cart-item-add',
      'cart-item-update',
      'cart-item-remove',
    ];

    this.cartChangeRemoteHooks = [
      'cart-item-add-remote',
      'cart-item-update-remote',
      'cart-item-remove-remote',
    ];

    this._bindUtilHooks();
    this._bindEvents();
  }

  _bindEvents() {
    this.quantityControl = new QuantityWidget({scope: '[data-minicart-content]'});

    const loadingOptions = {
      loadingMarkup: '<div class="loading"></div>',
      visibleClass: 'visible',
    };

    this.cartTotalsOverlay = new Loading(loadingOptions, false, '[data-minicart]');

    this.$cartToggle.off('click').on('click', () => {
      this._toggleMiniCart();
    });

    //Close minicart when clicking x button
    $('[data-minicart-close]').on('click', () => {
      this._hideMiniCart();
    });

    $('[data-minicart]').on('click', () => {
      event.stopPropagation();
    });

    //Close minicart when clicking out of it
    this.$body.on('click', () => {
      if (this.$overlay.hasClass('visible')) {
        this._hideMiniCart();
      }
    });

    //Close minicart with ESC key
    this.$body.on('keyup', '[data-minicart-toggle]', () => {
      if (event.keyCode === 27) {
        event.preventDefault();
        this._hideMiniCart();
      }
    });

    $('.minicart-item-quantity-price .form-input').on('change click', debounce((event) => {
      const $input = $(event.currentTarget);
      const $item = $input.parents('[data-minicart-item]');
      const productID = $item.data('product-id');
      const previousQuantity = $item.data('current-count');
      const quantity = $input.val();

      if (quantity != previousQuantity) {
        this._showOverlay();
        this._updateItem(productID, quantity);
        $item.data('current-count', quantity);
      }
    }, 300, false, true));

    $('[data-minicart-item-remove]').on('click', (event) => {
      event.preventDefault();
      const $input = $(event.currentTarget);
      const $item = $input.parents('[data-minicart-item]');
      const productID = $item.data('product-id');

      this._removeItem(productID);
    });
  }

  /**
   * Bind hook actions so cartPreview updates remotely.
   * cannot bind multple events in the standard space-separated way.
   */
  _bindUtilHooks() {
    // initial events: when an update button is clicked
    this.cartChangeHooks.forEach((hook) => {
      utils.hooks.on(hook, (event) => {
        this._showOverlay();
      });
    });

    // remote events: when the proper response is sent
    this.cartChangeRemoteHooks.forEach((hook) => {
      utils.hooks.on(hook, (event) => {
        this._refreshcartPreview();
      });
    })
  }

  _updateItem(itemID, qty) {
    utils.api.cart.itemUpdate(itemID, qty, () => {});
  }

  _removeItem(itemID) {
    this._showOverlay();
    utils.api.cart.itemRemove(itemID, () => {
      this._hideOverlay();
    });
  }

  _refreshcartPreview() {
    utils.api.cart.getContent({template: 'cart/minicart'}, (err, response) => {
      this.$cartPreviewContainer.html(response);

      // get cart count from newly appended response
      const count = parseInt($('[data-minicart-content]').data('count'), 10);

      this.$cartPreviewCount.text(count || 0);

      $('.minicart-count').attr('data-minicart-count', count);
      $('.minicart-toggle').toggleClass('minicart-toggle-empty', !count);

      this._hideOverlay();
      this._bindEvents();
    });
  }

  _showOverlay() {
    this.cartTotalsOverlay.show();
  }

  _hideOverlay() {
    this.cartTotalsOverlay.hide();
  }

  _toggleMiniCart() {
    if (this.$body.hasClass('minicart-open')) {
      this._hideMiniCart();
    } else {
      this._showMiniCart();
    }
  }

  _showMiniCart() {
    this.$body.addClass('minicart-open');
    this.$overlay.revealer('show');
  }

  _hideMiniCart() {
    this.$body.removeClass('minicart-open');
    this.$overlay.revealer('hide');
  }
};
