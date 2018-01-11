import * as React from 'react';
import Link from 'next/link';
import { List } from 'antd';
const fetch = require('isomorphic-unfetch');

import MyLayout from '../components/MyLayout';
import Show from '../models/Show';

interface Props {
  shows: Array<Show>;
}

class Index extends React.Component<Props, {}> {
  static async getInitialProps() {
    const res = await fetch('https://api.tvmaze.com/search/shows?q=batman');
    const data = await res.json();
  
    console.log(`Show data fetched. Count: ${data.length}`);
  
    return {
      shows: data
    }
  }

  render() {
    return (
      <MyLayout>
        <h1>Batman TV Shows</h1>
        <List 
          size="small"
          bordered
          dataSource={this.props.shows}
          renderItem={({show}: {show: Show}) => (
            <List.Item>
              <Link as={`/p/${show.id}`} href={`/post?id=${show.id}`}>
                <a>{ show.name }</a>
              </Link>
            </List.Item>
          )}
        />
      </MyLayout>
    )
  }
}
export default Index
