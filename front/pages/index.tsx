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
  static async getInitialProps(context: InitialProps) {
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
              <a>
                <Button type="primary" size="large">
                  Go to scheduling
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </AppLayout>
    )
  }
}
