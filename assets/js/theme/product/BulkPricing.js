import Modal from 'bc-modal';

export default class BulkPricing {
  constructor() {
    this.bulkPricingModal = new Modal({
      el: $('#bulk-pricing-modal'),
      modalClass: 'modal-bulk-pricing'
    });

    $('[data-bulk-pricing-button]').click((event) => {
      event.preventDefault();
      this.bulkPricingModal.open();
    });
  }
}