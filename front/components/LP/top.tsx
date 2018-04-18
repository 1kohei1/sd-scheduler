import * as React from 'react';
import Link from 'next/link';
import { Row, Col, Button } from 'antd';

export interface AppProps {
}

export default class App extends React.Component<AppProps, any> {
  render() {
    return (
      <Row>
        <Col
          lg={{
            span: 10,
            offset: 2,
          }}
          xl={{
            span: 9,
            offset: 3,
          }}
        >
          <div className="top">
            <div className="title">SD Scheduler</div>
            <div className="description">
              Developed to make scheduling senior design presentation&nbsp;easier.
            </div>
            <div className="action">
              <Button
                type="primary"
                size="large"
                style={{ marginBottom: '16px' }}
              >
                Check committee member availability
              </Button>
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
          </div>
        </Col>
        <Col
          md={{
            span: 18,
            offset: 3,
          }}
          lg={{
            span: 10,
            offset: 0,
          }}
          xl={{
            span: 8,
            offset: 0,
          }}
        >
          <img src="/static/eye-catch-2.jpeg" alt="Mock image" style={{ width: '100%' }} />
        </Col>
        <style jsx>{`
          .top .title {
            margin-top: 100px;
            font-size: 68px;
            margin-bottom: 24px;
            line-height: 76px;
            font-weight: 600;
          }
          .top .description {
            font-size: 20px;
            line-height: 40px;
            margin-bottom: 24px;
          }
          .top .dummy-block {
            display: inline-block;
            width: 16px;
          }
          @media (max-width: 991px) {
            .top .title {
              margin-top: 50px;
            }
            .top .title, .top .description, .top .action {
              text-align: center;
            }
            .top .action {
              margin-bottom: 16px;
            }
          }
          @media (max-width: 513px) {
            .top .dummy-block {
              display: block;
              width: 0;
            }
          }
          @media (max-width: 415px) {
            .top .title {
              font-size: 60px;
            }
          }
          @media (max-width: 410px) {
            .top .title {
              font-size: 48px;
            }
          }
        `}</style>
      </Row>
    );
  }
}
