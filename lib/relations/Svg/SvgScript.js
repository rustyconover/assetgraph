const SvgRelation = require('./SvgRelation');

class SvgScript extends SvgRelation {
  static getRelationsFromNode(node) {
    if (node.nodeType === node.ELEMENT_NODE && node.matches('script')) {
      const type = node.getAttribute('type');
      if (!type || type === 'text/javascript') {
        let href;
        let isXlink = false;
        if (node.getAttributeNS('http://www.w3.org/1999/xlink', 'href')) {
          href = node.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
          isXlink = true;
        } else if (node.hasAttribute('href')) {
          href = node.getAttribute('href');
          isXlink = false;
        }
        if (typeof href === 'string') {
          return {
            type: 'SvgScript',
            isXlink,
            href,
            node,
          };
        } else {
          return {
            type: 'SvgScript',
            to: {
              type: 'JavaScript',
              text: node.firstChild ? node.firstChild.nodeValue : '',
            },
            node,
          };
        }
      }
    }
  }

  static handler(node) {
    const type = node.getAttribute('type');
    if (!type || type === 'text/javascript') {
      let href;
      let isXlink = false;
      if (node.getAttributeNS('http://www.w3.org/1999/xlink', 'href')) {
        href = node.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
        isXlink = true;
      } else if (node.hasAttribute('href')) {
        href = node.getAttribute('href');
        isXlink = false;
      }
      if (typeof href === 'string') {
        return {
          type: 'SvgScript',
          isXlink,
          href,
          node,
        };
      } else {
        return {
          type: 'SvgScript',
          to: {
            type: 'JavaScript',
            text: node.firstChild ? node.firstChild.nodeValue : '',
          },
          node,
        };
      }
    }
  }

  get href() {
    if (this.isXlink) {
      return (
        this.node.getAttributeNS('http://www.w3.org/1999/xlink', 'href') ||
        undefined
      );
    } else {
      return this.node.getAttribute('href') || undefined;
    }
  }

  set href(href) {
    if (this.isXlink) {
      this.node.setAttributeNS(
        'http://www.w3.org/1999/xlink',
        'xlink:href',
        href
      );
    } else {
      this.node.setAttribute('href', href);
    }
    // Clear any inline script
    while (this.node.firstChild) {
      this.node.removeChild(this.node.firstChild);
    }
  }

  inline() {
    super.inline();
    // Doesn't need xlink: prefix here for some reason:
    if (this.node.hasAttributeNS('http://www.w3.org/1999/xlink', 'href')) {
      this.node.removeAttributeNS('http://www.w3.org/1999/xlink', 'href');
    }
    while (this.node.firstChild) {
      this.node.removeChild(this.node.firstChild);
    }
    this.node.appendChild(
      this.from.parseTree.createTextNode(
        this.to.text.replace(/<\/(?=(\s*)script[/ >])/gi, '<\\/')
      )
    ); // Safety hack for UglifyJS: https://github.com/mishoo/UglifyJS/issues/164
    this.from.markDirty();
    return this;
  }

  attach(position, adjacentRelation) {
    // FIXME: The SvgScript test fails if "this.node || " is removed from the below.
    // Work out the exact semantics of reattaching -- should it implicitly detach?
    // Adding "if (this.node) this.detach();" here also fixes it, but that should be a general thing
    this.node = this.node || this.from.parseTree.createElement('script');
    return super.attach(position, adjacentRelation);
  }
}

SvgScript.prototype.targetType = 'JavaScript';

module.exports = SvgScript;
