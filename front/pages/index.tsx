import * as React from 'react';
import Link from 'next/link';
import { Button } from 'antd';

import InitialProps from '../models/InitialProps';
import AppLayout from '../components/AppLayout';

interface Props {
}

interface IndexState {
}

export default class Index extends React.Component<Props, IndexState> {
  static async getInitialProps(props: InitialProps) {
    return {};
  }

  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <AppLayout>
        <div style={{ textAlign: 'center' }}>
          <div>Nice landing page</div>
          <div>
            <Link href="/schedule">
              <Button type="primary" size="large" href="/schedule">
                Go to scheduling
            </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }
}
