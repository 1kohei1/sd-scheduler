import * as React from 'react';
import { Menu, Icon } from 'antd';

import MyLayout from '../../components/MyLayout';
import InitialProps from '../../models/InitialProps';

export interface DashboardProps {
}

export default class Dashboard extends React.Component<DashboardProps, any> {
  static async getInitialProps(context: InitialProps) {
    return {};
  }

  render() {
    return (
      <MyLayout>
        <Menu style={{ width: '256px' }} defaultSelectedKeys={[""]}>
          <Menu.Item key="presentation">
            <Icon type="pie-chart" />
            <span>Spring, 2018</span>
          </Menu.Item>
          <Menu.Item key="faculties">
            <Icon type="pie-chart" />
            <span>Faculties</span>
          </Menu.Item>
          <Menu.Item key="schedule">
            <Icon type="pie-chart" />
            <span>Schedule</span>
          </Menu.Item>
        </Menu>
      </MyLayout>
    );
  }
}
