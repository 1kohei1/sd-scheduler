import * as React from 'react';
import { Form, Icon, Card, Button, Alert, Tag, List, Switch } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';

import { Semester } from '../models/Semester';
import Faculty from '../models/Faculty';
import Api from '../utils/Api';

export interface FacultiesProps {
  form: WrappedFormUtils,
  prop: string;
  isAdmin: boolean;
  semester: Semester,
  editing: boolean;
  updating: boolean;
  error: string;
  toggleForm: (menu: string) => void;
  updateSemester: (updateObj: any, menu: string) => void;
}

interface FacultiesState {
  user: Faculty | undefined;
  loading: boolean;
  faculties: Faculty[];
}

class Faculties extends React.Component<FacultiesProps, FacultiesState> {
  constructor(props: FacultiesProps) {
    super(props);

    this.state = {
      user: undefined,
      loading: true,
      faculties: [],
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.extra = this.extra.bind(this);
    this.info = this.info.bind(this);
    this.form = this.form.bind(this);
    this.onReload = this.onReload.bind(this);
  }

  onReload() {
    this.setState({
      loading: true,
    });
    this.getFaculties();
  }

  componentDidMount() {
    this.getFaculties();
  }

  private async getFaculties() {
    const faculties = await Api.getFaculties() as Faculty[];
    faculties.sort((a, b) => {
      if (a.firstName < b.firstName) {
        return -1;
      } else if (a.firstName > b.firstName) {
        return 1;
      } else {
        return 0;
      }
    });
    this.setState({
      faculties,
      loading: false,
    });
  }

  handleSubmit(e: React.FormEvent<any>) {
    e.preventDefault();

    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }

      const checkedFacultyIds = Object.entries(values).filter(([_id, isChecked]) => isChecked).map(([_id]) => _id);
      const key = this.props.prop;
      const updateObj = {
        [key]: checkedFacultyIds,
      };

      this.props.updateSemester(updateObj, key);
    })
  }

  extra() {
    const isArchived = false;

    let extra: string | JSX.Element = '';
    if (this.props.isAdmin && !isArchived && this.props.editing) {
      return (<Button
        icon="close"
        size="small"
        loading={this.props.updating}
        onClick={(e) => this.props.toggleForm(this.props.prop)}
      >
        Cancel
      </Button>);
    } else if (this.props.isAdmin && !isArchived) {
      return (<Button ghost
        type="primary"
        size="small"
        onClick={(e) => this.props.toggleForm(this.props.prop)}
      >
        Edit faculties
      </Button>);
    } else {
      return '';
    }
  }

  info() {
    if (this.props.semester.faculties && this.props.semester.faculties.length > 0) {
      return (
        <div>
          {this.props.semester.faculties.map((_id: string) => {
            const faculty = this.state.faculties.find(faculty => {
              return faculty._id === _id;
            });
            if (faculty) {
              return <div key={_id}>
                Dr. {faculty.firstName} {faculty.lastName}
              </div>
            } else {
              return null;
            }
          })}
        </div>
      )
    } else {
      return <div>No faculties are found.</div>
    }
  }

  form() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Item>
          Editing is <Tag>Admin only</Tag>feature
        </Form.Item>
        {this.props.error && (
          <Form.Item>
            <Alert message={this.props.error} type="error" />
          </Form.Item>
        )}
        <Form.Item>
          <Button
            loading={this.state.loading}
            onClick={this.onReload}
            style={{ marginRight: '8px' }}
          >
            {this.state.loading ? 'Loading' : 'Reload faculties'}
          </Button>
          Students can request checked faculties for their final presentations.
        </Form.Item>
        {!this.state.loading && (
          <Form.Item>
            <List
              size="small"
              dataSource={this.state.faculties}
              bordered
              renderItem={(faculty: Faculty) => (
                <List.Item
                  actions={[getFieldDecorator(faculty._id, {
                    initialValue: this.props.semester.faculties.indexOf(faculty._id) >= 0,
                    valuePropName: 'checked',
                  })(
                    <Switch />
                  )]}
                  key={faculty._id}
                >
                  Dr. {faculty.firstName} {faculty.lastName}
                </List.Item>
              )}
            />
          </Form.Item>
        )}
        {!this.state.loading && (
          <Form.Item>
            <Button
              htmlType="submit"
              type="primary"
              style={{ marginRight: '16px' }}
              loading={this.props.updating}
            >
              Update
            </Button>
            <Button
              onClick={(e) => this.props.toggleForm(this.props.prop)}
              loading={this.props.updating}
            >
              Cancel
            </Button>
          </Form.Item>
        )}
      </Form>
    )
  }

  render() {
    return (
      <Card title="Faculty" extra={this.extra()} style={{ marginBottom: '16px' }}>
        {this.props.editing ? this.form() : this.info()}
      </Card>
    );
  }
}


export default Form.create()(Faculties);