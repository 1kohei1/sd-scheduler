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
          <Row>
            <Col span={12}>
              <div className="title">Check committee member availability.</div>
            </Col>
            <Col span={12}>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <div className="title">Fill necessary information for your presentation.</div>
            </Col>
            <Col span={8}>
              <img src="/static/android-fill-presentation.jpeg" style={{ maxWidth: '500px', margin: 'auto' }} />
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <div className="title">Receive confirmation email. Group member, committee members, and sponsor members get confirmation email as well.</div>
            </Col>
            <Col span={12}>
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
          }
          @media (max-width: 727px) {
            .instruction .heading {
              padding: 16px 0;
            }
          }
        `}</style>
      </div>
    );
  }
}
