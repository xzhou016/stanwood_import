import Carousel from './components/Carousel';
import 'flickity';

export default class Home {
  constructor(context) {
    this.context = context;

    this.Carousel = new Carousel(this.context);
  }

  unload() {
    //remove all event handlers
  }
}
