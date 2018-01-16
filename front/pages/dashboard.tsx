import * as React from 'react';
import * as moment from 'moment';
import { Set } from 'immutable';
import { Layout } from 'antd';

import InitialProps from '../models/InitialProps';
import AppLayout from '../components/AppLayout';
import DashboardSider from '../components/DashboardSider';
import DashboardQuery from '../models/DashboardQuery';
import { Semester, Menus } from '../models/Semester';
import { ClickParam } from 'antd/lib/menu';

export interface DashboardProps {
  url: InitialProps;
  semesters: Semester[];
}

interface DashboardState {
  semester: string;
  menu: string;
  openKeys: Set<string>;
}

export default class Dashboard extends React.Component<DashboardProps, DashboardState> {
  util: SemesterUtil = new SemesterUtil();

  static async getInitialProps(context: InitialProps) {
    // Get list of semesters to display in the left column

    return {
      semesters: [{
        key: '2018_spring',
        displayName: '2018 Spring'
      }, {
        key: '2017_fall',
        displayName: '2017 Fall'
      }, {
        key: '2017_summer',
        displayName: '2017 Summer'
      }, {
        key: '2017_spring',
        displayName: '2017 Spring'
      }]
    };
  }

  constructor(props: DashboardProps) {
    super(props);

    this.state = this.stateFromQuery(props.url.query);

    this.onSubMenuTitleClick = this.onSubMenuTitleClick.bind(this);
  }

  private stateFromQuery(query: DashboardQuery) {
    const state: DashboardState = {
      semester: this.util.defaultSemester(),
      menu: this.util.defaultMenu,
      openKeys: Set()
    };

    // This validation check will be replaced with checking if key semester exists in given semesters
    if (this.util.isValidSemester(query.semester)) {
      state.semester = query.semester as string;
    }
    if (this.util.isValidMenu(query.menu)) {
      state.menu = query.menu as string;
    }
    if (query.openKeys) {
      state.openKeys = Set(query.openKeys.split(','));
    } else {
      state.openKeys = state.openKeys.add(`${state.semester}`);
    }

    return state;
  }

  componentWillReceiveProps(nextProps: DashboardProps) {
    this.setState(this.stateFromQuery(nextProps.url.query));
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

  render() {
    return (
      <AppLayout>
        <Layout>
          <Layout.Sider style={{ position: 'fixed' }}>
            <DashboardSider
              semesters={this.props.semesters}
              openKeys={this.state.openKeys.toArray()}
              selectedKeys={[`${this.state.semester}_${this.state.menu}`]}
              onSubMenuTitleClick={this.onSubMenuTitleClick}
            />
          </Layout.Sider>
        </Layout>
      </AppLayout>
    );
  }
}

class SemesterUtil {
  private startYear = 2017;
  private currentYear() {
    return moment().year();
  }
  private currentSeason() {
    const month = moment().month() + 1;
    if (1 <= month && month <= 5) {
      return 'spring';
    } else if (month <= 8) {
      return 'summer';
    } else {
      return 'fall';
    }
  }
  private isValidYear(year: string | undefined) {
    if (!year) return false;
    const numYear = parseInt(year);
    return !isNaN(numYear) && this.startYear <= numYear && numYear <= this.currentYear();
  }

  private isValidSeason(season: string | undefined | null) {
    if (!season) return false;
    return ['spring', 'summer', 'fall'].includes(season.toLowerCase());
  }

  defaultMenu = 'overview';

  defaultSemester() {
    return `${this.currentYear()}_${this.currentSeason()}`;
  }

  isValidSemester(semester: string | undefined) {
    if (!semester) return false;
    let year, season;
    [year, season] = semester.split('_');

    return this.isValidYear(year) && this.isValidSeason(season);
  }

  isValidMenu(menu: string | undefined | null) {
    if (!menu) return false;
    return Menus.map(menu => menu.key).includes(menu.toLowerCase());
  }
}