import * as React from 'react';
import { Row, Col, Form, Icon, Input, Button, Alert, Tooltip } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import Group from '../models/Group';

export interface FillGroupInfoProps {
  form: WrappedFormUtils;
  group: Group;
  addSponsor: () => void;
  onFillGroupInfoRef: (fillGroupInfoRef: any) => void;
  deleteSponsor: (_id: string) => void;
  schedulePresentation: (groupInfo: object) => void;
}

class FillGroupInfo extends React.Component<FillGroupInfoProps, any> {
  constructor(props: FillGroupInfoProps) {
    super(props);

    this.state = {}

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.props.onFillGroupInfoRef(this);
  }

  componentWillUnmount() {
    this.props.onFillGroupInfoRef(undefined);
  }

  formLayout() {
    return {
      labelCol: {
        md: {
          span: 4,
        },
        style: {
          textAlign: 'left',
        }
      },
      wrapperCol: {
        md: {
          span: 20,
        },
      }
    }
  }

  buttonLayout() {
    return {
      wrapperCol: {
        md: {
          span: 20,
          offset: 4,
        }
      }
    }
  }

  handleSubmit(e: React.FormEvent<any>) {
    if (e) {
      e.preventDefault();
    }

    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }

      const formSponsors = values.sponsors;
      let sponsors: object[] = [];
      if (values.hasOwnProperty('sponsors')) {
        sponsors = Object.entries(formSponsors)
        .map(([_id, sponsor]) => sponsor);
      }

      values.sponsors = sponsors;

      this.props.schedulePresentation(values);
    })
  }

  membersLabel() {
    return (
      <span>
        Members&nbsp;
        <Tooltip
          title="Group members are already registered. If you don't find your email, please report that from the right bottom chat baloon."
        >
          <Icon type="question-circle-o" />
        </Tooltip>
      </span>
    )
  }

  sponsorsLabel() {
    return (
      <span>
        Sponsors&nbsp;
        <Tooltip
          title="Please enter sponsor information. The system will send reminding emails one day before and one hour before your presentation."
        >
          <Icon type="question-circle-o" />
        </Tooltip>
      </span>
    )
  }

  render() {
    const { group } = this.props;

    return (
      <div className="fillgroupinfo-container">
        <h2>Group {group.groupNumber}</h2>
        <p>Please enter your group information.</p>
        <Form onSubmit={this.handleSubmit}>
          <Form.Item
            label="Project name"
            {...this.formLayout()}
          >
            {this.props.form.getFieldDecorator('projectName', {
              rules: [{
                required: true,
                message: 'Please fill the project name'
              }],
              initialValue: group.projectName,
            })(
              <Input
                placeholder="Project name"
              />
            )}
          </Form.Item>
          <Form.Item
            label="Sponsor name"
            {...this.formLayout()}
          >
            {this.props.form.getFieldDecorator('sponsorName', {
              rules: [{
                required: true,
                message: 'Please fill the sponsor name'
              }],
              initialValue: group.sponsorName,
            })(
              <Input
                placeholder="Sponsor name"
              />
            )}
          </Form.Item>
          {group.members.map((member, index) => (
            <Row
              key={member._id}
            >
              <Col
                {...this.formLayout().labelCol}
              >
                {index === 0 && (
                  <Form.Item
                    label={this.membersLabel()}
                  >
                  </Form.Item>
                )}
              </Col>
              <Col
                {...this.formLayout().wrapperCol}
                style={{ display: 'flex' }}
              >
                <Form.Item
                  style={{ width: '0' }}
                >
                  {this.props.form.getFieldDecorator(`members[${index}]._id`, {
                    initialValue: member._id,
                  })(
                    <Input />
                  )}
                </Form.Item>
                <Form.Item
                  style={{ marginRight: '8px', width: '240px' }}
                >
                  {this.props.form.getFieldDecorator(`members[${index}].firstName`, {
                    rules: [{
                      required: true,
                      message: 'Please enter the first name',
                    }],
                    initialValue: member.firstName,
                  })(
                    <Input
                      placeholder="First name"
                    />
                  )}
                </Form.Item>
                <Form.Item
                  style={{ marginRight: '8px', width: '240px' }}
                >
                  {this.props.form.getFieldDecorator(`members[${index}].lastName`, {
                    rules: [{
                      required: true,
                      message: 'Please enter the last name',
                    }],
                    initialValue: member.lastName,
                  })(
                    <Input
                      placeholder="Last name"
                    />
                  )}
                </Form.Item>
                <Form.Item
                  style={{ marginRight: '8px', width: '240px' }}
                >
                  {this.props.form.getFieldDecorator(`members[${index}].email`, {
                    rules: [{
                      required: true,
                      message: 'Please enter the last name',
                    }],
                    initialValue: member.email,
                  })(
                    <Input
                      placeholder="Email"
                      disabled
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          ))}
          {group.sponsors.length === 0 && (
            <Form.Item
              label={this.sponsorsLabel()}
              {...this.formLayout()}
            >
              No sponsor is registered.
            </Form.Item>
          )}
          {group.sponsors.map((sponsor, index) => (
            <Row
              key={sponsor._id}
            >
              <Col
                {...this.formLayout().labelCol}
              >
                {index === 0 && (
                  <Form.Item
                    label={this.sponsorsLabel()}
                  >
                  </Form.Item>
                )}
              </Col>
              <Col
                {...this.formLayout().wrapperCol}
                style={{ display: 'flex' }}
              >
                <Form.Item
                  style={{ width: '0' }}
                >
                  {this.props.form.getFieldDecorator(`sponsors[${sponsor._id}]._id`, {
                    initialValue: sponsor._id,
                  })(
                    <Input />
                  )}
                </Form.Item>
                <Form.Item
                  style={{ marginRight: '8px', width: '240px' }}
                >
                  {this.props.form.getFieldDecorator(`sponsors[${sponsor._id}].firstName`, {
                    rules: [{
                      required: true,
                      message: 'Please enter the first name',
                    }],
                    initialValue: sponsor.firstName,
                  })(
                    <Input
                      placeholder="First name"
                    />
                  )}
                </Form.Item>
                <Form.Item
                  style={{ marginRight: '8px', width: '240px' }}
                >
                  {this.props.form.getFieldDecorator(`sponsors[${sponsor._id}].lastName`, {
                    rules: [{
                      required: true,
                      message: 'Please enter the last name',
                    }],
                    initialValue: sponsor.lastName,
                  })(
                    <Input
                      placeholder="Last name"
                    />
                  )}
                </Form.Item>
                <Form.Item
                  style={{ marginRight: '8px', width: '240px' }}
                >
                  {this.props.form.getFieldDecorator(`sponsors[${sponsor._id}].email`, {
                    rules: [{
                      required: true,
                      message: 'Please enter the last name',
                    }, {
                      type: 'email',
                      message: 'It is not valid email',
                    }],
                    initialValue: sponsor.email,
                  })(
                    <Input
                      placeholder="Email"
                    />
                  )}
                </Form.Item>
                <Form.Item>
                  <Button icon="delete" shape="circle" onClick={e => this.props.deleteSponsor(sponsor._id)} />
                </Form.Item>
              </Col>
            </Row>
          ))}
          <Form.Item
            {...this.buttonLayout()}
          >
            <Button
              type="dashed"
              onClick={this.props.addSponsor}
              style={{ width: '200px' }}
            >
              <Icon type="plus" /> Add new sponsor
            </Button>
          </Form.Item>
        </Form>
        <style jsx>{`
          .fillgroupinfo-container {
            margin-top: 16px;
            margin-left: 46px;
            margin-right: 46px;
          }
        `}</style>
      </div>
    );
  }
}

export default Form.create()(FillGroupInfo);