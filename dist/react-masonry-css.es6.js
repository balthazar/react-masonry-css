var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import React from 'react';

const defaultProps = {
  breakpointCols: undefined, // optional, number or object { default: number, [key: number]: number }
  className: undefined, // required, string
  columnClassName: undefined, // required, string

  // Any React children. Typically an array of JSX items
  children: undefined,

  // Custom attributes, however it is advised against
  // using these to prevent unintended issues and future conflicts
  // ...any other attribute, will be added to the container
  columnAttrs: undefined, // object, added to the columns

  fallBackWidth: 2000
};

const DEFAULT_COLUMNS = 2;

class Masonry extends React.Component {
  constructor(props) {
    super(props);

    // Correct scope for when methods are accessed externally
    this.reCalculateColumnCount = this.reCalculateColumnCount.bind(this);
    this.reCalculateColumnCountDebounce = this.reCalculateColumnCountDebounce.bind(this);

    // default state
    let columnCount;
    if (this.props.breakpointCols && this.props.breakpointCols.default) {
      columnCount = this.props.breakpointCols.default;
    } else {
      columnCount = parseInt(this.props.breakpointCols) || DEFAULT_COLUMNS;
    }

    this.state = {
      columnCount
    };
  }

  componentWillMount() {
    if (typeof window === 'undefined') {
      // recalculate with fallback on server
      this.reCalculateColumnCount();
    }
  }

  componentDidMount() {
    this.reCalculateColumnCount();

    // window may not be available in some environments
    if (window) {
      window.addEventListener('resize', this.reCalculateColumnCountDebounce);
    }
  }

  componentDidUpdate() {
    this.reCalculateColumnCount();
  }

  componentWillUnmount() {
    if (window) {
      window.removeEventListener('resize', this.reCalculateColumnCountDebounce);
    }
  }

  reCalculateColumnCountDebounce() {
    if (!window || !window.requestAnimationFrame) {
      // IE10+
      this.reCalculateColumnCount();
      return;
    }

    if (window.cancelAnimationFrame) {
      // IE10+
      window.cancelAnimationFrame(this._lastRecalculateAnimationFrame);
    }

    this._lastRecalculateAnimationFrame = window.requestAnimationFrame(() => {
      this.reCalculateColumnCount();
    });
  }

  reCalculateColumnCount() {
    const windowWidth = typeof window !== 'undefined' && window.innerWidth || this.props.fallBackWidth;
    let breakpointColsObject = this.props.breakpointCols;

    // Allow passing a single number to `breakpointCols` instead of an object
    if (typeof breakpointColsObject !== 'object') {
      breakpointColsObject = {
        default: parseInt(breakpointColsObject) || DEFAULT_COLUMNS
      };
    }

    let matchedBreakpoint = Infinity;
    let columns = breakpointColsObject.default || DEFAULT_COLUMNS;

    for (let breakpoint in breakpointColsObject) {
      const optBreakpoint = parseInt(breakpoint);
      const isCurrentBreakpoint = optBreakpoint > 0 && windowWidth <= optBreakpoint;

      if (isCurrentBreakpoint && optBreakpoint < matchedBreakpoint) {
        matchedBreakpoint = optBreakpoint;
        columns = breakpointColsObject[breakpoint];
      }
    }

    columns = Math.max(1, parseInt(columns) || 1);

    if (this.state.columnCount !== columns) {
      this.setState({
        columnCount: columns
      });
    }
  }

  itemsInColumns() {
    const currentColumnCount = this.state.columnCount;
    const itemsInColumns = new Array(currentColumnCount);

    // Force children to be handled as an array
    const items = [].concat(this.props.children || []);

    for (let i = 0; i < items.length; i++) {
      const columnIndex = i % currentColumnCount;

      if (!itemsInColumns[columnIndex]) {
        itemsInColumns[columnIndex] = [];
      }

      itemsInColumns[columnIndex].push(items[i]);
    }

    return itemsInColumns;
  }

  renderColumns() {
    const { columnAttrs = {}, columnClassName } = this.props;
    const childrenInColumns = this.itemsInColumns();
    const columnWidth = `${100 / childrenInColumns.length}%`;

    const columnAttributes = _extends({}, columnAttrs, {
      style: _extends({}, columnAttrs.style, {
        width: columnWidth
      }),
      className: columnClassName
    });

    return childrenInColumns.map((items, i) => {
      return React.createElement(
        'div',
        _extends({}, columnAttributes, { key: i }),
        items.map((item, itemIndex) => _extends({}, item, {
          props: _extends({}, item.props, { ['data-index']: itemIndex })
        }))
      );
    });
  }

  render() {
    const _props = this.props,
          {
      // ignored
      children,
      breakpointCols,
      columnClassName,
      columnAttrs,

      // used
      className

    } = _props,
          rest = _objectWithoutProperties(_props, ['children', 'breakpointCols', 'columnClassName', 'columnAttrs', 'className']);

    return React.createElement(
      'div',
      _extends({}, rest, { className: className }),
      this.renderColumns()
    );
  }
}

Masonry.defaultProps = defaultProps;

export default Masonry;
