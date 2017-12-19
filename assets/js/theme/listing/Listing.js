import _ from 'lodash';
import EventEmitter from 'eventemitter2';
import Filters from './Filters';
import Loading from 'bc-loading';
import Compare from 'bc-compare';
import Alert from '../components/Alert';
import debounce from 'just-debounce';

export default class Listing extends EventEmitter {
  /**
   * Manages product listings.
   *
   * This class glues together different components, taking care of any
   * theme-specifc logic and UI.
   */

  constructor(templateNamespace, frontmatter) {
    super();

    this.$body = $(document.body);
    this.$filters = $('[data-filters]');
    this.$filtersContainer = $('[data-filters-container]');
    this.$alerts = $('[data-product-grid-alerts]');

    this.templateNamespace = templateNamespace;
    this.filters = new Filters(frontmatter);
    this.alert = new Alert(this.$alerts);
    this.loader = new Loading({}, true);

    this.footer = document.querySelector('.main-footer');
    this.compareWidget = document.querySelector('[data-compare-widget]');
    this.pageWrap = document.querySelector('.page-wrap');

    this.xLargeWidth = 1440;
    this.largeScreen = 1024;

    if ($('[data-product-compare]').length) {
      this._initCompare();
      this._widgetPosition();
    }

    this._bindEvents();
  }

  _bindEvents() {
    // Update filters
    this.filters.addTemplate(`${this.templateNamespace}/filters`, (content) => {
      const wasVisible = this.$filters.is(':visible');

      const $newFilters = $(content).find('[data-filters]');
      this.$filters.replaceWith($newFilters);
      this.$filters = $newFilters;

      if (wasVisible) {
        this.$filters.show();
      }
    });

    // Update product listing
    this.filters.addTemplate(`${this.templateNamespace}/products`, (content) => {
      $('[data-listing-container]').replaceWith(content);
    });

    // Pagination links
    this.$body.on('click', '[data-listing-pagination-link]', (event) => {
      event.preventDefault();
      this._scrollToTop();

      // Update filter state
      const $el = $(event.currentTarget);
      const url = $el.attr('href');
      this.filters.updateState(url);
    });

    // Update pagination
    this.filters.addTemplate(`${this.templateNamespace}/pagination`, (content) => {
      $('[data-listing-pagination]').replaceWith(content);
    });

    // UI feedback

    this.filters.on('fetch', (state) => {
      this.loader.show();
      this.emit('fetch', state);
    });

    this.filters.on('update', (state) => {
      setTimeout(() => {
        this.loader.hide();
      }, 1200);
      this.alert.clear();
      this.emit('update', state);
    });

    this.filters.on('error', (error, state) => {
      this.loader.hide();
      this.alert.error(error);
      this.emit('error', error, state);
    });

    $(window).on('scroll resize', () => {
      if ($('[data-product-compare]').length) {
        this._widgetPosition();
      }
    });

    // Disable compare button on 1 item if shown
    this.$body.on('click', '[data-compare-link]', (event) => {
      if ($('[data-compare-link]').hasClass('is-disabled')) {
        event.preventDefault();
      }
    });
  }

    _initCompare() {
    const compare = new Compare({
      itemTemplate: () => {},
    });

    compare.on('updated', () => {
      $('.compare-title span').text(compare.compareList.size);

      if (compare.compareList.size > 1) {
        $('[data-compare-widget]').addClass('visible');
      } else {
        $('[data-compare-widget]').removeClass('visible');
      }
    }, true);

    $('[data-compare-remove-all]').on('click', () => {
      compare.removeAll();
    });
  }

  _scrollToTop() {
    const scrollTop = $('[data-listing-container]').offset().top;
    $('html,body').animate({ scrollTop });
  }

  _widgetPosition() {
    const pageWrapOffset = window.innerWidth - (this.pageWrap.offsetLeft + this.pageWrap.offsetWidth);
    const xLargeScreen = $(window).width() >= this.xLargeWidth;

    if (window.innerWidth < this.largeScreen) {
      this.compareWidget.style.display = '';
    }

    this.compareWidget.style.right = xLargeScreen ? `${pageWrapOffset}px` : '';
  }

  unload() {
    //remove all event handlers
  }
}
