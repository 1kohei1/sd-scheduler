import * as React from 'react';
import { List } from 'immutable';
import { Table, Switch, Card, Tooltip, Icon, Button } from 'antd';

import AppLayout from '../components/AppLayout';
import InitialProps from '../models/InitialProps';
import Api from '../utils/Api';
import Loading from '../components/Loading';
import UserUtil from '../utils/UserUtil';
import Faculty from '../models/Faculty';

interface EditableFaculty extends Faculty {
  editing: boolean;
}

export interface FacultiesPageProps {
}

interface FacultiesPageState {
  loading: boolean;
  faculties: List<Faculty>;
  facultiesInForm: List<EditableFaculty>;
  errs: List<string>;
}

export default class FacultiesPage extends React.Component<FacultiesPageProps, FacultiesPageState> {
  static async getInitialProps(context: InitialProps) {
    await UserUtil.checkAuthentication(context);
    return {};
  }

  constructor(props: FacultiesPageProps) {
    super(props);

    this.state = {
      loading: true,
      faculties: List<Faculty>(),
      facultiesInForm: List<EditableFaculty>(),
      errs: List<string>(),
    }

    this.edit = this.edit.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  componentDidMount() {
    this.getFaculties();
  }

  onErr(err: string) {
    this.setState((prevState: FacultiesPageState, props: FacultiesPageProps) => {
      return {
        errs: prevState.errs.push(err),
        loading: false,
      };
    });
  }

  private async getFaculties() {
    try {
      const faculties = await Api.getFaculties();
      this.setState({
        faculties: List(faculties),
        facultiesInForm: List(faculties),
        loading: false,
      });
    } catch (err) {
      this.onErr(err);
    }
  }

  tableColumns() {
    return [{
      title: 'First name',
      dataIndex: 'firstName',
      render: (value: string, faculty: EditableFaculty) => (
        <div key={`${faculty._id}_firstName`}>
          {faculty.editing ? (
            <div>Editing</div>
          ) : (
              <div>{value}</div>
            )}
        </div>
      ),
    }, {
      title: 'Last name',
      dataIndex: 'lastName',
      render: (value: string, faculty: EditableFaculty) => (
        <div key={`${faculty._id}_lastName`}>
          {faculty.editing ? (
            <div>Editing</div>
          ) : (
              <div>{value}</div>
            )}
        </div>
      ),
    }, {
      title: 'Email',
      dataIndex: 'email',
      render: (value: string, faculty: EditableFaculty) => (
        <div key={`${faculty._id}_email`}>
          {faculty.editing ? (
            <div>Editing</div>
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
      render: (value: boolean, faculty: Faculty) => (
        <Switch
          defaultChecked={value}
          disabled
        />
      ),
    }, {
      title: 'Action',
      render: (faculty: EditableFaculty, record: EditableFaculty, index: number) => (
        <div>
          {faculty.editing ? (
            <div>
              <Button
                size="small"
                style={{ marginRight: '8px' }}
                onClick={e => this.edit(index)}
              >
                Save
              </Button>
              <Button
                size="small"
                onClick={e => this.cancel(index)}
              >
                Cancel
              </Button>
            </div>
          ) : (
              <Button
                size="small"
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
      facultiesInForm: facultiesInForm.set(index, faculty),
    })
  }

  render() {
    return (
      <AppLayout
        selectedMenu={['faculties']}
      >
        <div className="container">
          <h1>Faculties</h1>
          {this.state.loading ? <Loading /> : (
            <Table
              dataSource={this.state.facultiesInForm.toArray()}
              columns={this.tableColumns()}
              rowKey={faculty => faculty._id}
            />
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
