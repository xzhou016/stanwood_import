import Flickity from 'flickity-bg-lazyload';
import debounce from 'just-debounce';

export default class Carousel {

  constructor(context) {
    this.context = context;
    this.autoplay = this.context.carouselDelay;
    this._init();
  }

  _init() {
    this.flickity = new Flickity('[data-homepage-carousel]', {
      cellSelector: '[data-carousel-slide]',
      prevNextButtons: false,
      pageDots: true,
      wrapAround: true,
      accessibility: false,
      setGallerySize: false,
      bgLazyLoad: 1,
      autoPlay: this.autoplay,
    });

    this.windowWidth = $(window).width();
    this.mobileWidth = 1024;
    this.gutter = 30;
    this.$el = $('.homepage-carousel');
    this.$carouselViewport = $('.flickity-viewport', this.$el);
    this.$carouselDots = $('.flickity-page-dots', this.$el);
    this.$slideInfo = $('.carousel-slide-info', this.$el);

    this.$el.css('opacity', 1);
    this._bindEvents();
  }

  _bindEvents() {
    $('[data-carousel-slide-prev]').on('click', () => {
      this.flickity.previous();
    });

    $('[data-carousel-slide-next]').on('click', () => {
      this.flickity.next();
    });

    $(window).on('resize', () => {
      if (this.windowWidth >= this.mobileWidth) {
        this.$slideInfo.css('opacity', 0);
      }
    });

    $(window).on('resize', debounce(() => {
      if (this.windowWidth === $(window).width()) {
        this.$slideInfo.css('opacity', 1);
        return;
      }
      this.windowWidth = $(window).width();
      this._height();
    }, 300));

    this.flickity.on( 'select', () => {
      this._height();
    });

    this._height();
  }

  _height() {
    const $slide = $(this.flickity.selectedCell.element);
    const $slideInfo = $('.carousel-slide-info', $slide);
    const slideHeight = $slide.outerHeight();
    const slideInfoHeight = $slideInfo.outerHeight();

    if (this.windowWidth >= this.mobileWidth) {
      this._resetHeight();
      return;
    }

    if (!$slideInfo.length) {
      this.$el.add(this.$carouselViewport).css('height', slideHeight + (this.gutter * 2)); //some padding at the bottom
      this.$carouselDots.css('bottom', (this.gutter));
      return;
    }

    this.$el.add(this.$carouselViewport).css('height', slideHeight + slideInfoHeight);
    $slideInfo.css('margin-top', slideHeight);
    this.$carouselDots.css('bottom', (slideInfoHeight - this.gutter));
    this.$slideInfo.css('opacity', 1);
  }

  _resetHeight() {
    this.$el.add(this.$carouselViewport).css('height', '');
    this.$slideInfo.css({'margin-top': '', 'opacity': 1});
    this.$carouselDots.css('bottom', '');
  }

  unload() {
    this.flickity.destroy();
  }
}
