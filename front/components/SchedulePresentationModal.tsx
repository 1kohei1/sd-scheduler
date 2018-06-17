import * as React from 'react';
import { Modal, Alert, Row, Col, Select, Input, Checkbox, Button, Icon, message } from 'antd';
import { List, Map } from 'immutable';

import Api from '../utils/Api';
import Presentation from '../models/Presentation';
import PresentationDate from '../models/PresentationDate';
import Faculty from '../models/Faculty';
import Person, { NewPerson } from '../models/Person';
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
  schedulingPresentation: Map<keyof Presentation, any>;
  dateStr: string;
  saving: boolean;
  faculties: Faculty[];
}

export default class SchedulePresentationModal extends React.Component<SchedulePresentationModalProps, SchedulePresentationModalState> {
  constructor(props: SchedulePresentationModalProps) {
    super(props);

    this.state = {
      errs: List<string>(),
      presentationDate: undefined,
      schedulingPresentation: Map<keyof Presentation, any>(props.schedulingPresentation),
      dateStr: '',
      saving: false,
      faculties: [],
    }

    this.onChange = this.onChange.bind(this);
    this.onDateStrChange = this.onDateStrChange.bind(this);
    this.onFacultiesChange = this.onFacultiesChange.bind(this);
    this.addNewPerson = this.addNewPerson.bind(this);
    this.deletePerson = this.deletePerson.bind(this);
    this.onPersonChange = this.onPersonChange.bind(this);
    this.onOk = this.onOk.bind(this);
  }

  onErr(err: string) {
    this.setState({
      errs: this.state.errs.push(err),
      saving: false,
    })
  }

  componentDidMount() {
    this.getFaculties();
    this.getPresentationDate();
  }

  componentWillReceiveProps(nextProps: SchedulePresentationModalProps) {
    this.setState({
      errs: List<string>(),
      saving: false,
      schedulingPresentation: Map<keyof Presentation, any>(nextProps.schedulingPresentation),
      dateStr: nextProps.schedulingPresentation && nextProps.schedulingPresentation.start &&
        DatetimeUtil.formatISOString(nextProps.schedulingPresentation.start, DateConstants.dateFormat),
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

  onDateStrChange(dateStr: string) {
    this.setState({
      dateStr,
      schedulingPresentation: this.state.schedulingPresentation.set('start', ''),
    });
  }

  onChange(prop: keyof Presentation, val: string) {
    this.setState((prevState: SchedulePresentationModalState, props: SchedulePresentationModalProps) => {
      let newSchedulingPresentation = prevState.schedulingPresentation;
      newSchedulingPresentation = newSchedulingPresentation.set(prop, val);

      if (prop === 'start') {
        const startMoment = DatetimeUtil.getMomentFromISOString(val);
        const endMoment = DatetimeUtil.addToMoment(startMoment, 1, 'h');
        newSchedulingPresentation = newSchedulingPresentation.set('end', endMoment.toISOString());
      }

      return {
        schedulingPresentation: newSchedulingPresentation
      };
    });
  }

  onFacultiesChange(fid: string, checked: boolean) {
    this.setState((prevState: SchedulePresentationModalState, props: SchedulePresentationModalProps) => {
      const { schedulingPresentation } = prevState;
      const newFaculties = prevState.schedulingPresentation.get('faculties');

      if (checked) {
        newFaculties.push(fid);
      } else {
        const index = newFaculties.indexOf(fid);
        if (index >= 0) {
          newFaculties.splice(index, 1);
        }
      }

      return {
        schedulingPresentation: schedulingPresentation.set('faculties', newFaculties),
      }
    });
  }

  addNewPerson(prop: 'sponsors' | 'externalFaculties') {
    this.setState((prevState: SchedulePresentationModalState, props: SchedulePresentationModalProps) => {
      const newArr = prevState.schedulingPresentation.get(prop);
      newArr.push(NewPerson());

      return {
        schedulingPresentation: prevState.schedulingPresentation.set(prop, newArr),
      }
    });
  }

  onPersonChange(prop: 'sponsors' | 'externalFaculties', _id: string, prop2: 'firstName' | 'lastName' | 'email', val: string) {
    this.setState((prevState: SchedulePresentationModalState, props: SchedulePresentationModalProps) => {
      const newArr = prevState.schedulingPresentation.get(prop);
      const index = newArr.findIndex((p: Person) => p._id === _id);
      newArr[index][prop2] = val;

      return {
        schedulingPresentation: prevState.schedulingPresentation.set(prop, newArr),
      }
    });
  }

  deletePerson(prop: 'sponsors' | 'externalFaculties', _id: string) {
    this.setState((prevState: SchedulePresentationModalState, props: SchedulePresentationModalProps) => {
      const newArr = prevState.schedulingPresentation.get(prop);
      const index = newArr.findIndex((p: Person) => p._id === _id);
      newArr.splice(index, 1);

      return {
        schedulingPresentation: prevState.schedulingPresentation.set(prop, newArr),
      }
    });
  }

  async onOk() {
    const msg = this.validateMessage();
    if (msg.length > 0) {
      message.error(msg);
      return;
    }

    this.setState({
      saving: true,
    });

    const presentation = this.state.schedulingPresentation.toObject();
    // The senior design admin should be in presentation.faculties.
    // But when it's not present, add it
    if (presentation.faculties.indexOf(this.props.user._id) === -1) {
      presentation.faculties.push(this.props.user._id);
    }

    const body = {
      start: presentation.start,
      end: presentation.end,
      semester: presentation.semester,
      projectName: presentation.projectName,
      sponsorName: presentation.sponsorName,
      sponsors: presentation.sponsors,
      group: presentation.group._id,
      faculties: presentation.faculties,
      externalFaculties: presentation.externalFaculties,
    };

    try {
      // If _id is defined, update existing one.
      if (presentation._id) {
        await Api.updatePresentationByAdmin(presentation._id, body);
      } else {
        await Api.createPresentationByAdmin(body);
      }
      message.success('Successfully created/updated presentation');
      this.props.onClose(true);
    } catch (err) {
      this.onErr(err.message);
    }
  }

  private validateMessage() {
    const presentation = this.state.schedulingPresentation.toObject();

    // Check all necessary information is filled
    if (!presentation.projectName) {
      return 'Please fill in the project name';
    }
    if (!presentation.start || !presentation.end) {
      return 'Please fill in the presentation date time';
    }

    const committees = presentation.faculties
      .map((fid: string) => this.state.faculties.find((faculty: Faculty) => faculty._id === fid))
      .filter((faculty: Faculty | undefined) => !!faculty)
      .filter((faculty: Faculty) => !faculty.isAdmin);

    // Check number of committees
    if (committees.length + presentation.externalFaculties.length < 3) {
      return 'At least 3 committee members must be selected';
    }
    if (committees.length < 2) {
      return 'At least 2 EECS committee members must be selected';
    }


    // Check admin faculty is selected
    if (presentation.faculties.indexOf(this.props.user._id) === -1) {
      return 'SD faculty (you) is not selected';
    }

    // Check external faculty and sponsors
    const people = presentation.externalFaculties.concat(presentation.sponsors);
    const invalidPeople = people
      .filter((person: Person) => !person.firstName || !person.lastName || !person.email)
      .length > 0;
    if (invalidPeople) {
      return 'Please fill all information for external faculties or sponsors';
    }

    return '';
  }

  render() {
    return (
      <Modal
        visible={this.props.visible}
        title={`Schedule presentation for group ${this.state.schedulingPresentation.size > 0 && this.state.schedulingPresentation.get('group').groupNumber}`}
        onOk={this.onOk}
        confirmLoading={this.state.saving}
        onCancel={e => this.props.onClose(false)}
      >
        {this.state.schedulingPresentation.size > 0 && (
          <div>
            {this.state.errs.toArray().map((err: string, index: number) => (
              <Alert
                key={index}
                style={{ marginBottom: '8px' }}
                type="error"
                message={err}
              />
            ))}
            <Row style={{ marginBottom: '8px' }}>
              <Col span={6}>
                Project name:
              </Col>
              <Col span={18}>
                <Input
                  onChange={e => this.onChange('projectName', e.target.value)}
                  value={this.state.schedulingPresentation.get('projectName')}
                  placeholder="Project name"
                />
              </Col>
            </Row>
            <Row style={{ marginBottom: '8px' }}>
              <Col span={6}>
                Sponsor name:
              </Col>
              <Col span={18}>
                <Input
                  onChange={e => this.onChange('sponsorName', e.target.value)}
                  value={this.state.schedulingPresentation.get('sponsorName')}
                  placeholder="Sponsor name"
                />
              </Col>
            </Row>
            <Row style={{ marginBottom: '8px' }}>
              <Col span={6} style={{ lineHeight: '30px' }}>
                Date time:
              </Col>
              <Col span={18}>
                <Row gutter={8}>
                  <Col span={12}>
                    <Select
                      value={this.state.dateStr}
                      onChange={this.onDateStrChange}
                      style={{ width: '100%' }}
                    >
                      {
                        DatetimeUtil.getPresentationDateOptions((this.state.presentationDate as PresentationDate).dates)
                          .map((dateStr: string) => (
                            <Select.Option
                              key={dateStr}
                              value={dateStr}
                            >
                              {dateStr}
                            </Select.Option>
                          ))
                      }
                    </Select>
                  </Col>
                  <Col span={12}>
                    <Select
                      value={this.state.schedulingPresentation.get('start')}
                      onChange={(e: string) => this.onChange('start', e)}
                      style={{ width: '100%' }}
                    >
                      {
                        DatetimeUtil.getPresentationTimeOptions(
                          (this.state.presentationDate as PresentationDate).dates,
                          this.state.dateStr
                        )
                          .map((isostring: string) => (
                            <Select.Option
                              key={isostring}
                              value={isostring}
                            >
                              {DatetimeUtil.formatISOString(isostring, DateConstants.hourFormat)}
                            </Select.Option>
                          ))
                      }
                    </Select>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row style={{ marginBottom: '8px' }}>
              <Col span={6} style={{ lineHeight: '30px' }}>
                SD Faculty:
              </Col>
              <Col span={18}>
                <Checkbox
                  checked
                  disabled={true}
                >
                  {
                    this.state.faculties.filter((faculty: Faculty) => faculty._id === this.props.user._id)
                      .map((faculty: Faculty) => (
                        <span key={faculty._id}>
                          Dr. {faculty.firstName} {faculty.lastName}
                        </span>
                      ))
                  }

                </Checkbox>
              </Col>
            </Row>
            <Row style={{ marginBottom: '8px' }}>
              <Col span={6} style={{ lineHeight: '30px' }}>
                Committees:
              </Col>
              <Col span={18}>
                {
                  this.state.faculties
                    .filter((faculty: Faculty) => !faculty.isAdmin)
                    .map(faculty => (
                      <div key={faculty._id}>
                        <Checkbox
                          onChange={e => this.onFacultiesChange(faculty._id, e.target.checked)}
                          checked={this.state.schedulingPresentation.get('faculties').indexOf(faculty._id) >= 0}
                        >
                          Dr. {faculty.firstName} {faculty.lastName} {faculty.isAdmin && <span>(SD Faculty)</span>}
                        </Checkbox>
                      </div>
                    ))}
              </Col>
            </Row>
            <Row style={{ marginBottom: '8px' }}>
              <Col span={6}>
                External faculties:
              </Col>
              <Col span={18}>
                {this.state.schedulingPresentation.get('externalFaculties').map((faculty: Person) => (
                  <div key={faculty._id} style={{ marginBottom: '8px' }}>
                    <Input
                      value={faculty.firstName}
                      placeholder="First name"
                      onChange={e => this.onPersonChange('externalFaculties', faculty._id, 'firstName', e.target.value)}
                    />
                    <Input
                      value={faculty.lastName}
                      placeholder="Last name"
                      onChange={e => this.onPersonChange('externalFaculties', faculty._id, 'lastName', e.target.value)}
                    />
                    <Input
                      value={faculty.email}
                      placeholder="Email"
                      onChange={e => this.onPersonChange('externalFaculties', faculty._id, 'email', e.target.value)}
                    />
                    <Button icon="delete" shape="circle" onClick={e => this.deletePerson('externalFaculties', faculty._id)} />
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={e => this.addNewPerson('externalFaculties')}
                >
                  <Icon type="plus" /> Add other department faculty
                </Button>
              </Col>
            </Row>
            <Row style={{ marginBottom: '8px' }}>
              <Col span={6}>
                Sponsors:
              </Col>
              <Col span={18}>
                {this.state.schedulingPresentation.get('sponsors').map((sponsor: Person) => (
                  <div key={sponsor._id} style={{ marginBottom: '8px' }}>
                    <Input
                      value={sponsor.firstName}
                      placeholder="First name"
                      onChange={e => this.onPersonChange('sponsors', sponsor._id, 'firstName', e.target.value)}
                    />
                    <Input
                      value={sponsor.lastName}
                      placeholder="Last name"
                      onChange={e => this.onPersonChange('sponsors', sponsor._id, 'lastName', e.target.value)}
                    />
                    <Input
                      value={sponsor.email}
                      placeholder="Email"
                      onChange={e => this.onPersonChange('sponsors', sponsor._id, 'email', e.target.value)}
                    />
                    <Button icon="delete" shape="circle" onClick={e => this.deletePerson('sponsors', sponsor._id)} />
                  </div>
                ))}
                <Button
                  type="dashed"
                  onClick={e => this.addNewPerson('sponsors')}
                >
                  <Icon type="plus" /> Add new sponsor
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    );
  }
}
