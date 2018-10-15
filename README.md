# clear-json
show json with a pretty format 

## Install
`$ npm install clear-json --save`

## Usage
```javascript
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ClearJson from 'clear-json';


const json = JSON.stringify({ 
  string: '张春秋',
  number: 90,
  array: [
    { id: 24, name: '管理员' },
    { id: 45, name: '办事员' }
  ],
  object: {
    key0: 'value0'
  },
  null: null
  boolean: false
});

ReactDOM.render(<ClearJson json={json} />, document.getElementById('root'));
```

## Theme
```javascript
ReactDOM.render(<ClearJson json={json} theme="dark" />, document.getElementById('root'));
```

customize style
```less
.clear-json-theme-dark {
  background-color: #1e1e1e;
  color: #ddd;
  .node-key {
    color: #9cdcfe;
  }
  .node-value {
    color: #ce9178;
  }
  .node-bracket {
    color: orchid;
  }
}
```

## operations
```javascript
ReactDOM.render(<ClearJson json={json} operations={[
  <span onClick={(e, node) => {
    e && e.stopPropagation();
    console.log(node);
  }}>自定义</span>,
  'copy'
]} theme="dark" />, document.getElementById('root'));
```


