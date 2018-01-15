import Head from 'next/head'
import Link from 'next/link'
import * as NProgress from 'nprogress'
import Router from 'next/router'

import { Layout, Button } from 'antd';

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
    <Layout>
      <Layout.Header style={{ padding: "0 16px" }}>
        <div className="ko-header">
          <div>
            <Link href="/"><a style={{ color: 'white' }}>LOGO</a></Link>
          </div>
          <div>
            <Link href="/dashboard"><a>/dashboard</a></Link>
            <Link href="/dashboard?year=2017&season=summer&menu=schedule" as="/dashboard/2017/summer/schedule"><a>/dashboard/2017/summer/schedule</a></Link>
          </div>
          <div>
            <Button ghost>Login</Button>
          </div>
        </div>
      </Layout.Header>
    </Layout>
    { props.children }
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