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
          Developed to make scheduling UCF senior design presentation&nbsp;easier.
        </div>
        <div className="action">
          <Link href="/calendar">
            <Button
              type="primary"
              size="large"
              style={{ marginBottom: '16px' }}
            >
              Check committee member availability
            </Button>
          </Link>
          <span className="dummy-block"></span>
          <Link href="/schedule">
            <a>
              <Button
                size="large"
                style={{ marginBottom: '16px' }}
              >
                Schedule presentation
              </Button>
            </a>
          </Link>
        </div>
        <style jsx>{`
          .top {
            background: #141E30;  /* fallback for old browsers */
            background: -webkit-linear-gradient(to right, #243B55, #141E30);  /* Chrome 10-25, Safari 5.1-6 */
            background: linear-gradient(to right, #243B55, #141E30); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
            padding: 100px 0 85px 0;
            text-align: center;
          }
          .top .title {
            font-size: 68px;
            margin-bottom: 24px;
            line-height: 76px;
            font-weight: 600;
            color: #fff;
          }
          .top .description {
            font-size: 20px;
            line-height: 40px;
            margin-bottom: 24px;
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
