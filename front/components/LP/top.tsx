import * as React from 'react';
import Link from 'next/link';
import { Button } from 'antd';

export interface AppProps {
}

export default class App extends React.Component<AppProps, any> {
  render() {
    return (
      <div className="top">
        <h1 className="title">SD Scheduler</h1>
        <div className="description">
          Final presentation scheduling without&nbsp;the&nbsp;stress
        </div>
        <div className="action">
          <Link href="/calendar">
            <Button
              type="primary"
              size="large"
              style={{ marginBottom: '16px' }}
            >
              Check committee's availability
            </Button>
          </Link>
          <span className="dummy-block"></span>
          <Link href="/schedule">
            <a>
              <Button
                size="large"
                ghost
                style={{ marginBottom: '16px' }}
              >
                Schedule presentation
              </Button>
            </a>
          </Link>
        </div>
        <style jsx>{`
          .top {
            background-color: #292C33;
            padding: 100px 0 85px 0;
            text-align: center;
          }
          .top .title {
            font-size: 68px;
            margin-bottom: 16px;
            line-height: 76px;
            font-weight: 400;
            color: #fff;
          }
          .top .description {
            font-size: 20px;
            line-height: 40px;
            margin-bottom: 24px;
            letter-spacing: 0.2px;
            color: #fff;
          }
          .top .dummy-block {
            display: inline-block;
            width: 16px;
          }
          @media (max-width: 520px) {
            .top .dummy-block {
              display: block;
              width: 0;
            }
          }
          @media (max-width: 450px) {
            .top .title {
              font-size: 60px;
            }
          }
          @media (max-width: 400px) {
            .top {
              padding: 50px 0 35px 0;
            }
            .top .title {
              font-size: 48px;
            }
          }
        `}</style>
      </div>
    );
  }
}
