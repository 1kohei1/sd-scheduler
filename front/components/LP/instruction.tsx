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
          <Row className="instruction-row">
            <Col
              xs={{
                span: 16,
                offset: 4,
              }}
              sm={{
                span: 14,
                offset: 5,
              }}
              lg={{
                span: 12,
                offset: 6,
              }}
              xl={{
                span: 10,
                offset: 7,
              }}
            >
              <img src="/static/prod-semester-calendar.png" style={{ width: '100%' }} />
            </Col>
          </Row>
          <div className="title">Fill necessary information for your&nbsp;presentation.</div>
          <Row className="instruction-row">
            <Col
              xs={{
                span: 16,
                offset: 4,
              }}
              sm={{
                span: 14,
                offset: 5,
              }}
              lg={{
                span: 12,
                offset: 6,
              }}
              xl={{
                span: 10,
                offset: 7,
              }}
            >
              <img src="/static/prod-fill-information.png" style={{ width: '100%' }} />
            </Col>
          </Row>
          <div className="title">Receive confirmation email.</div>
          <Row className="instruction-row">
            <Col
              xs={{
                span: 16,
                offset: 4,
              }}
              sm={{
                span: 14,
                offset: 5,
              }}
              lg={{
                span: 12,
                offset: 6,
              }}
              xl={{
                span: 10,
                offset: 7,
              }}
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
            text-align: center;
          }
          .instruction .heading {
            font-size: 32px;
            padding: 32px 0;
          }
          .instruction .title {
            font-size: 28px;
            font-weight: 300;
          }
          .instruction-row {
            margin-bottom: 16px;
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
        <style>{`
          @media (min-width: 992px) {
            .instruction-row {
              margin-bottom: 24px;
            }
          }
        `}</style>
      </div>
    );
  }
}
