import $ from 'jquery';
import utils from '@bigcommerce/stencil-utils';
import ProductUtils from '../product/ProductUtils';
import ProductViewTemplates from '../product/productViewTemplates';
import QuantityWidget from '../components/QuantityWidget';
import SelectWrapper from '../components/SelectWrapper';
import Modal from 'bc-modal';
import imagesLoaded from 'imagesloaded';
import ThemeUtils from '../utils/ThemeUtilities';

export default class QuickView {
  constructor(context) {
    this.context = context;
    this.product;
    this.id = null;
    this.spinner = $('<div class="loading visible"></div>');
    this.themeUtils = new ThemeUtils();

    this.quickViewModal = new Modal({
      el: $('<div id="quick-view-modal">'),
      modalClass: 'quick-view-modal',
      afterShow: ($modal) => {
        this._modalLoadingState($modal);
        this._fetchProduct($modal, this.id);
      },
    });

    this._bindEvents();
  }

  /**
   * Show spinner
   */
  _modalLoadingState($modal) {
    $modal.append(this.spinner);
  }

  /**
   * Launch quickview modal on click and set up id variable
   */
  _bindEvents() {
    $('body').on('click', '[data-quick-view]', (event) => {
      event.preventDefault();

      this.id = $(event.currentTarget).data('product-id');

      if (!this.id) { return; }

      this.quickViewModal.open();
    });
  }

  /**
   * Run ajax fetch of product and add to modal. Bind product functionality and show the modal
   * @param {jQuery} $modal - the root (appended) modal element.
   * @param {integer} id - product id
   */
  _fetchProduct($modal, id) {
    utils.api.product.getById(id, { template: 'product/quick-view-modal' }, (err, response) => {
      $modal.find('.modal').addClass('quick-view-modal-visible').find('.modal-content').append(response);
      this.themeUtils.truncate($modal.find('.product-details-description-short.has-excerpt'));

      // set up product utils (adding to cart, options)
      this.product = new ProductUtils($modal.find('[data-quick-view-product]'), {
        priceWithoutTaxTemplate: ProductViewTemplates.priceWithoutTax,
        priceWithTaxTemplate: ProductViewTemplates.priceWithTax,
        priceSavedTemplate: ProductViewTemplates.priceSaved,
        callbacks: {
          didUpdate: (isError, response) => {},
          willUpdate: (isError, response) => {},
        },
      }).init(this.context);

      const $select = $modal.find('select');
      if ($select.length) {
        $select.each((i, el) => {
          new SelectWrapper(el);
        });
      }

      imagesLoaded($modal[0], () => {
        this.quickViewModal.position();
        new QuantityWidget({scope: $modal});
        $modal.addClass('loaded');
      });
    });
  }
}
