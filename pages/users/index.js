import MyLayout from '../../components/MyLayout';
import Link from 'next/link';

const users = [{
  id: 1,
  name: 'Kohei Arai'
}, {
  id: 2,
  name: 'Saito Satoru'
}, {
  id: 3,
  name: 'Takeshita Hiroshi'
}]

export default ({url: {query: { id }}}) => (
  <MyLayout>
    <h1>User page</h1>
    { id ? (
      <h3>{
        users.find(user => {
          return user.id == id;
        }).name
      }</h3>
    ) : (
      <ul>
      {
        users.map(user => (
          <li key={ user.id }>
            <Link  as={`/users/${user.id}`} href={`/users?id=${user.id}`}>
              <a>{ user.name }</a>
            </Link>
          </li>
        ))
      }
    </ul>
    )}
  </MyLayout>
)