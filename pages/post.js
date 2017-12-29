import Link from 'next/link';

import Layout from '../components/Layout'

export default (props) => {

console.log(props);

  return (
    <Layout>
      <h1>{ props.url.query.title }</h1>
      <p>This is the blog post content.</p>
      <Link href="/">
        Back
      </Link>
    </Layout>
  )
}