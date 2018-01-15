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
    { props.children }
  </div>
)

export default AppLayout;