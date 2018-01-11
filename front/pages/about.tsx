import * as React from 'react';
import { Button } from 'antd';
const fetch = require('isomorphic-unfetch');

import MyLayout from '../components/MyLayout';

export default class App extends React.PureComponent<{}, {message: string}> {
  static async getInitialProps() {
    return {}
  }

  constructor(props: {}) {
    super(props);
    this.state = {
      message: ''
    };

    this.onClick = this.onClick.bind(this);
  }

  async onClick(): Promise<void> {
    const res = await fetch('/api/sample');
    const data = await res.json();

    this.setState({
      message: data.message
    });
  }

  render() {
    return (
      <MyLayout>
        <h1>About page</h1>
        <Button type="primary" onClick={this.onClick}>Get /sample</Button>
        <div>Message: {this.state.message}</div>
      </MyLayout>
    );
  }
}

