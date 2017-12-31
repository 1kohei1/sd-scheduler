import Head from 'next/head'
import Link from 'next/link'
import NProgress from 'nprogress'
import Router from 'next/router'

import { Layout } from 'antd';
const { Header, Content, Footer } = Layout;

// Loading animation
Router.onRouteChangeStart = (url) => NProgress.start()
Router.onRouteChangeComplete = () => NProgress.done()
Router.onRouteChangeError = () => NProgress.done()

// import Header from './Header';

const layoutStyle = {
  margin: 20,
  padding: 20,
  border: '1px solid #DDD'
};

const MyLayout = (props) => (
  <Layout>
    <Head>
      <meta name='viewport' content='width=device-width, initial-scale=1' />
      <meta charSet='utf-8' />
      {/* Import CSS for nprogress */}
      <link rel='stylesheet' type='text/css' href='/static/nprogress.css' />
      {/* Antd css */}
      <link rel='stylesheet' href='//cdnjs.cloudflare.com/ajax/libs/antd/2.9.3/antd.min.css' />
    </Head>
    <Header>

    </Header>
    <Content>
      { props.children }
    </Content>
    <Footer>
      ABC
    </Footer>
  </Layout>
)

export default MyLayout;