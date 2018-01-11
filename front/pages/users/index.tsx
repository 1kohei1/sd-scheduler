import MyLayout from '../../components/MyLayout';
import Link from 'next/link';
import { List } from 'antd';

interface user {
  id: number;
  name: string;
}

const users: Array<user> = [{
  id: 1,
  name: 'Kohei Arai'
}, {
  id: 2,
  name: 'Saito Satoru'
}, {
  id: 3,
  name: 'Takeshita Hiroshi'
}]

export default ({url: {query: { id }}}: {url: {query: {id: number}}}) => (
  <MyLayout>
    <h1>User page</h1>
    { id ? (
      <h3>{
        (users.find((user: user) => {
          return user.id == id;
        }) as user).name
      }</h3>
    ) : (
      <List 
        size="small"
        bordered
        dataSource={users}
        renderItem={(user:user) => (
          <List.Item>
            <Link  as={`/users/${user.id}`} href={`/users?id=${user.id}`}>
              <a>{ user.name }</a>
            </Link>
          </List.Item>
        )}
      />
    )}
  </MyLayout>
)