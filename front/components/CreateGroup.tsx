import * as React from 'react';
import { Form, Select, Table, Alert, Divider, Button, Input, Icon, message } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { List } from 'immutable';

import { Semester } from '../models/Semester';
import Faculty from '../models/Faculty';
import Group from '../models/Group';
import Person from '../models/Person';
import Loading from './Loading';
import Api from '../utils/Api';

export interface CreateGroupProps {
  form: WrappedFormUtils;
}

interface CreateGroupState {
  errs: List<string>;
  loading: boolean;
  saving: boolean;
  groupLoading: boolean;

  semesters: Semester[];
  adminFaculties: Faculty[];
  groups: Group[];
}

let uuid = 0;

class CreateGroup extends React.Component<CreateGroupProps, CreateGroupState> {
  constructor(props: CreateGroupProps) {
    super(props);

    this.state = {
      errs: List<string>(),
      loading: true,
      saving: false,
      groupLoading: false,

      semesters: [],
      adminFaculties: [],
      groups: [],
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.getGroups = this.getGroups.bind(this);
    this.add = this.add.bind(this);
  }

  onErr(err: string) {
    this.setState({
      errs: this.state.errs.push(err),
      loading: false,
      groupLoading: false,
    });
  }

  componentDidMount() {
    Promise.all([
      this.getAdminFaculties(),
      this.getSemesters(),
    ])
      .then(() => {
        this.setState({
          loading: false,
        });
      })
      .catch(err => {
        this.onErr(err.message);
      })
  }

  private async getAdminFaculties() {
    try {
      const adminFaculties = await Api.getFaculties(`isActive=true&isAdmin=true`);
      this.setState({
        adminFaculties,
      });
    } catch (err) {
      this.onErr(err.message);
    }
  }

  private async getSemesters() {
    try {
      const semesters = await Api.getSemesters();
      this.setState({
        semesters,
      });
    } catch (err) {
      this.onErr(err.message);
    }
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }

      try {
        const newGroup = await Api.systemadminGroupCreate(values);
        this.props.form.resetFields();
        message.success('Successfully created a group');
        this.setState({
          groups: this.state.groups.concat(newGroup),
        });
      } catch (err) {
        this.onErr(err);
      }
    })
  }

  async getGroups() {
    const semester = this.props.form.getFieldValue('semester');
    const adminFaculty = this.props.form.getFieldValue('adminFaculty');

    if (!semester || !adminFaculty) {
      return;
    }

    this.setState({
      groupLoading: true,
    });

    try {
      const groups = await Api.getGroups(`semester=${semester}&adminFaculty=${adminFaculty}`);
      this.setState({
        groups,
        groupLoading: false,
      })
    } catch (err) {
      this.onErr(err.message);
    }
  }

  columns() {
    return [{
      title: 'Group number',
      dataIndex: 'groupNumber'
    }, {
      title: 'Member',
      dataIndex: 'members',
      render: (members: Person[]) => (
        <span>
          {
            members
              .map((member: Person) => `${member.firstName} ${member.lastName}`)
              .join(', ')
          }
        </span>
      )
    }, {
      title: 'Email',
      key: 'email',
      dataIndex: 'members',
      render: (members: Person[]) => (
        <span>
          {
            members
              .map((member: Person) => member.email)
              .join(', ')
          }
        </span>
      )
    }]
  }

  add() {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(uuid);
    uuid++;
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys: nextKeys,
    });
  }

  render() {
    this.props.form.getFieldDecorator('keys', {
      initialValue: [],
    });
    const keys = this.props.form.getFieldValue('keys');

    return (
      <div>
        <h3>Create a group</h3>
        {this.state.errs.map((err: string, index: number) => (
          <Alert
            key={index}
            type="error"
            message={err}
          />
        ))}
        {this.state.loading ? <Loading /> : (
          <Form onSubmit={this.handleSubmit}>
            <Form.Item
              label="Semester"
            >
              {this.props.form.getFieldDecorator('semester', {
                rules: [{
                  required: true,
                  message: 'Required',
                }]
              })(
                <Select>
                  {this.state.semesters.map((semester: Semester) => (
                    <Select.Option
                      key={semester._id}
                      value={semester._id}
                    >
                      {semester.displayName}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item
              label="Admin faculty"
            >
              {this.props.form.getFieldDecorator('adminFaculty', {
                rules: [{
                  required: true,
                  message: 'Required',
                }]
              })(
                <Select>
                  {this.state.adminFaculties.map((faculty: Faculty) => (
                    <Select.Option
                      key={faculty._id}
                      value={faculty._id}
                    >
                      Dr. {faculty.firstName} {faculty.lastName}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Button onClick={this.getGroups}>
              Get groups
            </Button>
            <Table
              dataSource={this.state.groups}
              columns={this.columns()}
              loading={this.state.groupLoading}
              rowKey="_id"
            />
            <Form.Item
              label="Group number"
            >
              {this.props.form.getFieldDecorator('groupNumber', {
                rules: [{
                  required: true,
                  message: 'Required'
                }]
              })(
                <Input />
              )}
            </Form.Item>
            {keys.map((_id: number) => (
              <div className="members" key={_id}>
                <Form.Item style={{ marginRight: '8px' }}>
                  {this.props.form.getFieldDecorator(`members[${_id}].firstName`, {
                    rules: [{
                      required: true,
                      message: 'Required',
                    }]
                  })(
                    <Input placeholder="First name" />
                  )}
                </Form.Item>
                <Form.Item style={{ marginRight: '8px' }}>
                  {this.props.form.getFieldDecorator(`members[${_id}].lastName`, {
                    rules: [{
                      required: true,
                      message: 'Required',
                    }]
                  })(
                    <Input placeholder="Last name" />
                  )}
                </Form.Item>
                <Form.Item style={{ marginRight: '8px' }}>
                  {this.props.form.getFieldDecorator(`members[${_id}].email`, {
                    rules: [{
                      required: true,
                      message: 'Required',
                    }, {
                      type: 'email',
                      message: 'Not a valid email',
                    }],
                  })(
                    <Input placeholder="Email" />
                  )}
                </Form.Item>
              </div>
            ))}
            <Button
              type="dashed"
              onClick={this.add}
              style={{ marginBottom: '16px' }}
            >
              <Icon type="plus" /> Add member
            </Button>
            <Button
              type="primary"
              style={{ width: '100%' }}
              htmlType="submit"
            >
              Create a group
            </Button>
          </Form>
        )}
        <Divider />
        <style jsx>{`
          .members {
            display: flex;
          }
        `}</style>
      </div>
    );
  }
}

export default Form.create()(CreateGroup);