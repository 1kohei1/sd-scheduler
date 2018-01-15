import * as React from 'react';

import InitialProps from '../../models/InitialProps';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardQuery from '../../models/DashboardQuery';

export interface DashboardProps {
  query: DashboardQuery
}

export default class Dashboard extends React.Component<DashboardProps, any> {
  static async getInitialProps(context: InitialProps) {
    return {
      query: context.query
    };
  }

  render() {
    return (
      <DashboardLayout query={this.props.query} />
    );
  }
}

