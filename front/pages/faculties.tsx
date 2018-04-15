import * as React from 'react';
import { List } from 'immutable';
import { Table, Switch, Tooltip, Icon, Button, Input, message } from 'antd';

import AppLayout from '../components/AppLayout';
import InitialProps from '../models/InitialProps';
import Api from '../utils/Api';
import Loading from '../components/Loading';
import UserUtil from '../utils/UserUtil';
import Faculty from '../models/Faculty';
import AddFaculties from '../components/AddFaculties';

interface EditableFaculty extends Faculty {
  editing: boolean;
}

export interface FacultiesPageProps {
  user: Faculty;
}

interface FacultiesPageState {
  loading: boolean;
  saving: boolean;
  faculties: List<Faculty>;
  facultiesInForm: List<EditableFaculty>;
  errs: List<string>;
}

export default class FacultiesPage extends React.Component<FacultiesPageProps, FacultiesPageState> {
  static async getInitialProps(context: InitialProps) {
    const user = await UserUtil.checkAuthentication(context);
    if (!user || !(user.isAdmin || user.isSystemAdmin)) {
      Api.redirect(context, '/dashboard');
    }

    return {
      user
    };
  }

  constructor(props: FacultiesPageProps) {
    super(props);

    this.state = {
      loading: true,
      saving: false,
      faculties: List<Faculty>(),
      facultiesInForm: List<EditableFaculty>(),
      errs: List<string>(),
    }

    this.edit = this.edit.bind(this);
    this.cancel = this.cancel.bind(this);
    this.change = this.change.bind(this);
    this.getFaculties = this.getFaculties.bind(this);
    this.onErr = this.onErr.bind(this);
  }

  componentDidMount() {
    this.getFaculties();
  }

  onErr(err: string) {
    this.setState((prevState: FacultiesPageState, props: FacultiesPageProps) => {
      return {
        errs: prevState.errs.push(err),
        loading: false,
        saving: false,
      };
    });
  }

  async getFaculties() {
    try {
      const faculties = await Api.getFaculties();
      const copyOfFaculties = faculties.map((faculty: Faculty) => ({ ...faculty }));

      this.setState({
        faculties: List(faculties),
        facultiesInForm: List(copyOfFaculties),
        loading: false,
      });
    } catch (err) {
      this.onErr(err.message);
    }
  }

  tableColumns() {
    return [{
      title: 'First name',
      dataIndex: 'firstName',
      render: (value: string, faculty: EditableFaculty, index: number) => (
        <div key={`${faculty._id}_firstName`}>
          {faculty.editing ? (
            <Input
              value={value}
              style={{ margin: '-6px 0' }}
              onChange={(e) => this.change(index, 'firstName', e.target.value)}
            />
          ) : (
              <div>{value}</div>
            )}
        </div>
      ),
    }, {
      title: 'Last name',
      dataIndex: 'lastName',
      render: (value: string, faculty: EditableFaculty, index: number) => (
        <div key={`${faculty._id}_lastName`}>
          {faculty.editing ? (
            <Input
              value={value}
              style={{ margin: '-6px 0' }}
              onChange={(e) => this.change(index, 'lastName', e.target.value)}
            />
          ) : (
              <div>{value}</div>
            )}
        </div>
      ),
    }, {
      title: 'Email',
      dataIndex: 'email',
      render: (value: string, faculty: EditableFaculty, index: number) => (
        <div key={`${faculty._id}_email`}>
          {faculty.editing ? (
            <Input
              value={value}
              style={{ margin: '-6px 0' }}
              onChange={(e) => this.change(index, 'email', e.target.value)}
            />
          ) : (
              <div>{value}</div>
            )}
        </div>
      ),
    }, {
      title: (
        <div>
          Active&nbsp;
          <Tooltip
            title="When faculty is active, students can select the faculty for the presentation. If faculty leaves UCF, please turn this switch off."
          >
            <Icon type="question-circle-o" style={{ fontSize: '14px' }} />
          </Tooltip>
        </div>
      ),
      dataIndex: 'isActive',
      render: (value: boolean, faculty: EditableFaculty, index: number) => (
        <Switch
          checked={value}
          disabled={!faculty.editing}
          onChange={(checked: boolean) => this.change(index, 'isActive', '')}
        />
      ),
    }, {
      title: 'Is password set',
      dataIndex: 'password_at',
      render: (value: boolean) => (
        <div>
          {value ? (
            <Icon type="check" style={{ fontSize: '20px' }} />
          ) : (
              <span></span>
            )}
        </div>
      ),
    }, {
      title: 'Action',
      render: (faculty: EditableFaculty, record: EditableFaculty, index: number) => (
        <div>
          {faculty.editing ? (
            <div>
              <Button
                size="small"
                loading={this.state.saving}
                style={{ marginRight: '8px' }}
                onClick={e => this.save(index)}
              >
                Save
              </Button>
              <Button
                size="small"
                loading={this.state.saving}
                onClick={e => this.cancel(index)}
              >
                Cancel
              </Button>
            </div>
          ) : (
              <Button
                size="small"
                loading={this.state.saving}
                onClick={e => this.edit(index)}
              >
                Edit
            </Button>
            )}
        </div>
      )
    }]
  }

  edit(index: number) {
    const { facultiesInForm } = this.state;
    const faculty: EditableFaculty = facultiesInForm.get(index);
    faculty.editing = true;
    this.setState({
      facultiesInForm: facultiesInForm.set(index, faculty),
    })
  }

  cancel(index: number) {
    const { faculties, facultiesInForm } = this.state;
    const faculty: EditableFaculty = faculties.get(index) as EditableFaculty;
    faculty.editing = false;
    this.setState({
      facultiesInForm: facultiesInForm.set(index, ({ ...faculty })),
    })
  }

  change(index: number, prop: 'firstName' | 'lastName' | 'email' | 'isActive', value: string) {
    const { facultiesInForm } = this.state;
    const faculty: EditableFaculty = facultiesInForm.get(index);

    if (prop === 'isActive') {
      faculty[prop] = !faculty[prop];
    } else {
      faculty[prop] = value;
    }

    this.setState({
      facultiesInForm: facultiesInForm.set(index, faculty),
    })
  }

  async save(index: number) {
    this.setState({
      saving: true,
    });

    const { faculties, facultiesInForm } = this.state;
    const faculty: EditableFaculty = facultiesInForm.get(index);

    const change = {
      firstName: faculty.firstName,
      lastName: faculty.lastName,
      email: faculty.email,
      isActive: faculty.isActive,
    }

    try {
      const updatedFaculty = await Api.updateFaculty(faculty._id, change);
      message.success('Successfully updated');
      this.setState({
        faculties: faculties.set(index, updatedFaculty),
        facultiesInForm: facultiesInForm.set(index, { ...updatedFaculty }),
        saving: false,
      });

      if (updatedFaculty._id === this.props.user._id) {
        UserUtil.updateUser();
      }
    } catch (err) {
      this.onErr(err.message);
    }
  }

  render() {
    return (
      <AppLayout
        selectedMenu={['faculties']}
      >
        <div className="container">
          <h1>Faculties</h1>
          {this.state.loading ? <Loading /> : (
            <div>
              <Table
                dataSource={this.state.facultiesInForm.toArray()}
                columns={this.tableColumns()}
                pagination={false}
                rowKey="_id"
                style={{ marginBottom: '32px' }}
              />
              <AddFaculties
                getFaculties={this.getFaculties}
              />
            </div>
          )}
        </div>
        <style jsx>
          {`
          .container {
            padding: 32px;
          }
        `}
        </style>
      </AppLayout>
    );
  }
}
