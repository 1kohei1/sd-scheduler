import * as React from 'react';
import { Row, Col } from 'antd';

export interface InstructionProps {
}

export default class Instruction extends React.Component<InstructionProps, any> {
  render() {
    return (
      <div className="instruction">
        <div className="heading">
          Schedule senior design presentation&nbsp;in&nbsp;5&nbsp;minutes.
        </div>
        <div className="box">
          <div className="title">Check committee member availability.</div>
          <Row style={{ marginBottom: '16px' }}>
            <Col
              xs={{
                span: 16,
                offset: 4,
              }}
              sm={{
                span: 14,
                offset: 5,
              }}
              span={12}
              offset={6}
            >
              <img src="/static/prod-semester-calendar.png" style={{ width: '100%' }} />
            </Col>
          </Row>
          <div className="title">Fill necessary information for your presentation.</div>
          <Row style={{ marginBottom: '16px' }}>
            <Col
              xs={{
                span: 16,
                offset: 4,
              }}
              sm={{
                span: 14,
                offset: 5,
              }}
              span={12}
              offset={6}
            >
              <img src="/static/prod-fill-information.png" style={{ width: '100%' }} />
            </Col>
          </Row>
          <div className="title">Group member, committee members, and sponsor members get confirmation email when presentation is scheduled.</div>
          <Row style={{ marginBottom: '16px' }}>
            <Col
              xs={{
                span: 16,
                offset: 4,
              }}
              sm={{
                span: 14,
                offset: 5,
              }}
              span={12}
              offset={6}
            >
              <img src="/static/prod-email.png" style={{ width: '100%' }} />
            </Col>
          </Row>
        </div>
        <style jsx>{`
          .instruction {
            margin: auto;
            max-width: 1040px;
            padding: 0 16px;
          }
          .instruction .heading {
            font-size: 32px;
            text-align: center;
            padding: 32px 0;
          }
          .instruction .title {
            font-size: 28px;
            font-weight: 300;
            text-align: center;
          }
          @media (max-width: 727px) {
            .instruction .heading {
              padding: 16px 0;
            }
          }
          @media (max-width: 380px) {
            .instruction .heading {
              font-size: 28px;
            }
          }
          @media (max-width: 330px) {
            .instruction .heading {
              font-size: 24px;
            }
          }
        `}</style>
      </div>
    );
  }
}
