import * as React from 'react';
import * as moment from 'moment-timezone';
import { Set } from 'immutable';
import { Layout } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import ObjectID from 'bson-objectid';

import InitialProps from '../models/InitialProps';
import DashboardQuery from '../models/DashboardQuery';
import { Semester, Menus } from '../models/Semester';
import AppLayout from '../components/AppLayout';
import DashboardSider from '../components/DashboardSider';
import Overview from '../components/Overview';
import MyCalendar from '../components/MyCalendar';
import { DateConstants } from '../models/Constants';
import Api from '../utils/Api';
import UserUtil from '../utils/UserUtil';

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
    await UserUtil.checkAuthentication();

    const semesters = await Api.getSemesters();

    return {
      semesters,
    }
    // Get list of semesters to display in the left column

    // const tempFunc = (dateStr: string) => {
    //   return moment.tz(dateStr, `${DateConstants.dateFormat} ${DateConstants.hourFormat}`, DateConstants.timezone);
    // }

    // return {
    //   semesters: [{
    //     _id: ObjectID.generate(),
    //     key: '2018_spring',
    //     displayName: '2018 Spring',
    //     presentationDates: [{
    //       _id: ObjectID.generate(),
    //       start: tempFunc('2018-04-25 9 AM'),
    //       end: tempFunc('2018-04-25 6 PM'),
    //     }, {
    //       _id: ObjectID.generate(),
    //       // start: tempFunc('2018-04-26 11 AM'),
    //       // end:  tempFunc('2018-04-26 3 PM'),
    //       start: tempFunc('2018-04-26 9 AM'),
    //       end: tempFunc('2018-04-26 6 PM'),
    //     }, {
    //       _id: ObjectID.generate(),
    //       // start: tempFunc('2018-04-27 11 AM'),
    //       // end:  tempFunc('2018-04-27 6 PM'),
    //       start: tempFunc('2018-04-27 9 AM'),
    //       end: tempFunc('2018-04-27 6 PM'),
    //     }],
    //   }, {
    //     _id: ObjectID.generate(),
    //     key: '2017_fall',
    //     displayName: '2017 Fall',
    //     presentationDates: [],
    //   }, {
    //     _id: ObjectID.generate(),
    //     key: '2017_summer',
    //     displayName: '2017 Summer',
    //     presentationDates: [],
    //   }, {
    //     _id: ObjectID.generate(),
    //     key: '2017_spring',
    //     displayName: '2017 Spring',
    //     presentationDates: [],
    //   }]
    // };
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
      return <Overview semester={semester} />
    } else if (menu === 'calendar') {
      return <MyCalendar semester={semester} />
    } else {
      return <div>Unknow menu is selected</div>
    }
  }

  render() {
    const semester: Semester = this.props.semesters.find((semester) => semester.key === this.state.semester) as Semester;

    return (
      <AppLayout>
        <Layout style={{ backgroundColor: 'white' }}>
          <Layout.Sider style={{ backgroundColor: 'white' }}>
            <DashboardSider
              semesters={this.props.semesters}
              openKeys={this.state.openKeys.toArray()}
              selectedKeys={[`${this.state.semester}_${this.state.menu}`]}
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