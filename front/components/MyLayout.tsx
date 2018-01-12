import Head from 'next/head'
import Link from 'next/link'
import * as NProgress from 'nprogress'
import Router from 'next/router'

import { Layout, Menu, Row, Col } from 'antd';
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
      {/* Auth0 script */}
      <script type="text/javascript" src='/static/auth0.min.js'></script>
    </Head>
    <Header>
      <Row>
        <Col span={18}>
          <Menu
            theme="dark"
            mode="horizontal"
            style={{ lineHeight: '64px' }}
          >
            <Menu.Item>
              <Link href="/">
                <a>Home</a>
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
        </Col>
        <Col span={6}>
          <Row type="flex" justify="end">
            <Menu
              theme="dark"
              mode="horizontal"
              style={{ lineHeight: '64px' }}
            >
              <Menu.Item>
                <Link href="/api/login">
                  <a>Login</a>
                </Link>
              </Menu.Item>
            </Menu>
          </Row>
        </Col>
      </Row>
    </Header>
    <Content style={{ padding: '0 50px' }}>
      {props.children}
    </Content>
    <Footer>

    </Footer>
  </Layout>
)

export default MyLayout;