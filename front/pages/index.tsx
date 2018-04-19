import * as React from 'react';
import Link from 'next/link';

import AppLayout from '../components/AppLayout';
import Top from '../components/LP/top';
import Instruction from '../components/LP/instruction';

interface Props {
}

interface IndexState {
}

export default class Index extends React.Component<Props, IndexState> {
  static async getInitialProps() {
    return {};
  }

  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <AppLayout>
        <Top />
        <Instruction />
      </AppLayout>
    )
  }
}
