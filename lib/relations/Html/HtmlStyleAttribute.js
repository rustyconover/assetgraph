const HtmlRelation = require('../HtmlRelation');

class HtmlStyleAttribute extends HtmlRelation {
  static getRelationsFromNode(node) {
    if (node.nodeType === node.ELEMENT_NODE && node.matches('[style]')) {
      return {
        type: 'HtmlStyleAttribute',
        to: {
          type: 'Css',
          isExternalizable: false,
          text: `bogusselector {${node.getAttribute('style')}}`,
        },
        node,
      };
    }
  }

  get href() {
    return this.node.getAttribute('style');
  }

  set href(href) {
    return this.node.setAttribute('style', href);
  }

  inlineHtmlRelation() {
    this.href = this.to.text.replace(/^bogusselector\s*\{\s*|\s*}\s*$/g, '');
    this.from.markDirty();
  }

  attach() {
    throw new Error('HtmlStyleAttribute.attach: Not supported.');
  }

  detach() {
    this.node.removeAttribute('style');
    this.node = undefined;
    return super.detach();
  }
}

Object.assign(HtmlStyleAttribute.prototype, {
  targetType: 'Css',
  _hrefType: 'inline',
});

module.exports = HtmlStyleAttribute;
