import Mixin from 'ember-metal/mixin';
import get from 'ember-metal/get';
import computed from 'ember-computed';
import service from 'ember-service/inject';
import { task } from 'ember-concurrency';
import { invokeAction } from 'ember-invoke-action';

/**
 * Pagination based on JSON-API's top level links object.
 *
 * When this component enters the viewport it requests the next set of data
 * based on the `next` link within the `links` object. Those new records are
 * then sent up to be handled.
 */
export default Mixin.create({
  store: service(),

  /**
   * Grabs the latest `next` URL from the `links` object
   */
  nextLink: computed('model', {
    get() {
      const model = get(this, 'model');
      const links = get(model, 'links') || {};
      return get(links, 'next') || undefined;
    }
  }),

  /**
   * Droppable task that queries the next set of data and sends an action
   * up to the owner.
   */
  getNextData: task(function* () {
    const nextLink = get(this, 'nextLink');
    if (nextLink === undefined) {
      return;
    }
    let model = get(this, 'model');
    model = get(model, 'firstObject') || model;
    const { modelName } = model.constructor;
    const options = this._parseLink(nextLink);
    const records = yield get(this, 'store').query(modelName, options);
    const links = get(records, 'links');
    invokeAction(this, 'update', records, links);
  }).drop(),

  /**
   * Decodes and rebuilds the query params object from the URL passed.
   */
  _parseLink(link) {
    let url = window.decodeURI(link);
    url = url.split('?');
    if (url.length !== 2) {
      return {};
    }
    url = url[1].split('&');
    const filter = {};
    url.forEach((param) => {
      const option = param.split('=');
      if (option[0].includes('[') === true) {
        const match = option[0].match(/(.+)\[(.+)\]/);
        filter[match[1]] = filter[match[1]] || {};
        filter[match[1]][match[2]] = decodeURIComponent(option[1]);
      } else {
        filter[option[0]] = decodeURIComponent(option[1]);
      }
    });
    return filter;
  }
});
