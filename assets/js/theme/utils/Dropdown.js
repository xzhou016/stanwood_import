
export default class Dropdown {
  constructor() {
    this.dropdown = '[data-dropdown]';
    this.toggle = '[data-dropdown-toggle]';
    this.panel = '[data-dropdown-panel]';

    this._bindEvents();
  }

  _bindEvents() {
    $(document).on('click', this.toggle, (event) => {
      this._toggleDropdown(event);
    });
  }

  _toggleDropdown(event) {
    event.preventDefault();

    $(event.currentTarget)
      .closest(this.dropdown)
      .find(this.panel)
      .revealer('toggle');

    $(this.toggle)
      .filter($(this.toggle).not($(event.currentTarget)))
      .closest(this.dropdown)
      .find(this.panel)
      .revealer('hide');
  }
}