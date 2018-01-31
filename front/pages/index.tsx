import * as React from 'react';
import { Row, Col } from 'antd';
const fetch = require('isomorphic-unfetch');

import AppLayout from '../components/AppLayout';
import SchedulingCalendar from '../components/SchedulingCalendar/SchedulingCalendar';

interface Props {
}

class Index extends React.Component<Props, {}> {
  static async getInitialProps() {
    return {};
  }

  render() {
    return (
      <AppLayout>
        <Row>
          <Col
            xs={{
              span: 22,
              offset: 1,
            }}
            lg={{
              span: 18,
              offset: 3
            }}
          >
            <SchedulingCalendar

            />
          </Col>
        </Row>
      </AppLayout>
    )
  }
}
export default Index
