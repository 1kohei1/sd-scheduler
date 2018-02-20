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

const onClick = (obj: any) => {
  if (obj.key === '2') {
    UserUtil.logout();
  }
}

const menu = (
  <Menu onClick={onClick}>
    <Menu.Item key={0}>
      <Link
        href={`/dashboard?semester=${SemesterUtil.defaultSemester()}&menu=${Menus[1].key}`}
        as={`/dashboard/${SemesterUtil.defaultSemester()}/${Menus[1].key}`}
      >
        <a>{Menus[1].displayName}</a>
      </Link>
    </Menu.Item>
    <Menu.Item key={1}>
      <Link href="/account">
        <a>Account</a>
      </Link>
    </Menu.Item>
    <Menu.Item key={2}>
      Logout
    </Menu.Item>
  </Menu>
)

export interface AppLayoutProps {
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
        <Dropdown overlay={menu}>
          <Button ghost>
            Dr. {this.state.user.firstName} {this.state.user.lastName} <Icon type="down" />
          </Button>
        </Dropdown>
      )
    } else {
      return (
        <Link href="/login">
          <Button ghost>Login</Button>
        </Link>
      )
    }
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
              <div>
                <Link href="/"><a style={{ color: 'white' }}>SD Scheduler</a></Link>
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
      `}
        </style>
      </div>
    )
  }
}