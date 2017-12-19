import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';
import ProductUtils from '../product/ProductUtils';
import ProductViewTemplates from '../product/productViewTemplates';
import QuantityWidget from '../components/QuantityWidget';
import SelectWrapper from '../components/SelectWrapper';
import Modal from 'bc-modal';
import ThemeUtils from '../utils/ThemeUtilities';
import AttributesHelper from '../product/AttributesHelper';


export default class CartEditOptions {
  constructor(context) {
    this.context = context;
    this.product;
    this.id = null;
    this.$spinner = $('<div class="loading visible"></div>');
    this.attributesHelper = new AttributesHelper('body');

    this.cartOptionsModal = new Modal({
      el: $('<div id="cart-options-modal">'),
      modalClass: 'cart-options-modal',
      afterShow: ($modal) => {
        this._modalLoadingState($modal);
        this._fetchProduct($modal, this.id);
      },
    });

    this._bindEvents();
  }

  _bindEvents() {
    $('body').on('click', '[data-item-edit]', (event) => {
      event.preventDefault();

      this.id = $(event.currentTarget).data('item-edit');

      if (!this.id) { return; }

      this.cartOptionsModal.open();
    });
  }

  /**
   * Show spinner
   */
  _modalLoadingState($modal) {
    $modal.append(this.$spinner);
  }

  /**
   * Run ajax fetch of product and add to modal. Bind product functionality and show the modal
   * @param {jQuery} $modal - the root (appended) modal element.
   * @param {string} $itemId - product id
   */
  _fetchProduct($modal, $itemID) {
    const options = {
      template: 'cart/edit-options',
    };

    utils.api.productAttributes.configureInCart($itemID, options, (err, response) => {
      $modal.find('.modal-content').append(response.content).find('.cart-edit-options').addClass('cart-edit-options-visible');

      this.cartOptionsModal.position();
      $modal.addClass('loaded');

      utils.hooks.on('product-option-change', (event, option) => {
        $modal.find('.loading').show();
        const $changedOption = $(option);
        const $form = $('#CartEditProductFieldsForm');
        const $submit = $('input[type="submit"]', $form);
        const $messageBox = $('[data-reconfigure-errors]');
        const item = $('[name="item_id"]', $form).attr('value');

        utils.api.productAttributes.optionChange(item, $form.serialize(), (err, result) => {
          const data = result.data || {};

          this.attributesHelper.updateAttributes(data);

          if (data.purchasing_message) {
            $($messageBox).html(data.purchasing_message);
            $submit.prop('disabled', true);
            $messageBox.show();
          } else {
            $submit.prop('disabled', false);
            $messageBox.hide();
          }

          if (!data.purchasable || !data.instock) {
            $submit.prop('disabled', true);
          } else {
            $submit.prop('disabled', false);
          }

          $modal.find('.loading').hide();
        })
      });

      utils.hooks.emit('product-option-change');

      $('#CartEditProductFieldsForm').on('submit', () => {
        $modal.find('.loading').show();
      });
    })
  }
}