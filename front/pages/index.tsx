import * as React from 'react';
const fetch = require('isomorphic-unfetch');

import AppLayout from '../components/AppLayout';

interface Props {
}

class Index extends React.Component<Props, {}> {
  static async getInitialProps() {
    return {};
  }

  render() {
    return (
      <AppLayout>
        Show student calendar view
      </AppLayout>
    )
  }
}
export default Index
