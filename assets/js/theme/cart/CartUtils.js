import utils from '@bigcommerce/stencil-utils';
import Alert from '../components/Alert';
import refreshContent from './refreshContent';
import debounce from 'just-debounce';
import Loading from 'bc-loading';

export default class CartUtils {
  constructor(options) {
    this.$cartContent = $('[data-cart-content]');
    this.cartAlerts = new Alert($('[data-cart-errors]', this.$cartContent));
    this.productData = {};

    const loadingOptions = {
      loadingMarkup: '<div class="loading"><span class="loading-spinner"></span></div>',
      visibleClass: 'visible',
      scrollLockClass: 'scroll-locked',
    };

    const cartContentOverlay = new Loading(loadingOptions, true, '[data-cart-content]');

    this.callbacks = $.extend({
      willUpdate: () => cartContentOverlay.show(),
      didUpdate: () => cartContentOverlay.hide(),
    }, options.callbacks);

    this._cacheInitialQuantities();
    this._bindEvents();
  }

  _bindEvents() {
    this.$cartContent.on('change', '[data-quantity-control-input]', debounce((event) => {
      const $target = $(event.target);
      const itemId = $target.closest('[data-quantity-control]').data('quantity-control');

      const newQuantity = parseInt($target.val(), 10);

      if (this.productData[itemId].oldQuantity !== newQuantity) {
        this.productData[itemId].quantityAltered = true;
        this.productData[itemId].newQuantity = newQuantity;
        this._updateCartItem(event);
      } else {
        delete this.productData[itemId].newQuantity;
        this.productData[itemId].quantityAltered = false;
        this._removeCartItem(event);
      }
    }, 300));

    this.$cartContent.on('click', '[data-cart-item-update]', (event) => {
      event.preventDefault();
    });

    this.$cartContent.on('click', '[data-cart-item-remove]', (event) => {
      event.preventDefault();
      this._removeCartItem(event);
    });
  }

  _cacheInitialQuantities() {
    $('[data-cart-item]').each((i, el) => {
      const $cartItem = $(el);
      const itemId = $cartItem.data('item-id');
      this.productData[itemId] = {
        oldQuantity: parseInt($cartItem.find('[data-quantity-control-input]').attr('value'), 10),
        quantityAltered: false,
      };
    });
  }

  _updateCartItem(event) {
    const $target = $(event.currentTarget);
    const $cartItem = $target.closest('[data-cart-item]');
    const itemId = $cartItem.data('item-id');

    this.callbacks.willUpdate();

    if (this.productData[itemId].quantityAltered) {
      const $quantityInput = $cartItem.find('[data-cart-item-quantity-input]');
      const newQuantity = this.productData[itemId].newQuantity;

      utils.api.cart.itemUpdate(itemId, newQuantity, (err, response) => {
        if (response.data.status === 'succeed') {
          this.productData[itemId].oldQuantity = newQuantity;

          const remove = (newQuantity === 0);
          refreshContent(this.callbacks.didUpdate, remove);
        } else {
          $quantityInput.val(this.productData[itemId].oldQuantity);
          this.cartAlerts.error(response.data.errors.join('\n'), true);

          this.callbacks.didUpdate();
        }
      });
    }
  }

  _removeCartItem(event) {
    const itemId = $(event.currentTarget).closest('[data-cart-item]').data('item-id');

    this.callbacks.willUpdate();

    utils.api.cart.itemRemove(itemId, (err, response) => {
      if (response.data.status === 'succeed') {
        refreshContent(this.callbacks.didUpdate, true);
      } else {
        this.cartAlerts.error(response.data.errors.join('\n'), true);

        this.callbacks.didUpdate();
      }
    });
  }

  unload() {
    //remove all event handlers
  }
}
