import Head from 'next/head'
import Link from 'next/link'
import * as NProgress from 'nprogress'
import Router from 'next/router'

import { Layout, Menu } from 'antd';
const { Header, Content, Footer } = Layout;

// Loading animation
Router.onRouteChangeStart = (url) => NProgress.start()
Router.onRouteChangeComplete = () => NProgress.done()
Router.onRouteChangeError = () => NProgress.done()

const MyLayout = (props: any) => (
  <Layout>
    <Head>
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <meta charSet='utf-8' />
      {/* Import CSS for nprogress */}
      <link rel='stylesheet' type='text/css' href='/static/nprogress.css' />
      {/* Antd css */}
      <link rel='stylesheet' href='/static/antd.min.css' />
    </Head>
    <Header>
      <Menu
        theme="dark"
        mode="horizontal"
        style={{ lineHeight: '64px' }}
      >
        <Menu.Item>
          <Link href="/">
            <a>Home 2</a>
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link href="/about">
            <a>About</a>
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link href="/users">
            <a>Users</a>
          </Link>
        </Menu.Item>
      </Menu>
    </Header>
    <Content style={{ padding: '0 50px'}}>
      {props.children}
    </Content>
    <Footer>
      
    </Footer>
  </Layout>
)

export default MyLayout;