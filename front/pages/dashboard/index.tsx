import * as React from 'react';
import { Menu, Icon } from 'antd';

import AppLayout from '../../components/AppLayout';
import InitialProps from '../../models/InitialProps';

export interface DashboardProps {
}

export default class Dashboard extends React.Component<DashboardProps, any> {
  static async getInitialProps(context: InitialProps) {
    return {};
  }

  render() {
    return (
      <AppLayout>
        <Menu style={{ width: '256px', height: "100vh" }}
          defaultSelectedKeys={["spring_2018"]}
        >
          <Menu.Item key="spring_2018">
            2018 Spring
          </Menu.Item>
          <Menu.Item key="fall_2017">
            2017 Fall
          </Menu.Item>
          <Menu.Item key="summer_2017">
            2017 Summer
          </Menu.Item>
          <Menu.Item key="spring_2017">
            2017 Spring
          </Menu.Item>
        </Menu>
      </AppLayout>
    );
  }
}
