import {hooks, api} from '@bigcommerce/stencil-utils';
import Url from 'url';
import 'history.js/scripts/bundled/html4+html5/jquery.history';
import SelectWrapper from './SelectWrapper';
import Loading from 'bc-loading';

export default class FacetedSearch {
  constructor(options, callback) {
    this.callback = callback;
    this.$body = $(document.body);
    this.$refineToggle = $('[data-refine-toggle]');
    this.$subcategoriesToggle = $('[data-show-more-subcategories]');

    this.options = $.extend(true, {
      config: {
        category: {
          shop_by_price: true,
        },
        shop_by_brand: {
          limit: 12,
        }
      },
      facetToggle: '[data-facet-toggle]',
      moreToggle: '[data-facet-more]',
      moreFacets: '[data-show-more-facets]',
    }, options);

    const loadingOptions = {
      loadingMarkup: '<div class="loading"></div>',
      visibleClass: 'visible',
      scrollLockClass: 'scroll-locked',
    };

    this.facetedSearchOverlay = new Loading(loadingOptions, true, '[data-sidebar]');

    this.callbacks = $.extend({
      willUpdate: () => this._showOverlay(),
      didUpdate: () => this._hideOverlay(),
    }, options.callbacks);

    this._bindEvents();
  }

  _bindEvents() {
    this.$body.on('click', this.options.facetToggle, (event) => {
      this._toggleFacet(event);
    });

    this.$body.on('click', this.options.moreToggle, (event) => {
      this._showAdditionalFilters(event);
    });

    this.$body.on('click', this.options.moreFacets, (event) => {
      event.preventDefault();
      const $container = $(event.currentTarget).parent();
      this._showMoreFacets($container);
    });

    this.$refineToggle.on('click', (event) => {
      const $toggle = $(event.currentTarget);
      this._toggleRefineMobile($toggle);
    });

    this.$subcategoriesToggle.on('click', (event) => {
      const $toggle = $(event.currentTarget);
      this._toggleSubcategories($toggle);
    });

    $(window).on('statechange', this._onStateChange.bind(this));
    hooks.on('facetedSearch-facet-clicked', this._onFacetClick.bind(this));
    hooks.on('facetedSearch-range-submitted', this._onRangeSubmit.bind(this));
    hooks.on('sortBy-submitted', this._onSortBySubmit.bind(this));
  }

  _showMoreFacets($container) {
    // Show/hide extra facets based on settings for product filtering
    this.callbacks.willUpdate();

    const $toggle = $container.find('[data-show-more-facets]');
    const $navList = $container.find('[data-facet-filter-wrapper]');

    const facet = $navList.data('facet');
    const facetUrl = History.getState().url;

    if (!$container.find('[data-additional-facets-list]').length) {
      if (this.options.showMore) {
        api.getPage(facetUrl, {
          template: this.options.showMore,
          params: {
            list_all: facet,
          },
        }, (err, response) => {
          if (err) {
            throw new Error(err);
          }
          $(response).insertAfter($navList);
          this._toggleFacetLists($container, $navList);
          this.callbacks.didUpdate();
        });
      }
    } else {
      this._toggleFacetLists($container, $navList);
      this.callbacks.didUpdate();
    }

    // Toggle more/less link
    $toggle.children().toggle();

    return false;
  }

  _toggleFacetLists($container, $navList) {
    // Hide original list
    $navList.toggle();

    // Toggle new list
    $container
      .find('[data-additional-facets-list]')
      .toggle();
  }

  _showAdditionalFilters(event) {
    event.preventDefault();

    $(event.currentTarget)
      .addClass('hidden')
      .parent('li')
      .siblings('li')
      .removeClass('hidden');
  }

  _toggleFacet(event) {
    this.options.toggleFacet(event);
  }

  _onFacetClick(event) {
    event.preventDefault();

    const $target = $(event.currentTarget);
    const url = $target.attr('href');

    $target.parent('[data-facet-item]').toggleClass('facet-selected');
    this._goToUrl(url);
  }

  _onRangeSubmit(event) {
    event.preventDefault();

    const url = Url.parse(location.href);
    let queryParams = $(event.currentTarget).serialize();

    if (this.$body.hasClass('template-search')) {
      const currentSearch = `search_query=${$('[data-faceted-search]').data('search-query')}` || '';
      queryParams = `${queryParams}&${currentSearch}`;
    }

    this._goToUrl(Url.format({pathname: url.pathname, search: '?' + queryParams}));
  }

  _onSortBySubmit(event) {
    event.preventDefault();

    const url = Url.parse(location.href, true);
    const queryParams = $(event.currentTarget).serialize().split('=');

    url.query[queryParams[0]] = queryParams[1];
    delete url.query['page'];

    this._goToUrl(Url.format({pathname: url.pathname, query: url.query}));
  }

  _onStateChange(event) {
    this.callbacks.willUpdate();
    api.getPage(History.getState().url, this.options, (err, content) => {
      if (err) {
        this.callbacks.didUpdate();
        throw new Error(err);
      }

      if (content) {
        $(this.options.template.scope).html(content.productListing);
        $(this.options.scope.sidebar).html(content.sidebar);
        $(this.options.scope.facetSelected).html(content.selected);
        this.callbacks.didUpdate();

        new SelectWrapper($('[data-sort-by] select'));
        this.callbacks.didUpdate();
      }
    });
  }

  _showOverlay() {
    this.facetedSearchOverlay.show();
  }

  _hideOverlay() {
    this.facetedSearchOverlay.hide();
  }

  _toggleRefineMobile($toggle) {
    $toggle.toggleClass('refine-icon-active');
    $toggle.parent().siblings('.mobile-category-filters').revealer();
  }

  _toggleSubcategories($toggle) {
    $toggle.siblings().toggle();
    $toggle.children().toggle();
  }

  _goToUrl(url) {
    History.pushState({}, document.title, url);
  }
}
