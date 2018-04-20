import * as React from 'react';
import Link from 'next/link';
import { Button } from 'antd';

export interface FooterProps {
}

export default class Footer extends React.Component<FooterProps, any> {
  render() {
    return (
      <div className="container">
        <div>
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
        <div>
          Developed by Kohei Arai. Please ⭐️the <a href="https://github.com/1kohei1/sd-scheduler" target="_blank">repo</a>!
        </div>
        <style jsx>{`
          .container {
            background-color: #292C33;
            padding: 100px 0 85px 0;
            color: #fff;
            text-align: center;
          }
          .dummy-block {
            display: inline-block;
            width: 16px;
          }
          @media (max-width: 520px) {
            .dummy-block {
              display: block;
              width: 0;
            }
          }
        `}</style>
      </div>
    );
  }
}
