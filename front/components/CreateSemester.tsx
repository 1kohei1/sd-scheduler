import * as React from 'react';
import { Table, Alert, Divider, Button, message } from 'antd';
import { List } from 'immutable';

import { Semester } from '../models/Semester';
import SemesterUtil from '../utils/SemesterUtil';
import Api from '../utils/Api';

export interface CreateSemesterProps {
}

interface CreateSemesterState {
  errs: List<string>;
  loading: boolean;
  semesters: Semester[];
  newSemesterKey: string;
  newSemesterDisplayName: string;
}

export default class CreateSemester extends React.Component<CreateSemesterProps, CreateSemesterState> {
  constructor(props: CreateSemesterProps) {
    super(props);

    let currentSeason = SemesterUtil.currentSeason();
    currentSeason = currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1);

    this.state = {
      errs: List<string>(),
      loading: false,
      semesters: [],
      newSemesterKey: SemesterUtil.defaultSemester(),
      newSemesterDisplayName: `${SemesterUtil.currentYear()} ${currentSeason}`,
    }

    this.onClick = this.onClick.bind(this);
  }

  onErr(err: string) {
    this.setState({
      errs: this.state.errs.push(err),
    });
  }

  componentDidMount() {
    this.getSemesters()
      .catch(err => {
        this.onErr(err.message);
      })
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

  columns() {
    return [{
      title: 'key',
      dataIndex: 'key'
    }, {
      title: 'displayName',
      dataIndex: 'displayName',
    }];
  }

  async onClick() {
    const body = {
      key: this.state.newSemesterKey,
      displayName: this.state.newSemesterDisplayName,
    };
    this.setState({
      loading: true,
    })

    try {
      const newSemester = await Api.createSemester(body);
      message.success('Successfully created a semester');
      this.setState({
        semesters: this.state.semesters.concat(newSemester),
        loading: false,
      });
    } catch (err) {
      this.onErr(err);
    }

  }

  render() {
    return (
      <div>
        <h3>Create a semester</h3>
        {this.state.errs.map((err: string, index: number) => (
          <Alert
            key={index}
            type="error"
            message={err}
          />
        ))}
        <Table
          dataSource={this.state.semesters}
          columns={this.columns()}
          pagination={false}
          rowKey="_id"
        />
        <p><b>New semester</b></p>
        <p>key: {this.state.newSemesterKey}</p>
        <p>displayName: {this.state.newSemesterDisplayName}</p>
        <Button
          type="primary"
          onClick={this.onClick}
          loading={this.state.loading}
        >
          Create a semester
        </Button>
        <Divider />
      </div>
    );
  }
}
