import * as React from 'react';

import InitialProps from '../../models/InitialProps';

export interface TokenProps {
}

export default class Token extends React.Component<TokenProps, any> {
  static async getInitialProps(context: InitialProps) {
    const token = context.query.token;

    console.log(token);

    // Check token and if token is not valid depending on where this code is executed, redirect to /password
    return {};
  }

  render() {
    return (
      <div>
        
      </div>
    );
  }
}
