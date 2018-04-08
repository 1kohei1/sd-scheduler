import * as React from 'react';
import Head from 'next/head'
import Link from 'next/link'
import * as NProgress from 'nprogress'
import Router from 'next/router'
import { Layout, Button, Dropdown, Menu, Icon } from 'antd';

import UserUtil from '../utils/UserUtil';
import Faculty from '../models/Faculty';
import { Menus } from '../models/Semester';
import SemesterUtil from '../utils/SemesterUtil';

// Loading animation
Router.onRouteChangeStart = (url) => NProgress.start();
Router.onRouteChangeComplete = () => NProgress.done();
Router.onRouteChangeError = () => NProgress.done();

export interface AppLayoutProps {
  selectedMenu?: string[];
}

interface AppLayoutState {
  user: Faculty | undefined;
}

export default class AppLayout extends React.Component<AppLayoutProps, AppLayoutState> {
  userUpdateKey = `AppLayout_${new Date().toISOString()}`;

  constructor(props: AppLayoutProps) {
    super(props);

    this.state = {
      user: undefined,
    }

    UserUtil.registerOnUserUpdates(this.userUpdateKey, this.setUser.bind(this));

    this.rightAction = this.rightAction.bind(this);
    this.menu = this.menu.bind(this);
  }

  private setUser(user: Faculty | undefined) {
    this.setState({
      user,
    });
  }

  componentDidMount() {
    // To reflect change to the database, call updateUser
    UserUtil.updateUser();
  }

  componentWillUnmount() {
    UserUtil.removeOnUserUpdates(this.userUpdateKey);
  }

  rightAction() {
    if (this.state.user) {
      return (
        <Dropdown overlay={this.menu()}>
          <Button ghost>
            Dr. {this.state.user.firstName} {this.state.user.lastName} <Icon type="down" />
          </Button>
        </Dropdown>
      )
    } else {
      return (
        <Link href="/login">
          <a><Button ghost>Login</Button></a>
        </Link>
      )
    }
  }

  onClick = (obj: any) => {
    if (obj.key === 'logout') {
      UserUtil.logout();
    }
  }

  menu() {
    return (
      <Menu onClick={this.onClick}>
        <Menu.Item key="dashboard">
          <Link
            href={`/dashboard`}
          >
            <a>Dashboard</a>
          </Link>
        </Menu.Item>
        <Menu.Item key="account">
          <Link href="/account">
            <a>Account</a>
          </Link>
        </Menu.Item>
        {this.state.user && this.state.user.isSystemAdmin && (
          <Menu.Item key="admin">
            <Link href="/admin">
              <a>Admin</a>
            </Link>
          </Menu.Item>
        )}
        <Menu.Item key="logout">
          Logout
        </Menu.Item>
      </Menu>
    )
  }

  render() {
    return (
      <div style={{ minHeight: '100%' }}>
        <Head>
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <meta charSet='utf-8' />
          {/* Import CSS for nprogress */}
          <link rel='stylesheet' type='text/css' href='/static/nprogress.css' />
          {/* Antd css */}
          <link rel='stylesheet' href='/static/antd.min.css' />
          <title>SD Scheduler</title>
        </Head>
        <Layout>
          <Layout.Header style={{ padding: "0 16px" }}>
            <div className="ko-header">
              <div className="left">
                <Link href="/">
                  <a style={{ color: 'white' }}>SD Scheduler</a>
                </Link>
                {this.state.user && this.state.user.isAdmin && (
                  <Menu
                    mode="horizontal"
                    theme="dark"
                    style={{ lineHeight: '64px', marginLeft: '32px' }}
                    defaultSelectedKeys={this.props.selectedMenu}
                  >
                    <Menu.Item key="dashboard">
                      <Link href="/dashboard">
                        <a>Dashboard</a>
                      </Link>
                    </Menu.Item>
                    <Menu.Item key="faculties">
                      <Link href="/faculties">
                        <a>Faculties</a>
                      </Link>
                    </Menu.Item>
                    <Menu.Item key="emails">
                      <Link href="/emails">
                        <a>Emails</a>
                      </Link>
                    </Menu.Item>
                  </Menu>
                )}
              </div>
              <div>
                {this.rightAction()}
              </div>
            </div>
          </Layout.Header>
        </Layout>
        {this.props.children}
        <style jsx>{`
        .ko-header {
          display: flex;
          justify-content: space-between;
          flex-direction: row;
        }
        .ko-header .left {
          display: flex;
        }
      `}
        </style>
      </div>
    )
  }
}