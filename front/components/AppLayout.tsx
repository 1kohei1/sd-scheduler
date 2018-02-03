import Head from 'next/head'
import Link from 'next/link'
import * as NProgress from 'nprogress'
import Router from 'next/router'
import { Layout, Button, Dropdown, Menu, Icon } from 'antd';

import Api from '../utils/Api';

// Loading animation
Router.onRouteChangeStart = (url) => NProgress.start();
Router.onRouteChangeComplete = () => NProgress.done();
Router.onRouteChangeError = () => NProgress.done();

const onClick = (obj: any) => {
  if (obj.key === '2') {
    Api.logout();
  }
}

const menu = (
  <Menu onClick={onClick}>
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

const AppLayout = (props: any) => (
  <div style={{ minHeight: '100%' }}>
    <Head>
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <meta charSet='utf-8' />
      {/* Import CSS for nprogress */}
      <link rel='stylesheet' type='text/css' href='/static/nprogress.css' />
      {/* Antd css */}
      <link rel='stylesheet' href='/static/antd.min.css' />
    </Head>
    <Layout>
      <Layout.Header style={{ padding: "0 16px" }}>
        <div className="ko-header">
          <div>
            <Link href="/"><a style={{ color: 'white' }}>LOGO</a></Link>
          </div>
          <div>
            {/* <Link href="/login">
              <Button ghost>Login</Button>
            </Link> */}
            <Dropdown overlay={menu}>
              <Button ghost>
                Prof name <Icon type="down" />
              </Button>
            </Dropdown>
          </div>
        </div>
      </Layout.Header>
    </Layout>
    {props.children}
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

export default AppLayout;