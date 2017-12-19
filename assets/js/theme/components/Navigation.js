import NavMobile from './NavMobile';

export default class Navigation {
  constructor() {
    this.$sidebarFluid = $('[data-sidebar-fluid]');
    this.$toggle = $('[data-submenu-toggle]');
    this.$dropdown = $('[data-submenu]');
    this.$navRow = $('[data-nav-menu-item-row]');
    this.$mobileNavToggle = $('[data-nav-mobile-toggle]');


    this.mobileNav = new NavMobile();

    this._bindEvents();
  }

  _bindEvents() {
    this.$toggle.on('click', (event) => {
      const $toggle = $(event.currentTarget);
      const $dropdown = $(event.currentTarget).parent().siblings('[data-submenu]');
      const $breadcrumbs = $('[data-menu-item-breadcrumb]');

      if ($toggle.data('submenu-toggle-breadcrumb') && $breadcrumbs.length > 0) {
        this._persistentMenu($breadcrumbs);
      } else {
        this._toggleDropdown($dropdown);
      }
    });

    this.$mobileNavToggle.on('click', () => {
      this.mobileNav.toggle();
    })
  }

  _persistentMenu($breadcrumbs) {
    if ($breadcrumbs.first().children('[data-nav-menu-item-row]').hasClass('nav-menu-item-row-active')) {
      this._closeAllDropdowns();
    } else {
      this._closeAdjacentDropdowns($breadcrumbs.first().children('[data-submenu]'));

      $breadcrumbs.each((index, breadcrumb) => {
        const $breadcrumb = $(breadcrumb);
        const $dropdown = $breadcrumb.children('[data-submenu]');
        const $dropdownLink = $dropdown.siblings('[data-nav-menu-item-row]');
        const $dropdownParent = $dropdown.parent();

        $dropdown.one('revealer-animating', () => {
          this._menuTier($dropdown);
        });

        if (!$dropdown.revealer('isVisible')) {
          $dropdown.one('revealer-show', (event) => {
            $dropdownLink.addClass('nav-menu-item-row-active');
          });
        } else {
          $dropdownLink.removeClass('nav-menu-item-row-active');
        }

        $dropdown.revealer();
      });
    }
  }

  _closeAllDropdowns() {
    this.$sidebarFluid.removeClass('nav-tier-2 nav-tier-3 nav-tier-4 nav-tier-5 nav-tier-6 nav-tier-7 nav-tier-8');
    this.$navRow.removeClass('nav-menu-item-row-active');
    this.$dropdown.revealer('hide');
  }

  _closeAdjacentDropdowns($currentDropdown) {
    $.each(this.$dropdown, (index, dropdown) => {
      const $dropdown = $(dropdown);
      // only hide dropdowns that aren't the one being clicked on or it's parent
      const hide = !$dropdown.is($currentDropdown) && !$dropdown.find($('[data-submenu]')).is($currentDropdown);

      if (hide) {
        $dropdown.revealer('hide').siblings('[data-nav-menu-item-row]').removeClass('nav-menu-item-row-active');
      }
    });
  }

  _toggleDropdown($dropdown) {
    this._closeAdjacentDropdowns($dropdown);

    const $dropdownParent = $dropdown.parent();
    const $dropdownLink = $dropdown.siblings('[data-nav-menu-item-row]');

    $dropdown.one('revealer-animating', () => {
      this._menuTier($dropdown);
    });

    if (!$dropdown.revealer('isVisible')) {
      $dropdownLink.addClass('nav-menu-item-row-active');
      $dropdown.one('revealer-show', (event) => {
        if ($dropdownParent.hasClass('nav-menu-item')) {
          this._scrollToNavPosition($dropdownParent);
        }
      });
    } else {
      $dropdownLink.removeClass('nav-menu-item-row-active');
    }

    $dropdown.revealer();
  }

  _scrollToNavPosition($anchor) {

    let anchorOffsetHeight = $anchor.offset().top - $anchor.height();

    if (anchorOffsetHeight < 0) {
      anchorOffsetHeight = 0;
    }

    const distance = anchorOffsetHeight - $(document).scrollTop();

    if (distance < 0) {
      $('html,body').animate({
        scrollTop: $anchor.offset().top - 30 // a little bit of padding so we're not kissing the viewport
      }, 0); // TODO: animate this with designer
    }
  }

  _menuTier($dropdown) {
    const $dropdownParents = $dropdown.parents('[data-menu-item]:not(.nav-menu-item)');

    this.$sidebarFluid.removeClass('nav-tier-2 nav-tier-3 nav-tier-4 nav-tier-5 nav-tier-6 nav-tier-7 nav-tier-8');

    // if dropdown is opening go up a tier
    if ($dropdown.revealer('isVisible')) {
      this.$sidebarFluid.addClass('nav-tier-' + ($dropdownParents.length + 2));
    } else {
      this.$sidebarFluid.addClass('nav-tier-' + ($dropdownParents.length + 1));
      this.$sidebarFluid.removeClass('nav-tier-' + ($dropdownParents.length + 2))
    }
  }
}
