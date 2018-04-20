import * as React from 'react';
import Link from 'next/link';
import { Divider } from 'antd';

import AppLayout from '../components/AppLayout';
import Top from '../components/LP/top';
import Instruction from '../components/LP/instruction';
import Reminder from '../components/LP/reminder';
import Device from '../components/LP/device';
import Footer from '../components/LP/footer';

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
        <Reminder />
        <Device />
        <Footer />
      </AppLayout>
    )
  }
}
