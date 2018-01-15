import * as React from 'react';
import { Layout, Menu } from 'antd';

import AppLayout from './AppLayout';

export interface DashboardLayoutProps {
}

export default class DashboardLayout extends React.Component<DashboardLayoutProps, any> {
  render() {
    return (
      <AppLayout>
        <Layout>
          <Layout.Sider style={{ height: '100vh', position: 'fixed' }}>
            <Menu style={{ width: '200px', height: "100vh" }}
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
          </Layout.Sider>
          <Layout.Content style={{ marginLeft: '200px', minHeight: '100vh', backgroundColor: 'white', padding: '0 16px' }}>
            ABC
          </Layout.Content>
        </Layout>
      </AppLayout>
    );
  }
}
