import debounce from 'just-debounce';
import utils from '@bigcommerce/stencil-utils';
import Loading from 'bc-loading';

export default class QuickSearch {
  constructor() {
    this.$body = $('body');
    this.$quickSearch = $('[data-quick-search]');
    this.$searchForm = $('[data-search-form]');
    this.$searchInput = $('[data-search-input]');
    this.$searchComponents = $('[data-quick-search-overlay], [data-search-close]');

    const loadingOptions = {
      loadingMarkup: '<div class="loading"></div>',
      visibleClass: 'visible',
      scrollLockClass: 'scroll-locked',
    };

    this.quickSearchOverlay = new Loading(loadingOptions, true, '[data-quick-search]');

    this._bindEvents();
  }

  _bindEvents() {
    this.$searchInput.on({
      keyup: debounce((event) => {
        const searchQuery = $(event.currentTarget).val();

        // Only perform search with at least 3 characters
        if (searchQuery.length < 3) {
          this.$quickSearch.revealer('hide');
          this.$searchComponents.revealer('hide');
          return;
        } else {
          this.$quickSearch.revealer('show').one('revealer-show', () => {
            this.$searchComponents.revealer('show');
          });
        }

        this._doSearch(searchQuery);
      }, 100),
      blur: debounce(() => {
        this.$body.removeClass('scroll-locked');
      }, 100)
    });

    this.$body.on('click', '[data-quick-search-submit]', (event) => {
      const searchQuery = this.$searchInput.val();
      const searchResults = $(event.currentTarget);
      event.preventDefault();

      this._submitSearch(searchQuery, searchResults);
    });

    //Close quicksearch when clicking out of it
    this.$body.on('click', (event) => {
      if (!$(event.target).closest('[data-search-form], [data-quick-search], .quick-view-modal-visible').length) {
        this._endSearch();
      }
    });

    //Close quicksearch with ESC key
    this.$body.on('keyup', (event) => {
      if (event.keyCode === 27) {
        event.preventDefault();
        this._endSearch();
      }
    });

    //Close quicksearch with close button
    $('[data-search-close]').on('click', (event) => {
      event.preventDefault();
      this._endSearch();
    });

    //Re-open quicksearch when clicking in search box if input has at least 3 characters
    this.$searchInput.on('click', (event) => {
      const searchQuery = $(event.currentTarget).val();

      if (searchQuery.length >= 3) {
        event.preventDefault();
        this.$quickSearch.revealer('show');
        this.$searchComponents.revealer('show');
      }
    });
  }

  _doSearch(searchQuery) {
    this.quickSearchOverlay.show();
    utils.api.search.search(searchQuery, { template: 'quick-results' }, (err, response) => {
      if (err) {
        return false;
      }

      this.$quickSearch.html(response);
      this.quickSearchOverlay.hide();
    })
  }

  _submitSearch(searchQuery, searchResults) {
    if (searchResults.parents('.quick-search-list-content').length) {
      window.location = this.$searchInput.attr('data-search-url') + '?search_query=' + searchQuery + '#search-content-listing';
      window.scrollTo(0, 0);

      if (window.location.hash === '#search-content-listing') {
        window.location.reload(true);
      }
    } else {
      window.location = this.$searchInput.attr('data-search-url') + '?search_query=' + searchQuery;
    }
  }

  _endSearch() {
    this.$quickSearch.revealer('hide');
    this.$searchComponents.revealer('hide');
  }
}
