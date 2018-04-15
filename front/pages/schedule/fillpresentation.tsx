import * as React from 'react';
import { Row, Col, Form, Select, Input, Button, Icon, Alert, Checkbox, Tooltip, Modal } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { List, Map } from 'immutable';
import Link from 'next/link'
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
      formSubmitted: false,
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onPresentationDatetimeChange = this.onPresentationDatetimeChange.bind(this);
  }

  onErr(err: string) {
    this.setState({
      errs: this.state.errs.push(err),
      loading: false,
      saving: false,
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
        // Since onPresentationDatetimeChange does not fire when the initial value is set, manually call the function
        this.onPresentationDatetimeChange(this.state.schedulingPresentation.get('start'));
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

  async schedulePresentation(change: any) {
    this.setState({
      saving: true,
    });

    const presentation = this.state.allPresentations
      .find((presentation: Presentation) => presentation._id === this.state.schedulingPresentation.get('_id'))

    try {
      if (presentation) {
        await Api.updatePresentation(presentation._id, change);
      } else {
        await Api.createPresentation(change);
      }
      this.setState({
        saving: false,
      });
      const ref = Modal.success({
        title: 'Successfully scheduled the presentation!',
        width: '520px',
        content: (
          <div>
            All the people to be present at the presentation (group members, faculties, sponsors) will soon receive emails about your presentation datetime and location!
          </div>
        ),
        okText: 'Navigate to the semester calendar',
        onOk: () => {
          ref.destroy();
          Api.redirect(
            undefined,
            '/'
          );
        }
      })
    } catch (err) {
      this.onErr(err.message)
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
      if (this.threeCommitteeMemberValidation() !== 'success' || this.twoEECSCommitteeMemberValidation() !== 'success') {
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

      // Set faculties
      values.faculties = this.getCommitteeMemberIds();
      // Committee member doesn't include the senior design faculty. 
      // So add to it
      values.faculties.push(this.props.group.adminFaculty);

      // Set end
      const startMoment = DatetimeUtil.getMomentFromISOString(values.start);
      values.end = DatetimeUtil.addToMoment(startMoment, 1, 'h').toISOString();

      // Set group
      values.group = this.props.group._id;

      // Set semester
      values.semester = this.props.group.semester;

      // Schedule presentation
      this.schedulePresentation(values);
    })
  }

  // Returns committee ids who will join the presentation
  private getCommitteeMemberIds() {
    // cannot use this.props.form.getFieldValue('faculties'). 
    // Using that registers faculty field with the value undefined. 
    // And that messes up the format of faculties[_id].checked
    if (this.state.availableFaculties.length === 0) {
      return [];
    }
    const faculties = this.props.form.getFieldValue('faculties');
    return Object.entries(faculties)
      .filter(([_id, obj]: [string, { checked: boolean }]) => obj.checked)
      .map(([_id, obj]: [string, { checked: boolean }]) => _id);
  }

  threeCommitteeMemberValidation() {
    const committeeIds = this.getCommitteeMemberIds();
    const externalFaculties = this.state.schedulingPresentation.get('externalFaculties');
    if (committeeIds.length + externalFaculties.length >= 3) {
      return 'success';
    } else if (this.state.formSubmitted) {
      return 'err';
    } else {
      return '';
    }
  }

  twoEECSCommitteeMemberValidation() {
    const committeeIds = this.getCommitteeMemberIds();
    if (committeeIds.length >= 2) {
      return 'success';
    } else if (this.state.formSubmitted) {
      return 'err';
    } else {
      return '';
    }
  }

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

  onDateChange() {
    // When different date is selected for the presentation, empty the start
    this.props.form.setFieldsValue({
      start: undefined
    });
    // Reset availableFaculties
    this.onPresentationDatetimeChange('');
  }

  onPresentationDatetimeChange(isostring: string) {
    if (isostring === '') {
      this.setState({
        availableFaculties: [],
      });
      return;
    }
    const startMoment = DatetimeUtil.getMomentFromISOString(isostring);
    const endMoment = DatetimeUtil.addToMoment(startMoment, 1, 'h');
    const presentationSlot = {
      _id: 'dummy id',
      start: startMoment,
      end: endMoment,
    };

    this.setState({
      availableFaculties: this.state.allFaculties.filter((faculty: Faculty) => {
        // Don't show admin member in available committee
        if (faculty.isAdmin) {
          return false;
        }
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

  sponsorMembersTooltip() {
    return (
      <Tooltip
        title="Sponsors who will join your presentation."
      >
        Sponsor members <Icon type="question-circle-o" />
      </Tooltip>
    )
  }

  availableFacultiesTooltip() {
    return (
      <Tooltip
        title="Please check faculties you would like to invite to the presentation. If you don't see the professor who confirmed to join your presentation, please talk with your senior design faculty."
      >
        EECS available committee <Icon type="question-circle-o" />
      </Tooltip>
    )
  }

  otherDepartmentFacultiesTooltip() {
    return (
      <Tooltip
        title="If you would like to invite faculties outside of EECS, please enter faculty information here."
      >
        Other department faculties <Icon type="question-circle-o" />
      </Tooltip>
    )
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
              {this.state.errs.map((err: string, index: number) => (
                <Alert
                  showIcon
                  type="error"
                  key={index}
                  style={{ marginBottom: '8px' }}
                  message="Error"
                  description={err}
                />
              ))}
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
                  initialValue: schedulingPresentation.sponsorName,
                })(
                  <Input placeholder="Sponsor name" />
                )}
              </Form.Item>
              {schedulingPresentation.sponsors.length === 0 ? (
                <Form.Item
                  {...ScheduleFormLayoutConstants.layoutWithColumn}
                  label={this.sponsorMembersTooltip()}
                >
                  <Button
                    type="dashed"
                    onClick={e => this.add('sponsors')}
                  >
                    <Icon type="plus" /> Add sponsor member
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
                              label={this.sponsorMembersTooltip()}
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
                        <Icon type="plus" /> Add sponsor member
                      </Button>
                    </Form.Item>
                  </div>
                )}
              <Row>
                <Col
                  {...ScheduleFormLayoutConstants.layoutWithColumn.labelCol}
                  style={{ textAlign: 'right' }}
                >
                  <Form.Item
                    label="Presentation time"
                    required={true}
                  >
                  </Form.Item>
                </Col>
                <Col
                  {...ScheduleFormLayoutConstants.layoutWithColumn.wrapperCol}
                >
                  <Row gutter={8}>
                    <Col xs={24} sm={12}>
                      <Form.Item>
                        {this.props.form.getFieldDecorator('startDate', {
                          rules: [{
                            required: true,
                            message: 'Please provide the presentation date'
                          }],
                          initialValue: schedulingPresentation.start ?
                            DatetimeUtil.formatISOString(schedulingPresentation.start, DateConstants.dateFormat) :
                            undefined
                        })(
                          <Select
                            placeholder="Presentation date"
                            onChange={this.onDateChange}
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
                        )}
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item>
                        {this.props.form.getFieldDecorator('start', {
                          rules: [{
                            required: true,
                            message: 'Please provide the presentation time'
                          }],
                          initialValue: schedulingPresentation.start ?
                            schedulingPresentation.start :
                            undefined
                        })(
                          <Select
                            disabled={!this.props.form.getFieldValue('startDate')}
                            onChange={this.onPresentationDatetimeChange}
                            placeholder="Presentation time"
                          >
                            {DatetimeUtil.getPresentationTimeOptions(
                              (this.state.presentationDate as PresentationDate).dates,
                              this.props.form.getFieldValue('startDate')
                            )
                              .map((isostring: string) => (
                                <Select.Option
                                  key={isostring}
                                  value={isostring}
                                >
                                  {DatetimeUtil.formatISOString(isostring, DateConstants.hourFormat)}
                                </Select.Option>
                              ))}
                          </Select>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Form.Item
                {...ScheduleFormLayoutConstants.layoutWithColumn}
                label="Senior design faculty"
              >
                <Checkbox
                  checked={true}
                  disabled={true}
                >
                  {
                    this.state.allFaculties.filter((faculty: Faculty) => faculty._id === this.props.group.adminFaculty)
                      .map((faculty: Faculty) => (
                        <span key={faculty._id}>
                          Dr. {faculty.firstName} {faculty.lastName}
                        </span>
                      ))
                  }
                </Checkbox>
              </Form.Item>
              {this.state.availableFaculties.length === 0 ? (
                <Form.Item
                  {...ScheduleFormLayoutConstants.layoutWithColumn}
                  label={this.availableFacultiesTooltip()}
                >
                  No committee members are available at specified time. Please change your presentation time.
                </Form.Item>
              ) : (
                  <div>
                    {this.state.availableFaculties.map((faculty: Faculty, index: number, arr: Faculty[]) => {
                      const layout = index === 0 ?
                        ScheduleFormLayoutConstants.layoutWithColumn :
                        ScheduleFormLayoutConstants.layoutWithoutColumn;
                      const isLast = arr.length - 1 === index;

                      return (
                        <Form.Item
                          key={faculty._id}
                          {...layout}
                          style={{ marginBottom: isLast ? '' : '0' }}
                          label={index === 0 ? this.availableFacultiesTooltip() : ''}
                        >
                          {this.props.form.getFieldDecorator(`faculties[${faculty._id}].checked`, {
                            initialValue: schedulingPresentation.faculties.indexOf(faculty._id) >= 0,
                            valuePropName: 'checked'
                          })(
                            <Checkbox
                            >
                              Dr. {faculty.firstName} {faculty.lastName}
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
                  label={this.otherDepartmentFacultiesTooltip()}
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
                              label={this.otherDepartmentFacultiesTooltip()}
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
                label="Validation for committees"
              >
                <div>You need to select</div>
                <div className={this.threeCommitteeMemberValidation()}>
                  <Icon type="check-circle-o" />&nbsp;At least 3 committee members
                </div>
                <div className={this.twoEECSCommitteeMemberValidation()}>
                  <Icon type="check-circle-o" />&nbsp;At least 2 EECS committee members
                </div>
              </Form.Item>
              <Form.Item
                {...ScheduleFormLayoutConstants.layoutWithoutColumn}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={this.state.saving}
                >
                  Schedule presentation
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