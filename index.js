import React, { Component } from 'react';
import JSON5 from 'json5';
import Clipboard from 'react-clipboard.js';

const ClearJsonContext = React.createContext({});

class ClearJson extends Component {
  static defaultProps = {
    theme: '',
    indent: 2,
    fold: true,
    hover: true,
    focus: true,
    copy: true,
    className: '',
    style: {},
  }
  constructor(props) {
    super(props);
    this.state = {
      active: 0
    };
  }

  static getDerivedStateFromProps(props, state) {
    return { ...props, ...state };
  }

  get jcontext() {
    const { active } = this.state;
    const { indent, hover, focus, fold, copy, operations } = this.props;
    return {
      active,
      indent,
      hover,
      focus,
      fold,
      copy,
      operations,
      setActiveNode: this.setActiveNode,
    };
  }

  setActiveNode = (newActive) => {
    let { active } = this.state;
    this.setState({
      active: active === newActive ? 0 : newActive
    });
  }

  render() {
    let { json, theme, className, style } = this.props;

    if ('string' === typeof json) {
      try {
        json = JSON5.parse(json);
      } catch (e) {
      }
    }
    if ('string' !== typeof json) {
      json = (
        <ClearJsonContext.Provider value={this.jcontext}>
          <Node json={json} />
        </ClearJsonContext.Provider>
      );
    }

    const themeClass = theme ? `clear-json-theme-${theme}` : '';
    return (
      <div className={`clear-json-container ${themeClass} ${className}`} style={style}>
        {json}
      </div>
    )
  }
}


let uuid = 1;
const bracket = {
  array: ['[', ']'],
  object: ['{', '}'],
};
class Node extends Component {
  constructor(props, context) {
    super(props);
    this.state = {
      hoverNode: false
    };
    this.id = uuid++;
    this.ctx = {};
  }

  onMouseOver = (e) => {
    e && e.stopPropagation();
    if (!this.ctx.hover) {
      return;
    }
    this.setState({
      hoverNode: true
    })
  }
  onMouseOut = (e) => {
    e && e.stopPropagation();
    if (!this.ctx.hover) {
      return;
    }
    this.setState({
      hoverNode: false
    });
  }
  onClickNode = (e) => {
    e && e.stopPropagation();
    if (!this.ctx.focus) {
      return;
    }
    this.ctx.setActiveNode(this.id);
  }
  clickFold = () => {
    const { foldClosed } = this.state;
    this.setState({
      foldClosed: !foldClosed
    });
  }
  getFold(length) {
    const { foldClosed } = this.state;
    if (!this.ctx.fold || !length) {
      return null;
    }
    return (
      <span
        onClick={this.clickFold}
        className={`node-fold ${foldClosed ? 'closed-fold' : ''}`}
      />
    );
  }
  getStartBracket(dataType) {
    return <span>{this.getNodeKey()}{this.getBracket(dataType, 0)}</span>
  }
  getEndBracket(dataType) {
    const { next = false } = this.props;
    return <span>{this.getBracket(dataType, 1)}{next ? ',' : ''}</span>
  }
  getBracket(dataType, i) {
    return <span className="node-bracket">{bracket[dataType][i]}</span>
  }
  getNodeCount(length) {
    const { foldClosed } = this.state;
    return length && foldClosed ? <span className="node-count">// {length} item{length > 1 ? 's' : ''}</span> : null;
  }
  nodeOperation() {
    let { operations: nodeOperations, active: activeNode } = this.ctx;
    const active = activeNode === this.id;
    if (!active) {
      return null;
    }
    if (nodeOperations) {
      nodeOperations = nodeOperations.map((op, i) => {
        if ('string' === typeof op) {
          op = this.getDefaultOp(op);
        } else {
          const originClick = op.props.onClick;
          op = React.cloneElement(op, {
            key: i,
            onClick: (e) => {
              originClick(e, this);
            }
          })
        }
        return op;
      });
    } else {
      const { copy } = this.ctx;
      if (!copy) {
        return null;
      }
      nodeOperations = this.getDefaultOp('copy');
    }

    return (
      <div className="node-operations">
        {nodeOperations}
      </div>
    );
  }
  getDefaultOp(type) {
    let { json, keys = '' } = this.props;
    if (keys) {
      json = { [keys]: json };
    }
    const { indent } = this.ctx;
    if ('copy' === type) {
      return (
        <Clipboard
          component="span"
          key="copy"
          data-clipboard-text={JSON.stringify(json, null, indent)}
          onClick={e => e.stopPropagation()}
        >
          <span className="node-operation">复制</span>
        </Clipboard>
      )
    }
    return null;
  }
  getNodeKey() {
    const { keys = '' } = this.props;
    return keys ? <span className="node-key">"{keys}":&nbsp;</span> : null;
  }
  getNodeValue() {
    let { json: value, next } = this.props;
    const valueType = typeof value;

    if ('boolean' === valueType) {
      value = value.toString();
    } else if (undefined === value) {
      value = typeof undefined;
    } else if (null === value) {
      value = "null";
    } else if (value instanceof Date) {
      if (value.toString() === 'Invalid Date') {
        value = value.toString();
      } else {
        value = value.toISOString();
      }
    } else if (value instanceof RegExp) {
      value = value.toString();
    } else if ('number' !== valueType) {
      value = `"${value}"`
    } else if (isNaN(value)) {
      value = 'NaN';
    }


    return (
      <React.Fragment>
        <span className="node-value">{value}</span>{next ? ',' : ''}
      </React.Fragment>
    )
  }
  getContent() {
    const { json } = this.props;
    const { foldClosed } = this.state;

    let content = '';
    let dataType = '';
    let data = json;
    if (Array.isArray(json)) {
      dataType = 'array';
    } else if (json && 'object' === typeof json && !(json instanceof Date) && !(json instanceof RegExp)) {
      dataType = 'object';
      data = Object.entries(json);
    }
    if (dataType) {
      const length = data.length;
      content = (
        <React.Fragment>
          {this.getFold(length)}
          {this.getStartBracket(dataType)}
          {!length ? null : (
            foldClosed ? <span className="ellipsis-content">...</span> :
            <div className="clear-json-content">
              {data.map((node, i) => {
                let key = i, keys, value = node;
                if ('object' === dataType) {
                  [keys, value] = node;
                  key = keys;
                }
                return <Node key={key} keys={keys} json={value} next={i !== length - 1} />;
              })}
            </div>
          )}
          {this.getEndBracket(dataType)}
          {this.getNodeCount(length)}
          {this.nodeOperation()}
        </React.Fragment>
      );
    } else {
      content = (
        <React.Fragment>
          {this.getNodeKey()}
          {this.getNodeValue()}
        </React.Fragment>
      );
    }
    return content;
  }

  render() {
    const { hoverNode } = this.state;

    return (
      <ClearJsonContext.Consumer>
        {context => {
          this.ctx = context;
          return (
            <div
              onMouseOver={this.onMouseOver}
              onMouseOut={this.onMouseOut}
              onClick={this.onClickNode}
              className={`${hoverNode ? 'hover-node' : ''} clear-json-node ${context.active === this.id ? 'active-node' : ''}`}
            >
              {this.getContent()}
              {this.nodeOperation()}
            </div>
          )
        }}
      </ClearJsonContext.Consumer>
    )
  }

}

export default ClearJson;
