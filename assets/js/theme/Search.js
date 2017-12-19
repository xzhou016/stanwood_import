import Listing from './listing/Listing';
import FacetedSearch from './components/FacetedSearch';
import Tabs from 'bc-tabs';

export default class Search {
  constructor(context) {
    this.context = context;
    this.$tabLink = $('.search-tab-link');
    this.queryString = window.location.search;

    this.listing = new Listing('search', {
      product_results: {limit: this.context.listingProductCount},
    });

    this.listing.on('update', () => {
      this.tabs.unload();
      this._initTabs();
    });

    this._initTabs();
    this._initializeFacetedSearch();
  }

  _initTabs() {
    // Show the content tab if no product results, or product tab if category/brand results
    let defaultTab = '';

    if ($('#search-product-listing .search-results-group').length) {
      defaultTab = document.querySelector('#product-content-listing');
    } else if (!$('#search-product-listing .products-section-grid').length) {
      defaultTab = document.querySelector('#search-content-listing');
    }

    this.tabs = new Tabs({
      defaultTab,
      keepTabsOpen: () => false,
    });
  }

  _initializeFacetedSearch() {
    const facetedSearchOptions = {
      config: {
        product_results: {
          limit: this.context.productsPerPage,
        },
      },
      template: {
        productListing: 'search/products',
        sidebar: 'search/filters',
      },
      scope: {
        productListing: '[data-search]',
        sidebar: '[data-search-sidebar]',
      },
      showMore: 'search/show-more',
    };

    new FacetedSearch(facetedSearchOptions);
  }

  unload() {
    //remove all event handlers
  }
}
