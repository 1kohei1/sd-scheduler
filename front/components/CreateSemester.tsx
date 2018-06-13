import * as React from 'react';
import { Table, Divider, Button, message } from 'antd';
import { List } from 'immutable';

import { Semester } from '../models/Semester';
import SemesterUtil from '../utils/SemesterUtil';
import Loading from './Loading';
import Api from '../utils/Api';

export interface CreateSemesterProps {
}

interface CreateSemesterState {
  errs: List<string>;
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

  onClick() {

  }

  render() {
    return (
      <div>
        <h3>Create a semester</h3>
        <Table
          dataSource={this.state.semesters}
          columns={this.columns()}
          rowKey="_id"
        />
        <p><b>New semester</b></p>
        <p>key: {this.state.newSemesterKey}</p>
        <p>displayName: {this.state.newSemesterDisplayName}</p>
        <Button
          type="primary"
          onClick={this.onClick}
        >
          Create a semester
        </Button>
        <Divider />
      </div>
    );
  }
}
