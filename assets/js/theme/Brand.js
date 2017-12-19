import Listing from './listing/Listing';
import FacetedSearch from './components/FacetedSearch';

export default class Brand {
  constructor(context) {
    this.context = context;

    this.listing = new Listing('brand', {
      brand: {products: {limit: this.context.listingProductCount}},
    });

    this._initializeFacetedSearch();
  }

  _initializeFacetedSearch() {
    const facetedSearchOptions = {
      config: {
        brand: {
          products: {
            limit: this.context.productsPerPage,
          }
        },
      },
      template: {
        productListing: 'brand/products',
        sidebar: 'brand/filters',
        selected: 'brand/selected'
      },
      scope: {
        productListing: '[data-brand-products]',
        sidebar: '[data-brand-sidebar]',
        facetSelected: '[data-faceted-search-selected]'
      },
      showMore: 'brand/show-more',
    };

    new FacetedSearch(facetedSearchOptions);
  }

  unload() {
    //remove all event handlers
  }
}
