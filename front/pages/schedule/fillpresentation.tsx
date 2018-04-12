import * as React from 'react';
import { Row, Col, Form, Select, Input, Button, Icon } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { List, Map } from 'immutable';
import ObjectID from 'bson-objectid';

import InitialProps from '../../models/InitialProps';
import Group from '../../models/Group';
import Presentation, { NewPresentation } from '../../models/Presentation';
import PresentationDate from '../../models/PresentationDate';
import Person, { NewPerson } from '../../models/Person';
import Api from '../../utils/Api';
import AppLayout from '../../components/AppLayout';
import ScheduleLayout from '../../components/ScheduleLayout';
import Loading from '../../components/Loading';
import { ScheduleFormLayoutConstants } from '../../models/Constants';

export interface FillPresentationProps {
  form: WrappedFormUtils;
  group: Group;
}

interface FillPresentationState {
  loading: boolean;
  saving: boolean;
  errs: List<string>;

  schedulingPresentation: Map<keyof Presentation, any>;
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

      schedulingPresentation: Map<keyof Presentation, any>(NewPresentation(this.props.group.semester, this.props.group)),
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
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
        this.setState({
          loading: false,
        })
      })
      .catch(err => {
        this.onErr(err.message);
      })
  }

  private async getFaculties() {

  }

  private async getPresentationDate() {

  }

  private async getPresentations() {

  }

  private async getAvailableSlots() {

  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
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

      // Check if state.schedulingPresentation._id exists in state.allPresentations and pass _id if it exists to verification modal
      // Present dialog to verify user belongs to the group
      console.log(values);
    })
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

  render() {
    const { group } = this.props;
    const schedulingPresentation = this.state.schedulingPresentation.toObject();

    const sponsorsLayout = schedulingPresentation.sponsors.length === 0 ?
      ScheduleFormLayoutConstants.layoutWithColumn :
      ScheduleFormLayoutConstants.layoutWithoutColumn;
    const externalFacultiesLayout = schedulingPresentation.externalFaculties.length === 0 ?
      ScheduleFormLayoutConstants.layoutWithColumn :
      ScheduleFormLayoutConstants.layoutWithoutColumn;

    return (
      <AppLayout>
        <ScheduleLayout
          current={1}
          groupNumber={group.groupNumber}
          description={`Please fill the presentation detail for group ${group.groupNumber}`}
        >
          {this.state.loading ? <Loading /> : (
            <Form onSubmit={this.handleSubmit}>
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
                {...sponsorsLayout}
                label={schedulingPresentation.sponsors.length === 0 ? 'Sponsor members' : ''}
              >
                <Button
                  type="dashed"
                  onClick={e => this.add('sponsors')}
                >
                  <Icon type="plus" /> Add new sponsor member
              </Button>
              </Form.Item>
              <Form.Item
                {...ScheduleFormLayoutConstants.layoutWithColumn}
                label="Presentation date"
              >
                {this.props.form.getFieldDecorator('start', {
                  rules: [{
                    required: true,
                    message: 'Please provide the presentation time',
                  }],
                  initialValue: schedulingPresentation.start,
                })(
                  <Select>
                    <Select.Option
                      value="abc"
                    >
                      abc
                  </Select.Option>
                  </Select>
                )}
              </Form.Item>
              <Form.Item
                {...ScheduleFormLayoutConstants.layoutWithColumn}
                label="EECS faculties"
              >

              </Form.Item>
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
                {...externalFacultiesLayout}
                label={schedulingPresentation.externalFaculties.length === 0 ? 'Other department faculties' : ''}
              >
                <Button
                  type="dashed"
                  onClick={e => this.add('externalFaculties')}
                >
                  <Icon type="plus" /> Add other department faculty
              </Button>
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
      </AppLayout>
    );
  }
}

export default Form.create()(FillPresentation);