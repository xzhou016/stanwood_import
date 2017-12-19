import utils from '@bigcommerce/stencil-utils';
import Alert from '../components/Alert';
import ImageSwitcher from './imageSwitcher';
import initFormSwatch from '../core/formSelectedValue';
import AttributesHelper from './AttributesHelper';

/**
 * PxU's handler for a couple product-related ajax features.
 * ---------------------------------------------------------
 *
 * lodash templating:
 * ------------------
 *   Updates to product pricing are handled by lodash's templating engine https://lodash.com/docs#template.
 *   Product pricing markup and logic in price.html should therefore be mirrored in productViewTemplates.js
 *
 * callbacks:
 * ----------
 *   willUpdate:   executed on product form submission.
 *                   passes a jQuery object of the product options form
 *
 *   didUpdate:    executed on product cart request response.
 *                   passes as arguments:
 *                   {boolean} isError  - whether or not the request was successful
 *                   {object}  response - response data from Bigcommerce
 *                   {jQuery}  $form    - the product options form jQuery element
 *
 *   switchImage:  executed on product variation change if and when the returned set of options has an image associated.
 *                   passes the url of the image. The code as it stands assumes a configured 'product' image size in config.json
 *
 */

export default class ProductUtils {
  constructor(el, options) {
    this.$el = $(el);
    this.options = options;
    this.productId = this.$el.find('[data-product-id]').val();

    // class to add or remove from cart-add button depending on variation availability
    this.buttonDisabledClass = 'button-disabled';

    // two alert locations based on action
    this.cartAddAlert = new Alert(this.$el.find('[data-product-cart-message]'));
    this.cartOptionAlert = new Alert(this.$el.find('[data-product-option-message]'));

    this.imageSwitcher = new ImageSwitcher(this.context, this.$el);

    this.attributesHelper = new AttributesHelper(el);

    this.callbacks = $.extend({
      willUpdate: () => console.log('Update requested.'),
      didUpdate: () => console.log('Update executed.'),
      switchImage: (url) => this.imageSwitcher.variantImage(url),
    }, options.callbacks);
  }

  /**
   * pass in the page context and bind events
   */
  init(context) {
    this.context = context;

    this._bindProductOptionChange();
    this._bindQuantityChange();

    if (this.$el.hasClass('single-product')) {
      // run initial attr update if we're on a single product page
      this.attributesHelper.updateAttributes(window.BCData.product_attributes);
    } else {
      // otherwise emit our option change event (this happens in the quickshop)
      utils.hooks.emit('product-option-change');
    }

    this._bindAddWishlist();
    this._bindCartAdd();
    initFormSwatch();
  }

  /**
   * Cache an object of jQuery elements for DOM updating
   * @param  jQuery $el - a wrapping element of the scoped product
   * @return {object} - buncha jQuery elements which may or may not exist on the page
   */
  _getViewModel($el) {
    return {
      $price: $('[data-product-price-wrapper="without-tax"]', $el),
      $priceWithTax: $('[data-product-price-wrapper="with-tax"]', $el),
      $saved: $('[data-product-price-saved]', $el),
      $sku: $('[data-product-sku]', $el),
      $weight: $('[data-product-weight]', $el),
      $addToCart: $('[data-button-purchase]', $el),
    };
  }

  /**
   * Bind quantity input changes.
   */
  _bindQuantityChange() {
    this.$el.on('click', '[data-product-quantity-change]', (event) => {
      this._updateQuantity(event);
    });
  }

  /**
   * Bind product options changes.
   */
  _bindProductOptionChange() {
    utils.hooks.on('product-option-change', (event, changedOption) => {
      const $changedOption = $(changedOption);
      const $form = $changedOption.parents('form');

      // Do not trigger an ajax request if it's a file or if the browser doesn't support FormData
      if ($changedOption.attr('type') === 'file' || window.FormData === undefined) {
        return;
      }

      utils.api.productAttributes.optionChange(this.productId, $form.serialize(), (err, response) => {
        this.cartAddAlert.clear();

        const viewModel = this._getViewModel(this.$el);
        const data = response ? response.data : {};

        this.attributesHelper.updateAttributes(data);

        // updating price
        if (data.price && viewModel.$price.length) {
          const priceStrings = {
            price: data.price,
            excludingTax: this.context.productExcludingTax,
          };
          viewModel.$price.html(this.options.priceWithoutTaxTemplate(priceStrings));
        }

        if (data.price && viewModel.$priceWithTax.length) {
          const priceStrings = {
            price: data.price,
            includingTax: this.context.productIncludingTax,
          };
          viewModel.$priceWithTax.html(this.options.priceWithTaxTemplate(priceStrings));
        }

        if (data.price && viewModel.$saved.length) {
          const priceStrings = {
            price: data.price,
            savedString: this.context.productYouSave,
          };
          viewModel.$saved.html(this.options.priceSavedTemplate(priceStrings));
        }

        // update sku if exists
        if (data.sku && viewModel.$sku.length) {
          viewModel.$sku.html(data.sku);
        }

        // update weight if exists
        if (data.weight && viewModel.$weight.length) {
          viewModel.$weight.html(data.weight.formatted);
        }

        // handle product variant image if exists
        if (data.image) {
          const mainImageUrl = utils.tools.image.getSrc(
            data.image.data,
            this.context.themeImageSizes.product
          );

          this.callbacks.switchImage(mainImageUrl);
        } else {
          this.callbacks.switchImage(null);
        }

        this.cartOptionAlert.clear();

        if (data.purchasing_message) {
          this.cartOptionAlert.error(data.purchasing_message);
        }

        // update submit button state
        if (!data.purchasable || !data.instock) {
          viewModel.$addToCart
            .addClass(this.buttonDisabledClass)
            .prop('disabled', true);
        } else {
          viewModel.$addToCart
            .removeClass(this.buttonDisabledClass)
            .prop('disabled', false);
        }
      });
    });
  }

  /**
   * Add a product to cart
   */
  _bindCartAdd() {
    utils.hooks.on('cart-item-add', (event, form) => {
      // Do not do AJAX if browser doesn't support FormData
      if (window.FormData === undefined) { return; }

      event.preventDefault();

      this.callbacks.willUpdate($(form));
      $('[data-button-purchase]').prop('disabled', true);

      // Add item to cart
      utils.api.cart.itemAdd(new FormData(form), (err, response) => {
        let isError = false;

        if (err || response.data.error) {
          isError = true;
          response = err || response.data.error;
        }

        this._updateMessage(isError, response);
        this.callbacks.didUpdate(isError, response, $(form));

        setTimeout(() => {
          this.cartAddAlert.clear();
          $('[data-button-purchase]').prop('disabled', false);
        }, 5000);
      });
    });
  }

  /**
   * Validate and update quantity input value
   */
  _updateQuantity(event) {
    const $target = $(event.currentTarget);
    const $quantity = $target.closest('[data-product-quantity]').find('[data-product-quantity-input]');
    const min = parseInt($quantity.prop('min'), 10);
    const max = parseInt($quantity.prop('max'), 10);
    let newQuantity = parseInt($quantity.val(), 10);

    this.cartAddAlert.clear();
    this.cartOptionAlert.clear();

    if ($target.is('[data-quantity-increment]') && (!max || newQuantity < max)) {
      newQuantity = newQuantity + 1;
    } else if ($target.is('[data-quantity-decrement]') && newQuantity > min) {
      newQuantity = newQuantity - 1;
    }

    $quantity.val(newQuantity);
  }

  /**
   * interpret and display cart-add response message
   */
  _updateMessage(isError, response) {
    let message = '';

    if (isError) {
      message = response;
    } else {
      message = this.context.addSuccess;
      message = message
                  .replace('*product*', this.$el.find('[data-product-details]').data('product-title'))
                  .replace('*cart_link*', `<a href=${this.context.urlsCart}>${this.context.cartLink}</a>`)
                  .replace('*checkout_link*', `<a href=${this.context.urlsCheckout}>${this.context.checkoutLink}</a>`);
    }

    this.cartAddAlert.message(message, (isError ? 'error' : 'success'));
  }

  /**
   * Ajax add to wishlist
   *
   */

  _bindAddWishlist() {
    $('[data-wishlist]').on('click', (event) => {
      const $button = $(event.currentTarget);
      const addUrl = $button.attr('href');
      const viewUrl = $button.data('wishlist');
      const title = $('[data-product-title]').data('product-title');

      if ($('[data-is-customer]').length) {
        event.preventDefault();

        $.ajax({
          type: 'POST',
          url: addUrl,
          success: () => {
            this.cartAddAlert.success(this.context.messagesWishlistAddSuccess.replace('*product*', title).replace('*url*', viewUrl), true);
          },
          error: () => {
            this.cartAddAlert.error(this.context.messagesWishlistAddError.replace('*product*', title), true);
          },
          complete: () => {
            $button
              .closest('[data-dropdown]')
              .find('[data-dropdown-toggle]')
              .trigger('click');
          },
        });
      }
    });
  }

  unload() {
    //remove all event handlers
  }
}
