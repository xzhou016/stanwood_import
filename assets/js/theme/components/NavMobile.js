import 'jquery-revealer';

export default class NavMobile {
  constructor() {
    this.$toggle = $('[data-nav-mobile-toggle]');
    this.$sidebar = $('[data-sidebar]');
    this.$body = $('body');
  }

  toggle() {
    this.$body.toggleClass('scroll-locked');
    this.$sidebar.revealer();
  }
}