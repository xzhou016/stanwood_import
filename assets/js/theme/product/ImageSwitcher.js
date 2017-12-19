import Flickity from 'flickity-sync';
import 'flickity-bg-lazyload';
import 'flickity-imagesloaded';
import debounce from 'just-debounce';
import Intense from '@tholman/intense-images';

export default class ImageSwitcher {
  constructor(context, el) {
    this.context = context;
    this.el = el;
    this.$el = $(el);
    this.$container = this.$el.find('.product-image');
    this.$zoomImages = this.$container.find('.product-image-zooms');
    this.mobileWidth = 768;
    this.previousInterval;
    this.nextInterval;

    const contain = $('[data-product-main-image]').children().length < 4;

    this._imageZoom('.image-zoom');

    this.flickityMainImage = new Flickity(this.$el.find('[data-product-main-image]')[0], {
      cellSelector: '[data-product-main-image-slide]',
      prevNextButtons: false,
      pageDots: false,
      wrapAround: true,
      accessibility: false,
      setGallerySize: true,
      sync: this.$el.find('[data-product-thumbnails]')[0],
      lazyLoad: 1,
      imagesLoaded: true,
    });

    this.flickityThumbnails = new Flickity(this.$el.find('[data-product-thumbnails]')[0], {
      cellSelector: '[data-product-thumbnails-slide]',
      prevNextButtons: false,
      pageDots: false,
      wrapAround: !contain,
      accessibility: false,
      setGallerySize: true,
      contain: contain,
      draggable: !contain,
      bgLazyLoad: 2,
      imagesLoaded: true,
    });

    this._bindEvents();
  }

  _bindEvents() {
    this.$el.find('[data-carousel-slide-previous]').on('mousedown touchstart', () => {
      this.previousInterval = setInterval(() => {
        this.flickityThumbnails.previous();
        this._removeVariants();
      }, 600);
    });

    this.$el.find('[data-carousel-slide-previous]').on('mouseup touchend', () => {
      clearInterval(this.previousInterval);
    });

    this.$el.find('[data-carousel-slide-previous]').on('click', () => {
      this.flickityThumbnails.previous();
      this._removeVariants();
    });

    this.$el.find('[data-carousel-slide-next]').on('mousedown touchstart', () => {
      this.nextInterval = setInterval(() => {
        this.flickityThumbnails.next();
        this._removeVariants();
      }, 600);
    });

    this.$el.find('[data-carousel-slide-next]').on('mouseup touchend', () => {
      clearInterval(this.nextInterval);
    });

    this.$el.find('[data-carousel-slide-next]').on('click', () => {
      this.flickityThumbnails.next();
      this._removeVariants();
    });

    this._containerHeight();

    this._zoomClick();

    this.flickityMainImage.on('lazyLoad', () => {
      this._containerHeight();
    });

    $(window).on('resize', debounce(() => {
      this._containerHeight();
    }, 300, false, false));
  }

  _containerHeight() {
    this.$container.css({
      'visibility': 'visible',
      'height': $('[data-product-main-image]').height() + $('[data-product-thumbnails]:visible').height() + 30 //gutter
    });
  }

  variantImage(url) {
    this._removeVariants(0);
    this.$zoomImages.children('[data-variant-slide]').remove();

    if (!url) {
      this.flickityThumbnails.select(0);
      return;
    }

    const length = this.flickityMainImage.slides.length;

    this.flickityMainImage
        .append($(`<img src="${url}"
                      class="product-main-image-slide"
                      data-product-main-image-slide
                      data-variant-slide />`));

    this.flickityThumbnails
        .append($(`<figure style="background-image: url(${url})"
          class="product-thumbnails-slide"
          data-variant-slide
          data-product-thumbnails-slide />`));

    this.$zoomImages
      .append($(`<div data-image="${url}" class="image-zoom" data-variant-slide />`));

    this.flickityThumbnails.select(length);

    this._imageZoom('.image-zoom[data-variant-slide]');
  }

  _zoomClick() {
    this.flickityMainImage.on('staticClick', (event, pointer, cellElement, cellIndex) => {
      if (!cellElement || window.outerWidth < this.mobileWidth) {
        return;
      }
      $('.image-zoom')[cellIndex].click();
    })
  }

  _imageZoom(selector) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) { return; }
    Intense(elements);
  }

  _removeVariants(timeout=false) {
    if (timeout) {
      setTimeout(() => {
        this.flickityMainImage.remove($('[data-variant-slide]'));
        this.flickityThumbnails.remove($('[data-variant-slide]'));
      }, 600);
    } else {
      this.flickityMainImage.remove($('[data-variant-slide]'));
      this.flickityThumbnails.remove($('[data-variant-slide]'));
    }
  }

  unload() {

  }
}
