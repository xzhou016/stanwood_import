import Listing from './listing/Listing';
import FacetedSearch from './components/FacetedSearch';

export default class Category {
  constructor(context) {
    this.context = context;

    this.listing = new Listing('category', {
      category: { products: { limit: this.context.listingProductCount } },
    });

    this._init();
  }

  _init() {
    if ($('[data-faceted-search]').length) {
      this._initializeFacetedSearch();
    }
  }

  _initializeFacetedSearch() {
    const facetedSearchOptions = {
      config: {
        category: {
          products: {
            limit: this.context.productsPerPage,
          }
        },
      },
      template: {
        productListing: 'category/products',
        sidebar: 'category/filters',
        selected: 'category/selected'
      },
      scope: {
        productListing: '[data-category-products]',
        sidebar: '[data-category-sidebar]',
        facetSelected: '[data-faceted-search-selected]'
      },
      showMore: 'category/show-more',
    };

    new FacetedSearch(facetedSearchOptions);
  }

  unload() {
    //remove all event handlers
  }
}
