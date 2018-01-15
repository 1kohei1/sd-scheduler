import * as React from 'react';
import { Layout, Menu } from 'antd';

import AppLayout from './AppLayout';
import Overview from './Overview';
import InitialProps from '../models/InitialProps';
import DashboardQuery from '../models/DashboardQuery';

export interface DashboardLayoutProps {
  query: DashboardQuery;
}

export default class DashboardLayout extends React.Component<DashboardLayoutProps, any> {
  constructor(props: DashboardLayoutProps) {
    super(props);
    console.log("DashboardLayout constructor props", props);
  }

  componentWillReceiveProps(nextProps: DashboardLayoutProps) {
    console.log("DashboardLayout componentWillReceiveProps props", nextProps);
  }

  render() {
    return (
      <AppLayout>
        <Layout style={{ backgroundColor: 'white' }}>
          <Layout.Sider style={{ position: 'fixed' }}>
            <Menu style={{ width: '200px', height: "calc(100vh - 64px)" }}
              defaultOpenKeys={["2017_spring"]}
              defaultSelectedKeys={["2017_spring_overview"]}
              mode="inline"
            >
              <Menu.SubMenu key="2018_spring" title="2018 Spring">
                <Menu.Item key="2018_spring_overview">
                  Overview
                </Menu.Item>
                <Menu.Item key="2018_spring_availability">
                  My Availablity
                </Menu.Item>
                <Menu.Item key="2018_spring_schedule">
                  My Schedule
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.SubMenu key="2017_fall" title="2017 Fall">
                <Menu.Item key="2017_fall_overview">
                  Overview
                </Menu.Item>
                <Menu.Item key="2017_fall_availability">
                  My Availablity
                </Menu.Item>
                <Menu.Item key="2017_fall_schedule">
                  My Schedule
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.SubMenu key="2017_summer" title="2017 Summer">
                <Menu.Item key="2017_summer_overview">
                  Overview
                </Menu.Item>
                <Menu.Item key="2017_summer_availability">
                  My Availablity
                </Menu.Item>
                <Menu.Item key="2017_summer_schedule">
                  My Schedule
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.SubMenu key="2017_spring" title="2017 Spring">
                <Menu.Item key="2017_spring_overview">
                  Overview
                </Menu.Item>
                <Menu.Item key="2017_spring_availability">
                  My Availablity
                </Menu.Item>
                <Menu.Item key="2017_spring_schedule">
                  My Schedule
                </Menu.Item>
              </Menu.SubMenu>
            </Menu>
          </Layout.Sider>
          <Layout.Content style={{ marginLeft: '200px', padding: '0 16px' }}>
            <Overview year={2018} semester="spring" />
          </Layout.Content>
        </Layout>
      </AppLayout>
    );
  }
}
