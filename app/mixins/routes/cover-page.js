import Mixin from 'ember-metal/mixin';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import { bind, later, cancel, scheduleOnce } from 'ember-runloop';
import jQuery from 'jquery';

export default Mixin.create({
  activate() {
    this._super(...arguments);
    jQuery('body').addClass('cover-page');
    jQuery(document).on('scroll', bind(this, '_handleScroll'));
    scheduleOnce('afterRender', () => {
      jQuery('.primary-nav').addClass('transparent');
    });
  },

  deactivate() {
    this._super(...arguments);
    jQuery('body').removeClass('cover-page');
    jQuery(document).off('scroll', bind(this, '_handleScroll'));
  },

  _handleScroll() {
    if (jQuery(window).scrollTop() < 200) {
      jQuery('.primary-nav').removeClass('transparent');
      const timer = later(() => {
        if (jQuery(window).scrollTop() < 200) {
          jQuery('.primary-nav').addClass('transparent');
        }
      }, 1000);

      if (get(this, 'timer') !== undefined) {
        cancel(get(this, 'timer'));
      }
      set(this, 'timer', timer);
    }
  }
});
