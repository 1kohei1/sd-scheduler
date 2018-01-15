import * as React from 'react';
import { Layout, Menu } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import * as moment from 'moment';
import { Set } from 'immutable';

import AppLayout from './AppLayout';
import Overview from './Overview';
import InitialProps from '../models/InitialProps';
import DashboardQuery from '../models/DashboardQuery';

export interface DashboardLayoutProps {
  query: DashboardQuery;
}

interface DashboardLayoutState {
  year: number;
  season: string;
  menu: string;
  openKeys: Set<string>;
}

export default class DashboardLayout extends React.Component<DashboardLayoutProps, DashboardLayoutState> {
  private util: Util;

  constructor(props: DashboardLayoutProps) {
    super(props);
    
    this.util = new Util();
    this.state = this.util.convertToState(props.query);

    this.onSubMenuClick = this.onSubMenuClick.bind(this);
    this.onMenuItemClick = this.onMenuItemClick.bind(this);
  }

  componentWillReceiveProps(nextProps: DashboardLayoutProps) {
    this.setState(this.util.convertToState(nextProps.query));
  }

  onSubMenuClick({key}: ClickParam) {
    this.setState((prevState, props) => {
      if (prevState.openKeys.includes(key)) {
        return {
          openKeys: prevState.openKeys.delete(key)
        };
      } else {
        return {
          openKeys: prevState.openKeys.add(key)
        }
      }
    });
  }

  onMenuItemClick({key}: ClickParam) {
    const arr = key.split('_');
    this.setState({
      year: parseInt(arr[0]),
      season: arr[1],
      menu: arr[2]
    });
  }

  render() {
    return (
      <AppLayout>
        <Layout style={{ backgroundColor: 'white' }}>
          <Layout.Sider style={{ position: 'fixed' }}>
            <Menu style={{ width: '200px', height: "calc(100vh - 64px)" }}
              openKeys={ this.state.openKeys.toArray() }
              selectedKeys={[`${this.state.year}_${this.state.season}_${this.state.menu}`]}
              onClick={this.onMenuItemClick}
              mode="inline"
            >
              <Menu.SubMenu key="2018_spring" 
                title="2018 Spring"
                onTitleClick={this.onSubMenuClick}
              >
                <Menu.Item key="2018_spring_overview">
                  Overview
                </Menu.Item>
                <Menu.Item key="2018_spring_availability">
                  My Availablity
                </Menu.Item>
                <Menu.Item key="2018_spring_schedule">
                  My Schedule
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.SubMenu key="2017_fall" 
                title="2017 Fall"
                onTitleClick={this.onSubMenuClick}
              >
                <Menu.Item key="2017_fall_overview">
                  Overview
                </Menu.Item>
                <Menu.Item key="2017_fall_availability">
                  My Availablity
                </Menu.Item>
                <Menu.Item key="2017_fall_schedule">
                  My Schedule
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.SubMenu key="2017_summer" 
                title="2017 Summer"
                onTitleClick={this.onSubMenuClick}
              >
                <Menu.Item key="2017_summer_overview">
                  Overview
                </Menu.Item>
                <Menu.Item key="2017_summer_availability">
                  My Availablity
                </Menu.Item>
                <Menu.Item key="2017_summer_schedule">
                  My Schedule
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.SubMenu key="2017_spring" 
                title="2017 Spring"
                onTitleClick={this.onSubMenuClick}
              >
                <Menu.Item key="2017_spring_overview">
                  Overview
                </Menu.Item>
                <Menu.Item key="2017_spring_availability">
                  My Availablity
                </Menu.Item>
                <Menu.Item key="2017_spring_schedule">
                  My Schedule
                </Menu.Item>
              </Menu.SubMenu>
            </Menu>
          </Layout.Sider>
          <Layout.Content style={{ marginLeft: '200px', padding: '0 16px' }}>
            <Overview year={2018} semester="spring" />
          </Layout.Content>
        </Layout>
      </AppLayout>
    );
  }
}

class Util {
  private startYear = 2016;
  private currentYear = () => {
    return moment().year();
  }
  private currentSeason = () => {
    const month = moment().month() + 1;
    if (1 <= month && month <= 5) {
      return 'spring';
    } else if (month <= 8) {
      return 'summer';
    } else {
      return 'fall';
    }
  }

  convertToState = (query: DashboardQuery): DashboardLayoutState => {
    let obj: any;
    if (this.isValidYear(query.year) && this.isValidSeason(query.season) && this.isValidMenu(query.menu)) {
      obj = {
        year: parseInt(query.year as string),
        season: query.season as string,
        menu: query.menu as string,
      };
    } else if (this.isValidYear(query.year) && this.isValidSeason(query.season)) {
      obj = {
        year: parseInt(query.year as string),
        season: query.season as string,
        menu: 'overview',
      };
    } else {
      obj = {
        year: this.currentYear(),
        season: this.currentSeason(),
        menu: 'overview',
      };
    }
    obj.openKeys = Set([`${obj.year}_${obj.season}`]);

    return obj;
  }

  private isValidYear = (year: string | undefined) => {
    if (year === undefined) return false;
    const numYear = parseInt(year);
    return !isNaN(numYear) && this.startYear <= numYear && numYear <= this.currentYear();
  }

  private isValidSeason = (season: string | undefined) => {
    if (season === undefined) return false;
    return ['spring', 'summer', 'fall'].indexOf(season.toLowerCase()) >= 0;
  }

  private isValidMenu = (menu: string | undefined) => {
    if (menu === undefined) return false;
    return ['overview', 'availability', 'schedule'].indexOf(menu.toLowerCase()) >= 0;
  }
}
