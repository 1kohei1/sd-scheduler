import * as React from 'react';
import { Form, Select, Input, Button, Icon } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { List } from 'immutable';

import InitialProps from '../../models/InitialProps';
import Group from '../../models/Group';
import Presentation, { newPresentation } from '../../models/Presentation';
import PresentationDate from '../../models/PresentationDate';
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
    }

    this.handleSubmit = this.handleSubmit.bind(this);
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

      // Present dialog to verify user belongs to the group
    })
  }

  render() {
    const { group } = this.props;

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
                  initialValue: '',
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
                  initialValue: '',
                })(
                  <Input placeholder="Sponsor name" />
                )}
              </Form.Item>
              <Form.Item
                {...ScheduleFormLayoutConstants.layoutWithColumn}
                label="Sponsor members"
              >
                <div>Check the sample</div>
                <Button
                  type="dashed"
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
                  initialValue: '',
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
              <Form.Item
                {...ScheduleFormLayoutConstants.layoutWithColumn}
                label="Other department faculties"
              >

                <Button
                  type="dashed"
                >
                  <Icon type="plus" /> Add other department faculty
              </Button>
              </Form.Item>
              <Form.Item
                {...ScheduleFormLayoutConstants.layoutWithoutColumn}
              >
                <Button type="primary">
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