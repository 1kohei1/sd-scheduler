import * as React from 'react';
import { Set } from 'immutable';
import { Layout } from 'antd';
import { ClickParam } from 'antd/lib/menu';

import InitialProps from '../models/InitialProps';
import DashboardQuery from '../models/DashboardQuery';
import { Semester } from '../models/Semester';
import AppLayout from '../components/AppLayout';
import DashboardSider from '../components/DashboardSider';
import Overview from '../components/Overview';
import MyCalendar from '../components/MyCalendar';
import Api from '../utils/Api';
import UserUtil from '../utils/UserUtil';
import SemesterUtil from '../utils/SemesterUtil';
import Faculty from '../models/Faculty';
import GroupView from '../components/GroupView';

export interface DashboardProps {
  url: InitialProps;
  semesters: Semester[];
  user: Faculty;
}

interface DashboardState {
  semester: string;
  menu: string;
  openKeys: Set<string>;
}

export default class Dashboard extends React.Component<DashboardProps, DashboardState> {
  static async getInitialProps(context: InitialProps) {
    let asPath = '/dashboard';
    if (context.query.semester) {
      asPath += `/${context.query.semester}`;
    }
    if (context.query.menu) {
      asPath += `/${context.query.menu}`;
    }
    context.asPath = asPath;
    const user = await UserUtil.checkAuthentication(context);

    const semesters = await Api.getSemesters();

    return {
      user,
      semesters,
    }
  }

  constructor(props: DashboardProps) {
    super(props);

    this.state = this.stateFromQuery(props.url.query);

    this.onSubMenuTitleClick = this.onSubMenuTitleClick.bind(this);
    this.content = this.content.bind(this);
  }

  componentWillReceiveProps(nextProps: DashboardProps) {
    this.setState(this.stateFromQuery(nextProps.url.query));
  }

  private stateFromQuery(query: DashboardQuery) {
    const state: DashboardState = {
      semester: SemesterUtil.defaultSemester(),
      menu: SemesterUtil.defaultMenu,
      openKeys: Set()
    };

    // This validation check will be replaced with checking if key semester exists in given semesters
    if (SemesterUtil.isValidSemester(query.semester)) {
      state.semester = query.semester as string;
    }
    if (SemesterUtil.isValidMenu(query.menu)) {
      state.menu = query.menu as string;
    }
    if (query.openKeys) {
      state.openKeys = Set(query.openKeys.split(','));
    } else {
      state.openKeys = state.openKeys.add(`${state.semester}`);
    }

    return state;
  }

  onSubMenuTitleClick({ key }: ClickParam) {
    this.setState((prevState, props) => {
      if (prevState.openKeys.includes(key)) {
        return {
          openKeys: prevState.openKeys.delete(key)
        }
      } else {
        return {
          openKeys: prevState.openKeys.add(key)
        }
      }
    });
  }

  content(menu: string, semester: Semester) {
    if (!semester) {
      return null;
    }

    if (menu === 'overview') {
      return (
        <Overview
          user={this.props.user}
          semester={semester}
        />
      )
    } else if (menu === 'calendar') {
      return (
        <MyCalendar
          user={this.props.user}
          semester={semester}
        />
      )
    } else if (menu === 'group') {
      return (
        <GroupView
          user={this.props.user}
          semester={semester}
        />)
    } else {
      return <div>Unknow menu is selected</div>
    }
  }

  render() {
    const semester: Semester = this.props.semesters.find((semester) => semester.key === this.state.semester) as Semester;

    return (
      <AppLayout
        selectedMenu={['dashboard']}
      >
        <Layout style={{ backgroundColor: 'white' }}>
          <Layout.Sider style={{ backgroundColor: 'white' }}>
            <DashboardSider
              semesters={this.props.semesters}
              openKeys={this.state.openKeys.toArray()}
              selectedKeys={[`${this.state.semester}_${this.state.menu}`]}
              user={this.props.user}
              onSubMenuTitleClick={this.onSubMenuTitleClick}
            />
          </Layout.Sider>
          <Layout.Content style={{ backgroundColor: 'white', minHeight: "calc(100vh - 64px)", padding: '32px' }}>
            {this.content(this.state.menu, semester)}
          </Layout.Content>
        </Layout>
      </AppLayout>
    );
  }
}
