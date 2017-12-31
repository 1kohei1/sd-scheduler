import Link from 'next/link';
import fetch from 'isomorphic-unfetch';
import { List } from 'antd';

import MyLayout from '../components/MyLayout';

const Index = (props) => (
  <MyLayout>
    <h1>Batman TV Shows</h1>
    <List 
      size="small"
      bordered
      dataSource={props.shows}
      renderItem={({show}) => (
        <List.Item>
          <Link as={`/p/${show.id}`} href={`/post?id=${show.id}`}>
            <a>{ show.name }</a>
          </Link>
        </List.Item>
      )}
    />
  </MyLayout>
)

Index.getInitialProps = async function() {
  const res = await fetch('https://api.tvmaze.com/search/shows?q=batman');
  const data = await res.json();

  console.log(`Show data fetched. Count: ${data.length}`);

  return {
    shows: data
  }
}

export default Index