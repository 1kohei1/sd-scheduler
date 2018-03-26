import * as React from 'react';
import ObjectID from 'bson-objectid';
import { Modal, Row, Col, Form, Input, Button } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import { KoCalendarConstants } from '../../models/Constants';
import DatetimeUtil from '../../utils/DatetimeUtil';
import Presentation from '../../models/Presentation';
import TimeSlot from '../../models/TimeSlot';
import Location from '../../models/Location';

export interface PresentationSlotTileProps {
  form: WrappedFormUtils;
  ruler: number[];
  presentation: Presentation;
  locations: Location[];
  cancelPresentation: (presentation: Presentation, note: string) => void;
}

interface PresentationSlotTileState {
  visible: boolean;
}

class PresentationSlotTile extends React.Component<PresentationSlotTileProps, any> {
  locationByAdminId: any = {};

  constructor(props: PresentationSlotTileProps) {
    super(props);

    this.props.locations.forEach(location => {
      this.locationByAdminId[location.admin._id] = location.location;
    })

    this.state = {
      visible: false
    };

    this.toggleModal = this.toggleModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  toggleModal(v: boolean) {
    this.setState({
      visible: v
    });
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.props.form.validateFields((err: any, values: any) => {
      if (err) {
        return;
      }

      this.props.cancelPresentation(this.props.presentation, values.reason)
    })
  }

  render() {
    const start = DatetimeUtil.convertToHourlyNumber(DatetimeUtil.getMomentFromISOString(this.props.presentation.start));
    const end = DatetimeUtil.convertToHourlyNumber(DatetimeUtil.getMomentFromISOString(this.props.presentation.end));

    const topOffset = `${(start - this.props.ruler[0]) * KoCalendarConstants.rulerColumnHeightNum}px`;
    const height = `${(end - start) * KoCalendarConstants.rulerColumnHeightNum}px`;

    const { group } = this.props.presentation;

    return (
      <div>
        <div
          className="ko-presentationslottile"
          onClick={(e) => this.toggleModal(true)}
        >
          <span>Group {group.groupNumber} presentation ({this.locationByAdminId[group.adminFaculty]})</span>
        </div>

        <Modal
          title={group.projectName}
          visible={this.state.visible}
          cancelText="Close"
          destroyOnClose={true}
          footer={(
            <div>
              <Button
                onClick={(e) => this.toggleModal(false)}
              >
                Close
              </Button>
            </div>
          )}
          onCancel={(e) => this.toggleModal(false)}
        >
          <Row>
            <Col span={4} xs={5}>
              Group:
          </Col>
            <Col span={20} xs={19}>
              {group.groupNumber}
            </Col>
          </Row>
          <Row>
            <Col span={4} xs={5}>
              Sponsor:
          </Col>
            <Col span={20} xs={19}>
              {group.sponsorName}
            </Col>
          </Row>
          <Row>
            <Col span={4} xs={5}>
              Location:
          </Col>
            <Col span={20} xs={19}>
              {this.locationByAdminId[group.adminFaculty]}
            </Col>
          </Row>
          <Row>
            <Col span={4} xs={5}>
              Member:
          </Col>
            <Col span={20} xs={19}>
              {group.members.map(member => `${member.firstName} ${member.lastName}`).join(', ')}
            </Col>
          </Row>
          <Row>
            <Col span={4} xs={5}>
              Sponsor:
          </Col>
            <Col span={20} xs={19}>
              {group.sponsors.map(member => `${member.firstName} ${member.lastName}`).join(', ')}
            </Col>
          </Row>
          <div
            style={{ marginTop: '16px' }}
          >
            <p>If you need to cancel this presentation by any reason, please provide the reason. The reason will be sent to students, other faculties, and sponsors.</p>
            <Form
              onSubmit={this.handleSubmit}
            >
              <Form.Item>
                {this.props.form.getFieldDecorator('reason', {
                  rules: [{
                    required: true,
                    message: 'Please provide the reason',
                  }]
                })(
                  <Input />
                )}
              </Form.Item>
              <Button
                htmlType="submit"
                type="danger"
              >
                Cancel the presentation
            </Button>
            </Form>
          </div>
        </Modal>
        <style jsx>{`
          .ko-presentationslottile {
            position: absolute;
            top: ${topOffset};
            left: 0;
            height: ${height}
            width: calc(100% - 5px);
            opacity: 0.8;
            background-color: ${KoCalendarConstants.presentationTileBackgroundColor};
            font-size: 12px;
            z-index: 3;
            display: flex;
          }
          .ko-presentationslottile span {
            align-self: flex-end;
          }
          .ko-presentationslottile:hover {
            cursor: pointer;
            opacity: 0.9;
          }
        `}
        </style>
      </div>
    );
  }
}

export default Form.create()(PresentationSlotTile)