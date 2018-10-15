import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ClearJson from '../index';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      json: {
        string: '张春秋',
        number: 90,
        array: [
          { id: 24, name: '管理员' },
          { id: 45, name: '办事员' }
        ],
        object: {
          key0: 'value0'
        },
        null: null,
        boolean: false
      }
    }
  }

  render() {
    return (
      <div style={{ display: 'flex' }}>
        <textarea
          value={this.state.json}
          onChange={e => this.setState({json: e.target.value})}
          style={{flex: 1, height: '400px'}}
        ></textarea>
        <ClearJson
          json={this.state.json}
          style={{flex: 1}}
          operations={[
            <span onClick={(e, node) => {
              e && e.stopPropagation();
              console.log(node);
            }}>复制啊</span>,
            'copy'
          ]}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
