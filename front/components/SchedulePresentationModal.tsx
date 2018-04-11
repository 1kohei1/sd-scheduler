import * as React from 'react';
import { Modal, Alert, Row, Col, Select, Input, Checkbox, Button, Icon } from 'antd';
import { List } from 'immutable';

import Api from '../utils/Api';
import Presentation from '../models/Presentation';
import PresentationDate, { PresentationDateDates } from '../models/PresentationDate';
import Faculty from '../models/Faculty';
import DatetimeUtil from '../utils/DatetimeUtil';
import { DateConstants } from '../models/Constants';

export interface SchedulePresentationModalProps {
  visible: boolean;
  user: Faculty;
  semesterId: string;
  schedulingPresentation: Presentation;
  onClose: (shouldUpdate: boolean) => void;
}

interface SchedulePresentationModalState {
  errs: List<string>;
  presentationDate: PresentationDate | undefined;
  schedulingPresentation: Presentation;
  faculties: Faculty[];
}

export default class SchedulePresentationModal extends React.Component<SchedulePresentationModalProps, SchedulePresentationModalState> {
  constructor(props: SchedulePresentationModalProps) {
    super(props);

    this.state = {
      errs: List<string>(),
      presentationDate: undefined,
      schedulingPresentation: props.schedulingPresentation,
      faculties: [],
    }

    this.onOk = this.onOk.bind(this);
  }

  onErr(err: string) {
    this.setState({
      errs: this.state.errs.push(err),
    })
  }

  componentDidMount() {
    this.getFaculties();
    this.getPresentationDate();
  }

  componentWillReceiveProps(nextProps: SchedulePresentationModalProps) {
    this.setState({
      schedulingPresentation: nextProps.schedulingPresentation,
    })
  }

  async getFaculties() {
    try {
      const faculties = await Api.getFaculties(`isActive=true`) as Faculty[];
      this.setState({
        faculties,
      });
    } catch (err) {
      this.onErr(err.message);
    }
  }

  async getPresentationDate() {
    try {
      const presentationDates = await Api.getPresentationDates(`semester=${this.props.semesterId}&admin=${this.props.user._id}`) as PresentationDate[];
      const presentationDate = presentationDates[0];
      this.setState({
        presentationDate,
      });
    } catch (err) {
      this.onErr(err.message);
    }
  }

  onOk() {
    if (this.state.schedulingPresentation._id) {
      // Update existing presentation
    } else {
      // Create new presentation
    }
    this.props.onClose(true);
  }

  render() {
    return (
      <Modal
        visible={this.props.visible}
        title={`Schedule presentation for group ${this.state.schedulingPresentation && this.props.schedulingPresentation.group.groupNumber}`}
        onOk={this.onOk}
        onCancel={e => this.props.onClose(false)}
      >
        {this.state.schedulingPresentation && (
          <div>
            <Row style={{ marginBottom: '8px' }}>
              <Col span={4} style={{ lineHeight: '30px' }}>
                Project name:
              </Col>
              <Col span={20}>
                {/* <Input value={this.state.schedulingPresentation.projectName} /> */}
              </Col>
            </Row>
            <Row style={{ marginBottom: '8px' }}>
              <Col span={4} style={{ lineHeight: '30px' }}>
                Sponsor name:
              </Col>
              <Col span={20}>
                {/* <Input value={this.state.schedulingPresentation.sponsorName} /> */}
              </Col>
            </Row>
            <Row style={{ marginBottom: '8px' }}>
              <Col span={4} style={{ lineHeight: '30px' }}>
                Date time:
              </Col>
              <Col span={20}>
                <Select
                  style={{ width: '100%' }}
                  value={this.state.schedulingPresentation.start}
                >
                  {
                    DatetimeUtil.getIsoStringsFromPresentationDateDates((this.state.presentationDate as PresentationDate).dates)
                      .map((isostring: string) => (
                        <Select.Option
                          key={isostring}
                          value={isostring}
                        >
                          {DatetimeUtil.formatISOString(isostring, `${DateConstants.dateFormat} ${DateConstants.hourFormat}`)}
                        </Select.Option>
                      ))
                  }
                </Select>
              </Col>
            </Row>
            <Row style={{ marginBottom: '8px' }}>
              <Col span={4} style={{ lineHeight: '30px' }}>
                Faculties:
              </Col>
              <Col span={20}>
                {this.state.faculties.map(faculty => (
                  <Checkbox
                    key={faculty._id}
                    checked={this.state.schedulingPresentation.faculties.indexOf(faculty._id) >= 0}
                  >
                    Dr. {faculty.firstName} {faculty.lastName} {faculty.isAdmin && <span>(SD Faculty)</span>}
                  </Checkbox>
                ))}
              </Col>
            </Row>
            <Row style={{ marginBottom: '8px' }}>
              <Col span={4}>
                External faculties:
              </Col>
              <Col span={20}>
                {this.state.schedulingPresentation.externalFaculties.map(faculty => (
                  <div style={{ display: 'flex' }} key={faculty._id}>
                    <Input value={faculty.firstName} placeholder="First name" />
                    <Input value={faculty.lastName} placeholder="Last name" />
                    <Input value={faculty.email} placeholder="Email" />
                    <Button icon="delete" shape="circle" />
                  </div>
                ))}
                <Button
                  type="dashed"
                >
                  <Icon type="plus" /> Add new other department faculty
                </Button>
              </Col>
            </Row>
            <Row style={{ marginBottom: '8px' }}>
              <Col span={4}>
                Sponsors:
              </Col>
              <Col span={20}>

              </Col>
            </Row>
          </div>
        )}
      </Modal>
    );
  }
}
