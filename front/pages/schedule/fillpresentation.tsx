import * as React from 'react';
import { Row, Col, Form, Select, Input, Button, Icon, Alert, Checkbox } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { List, Map } from 'immutable';
import ObjectID from 'bson-objectid';

import InitialProps from '../../models/InitialProps';
import Group from '../../models/Group';
import Presentation, { NewPresentation } from '../../models/Presentation';
import PresentationDate from '../../models/PresentationDate';
import Person, { NewPerson } from '../../models/Person';
import Faculty from '../../models/Faculty';
import AvailableSlot from '../../models/AvailableSlot';
import TimeSlot from '../../models/TimeSlot';
import Api from '../../utils/Api';
import DatetimeUtil from '../../utils/DatetimeUtil';
import AppLayout from '../../components/AppLayout';
import ScheduleLayout from '../../components/ScheduleLayout';
import Loading from '../../components/Loading';
import { DateConstants, ScheduleFormLayoutConstants } from '../../models/Constants';

export interface FillPresentationProps {
  form: WrappedFormUtils;
  group: Group;
}

interface FillPresentationState {
  loading: boolean;
  saving: boolean;
  errs: List<string>;

  allFaculties: Faculty[];
  presentationDate: PresentationDate | undefined;
  allPresentations: Presentation[];
  allAvailableSlots: AvailableSlot[];

  schedulingPresentation: Map<keyof Presentation, any>;
  availableFaculties: Faculty[];
  fourFacultiesStatus: 'err' | 'success' | '';
  sdFacultyStatus: 'err' | 'success' | '';
  formSubmitted: boolean;
}

class FillPresentation extends React.Component<FillPresentationProps, FillPresentationState> {
  static async getInitialProps(context: InitialProps) {
    const { groupId } = context.query;

    try {
      const groups = await Api.getGroups(`_id=${groupId}`) as Group[];

      if (groups.length === 0) {
        Api.redirect(context, '/schedule');
        return {};
      } else {
        return {
          group: groups[0],
        }
      }
    } catch (err) {
      Api.redirect(context, '/schedule');
      return {};
    }
  }

  constructor(props: FillPresentationProps) {
    super(props);

    this.state = {
      loading: true,
      saving: false,
      errs: List<string>(),

      allFaculties: [],
      presentationDate: undefined,
      allPresentations: [],
      allAvailableSlots: [],

      schedulingPresentation: Map<keyof Presentation, any>(NewPresentation(this.props.group.semester, this.props.group)),
      availableFaculties: [],
      fourFacultiesStatus: '',
      sdFacultyStatus: '',
      formSubmitted: false,
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.onPresentationDateChange = this.onPresentationDateChange.bind(this);
  }

  onErr(err: string) {
    this.setState({
      errs: this.state.errs.push(err),
      loading: false,
    })
  }

  componentDidMount() {
    Promise.all([
      this.getFaculties(),
      this.getPresentationDate(),
      this.getPresentations(),
      this.getAvailableSlots(),
    ])
      .then(() => {
        // Since onPresentationDateChange does not fire when the initial value is set, manually call the function
        this.onPresentationDateChange(this.state.schedulingPresentation.get('start'));
        this.setState({
          loading: false,
        })
      })
      .catch(err => {
        this.onErr(err.message);
      })
  }

  private async getFaculties() {
    try {
      const allFaculties = await Api.getFaculties(`isActive=true`);
      this.setState({
        allFaculties,
      })
    } catch (err) {
      this.onErr(err.message);
    }
  }

  private async getPresentationDate() {
    try {
      const { group } = this.props;
      const presentationDates = await Api.getPresentationDates(`semester=${group.semester}&admin=${group.adminFaculty}`);
      if (presentationDates.length > 0) {
        this.setState({
          presentationDate: presentationDates[0],
        })
      }
    } catch (err) {
      this.onErr(err.message);
    }
  }

  private async getPresentations() {
    try {
      const { group } = this.props;
      const allPresentations = await Api.getPresentations(`semester=${group.semester}`);

      const newState: any = {
        allPresentations,
      };
      const schedulingPresentation = allPresentations.find((presentation: Presentation) => presentation.group._id === group._id);
      if (schedulingPresentation) {
        newState.schedulingPresentation = Map<keyof Presentation, any>(schedulingPresentation);
      }

      this.setState(newState);
    } catch (err) {
      this.onErr(err.message);
    }
  }

  private async getAvailableSlots() {
    try {
      const allAvailableSlots = await Api.getAvailableSlots(`semester=${this.props.group.semester}`);
      this.setState({
        allAvailableSlots,
      })
    } catch (err) {
      this.onErr(err.message);
    }
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.setState({
      formSubmitted: true,
    });

    this.props.form.validateFieldsAndScroll((err: any, values: any) => {
      if (err) {
        return;
      }

      // Handle externalFaculties and sponsors
      if (!values.externalFaculties) {
        values.externalFaculties = [];
      } else {
        values.externalFaculties = Object.values(values.externalFaculties);
      }
      if (!values.sponsors) {
        values.sponsors = [];
      } else {
        values.sponsors = Object.values(values.sponsors);
      }

      // Handle faculties
      values.faculties = this.getPresentationFacultyIds();

      // Check if state.schedulingPresentation._id exists in state.allPresentations and pass _id if it exists to verification modal
      // Present dialog to verify user belongs to the group
      console.log(values);
    })
  }

  // Returns faculty ids who will join the presentation
  private getPresentationFacultyIds() {
    const faculties = this.props.form.getFieldValue('faculties');
    if (!faculties) {
      return [];
    }
    return Object.entries(faculties)
      .filter(([_id, obj]: [string, { checked: boolean }]) => obj.checked)
      .map(([_id, obj]: [string, { checked: boolean }]) => _id);
  }

  /*
  private fourFacultiesStatus(externalFaculties: Person[]) {
    const facultyIds = this.getPresentationFacultyIds();
    if (facultyIds.length + externalFaculties.length >= 4) {
      return 'success';
    } else if (this.state.formSubmitted) {
      return 'err';
    } else {
      return '';
    }
  }

  setSdFacultyStatus() {
    this.setState({
      sdFacultyStatus: this.sdFacultyStatus(),
    })
  }

  private sdFacultyStatus() {
    const facultyIds = this.getPresentationFacultyIds();
    const isSDFacultySelected = facultyIds
      .filter((fid: string) => this.props.group.adminFaculty === fid)
      .length > 0;

    if (isSDFacultySelected) {
      return 'success';
    } else if (this.state.formSubmitted) {
      return 'err';
    } else {
      return '';
    }
  }
  */

  remove(prop: 'sponsors' | 'externalFaculties', _id: string) {
    const { schedulingPresentation } = this.state;
    const newArr = schedulingPresentation.get(prop).filter((p: Person) => p._id !== _id);
    this.setState({
      schedulingPresentation: schedulingPresentation.set(prop, newArr),
    })
  }

  add(prop: 'sponsors' | 'externalFaculties') {
    const { schedulingPresentation } = this.state;
    const newArr = schedulingPresentation.get(prop).concat(NewPerson());
    this.setState({
      schedulingPresentation: schedulingPresentation.set(prop, newArr),
    })
  }

  onPresentationDateChange(isostring: string) {
    const startMoment = DatetimeUtil.getMomentFromISOString(isostring);
    const endMoment = DatetimeUtil.addToMoment(startMoment, 1, 'h');
    const presentationSlot = {
      _id: 'dummy id',
      start: startMoment,
      end: endMoment,
    };

    this.setState({
      availableFaculties: this.state.allFaculties.filter((faculty: Faculty) => {
        const availableSlot = this.state.allAvailableSlots.find(
          (availableSlot: AvailableSlot) => availableSlot.faculty === faculty._id
        );
        if (!availableSlot) {
          return false;
        }

        const isFacultyAvailableAtPresentationTime = availableSlot
          .availableSlots
          .map(DatetimeUtil.convertToTimeSlot)
          .filter((ts: TimeSlot) => DatetimeUtil.doesCover(ts, presentationSlot))
          .length > 0;

        if (!isFacultyAvailableAtPresentationTime) {
          return false;
        }

        const isFacultyBookedForAnotherPresentation = this.state.allPresentations
          .filter((presentation: Presentation) =>
            presentation._id !== this.state.schedulingPresentation.get('_id') &&
            presentation.faculties.indexOf(faculty._id) >= 0
          )
          .map(DatetimeUtil.convertToTimeSlot)
          .filter((ts: TimeSlot) => DatetimeUtil.doesOverlap(ts, presentationSlot))
          .length > 0;

        if (isFacultyBookedForAnotherPresentation) {
          return false;
        }

        return true;
      }),
    })
  }

  render() {
    const { group } = this.props;
    const schedulingPresentation = this.state.schedulingPresentation.toObject();

    return (
      <AppLayout>
        <ScheduleLayout
          current={1}
          groupNumber={group.groupNumber}
          description={`Please fill the presentation detail for group ${group.groupNumber}.`}
        >
          {this.state.loading ? <Loading /> : (
            <Form onSubmit={this.handleSubmit}>
              {this.state.errs.map((err: string, index: number) => {
                <Alert
                  showIcon
                  type="error"
                  message="Error"
                  description={err}
                />
              })}
              <Form.Item
                {...ScheduleFormLayoutConstants.layoutWithColumn}
                label="Project name"
              >
                {this.props.form.getFieldDecorator('projectName', {
                  rules: [{
                    required: true,
                    message: 'Please provide the project name',
                  }],
                  initialValue: schedulingPresentation.projectName,
                })(
                  <Input placeholder="Project name" />
                )}
              </Form.Item>
              <Form.Item
                {...ScheduleFormLayoutConstants.layoutWithColumn}
                label="Sponsor name"
              >
                {this.props.form.getFieldDecorator('sponsorName', {
                  rules: [{
                    required: true,
                    message: 'Please provide the sponsor name',
                  }],
                  initialValue: schedulingPresentation.sponsorName,
                })(
                  <Input placeholder="Sponsor name" />
                )}
              </Form.Item>
              {schedulingPresentation.sponsors.length === 0 ? (
                <Form.Item
                  {...ScheduleFormLayoutConstants.layoutWithColumn}
                  label="Sponsor members"
                >
                  <Button
                    type="dashed"
                    onClick={e => this.add('sponsors')}
                  >
                    <Icon type="plus" /> Add new sponsor member
                  </Button>
                </Form.Item>
              ) : (
                  <div>
                    {schedulingPresentation.sponsors.map((sponsor: Person, index: number) => (
                      <Row key={sponsor._id}>
                        <Col
                          {...ScheduleFormLayoutConstants.layoutWithColumn.labelCol}
                          style={{ textAlign: 'right' }}
                        >
                          {index === 0 && (
                            <Form.Item
                              label="Sponsor members"
                            >
                            </Form.Item>
                          )}
                        </Col>
                        <Col
                          {...ScheduleFormLayoutConstants.layoutWithColumn.wrapperCol}
                          style={{ display: 'flex' }}
                        >
                          <Form.Item style={{ width: 0 }}>
                            {this.props.form.getFieldDecorator(`sponsors[${sponsor._id}]._id`, {
                              initialValue: sponsor._id,
                            })(
                              <Input disabled />
                            )}
                          </Form.Item>
                          <Form.Item style={{ marginRight: '8px' }}>
                            {this.props.form.getFieldDecorator(`sponsors[${sponsor._id}].firstName`, {
                              rules: [{
                                required: true,
                                message: 'Please provide the first name'
                              }],
                              initialValue: sponsor.firstName,
                            })(
                              <Input placeholder="First name" />
                            )}
                          </Form.Item>
                          <Form.Item style={{ marginRight: '8px' }}>
                            {this.props.form.getFieldDecorator(`sponsors[${sponsor._id}].lastName`, {
                              rules: [{
                                required: true,
                                message: 'Please provide the last name'
                              }],
                              initialValue: sponsor.lastName,
                            })(
                              <Input placeholder="Last name" />
                            )}
                          </Form.Item>
                          <Form.Item style={{ marginRight: '8px' }}>
                            {this.props.form.getFieldDecorator(`sponsors[${sponsor._id}].email`, {
                              rules: [{
                                required: true,
                                message: 'Please provide the email'
                              }, {
                                type: 'email',
                                message: 'It is not valid email',
                              }],
                              initialValue: sponsor.email,
                            })(
                              <Input placeholder="Email" />
                            )}
                          </Form.Item>
                          <Form.Item>
                            <Button
                              icon="delete"
                              shape="circle"
                              onClick={e => this.remove('sponsors', sponsor._id)}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    ))}
                    <Form.Item
                      {...ScheduleFormLayoutConstants.layoutWithoutColumn}
                    >
                      <Button
                        type="dashed"
                        onClick={e => this.add('sponsors')}
                      >
                        <Icon type="plus" /> Add new sponsor member
                      </Button>
                    </Form.Item>
                  </div>
                )}
              <Form.Item
                {...ScheduleFormLayoutConstants.layoutWithColumn}
                label="Presentation time"
              >
                {this.props.form.getFieldDecorator('start', {
                  rules: [{
                    required: true,
                    message: 'Please provide the presentation time',
                  }],
                  initialValue: schedulingPresentation.start,
                })(
                  <Select onChange={this.onPresentationDateChange}>
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
                )}
              </Form.Item>
              {this.state.availableFaculties.length === 0 ? (
                <Form.Item
                  {...ScheduleFormLayoutConstants.layoutWithColumn}
                  label="EECS faculties"
                >
                  No faculties are available at specified time. Please change your presentation time.
                </Form.Item>
              ) : (
                  <div>
                    {this.state.availableFaculties.map((faculty: Faculty, index: number, arr: Faculty[]) => {
                      const layout = index === 0 ?
                        ScheduleFormLayoutConstants.layoutWithColumn :
                        ScheduleFormLayoutConstants.layoutWithoutColumn;

                      return (
                        <Form.Item
                          key={faculty._id}
                          {...layout}
                          style={{ marginBottom: arr.length - 1 === index ? '' : '0' }}
                          label={index === 0 ? 'EECS faculties' : ''}
                        >
                          {this.props.form.getFieldDecorator(`faculties[${faculty._id}].checked`, {
                            initialValue: schedulingPresentation.faculties.indexOf(faculty._id) >= 0,
                            valuePropName: 'checked'
                          })(
                            <Checkbox
                            >
                              Dr. {faculty.firstName} {faculty.lastName} {faculty.isAdmin && (<span>(SD Faculty)</span>)}
                            </Checkbox>
                          )}
                        </Form.Item>
                      )
                    })}
                  </div>
                )}
              {schedulingPresentation.externalFaculties.length === 0 ? (
                <Form.Item
                  {...ScheduleFormLayoutConstants.layoutWithColumn}
                  label="Other department faculties"
                >
                  <Button
                    type="dashed"
                    onClick={e => this.add('externalFaculties')}
                  >
                    <Icon type="plus" /> Add other department faculty
                  </Button>
                </Form.Item>
              ) : (
                  <div>
                    {schedulingPresentation.externalFaculties.map((faculty: Person, index: number) => (
                      <Row key={faculty._id}>
                        <Col
                          {...ScheduleFormLayoutConstants.layoutWithColumn.labelCol}
                          style={{ textAlign: 'right' }}
                        >
                          {index === 0 && (
                            <Form.Item
                              label="Other department faculties"
                            >
                            </Form.Item>
                          )}
                        </Col>
                        <Col
                          {...ScheduleFormLayoutConstants.layoutWithColumn.wrapperCol}
                          style={{ display: 'flex' }}
                        >
                          <Form.Item style={{ width: 0 }}>
                            {this.props.form.getFieldDecorator(`externalFaculties[${faculty._id}]._id`, {
                              initialValue: faculty._id,
                            })(
                              <Input disabled />
                            )}
                          </Form.Item>
                          <Form.Item style={{ marginRight: '8px' }}>
                            {this.props.form.getFieldDecorator(`externalFaculties[${faculty._id}].firstName`, {
                              rules: [{
                                required: true,
                                message: 'Please provide the first name'
                              }],
                              initialValue: faculty.firstName,
                            })(
                              <Input placeholder="First name" />
                            )}
                          </Form.Item>
                          <Form.Item style={{ marginRight: '8px' }}>
                            {this.props.form.getFieldDecorator(`externalFaculties[${faculty._id}].lastName`, {
                              rules: [{
                                required: true,
                                message: 'Please provide the last name'
                              }],
                              initialValue: faculty.lastName,
                            })(
                              <Input placeholder="Last name" />
                            )}
                          </Form.Item>
                          <Form.Item style={{ marginRight: '8px' }}>
                            {this.props.form.getFieldDecorator(`externalFaculties[${faculty._id}].email`, {
                              rules: [{
                                required: true,
                                message: 'Please provide the email'
                              }, {
                                type: 'email',
                                message: 'It is not valid email',
                              }],
                              initialValue: faculty.email,
                            })(
                              <Input placeholder="Email" />
                            )}
                          </Form.Item>
                          <Form.Item>
                            <Button
                              icon="delete"
                              shape="circle"
                              onClick={e => this.remove('externalFaculties', faculty._id)}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    ))}
                    <Form.Item
                      {...ScheduleFormLayoutConstants.layoutWithoutColumn}
                    >
                      <Button
                        type="dashed"
                        onClick={e => this.add('externalFaculties')}
                      >
                        <Icon type="plus" /> Add other department faculty
                      </Button>
                    </Form.Item>
                  </div>
                )}
              <Form.Item
                {...ScheduleFormLayoutConstants.layoutWithColumn}
                label="Validation"
              >
                <div>For faculties, you need to select</div>
                <div className={this.state.fourFacultiesStatus}>
                  <Icon type="check-circle-o" />&nbsp;At least 4 faculties
                </div>
                <div className={this.state.sdFacultyStatus}>
                  <Icon type="check-circle-o" />&nbsp;Your senior design faculty
                </div>
              </Form.Item>
              <Form.Item
                {...ScheduleFormLayoutConstants.layoutWithoutColumn}
              >
                <Button type="primary" htmlType="submit">
                  Verify yourself &amp; schedule presentation
                </Button>
              </Form.Item>
            </Form>
          )}
        </ScheduleLayout>
        <style jsx>{`
          .success {
            color: #52c41a;
          }
          .err {
            color: #f5222d;
          }
        `}</style>
      </AppLayout >
    );
  }
}

export default Form.create()(FillPresentation);