import * as React from 'react';
import { Form, Input, Card, Button, Icon, Alert, message } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import ObjectID from 'bson-objectid';
import { List } from 'immutable';

import Api from '../utils/Api';

export interface AddFacultiesProps {
  form: WrappedFormUtils;
  getFaculties: () => void;
}

interface AddFacultiesState {
  ids: List<string>;
  errs: List<string>;
}

class AddFaculties extends React.Component<AddFacultiesProps, AddFacultiesState> {
  constructor(props: AddFacultiesProps) {
    super(props);

    this.state = {
      ids: List<string>([ObjectID.generate()]),
      errs: List<string>(),
    }

    this.add = this.add.bind(this);
    this.delete = this.delete.bind(this);
    this.submit = this.submit.bind(this);
    this.onErr = this.onErr.bind(this);
  }

  onErr(err: string) {
    console.log(err);
    this.setState({
      errs: this.state.errs.push(err),
    })
  }

  add() {
    this.setState({
      ids: this.state.ids.push(ObjectID.generate()),
    })
  }

  delete(id: string) {
    const { ids } = this.state;
    const index = ids.indexOf(id);

    this.setState({
      ids: ids.delete(index),
    })
  }

  submit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }

      const promises = Object.entries(values)
        .map(([id, values]) => values)
        .map(newFaculty => Api.createFaculty(newFaculty));
      
      try {
        await Promise.all(promises);
        message.success('Faculties are registered to the system');
        this.props.getFaculties();
        this.setState({
          ids: List<string>([ObjectID.generate()]),
        })
      } catch (err) {
        this.onErr(err.message);
      }
    });
  }

  render() {
    return (
      <Card
        title="Add faculties"
      >
        <Form onSubmit={this.submit}>
          {this.state.errs.map((err: string, index: number) => (
            <Form.Item>
              <Alert
                key={index}
                message="Error"
                type="error"
                showIcon
                description={err}
              />
            </Form.Item>
          ))}
          {this.state.ids.map((id: string) => (
            <div style={{ display: 'flex' }}
              key={id}
            >
              <Form.Item style={{ marginRight: '8px' }}>
                {this.props.form.getFieldDecorator(`[${id}].firstName`, {
                  rules: [{
                    required: true,
                    message: 'Please enter first name',
                  }]
                })(
                  <Input placeholder="First name" />
                )}
              </Form.Item>
              <Form.Item style={{ marginRight: '8px' }}>
                {this.props.form.getFieldDecorator(`[${id}].lastName`, {
                  rules: [{
                    required: true,
                    message: 'Please enter last name',
                  }]
                })(
                  <Input placeholder="Last name" />
                )}
              </Form.Item>
              <Form.Item style={{ marginRight: '8px' }}>
                {this.props.form.getFieldDecorator(`[${id}].email`, {
                  rules: [{
                    required: true,
                    message: 'Please enter email',
                  }, {
                    type: 'email',
                    message: 'Please enter valid email'
                  }]
                })(
                  <Input placeholder="Email" />
                )}
              </Form.Item>
              <Form.Item>
                <Button
                  icon="delete"
                  shape="circle"
                  onClick={(e) => this.delete(id)}
                />
              </Form.Item>
            </div>
          ))}
          <Form.Item>
            <Button
              type="dashed"
              onClick={(e) => this.add()}
            >
              <Icon type="plus" />
              Add faculty
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
            >
              Save
          </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  }
}

export default Form.create()(AddFaculties);