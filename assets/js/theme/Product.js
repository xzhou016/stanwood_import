import Alert from './components/Alert';
import ProductUtils from './product/ProductUtils';
import QuantityWidget from './components/QuantityWidget';
import productViewTemplates from './product/productViewTemplates';
import ProductReviews from './product/reviews';
import Tabs from 'bc-tabs';
import BulkPricing from './product/BulkPricing';
import debounce from 'just-debounce';
import ThemeUtils from './utils/ThemeUtilities';
import ScrollLink from 'bc-scroll-link';
import fitVids from 'fitvids';

export default class Product {
  constructor(context) {
    this.context = context;
    this.el = '[data-product-container]';
    this.$el = $(this.el);
    this.$tabsContainer = $('[data-tabs]', this.$el);
    this.$tabLink = $('.product-tab-link', this.$tabsContainer);
    this.mobileWidth = 500;

    this.alert = new Alert($('[data-product-message]'));
    this.quantityControl = new QuantityWidget({scope: '[data-cart-item-add]'});
    this.themeUtils = new ThemeUtils();
    this.fitVidsInitialized = false;

    this.scrollLink = new ScrollLink({
      offset: -135,
    });

    new ProductReviews(this.context);
    new BulkPricing();

    this.ProductUtils = new ProductUtils(this.el, {
      priceWithoutTaxTemplate: productViewTemplates.priceWithoutTax,
      priceWithTaxTemplate: productViewTemplates.priceWithTax,
      priceSavedTemplate: productViewTemplates.priceSaved,
      callbacks: {},
    }).init(this.context);

    $(document).ready(() => {
      this._truncateExcerpts();
    });

    this._initTabs();
    this._bindEvents();
  }

  _truncateExcerpts() {
    const $excerpts = $('.has-excerpt');

    $excerpts.each((i, el) => {
      const $excerpt = $(el);

      this.themeUtils.truncate($excerpt);
    });
  }

  _initTabs() {
    this.tabs = new Tabs({
      afterSetup: (tabId) => {
        this._initVids(tabId);
      },
      afterChange: () => {
        const tabId =  '#' + $('[data-tab-content]:visible').attr('id');
        this._initVids(tabId);
        this._tabsHeight($(tabId));
      },
      keepTabsOpen: () => {
        return window.innerWidth < this.mobileWidth;
      },
      tabHistory: true,
    });

    $('.product-tab-toggle').bind('click', (event) => {
      const $target = $(event.currentTarget).parent();
      this.tabs.activateTab($target.attr('href'), true);
    });

    $(window).on('resize', debounce(() => {
      this._tabsHeight($('[data-tab-content]:visible'));
    }, 300));
  }

  _tabsHeight($content) {
    const $productTabs = $('.product-tab-title');
    const tabsMargin = 80;
    const tabsHeight = $productTabs.outerHeight(true) + $content.outerHeight(true) + tabsMargin;

    if (window.innerWidth >= this.mobileWidth) {
      $('.product-tabs-wrapper').css('height', tabsHeight);
    } else {
      $('.product-tabs-wrapper').css('height', '');
    }
  }

  // if page loads with tabs hidden, we need to wait until the proper tab is clicked before running fitVids.
  _initVids(tabId) {
    if (tabId === '#videos' && !this.fitVidsInitialized) {
      fitVids('.product-videos-list');
      this.fitVidsInitialized = true;
    }
  }

  _bindEvents() {
    //Activate the reviews tab when we jump down to it
    $('[data-reviews-link]').on('click', (event) => {
      event.preventDefault();
      this.scrollLink.scrollToContent('#reviews');
      this.tabs.activateTabToggle('#reviews');
      this.tabs.activateTabContent('#reviews');
    });

    //Activate the description tab when we jump down to it
    $('[data-description-link]').on('click', (event) => {
      event.preventDefault();
      this.scrollLink.scrollToContent('#description');
      this.tabs.activateTabToggle('#description');
      this.tabs.activateTabContent('#description');
    });
  }

  unload() {
    //remove all event handlers
  }
}
